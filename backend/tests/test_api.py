import csv
import io
import os
import pytest
import mongomock
from bson import ObjectId
from fastapi.testclient import TestClient
from pymongo.errors import ServerSelectionTimeoutError
from backend.main import app
from backend.db import get_db, ensure_indexes, serialize
from backend.manage import seed_catalog

@pytest.fixture
def setup(monkeypatch):
    monkeypatch.setenv('APP_ENV', 'development')
    monkeypatch.delenv('BACKEND_API_KEY', raising=False)
    db = mongomock.MongoClient(tz_aware=True).ecom_test
    ensure_indexes(db)
    app.dependency_overrides[get_db] = lambda: db
    client = TestClient(app)
    client.post('/api/admin/categories', json={'name':'Phones','slug':'phones'})
    yield client, db
    app.dependency_overrides.clear()

@pytest.fixture
def product():
    return {'name':'Test Phone','slug':'test-phone','sku':'TEST-001','category':'Phones','categorySlug':'phones','price':100,'mrp':150,'stock':10}

def create(client, product):
    r=client.post('/api/admin/products',json=product)
    assert r.status_code == 201, r.text
    return r.json()['product']

def test_crud_serialization_and_no_static_resurrection(setup, product):
    c,db=setup;p=create(c,product)
    assert ObjectId.is_valid(p['_id'])
    assert p['createdAt'].endswith('+00:00')
    for key in [p['_id'],p['slug'],p['sku']]:
        assert c.get('/api/admin/products/'+key).json()['product']['sku']=='TEST-001'
    r=c.put('/api/admin/products/'+p['_id'],json={'price':120,'stock':0})
    assert r.status_code==200
    p=r.json()['product'];assert p['stock']==0 and p['availableStock']==0 and p['inStock'] is False
    assert p['discountAmount']==30
    assert c.delete('/api/admin/products/'+p['_id']).status_code==200
    assert c.get('/api/admin/products/'+p['_id']).status_code==404
    assert c.get('/api/products').json()['data']==[]

@pytest.mark.parametrize('bad',[{'price':-1},{'price':0},{'stock':-1},{'stock':1.5},{'name':'   '},{'status':'nonsense'},{'slug':'not a slug'},{'reservedStock':11},{'categorySlug':'missing'}])
def test_invalid_create_and_update(setup,product,bad):
    c,db=setup
    assert c.post('/api/admin/products',json={**product,**bad}).status_code==422
    p=create(c,product)
    assert c.patch('/api/admin/products/'+p['_id'],json=bad).status_code==422
    assert db.products.count_documents({})==1
    assert db.products.find_one() ['price']==100

def test_duplicates_and_literal_search(setup,product):
    c,db=setup;create(c,product)
    assert c.post('/api/admin/products',json={**product,'slug':'different'}).status_code==409
    assert c.post('/api/admin/products',json={**product,'sku':'different'}).status_code==409
    assert c.get('/api/admin/products?search=.*').json()['products']==[]
    assert c.get('/api/admin/products?search=phone&limit=1').json()['pagination']['total']==1
    assert c.get('/api/admin/products?page=0').status_code==422
    assert c.get('/api/admin/products?limit=-1').status_code==422
    assert c.patch('/api/admin/products/missing',json={'price':50}).status_code==404
    assert c.delete('/api/admin/products/missing').status_code==404

def test_inventory_and_reports(setup,product):
    c,db=setup;p=create(c,product)
    r=c.post('/api/admin/inventory/adjust',json={'productId':p['_id'],'quantityChange':-10,'reason':'Stock count'})
    assert r.status_code==200 and r.json()['newStock']==0
    assert c.post('/api/admin/inventory/adjust',json={'productId':p['_id'],'quantityChange':-1,'reason':'Count'}).status_code==409
    assert c.post('/api/admin/inventory/adjust',json={'productId':p['_id'],'quantityChange':1.5,'reason':'Count'}).status_code==422
    assert db.inventorylogs.count_documents({})==1
    r=c.get('/api/admin/reports/inventory').json()
    assert r['categories'][0]['totalStock']==0
    assert r['brands'][0]['averagePrice']==100
    assert len(r['lowStock'])==1
    r=c.get('/api/admin/stats').json()
    assert r['kpis']['totalInventoryValue']==0 and r['kpis']['totalOrders']==0
    assert r['charts']['salesOverTime']==[] and r['charts']['ordersByStatus']==[]
    assert r['kpis']['grossProfit'] is None

def test_publish_filter(setup,product):
    c,db=setup;create(c,{**product,'status':'Draft'})
    assert c.get('/api/products').json()['data']==[]
    assert c.get('/api/products/test-phone').status_code==404
    assert len(c.get('/api/admin/products').json()['products'])==1

