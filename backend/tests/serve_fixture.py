"""Local browser smoke-test server. Never deployed or used by production startup."""
import mongomock
from backend.main import app
from backend.db import get_db, ensure_indexes
from backend.manage import seed_catalog

db = mongomock.MongoClient(tz_aware=True).browser_smoke
ensure_indexes(db)
seed_catalog(db)
app.dependency_overrides[get_db] = lambda: db
