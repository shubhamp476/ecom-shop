"""FastAPI endpoints matching the existing Next.js contracts."""
import csv
import io
import math
import os
import re
import secrets
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, Response
from pydantic import ValidationError
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError, PyMongoError
from .db import create_client, database_name, ensure_indexes, get_db, identity, now, serialize
from .schemas import (ProductInput, CategoryInput, BrandInput, CustomerInput, CouponInput,
                      SupplierInput, SettingsInput, OrderPatch, InventoryAdjustment, ImportInput)

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / '.env.local')
load_dotenv(ROOT / '.env')

@asynccontextmanager
async def lifespan(app):
    client = create_client()
    app.state.client = client
    app.state.db = client[database_name(client)] if client is not None else None
    # Index provisioning is explicit: python -m backend.manage indexes.
    # Startup never mutates existing collections or masks an Atlas outage.
    yield
    if client is not None: client.close()

def authorize(request: Request):
    protected = request.url.path.startswith('/api/admin') or request.url.path == '/api/seed' or request.method not in ('GET', 'HEAD', 'OPTIONS')
    if not protected: return
    expected = os.getenv('BACKEND_API_KEY', '')
    if not expected:
        if os.getenv('APP_ENV', 'development') == 'production':
            raise HTTPException(503, 'Backend administration is not configured')
        return
    if not secrets.compare_digest(request.headers.get('x-api-key', ''), expected):
        raise HTTPException(401, 'Invalid API key')

app = FastAPI(title='ECOM-SHOP PyMongo API', version='1.0.0', lifespan=lifespan, dependencies=[Depends(authorize)])
DB = Annotated[object, Depends(get_db)]

@app.exception_handler(HTTPException)
async def http_error(request, exc):
    return JSONResponse({'success': False, 'error': str(exc.detail)}, status_code=exc.status_code)

@app.exception_handler(RequestValidationError)
@app.exception_handler(ValidationError)
async def validation_error(request, exc):
    errors = [{'field': '.'.join(map(str, e['loc'])), 'message': e['msg']} for e in exc.errors()]
    return JSONResponse({'success': False, 'error': '; '.join(e['message'] for e in errors), 'details': errors}, status_code=422)

@app.exception_handler(DuplicateKeyError)
async def duplicate_error(request, exc):
    return JSONResponse({'success': False, 'error': 'A record with that unique identifier already exists.'}, status_code=409)

@app.exception_handler(PyMongoError)
async def database_error(request, exc):
    return JSONResponse({'success': False, 'error': 'Database operation failed. Check backend connectivity and database configuration.'}, status_code=503)

def result(**values):
    return serialize({'success': True, **values})

def audit(db, action, entity, entity_id='', details=''):
    db.activitylogs.insert_one({'actor': 'Super Admin', 'role': 'Administrator', 'action': action,
                               'entity': entity, 'entityId': str(entity_id), 'details': details or action,
                               'timestamp': now()})

def find_product(db, value):
    product = db.products.find_one(identity(value))
    if product is None: raise HTTPException(404, 'Product not found')
    return product

def validate_category(db, data):
    if db.categories.find_one({'slug': data['categorySlug']}) is None:
        raise HTTPException(422, 'Category does not exist. Create it before adding products.')

def product_create(db, model):
    data = model.document()
    validate_category(db, data)
    data.update(createdAt=now(), updatedAt=now())
    data['_id'] = db.products.insert_one(data).inserted_id
    audit(db, 'PRODUCT_CREATED', 'Product', data['_id'], f"Created {data['name']}")
    return data

def product_update(db, value, body):
    old = find_product(db, value)
    data = ProductInput.model_validate({**old, **body}).document()
    validate_category(db, data)
    data['updatedAt'] = now()
    query = {'_id': old['_id'], 'updatedAt': old.get('updatedAt')}
    updated = db.products.find_one_and_update(query, {'$set': data}, return_document=ReturnDocument.AFTER)
    if updated is None: raise HTTPException(409, 'Product changed concurrently; reload and try again')
    audit(db, 'PRODUCT_UPDATED', 'Product', old['_id'], f"Updated {data['name']}")
    return updated

@app.get('/health')
def health():
    return result(service='ECOM-SHOP', driver='pymongo')

@app.get('/health/ready')
def ready(db: DB):
    db.command('ping')
    return result(database='connected', driver='pymongo')

