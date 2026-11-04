"""Database-derived reports; no fabricated chart series or estimated profit."""
import csv
import io
from collections import Counter
from datetime import datetime
import pandas as pd
from .db import serialize

CATEGORY_PIPELINE = [{'$group': {'_id': '$category', 'productCount': {'$sum': 1}, 'totalStock': {'$sum': '$stock'}, 'inventoryValue': {'$sum': {'$multiply': ['$price', '$stock']}}}}, {'$sort': {'_id': 1}}]
BRAND_PIPELINE = [{'$group': {'_id': '$brand', 'productCount': {'$sum': 1}, 'minimumPrice': {'$min': '$price'}, 'maximumPrice': {'$max': '$price'}, 'averagePrice': {'$avg': '$price'}}}, {'$sort': {'_id': 1}}]

def inventory_report(db):
    return {'categories': list(db.products.aggregate(CATEGORY_PIPELINE)),
            'brands': list(db.products.aggregate(BRAND_PIPELINE)),
            'lowStock': list(db.products.find({'stock': {'$lte': 10}}).sort('stock', 1))}

def build_stats(db):
    products = list(db.products.find())
    orders = list(db.orders.find().sort('createdAt', -1))
    low = [p for p in products if p.get('stock', 0) <= p.get('reorderLevel', 5)]
    revenue = sum(o.get('total', 0) for o in orders if o.get('paymentStatus') == 'Paid')
    by_month = {}
    for order in orders:
        date = order.get('createdAt')
        if isinstance(date, str):
            try: date = datetime.fromisoformat(date.replace('Z', '+00:00'))
            except ValueError: continue
        if not isinstance(date, datetime): continue
        month = date.strftime('%Y-%m')
        row = by_month.setdefault(month, {'month': month, 'revenue': 0, 'orders': 0})
        row['orders'] += 1
        if order.get('paymentStatus') == 'Paid': row['revenue'] += order.get('total', 0)
    report = inventory_report(db)
    statuses = Counter(o.get('fulfillmentStatus', 'Pending') for o in orders)
    return {'kpis': {
        'totalProducts': len(products), 'activeProducts': sum(p.get('status')=='Active' for p in products),
        'draftProducts': sum(p.get('status')=='Draft' for p in products),
        'outOfStockProducts': sum(p.get('stock', 0)==0 for p in products),
        'lowStockProducts': sum(p.get('stock', 0)>0 for p in low),
        'totalInventoryValue': round(sum(p.get('price',0)*p.get('stock',0) for p in products),2),
        'totalInventoryCost': round(sum(p.get('costPrice',0)*p.get('stock',0) for p in products),2),
        'totalOrders': len(orders), 'pendingOrders': sum(o.get('fulfillmentStatus') in ['Pending','Processing'] for o in orders),
        'totalRevenue': round(revenue,2), 'grossProfit': None, 'profitMargin': None,
        'totalCustomers': db.customers.count_documents({})},
        'charts': {'salesOverTime': [by_month[k] for k in sorted(by_month)],
                   'categoryDistribution': [{'name': r['_id'], 'value': r['totalStock']} for r in report['categories']],
                   'ordersByStatus': [{'name': k, 'value': v} for k,v in statuses.items()]},
        'widgets': {'lowStockItems': [{**p, 'id': str(p['_id'])} for p in low[:5]],
                    'recentOrders': [{'id': str(o['_id']), 'orderNumber': o['orderNumber'], 'customerName': o['customer']['name'],
                                      'total': o['total'], 'paymentStatus': o['paymentStatus'], 'fulfillmentStatus': o['fulfillmentStatus'],
                                      'createdAt': o.get('createdAt'), 'itemsCount': sum(i['quantity'] for i in o.get('items',[]))} for o in orders[:5]],
                    'recentActivity': list(db.activitylogs.find().sort('timestamp',-1).limit(6))},
        'notes': ['Profit is unavailable until order-time cost snapshots are recorded.']}

def export_csv(db, kind):
    if kind == 'orders':
        columns = ['OrderNumber','CustomerName','Email','Phone','Total (INR)','PaymentStatus','FulfillmentStatus','Date']
        rows = [[o['orderNumber'], o['customer']['name'], o['customer']['email'], o['customer'].get('phone',''), o['total'], o['paymentStatus'], o['fulfillmentStatus'], serialize(o.get('createdAt'))] for o in db.orders.find()]
    elif kind == 'inventory':
        columns = ['SKU','ProductName','Category','StockOnHand','ReservedStock','AvailableStock','ReorderLevel','Warehouse']
        rows = [[p['sku'],p['name'],p['category'],p['stock'],p.get('reservedStock',0),p.get('availableStock',p['stock']),p.get('reorderLevel',5),p.get('warehouseLocation','')] for p in db.products.find()]
    else:
        columns = ['SKU','Name','Category','Brand','Price (INR)','MRP (INR)','CostPrice (INR)','Stock','Status','Barcode']
        rows = [[p['sku'],p['name'],p['category'],p.get('brand',''),p['price'],p.get('mrp',p['price']),p.get('costPrice',0),p['stock'],p['status'],p.get('barcode','')] for p in db.products.find()]
    # Protect spreadsheet users from executable formulas in user-entered text.
    rows = [["'"+v if isinstance(v,str) and v.lstrip().startswith(('=','+','-','@')) else v for v in row] for row in rows]
    return pd.DataFrame(rows, columns=columns).to_csv(index=False, quoting=csv.QUOTE_MINIMAL)