def test_import_export_quoted_csv(setup,product):
    c,db=setup
    payload={'csvContent':'SKU,Name,Category,Price,Stock\nIMP-1,"Phone, Large",Phones,200,0\n','commit':False}
    r=c.post('/api/admin/import',json=payload)
    assert r.status_code==200 and r.json()['validCount']==1
    assert db.products.count_documents({})==0
    r=c.post('/api/admin/import',json={**payload,'commit':True})
    assert r.json()['committed'] is True and db.products.find_one()['stock']==0
    output=c.get('/api/admin/export').text
    rows=list(csv.DictReader(io.StringIO(output)))
    assert rows[0]['Name']=='Phone, Large' and rows[0]['Stock']=='0'
    assert c.post('/api/admin/import',json={'csvContent':output,'commit':True}).json()['committed'] is True
    assert db.products.count_documents({})==1
    r=c.post('/api/admin/import',json={'csvContent':'SKU,Name,Category,Price,Stock\nBAD,Bad,Phones,-1,2','commit':True})
    assert r.json()['committed'] is False and r.json()['errorCount']==1

def test_resources_and_settings(setup):
    c,db=setup
    for resource, data, singular in [
        ('brands',{'name':'Test Brand'},'brand'),
        ('customers',{'name':'Test','email':'TEST@example.com','phone':'123'},'customer'),
        ('coupons',{'code':'test','discountValue':10},'coupon'),
        ('suppliers',{'name':'Test','companyName':'Company'},'supplier')]:
        assert c.post('/api/admin/'+resource,json=data).status_code==201
        assert len(c.get('/api/admin/'+resource).json()[resource])==1
    assert c.patch('/api/admin/customers',json={'email':'test@example.com','tier':'VIP'}).json()['customer']['tier']=='VIP'
    assert c.patch('/api/admin/coupons',json={'code':'test','status':'Disabled'}).json()['coupon']['status']=='Disabled'
    assert c.delete('/api/admin/coupons?code=test').status_code==200
    assert c.put('/api/admin/settings',json={'storeName':'ECOM-SHOP','defaultTaxRate':0}).status_code==200
    assert c.get('/api/admin/settings').json()['settings']['defaultTaxRate']==0
    assert c.post('/api/admin/categories',json={'name':'Child','parentId':'phones'}).status_code==201
    assert c.put('/api/admin/categories',json={'slug':'phones','parentId':'child'}).status_code==422
    assert c.delete('/api/admin/categories?slug=phones').status_code==200
    assert db.categories.find_one({'slug':'child'})['parentId'] is None

def test_errors_do_not_claim_success(setup,monkeypatch,product):
    c,db=setup
    def fail(*args,**kwargs): raise ServerSelectionTimeoutError('secret-uri-must-not-leak')
    monkeypatch.setattr(db.products,'insert_one',fail)
    r=c.post('/api/admin/products',json=product)
    assert r.status_code==503 and r.json()['success'] is False
    assert 'secret-uri' not in r.text

def test_auth_and_health(setup,monkeypatch):
    c,db=setup
    monkeypatch.setenv('BACKEND_API_KEY','test-key')
    assert c.get('/health').status_code==200
    assert c.get('/api/products').status_code==200
    assert c.get('/api/admin/products').status_code==401
    assert c.get('/api/admin/products',headers={'x-api-key':'test-key'}).status_code==200
    monkeypatch.delenv('BACKEND_API_KEY')
    monkeypatch.setenv('APP_ENV','production')
    assert c.get('/api/admin/products').status_code==503

def test_seed_is_non_destructive(setup):
    c,db=setup
    seed_catalog(db)
    p=db.products.find_one();db.products.update_one({'_id':p['_id']},{'$set':{'price':123}})
    count=db.products.count_documents({});seed_catalog(db)
    assert db.products.count_documents({})==count
    assert db.products.find_one({'_id':p['_id']})['price']==123
    assert c.get('/api/seed').status_code==405
    assert c.post('/api/seed').status_code==403

def test_order_creation_and_inventory(setup,product):
    c,db=setup
    c.post('/api/admin/categories', json={'name':'Phones','slug':'phones'})
    p=c.post('/api/admin/products', json=product).json()['product']
    order_payload = {
        'orderNumber': 'GV-TEST-001',
        'customer': {'name': 'Rohan Sharma', 'email': 'rohan@example.com', 'phone': '9876543210'},
        'items': [{'productId': p['_id'], 'name': p['name'], 'price': p['price'], 'quantity': 2}],
        'subtotal': p['price'] * 2,
        'tax': 0,
        'discount': 0,
        'shipping': 0,
        'total': p['price'] * 2,
        'paymentMethod': 'Razorpay',
        'paymentStatus': 'Paid',
        'fulfillmentStatus': 'Confirmed',
    }
    r = c.post('/api/admin/orders', json=order_payload)
    assert r.status_code == 201
    assert r.json()['order']['orderNumber'] == 'GV-TEST-001'
    # Verify stock deducted
    from backend.db import identity
    updated_prod = db.products.find_one(identity(p['_id']))
    assert updated_prod['stock'] == 8 # was 10, 10 - 2 = 8
    # Verify customer updated
    cust = db.customers.find_one({'email': 'rohan@example.com'})
    assert cust is not None and cust['totalOrders'] == 1
    # Verify order in listing
    orders_res = c.get('/api/admin/orders').json()
    assert len(orders_res['orders']) == 1

def test_missing_configuration(monkeypatch):
    monkeypatch.setenv('MONGODB_URI','')
    with TestClient(app) as c:
        assert c.get('/health').status_code==200
        assert c.get('/health/ready').status_code==503
        assert c.get('/api/products').status_code==503