@app.get('/api/products')
def public_products(db: DB, category: str = '', limit: int = Query(1000, ge=1, le=1000)):
    query = {'status': 'Active'}
    if category: query['categorySlug'] = category
    data = list(db.products.find(query).sort('createdAt', -1).limit(limit))
    return result(source='pymongo', count=len(data), data=data)

@app.get('/api/products/{slug}')
def public_product(slug: str, db: DB):
    data = db.products.find_one({'slug': slug, 'status': 'Active'})
    if data is None: raise HTTPException(404, 'Product not found')
    return result(data=data)

@app.post('/api/products', status_code=201)
def create_public_product(body: ProductInput, db: DB):
    return result(data=product_create(db, body))

@app.get('/api/categories')
def public_categories(db: DB):
    return result(categories=list(db.categories.find({'status': 'Active'}).sort('sortOrder', 1)))

@app.get('/api/admin/products')
def products(db: DB, search: str = '', category: str = '', brand: str = '', status: str = '',
             sort: str = 'newest', page: int = Query(1, ge=1), limit: int = Query(10, ge=1, le=1000)):
    clauses = []
    if search:
        clauses.append({'$or': [{f: {'$regex': re.escape(search), '$options': 'i'}} for f in ['name', 'sku', 'brand', 'category']]})
    if category: clauses.append({'$or': [{'categorySlug': category}, {'category': category}]})
    if brand: clauses.append({'$or': [{'brandSlug': brand}, {'brand': brand}]})
    if status: clauses.append({'status': status})
    query = {'$and': clauses} if clauses else {}
    sort_field, direction = {'price_asc': ('price', 1), 'price_desc': ('price', -1), 'stock_low': ('stock', 1), 'name_asc': ('name', 1)}.get(sort, ('createdAt', -1))
    total = db.products.count_documents(query)
    rows = list(db.products.find(query).sort([(sort_field, direction), ('_id', 1)]).skip((page-1)*limit).limit(limit))
    return result(products=rows, pagination={'page': page, 'limit': limit, 'total': total, 'totalPages': max(1, math.ceil(total/limit))})

@app.post('/api/admin/products', status_code=201)
def create_product(body: ProductInput, db: DB):
    return result(product=product_create(db, body), message='Product created successfully!')

@app.get('/api/admin/products/{value}')
def get_product(value: str, db: DB):
    return result(product=find_product(db, value))

@app.put('/api/admin/products/{value}')
@app.patch('/api/admin/products/{value}')
def update_product(value: str, body: dict, db: DB):
    return result(product=product_update(db, value, body), message='Product updated successfully!')

@app.delete('/api/admin/products/{value}')
def delete_product(value: str, db: DB):
    data = db.products.find_one_and_delete(identity(value))
    if data is None: raise HTTPException(404, 'Product not found')
    audit(db, 'PRODUCT_DELETED', 'Product', data['_id'], f"Deleted {data['name']}")
    return result(message='Product deleted successfully!')

