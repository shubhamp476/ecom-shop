"""Live smoke test in a new temporary collection; deletes only its own test data."""
import json
from uuid import uuid4
from dotenv import load_dotenv
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from backend.db import create_client, database_name, now, serialize
from backend.schemas import ProductInput
load_dotenv('.env.local')
client=create_client(); checks=[]; collection=None
try:
    db=client[database_name(client)]
    db.command('ping'); checks.append('Atlas authenticated ping')
    collection=db['_ecom_migration_check_'+uuid4().hex]
    collection.create_index('sku',unique=True)
    data=ProductInput(name='Temporary integration fixture',category='Testing',price=100,mrp=120,stock=4,sku='SMOKE-1').document()
    data['createdAt']=now();identifier=collection.insert_one(data).inserted_id
    row=collection.find_one({'_id':identifier});assert row['stock']==4
    assert isinstance(serialize(row)['_id'],str);checks.append('Product insert, retrieval and BSON serialization')
    try: collection.insert_one({**data,'_id':ObjectId()})
    except DuplicateKeyError: checks.append('Unique SKU rejects duplicate')
    else: raise AssertionError('Duplicate was accepted')
    collection.update_one({'_id':identifier},{'$set':{'stock':0,'updatedAt':now()}})
    assert collection.find_one({'_id':identifier})['stock']==0;checks.append('Update preserves zero stock')
    report=list(collection.aggregate([{'$group':{'_id':'$category','count':{'$sum':1},'stock':{'$sum':'$stock'}}}]))
    assert report[0]['count']==1 and report[0]['stock']==0;checks.append('MongoDB aggregation')
    assert collection.delete_one({'_id':identifier}).deleted_count==1
    assert collection.count_documents({})==0;checks.append('Delete and empty result')
finally:
    if collection is not None:
        collection.drop();checks.append('Temporary test collection removed')
    client.close()
print(json.dumps({'status':'passed','scope':'One temporary collection; application documents were not modified','checks':checks},indent=2))
