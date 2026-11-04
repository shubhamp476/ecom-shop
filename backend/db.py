"""One pooled, lazy MongoClient per worker; no process-memory write fallback."""
import os
from datetime import datetime, timezone
from bson import ObjectId, Decimal128
from fastapi import HTTPException, Request
from pymongo import MongoClient


def create_client():
    uri = os.getenv("MONGODB_URI", "")
    if not uri or "<" in uri:
        return None
    return MongoClient(uri, connect=False, serverSelectionTimeoutMS=5000,
                       connectTimeoutMS=5000, socketTimeoutMS=10000,
                       maxPoolSize=20, tz_aware=True)


def database_name(client):
    # Preserve the database in the existing URI unless explicitly overridden.
    return os.getenv("MONGODB_DB") or client.get_default_database(default="ecom_shop_db").name


def get_db(request: Request):
    db = getattr(request.app.state, "db", None)
    if db is None:
        raise HTTPException(503, "MongoDB is not configured. Set MONGODB_URI on the Python backend.")
    return db


def ensure_indexes(db):
    for collection, fields in {"products": ["slug", "sku"], "categories": ["slug"],
                               "brands": ["slug"], "coupons": ["code"],
                               "customers": ["email"], "orders": ["orderNumber"]}.items():
        for field in fields:
            db[collection].create_index(field, unique=True)
    db.products.create_index([("categorySlug", 1), ("status", 1)])
    db.products.create_index("brand")
    db.products.create_index("stock")
    db.activitylogs.create_index([("timestamp", -1)])
    db.inventorylogs.create_index([("productId", 1), ("timestamp", -1)])


def identity(value: str):
    alternatives = [{field: value} for field in ("id", "slug", "sku")]
    if ObjectId.is_valid(value):
        alternatives.insert(0, {"_id": ObjectId(value)})
    return {"$or": alternatives}


def serialize(value):
    if isinstance(value, dict):
        return {key: serialize(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [serialize(item) for item in value]
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, datetime):
        return value.replace(tzinfo=value.tzinfo or timezone.utc).isoformat()
    if isinstance(value, Decimal128):
        return float(value.to_decimal())
    return value


def now():
    return datetime.now(timezone.utc)