# The existing ancillary UI uses natural keys in request bodies and query strings.
def register_resource(collection, singular, model, key, methods):
    path = '/api/admin/' + collection
    def listing(request: Request, db: DB):
        query = {}
        search = request.query_params.get('search', '')
        if search and collection == 'customers':
            query = {'$or': [{f: {'$regex': re.escape(search), '$options': 'i'}} for f in ['name', 'email', 'phone', 'city']]}
        return result(**{collection: list(db[collection].find(query).sort('sortOrder' if collection == 'categories' else 'createdAt', 1 if collection == 'categories' else -1))})
    def validate_parent(db, data):
        if collection != 'categories' or not data.get('parentId'): return
        parent = data['parentId']; visited = {data['slug']}
        while parent:
            if parent in visited: raise HTTPException(422, 'Category hierarchy cannot contain a cycle')
            visited.add(parent)
            doc = db.categories.find_one({'slug': parent})
            if doc is None: raise HTTPException(422, 'Parent category does not exist')
            parent = doc.get('parentId')
    def create(body: dict, db: DB):
        data = model.model_validate(body).model_dump()
        validate_parent(db, data)
        data.update(createdAt=now(), updatedAt=now())
        data['_id'] = db[collection].insert_one(data).inserted_id
        audit(db, collection.upper()+'_CREATED', singular, data['_id'])
        return result(**{singular: data})
    def update(body: dict, db: DB):
        value = body.get(key)
        if not isinstance(value, str) or not value.strip(): raise HTTPException(422, f'{key} is required')
        if key == 'email': value = value.lower().strip()
        if key == 'code': value = value.upper().strip()
        old = db[collection].find_one({key: value})
        if old is None: raise HTTPException(404, singular+' not found')
        data = model.model_validate({**old, **body, key: value}).model_dump()
        validate_parent(db, data)
        data['updatedAt'] = now()
        updated = db[collection].find_one_and_update({'_id': old['_id']}, {'$set': data}, return_document=ReturnDocument.AFTER)
        audit(db, collection.upper()+'_UPDATED', singular, old['_id'])
        return result(**{singular: updated})
    def delete(request: Request, db: DB):
        value = request.query_params.get(key, '')
        if not value: raise HTTPException(422, f'{key} is required')
        if key == 'code': value = value.upper()
        if collection == 'categories' and db.products.count_documents({'categorySlug': value}):
            raise HTTPException(409, 'Move products to another category before deleting this category')
        old = db[collection].find_one_and_delete({key: value})
        if old is None: raise HTTPException(404, singular+' not found')
        if collection == 'categories':
            db.categories.update_many({'parentId': value}, {'$set': {'parentId': old.get('parentId')}})
        audit(db, collection.upper()+'_DELETED', singular, value)
        return result(message=singular+' deleted')
    for method in methods:
        app.add_api_route(path, {'GET': listing, 'POST': create, 'PATCH': update, 'PUT': update, 'DELETE': delete}[method], methods=[method], name=collection+'_'+method.lower(), status_code=201 if method=='POST' else 200)

register_resource('categories', 'category', CategoryInput, 'slug', ['GET', 'POST', 'PUT', 'DELETE'])
register_resource('brands', 'brand', BrandInput, 'slug', ['GET', 'POST'])
register_resource('customers', 'customer', CustomerInput, 'email', ['GET', 'POST', 'PATCH'])
register_resource('coupons', 'coupon', CouponInput, 'code', ['GET', 'POST', 'PATCH', 'DELETE'])
register_resource('suppliers', 'supplier', SupplierInput, 'companyName', ['GET', 'POST'])

@app.get('/api/admin/orders')
def orders(db: DB, search: str = '', status: str = ''):
    clauses = []
    if search: clauses.append({'$or': [{f: {'$regex': re.escape(search), '$options': 'i'}} for f in ['orderNumber', 'customer.name', 'customer.email']]})
    if status: clauses.append({'$or': [{'fulfillmentStatus': status}, {'paymentStatus': status}]})
    return result(orders=list(db.orders.find({'$and': clauses} if clauses else {}).sort('createdAt', -1)))

@app.patch('/api/admin/orders')
def update_order(body: OrderPatch, db: DB):
    data = body.model_dump(exclude_none=True, exclude={'orderNumber'})
    data['updatedAt'] = now()
    updated = db.orders.find_one_and_update({'orderNumber': body.orderNumber}, {'$set': data}, return_document=ReturnDocument.AFTER)
    if updated is None: raise HTTPException(404, 'Order not found')
    audit(db, 'ORDER_UPDATED', 'Order', body.orderNumber)
    return result(order=updated)

@app.get('/api/admin/settings')
def settings(db: DB):
    return result(settings=db.storesettings.find_one({}) or SettingsInput().model_dump())

@app.put('/api/admin/settings')
def save_settings(body: dict, db: DB):
    old = db.storesettings.find_one({}) or {}
    data = SettingsInput.model_validate({**old, **body}).model_dump()
    data['updatedAt'] = now()
    saved = db.storesettings.find_one_and_update({'_id': old.get('_id', 'store')}, {'$set': data}, upsert=True, return_document=ReturnDocument.AFTER)
    audit(db, 'SETTINGS_UPDATED', 'StoreSettings')
    return result(settings=saved)

@app.get('/api/admin/logs')
def logs(db: DB):
    return result(activityLogs=list(db.activitylogs.find().sort('timestamp', -1).limit(50)), inventoryLogs=list(db.inventorylogs.find().sort('timestamp', -1).limit(50)))

