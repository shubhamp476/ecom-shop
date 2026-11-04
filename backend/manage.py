"""Explicit, non-destructive database setup commands."""
import argparse
import json
from pathlib import Path
from dotenv import load_dotenv
from .db import create_client, database_name, ensure_indexes, now
from .schemas import ProductInput, CategoryInput

ROOT = Path(__file__).resolve().parent.parent

def seed_catalog(db):
    catalog = json.loads((ROOT/'backend/catalog.json').read_text())
    for row in catalog['categories']:
        data = CategoryInput.model_validate(row).model_dump()
        data.update(createdAt=now(), updatedAt=now())
        db.categories.update_one({'slug': data['slug']}, {'$setOnInsert': data}, upsert=True)
    for i, row in enumerate(catalog['products']):
        data = ProductInput.model_validate({**row, 'sku': f'GV-CATALOG-{i+1:04}', 'mrp': row.get('originalPrice', row['price']), 'stock': 10 if row.get('inStock') else 0}).document()
        data.update(createdAt=now(), updatedAt=now())
        db.products.update_one({'slug': data['slug']}, {'$setOnInsert': data}, upsert=True)
    return {'categoriesSeeded': len(catalog['categories']), 'productsSeeded': len(catalog['products'])}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('command', choices=['ping','indexes','seed'])
    args = parser.parse_args()
    load_dotenv(ROOT/'.env.local'); load_dotenv(ROOT/'.env')
    client = create_client()
    if client is None:
        print('MongoDB URI is missing or contains a placeholder. No database operations executed.')
        return 1
    try:
        db = client[database_name(client)]
        db.command('ping')
        if args.command in ['indexes','seed']: ensure_indexes(db)
        if args.command == 'seed': print(json.dumps(seed_catalog(db)))
        else: print(f'{args.command}: passed')
        return 0
    except Exception as exc:
        # Never print a URI, password, or server error containing credentials.
        print(f'{args.command}: failed ({type(exc).__name__}). Check Atlas configuration.')
        return 1
    finally: client.close()

if __name__ == '__main__':
    raise SystemExit(main())