@app.post('/api/admin/inventory/adjust')
def adjust(body: InventoryAdjustment, db: DB):
    for attempt in range(3):
        old = find_product(db, body.productId)
        previous = old.get('stock', 0); reserved = old.get('reservedStock', 0)
        stock = previous + body.quantityChange
        if stock < reserved: raise HTTPException(409, 'Adjustment would make stock negative or lower than reserved stock')
        status = old.get('status', 'Active')
        if stock == 0 and status == 'Active': status = 'Out of Stock'
        elif stock > 0 and status == 'Out of Stock': status = 'Active'
        changed = db.products.find_one_and_update({'_id': old['_id'], 'stock': previous, 'updatedAt': old.get('updatedAt')},
            {'$set': {'stock': stock, 'availableStock': stock-reserved, 'inStock': stock > reserved, 'status': status, 'updatedAt': now()}}, return_document=ReturnDocument.AFTER)
        if changed is not None: break
    else: raise HTTPException(409, 'Concurrent inventory update; retry')
    db.inventorylogs.insert_one({'productId': str(old['_id']), 'productName': old['name'], 'sku': old['sku'],
        'type': body.type, 'quantityChange': body.quantityChange, 'previousStock': previous, 'newStock': stock,
        'reason': body.reason, 'actor': body.actor, 'timestamp': now()})
    audit(db, 'STOCK_ADJUSTED', 'Inventory', old['_id'], body.reason)
    return result(previousStock=previous, newStock=stock, message='Stock updated successfully')

# Reports and CSV processing share the same database as the CRUD endpoints.
from .reports import build_stats, inventory_report, export_csv

@app.get('/api/admin/stats')
def stats(db: DB):
    return result(**build_stats(db))

@app.get('/api/admin/reports/inventory')
def report(db: DB):
    return result(**inventory_report(db))

@app.get('/api/admin/export')
def export(db: DB, type: str = 'products'):
    if type not in ['products', 'orders', 'inventory']: raise HTTPException(422, 'Unsupported export type')
    return Response(export_csv(db, type), media_type='text/csv', headers={'Content-Disposition': f'attachment; filename="{type}_export.csv"'})

@app.post('/api/admin/import')
def import_csv(body: ImportInput, db: DB):
    reader = csv.DictReader(io.StringIO(body.csvContent))
    if not reader.fieldnames: raise HTTPException(422, 'CSV header required')
    valid, errors, prepared, seen = [], [], [], set()
    total = 0
    for i, row in enumerate(reader, 1):
        total = i
        if i > 5000: raise HTTPException(422, 'Import is limited to 5000 rows')
        normalized = {re.sub(r'[^a-z]', '', k.lower()): v for k, v in row.items() if k}
        try:
            sku = normalized.get('sku', '').strip()
            if not sku: raise ValueError('SKU is required for repeatable imports')
            if sku in seen: raise ValueError('Duplicate SKU in CSV')
            seen.add(sku)
            old = db.products.find_one({'sku': sku})
            raw = {**(old or {}), 'sku': sku, 'name': normalized.get('name', ''),
                   'category': normalized.get('category', ''), 'categorySlug': '',
                   'price': normalized.get('priceinr', normalized.get('price', '')),
                   'stock': normalized.get('stock', '0')}
            for csv_key, field in [('brand','brand'), ('mrpinr','mrp'), ('costpriceinr','costPrice'), ('status','status'), ('barcode','barcode')]:
                if csv_key in normalized: raw[field] = normalized[csv_key]
            model = ProductInput.model_validate(raw)
            validate_category(db, model.document())
            conflict = db.products.find_one({'slug': model.slug})
            if conflict and (not old or old['_id'] != conflict['_id']): raise ValueError('Duplicate product slug')
            valid.append({'sku': model.sku, 'name': model.name, 'category': model.category, 'price': model.price, 'stock': model.stock})
            prepared.append((old, model))
        except (ValueError, HTTPException) as exc:
            errors.append({'row': i, 'error': str(exc.detail) if isinstance(exc, HTTPException) else str(exc), 'data': str(row)})
    committed = False
    if body.commit and not errors and prepared:
        for old, model in prepared:
            if old: product_update(db, str(old['_id']), model.model_dump())
            else: product_create(db, model)
        committed = True
    return result(committed=committed, totalRows=total, validCount=len(valid), errorCount=len(errors), validRows=valid, errors=errors)

@app.post('/api/seed')
def seed(db: DB):
    if os.getenv('ALLOW_SEED') != 'true': raise HTTPException(403, 'Seeding is disabled; use the explicit backend management command')
    from .manage import seed_catalog
    return result(**seed_catalog(db))
