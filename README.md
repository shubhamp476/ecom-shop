# ECOM-SHOP

Electronics storefront and administration application. The existing Next.js/React interface now uses a Python FastAPI API with **PyMongo**, the Python driver for **MongoDB Atlas**. MongoDB remains the database.

```text
Browser → Next.js pages and /api proxy → FastAPI → PyMongo MongoClient → MongoDB Atlas
                                      ↓
                              Pandas CSV exports
```

## Implemented features

- Product browsing, category pages, product detail pages and existing cart UI.
- Product CRUD with pagination, literal search, sorting, unique SKU/slug indexes and Pydantic validation.
- Category hierarchy, brands, suppliers, customers, coupons, store settings and existing order updates.
- Stock adjustments, reserved-stock checks, activity and inventory logs.
- MongoDB aggregation for category totals and brand price statistics, plus low-stock reports.
- CSV preview/import and Pandas exports with quoted fields and spreadsheet formula protection.
- Production administrator Basic authentication over HTTPS and a server-to-server API key.

Checkout/payment processing and customer authentication are not implemented. The cart is existing frontend state, not a completed payment workflow. Historical sample data in `src/lib/admin-store.ts` is retained as reference and is not used for persistence.

## Requirements and layout

Node.js 22+, Python 3.12+, and a reachable MongoDB Atlas cluster.

```text
src/app/                 Existing storefront and admin pages
src/app/api/             Same-origin forwarding handlers
src/lib/backend.ts       Server-only FastAPI client
src/lib/data-service.ts  Storefront data access
src/models/              TypeScript API contracts (no Mongoose)
src/proxy.ts             Production admin authentication
backend/main.py          FastAPI routes, error handling and access checks
backend/db.py            Pooled MongoClient, BSON conversion and indexes
backend/schemas.py       Pydantic validation
backend/reports.py       MongoDB aggregation and Pandas CSV export
backend/manage.py        Ping, index setup and non-destructive catalog seeding
backend/tests/           Isolated automated API tests
netlify.toml             Next.js deployment configuration
render.yaml              Python API hosting blueprint
Final_Project_Report.docx Academic report
```

## Local setup

```bash
npm ci
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements-dev.txt
```

Copy `.env.example` to `.env.local` only if that file does not already exist. Preserve existing credentials when editing it.

1. Set `MONGODB_URI` to your real Atlas connection string. URL-encode special characters in the database password. Replace all placeholders.
2. Use a database user restricted to the existing application database. Allow the Python host's outbound addresses in Atlas Network Access.
3. The database in the URI is retained. `MONGODB_DB` can explicitly override it; the default is `ecom_shop_db` only when neither is provided. Existing Mongoose collection names and camelCase fields are preserved.
4. Check connectivity, then create indexes:

```bash
python -m backend.manage ping
python -m backend.manage indexes
# Optional, explicit sample catalog insertion. Existing products are not overwritten:
python -m backend.manage seed
```

Index setup must pass before serving writes. If existing duplicate SKU/slug values prevent index creation, inspect and resolve them deliberately; setup never deletes or deduplicates data automatically.

Start the backend and frontend in separate terminals:

```bash
source .venv/bin/activate
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

```bash
npm run dev
```

Open `http://localhost:3000`, `/shop`, and `/admin`. FastAPI interactive documentation is at `http://127.0.0.1:8000/docs`.

## Environment variables

| Variable | Host | Purpose |
|---|---|---|
| `MONGODB_URI` | Python only | Atlas URI; never exposed to the browser |
| `MONGODB_DB` | Python only | Optional database-name override |
| `APP_ENV` | Python | Set `production` on deployed API |
| `BACKEND_URL` | Next.js only | Python origin, without `/api`; local default `http://127.0.0.1:8000` |
| `BACKEND_API_KEY` | Both hosts | Same strong random secret on Python and Next.js |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Next.js | Administrator browser sign-in; required in production |
| `DEMO_MODE` | Next.js | `true` enables explicitly labelled, read-only sample storefront |
| `ALLOW_SEED` | Python | Optional seed HTTP endpoint; disabled by default |

Do not prefix credentials with `NEXT_PUBLIC_`. In production missing admin credentials disable administration. The API key is forwarded only by the Next.js server. This is a basic single-administrator deployment gate; individual users, roles, rate limiting and session management remain future enhancements.

A database outage returns HTTP 503. Writes never silently fall back to memory. Empty collections remain empty. The optional demo catalog is deliberately selected with `DEMO_MODE=true`; it cannot accept administrative writes.

## API reference

The browser keeps its existing `/api/...` URLs; Next.js forwards them to FastAPI.

| Endpoint | Methods | Function |
|---|---|---|
| `/health`, `/health/ready` (Python) | GET | Process health / actual MongoDB ping |
| `/api/products` | GET, POST | Published catalog / protected creation |
| `/api/products/{slug}` (Python) | GET | Published product |
| `/api/categories` (Python) | GET | Active categories |
| `/api/admin/products` | GET, POST | Filtered product list / create |
| `/api/admin/products/{id}` | GET, PUT, PATCH, DELETE | ObjectId, legacy ID, slug or SKU lookup |
| `/api/admin/categories` | GET, POST, PUT, DELETE | Hierarchy; update/delete by slug |
| `/api/admin/brands`, `/api/admin/suppliers` | GET, POST | Resource management |
| `/api/admin/customers` | GET, POST, PATCH | Customer management by email |
| `/api/admin/coupons` | GET, POST, PATCH, DELETE | Coupon management by code |
| `/api/admin/orders` | GET, PATCH | Existing orders and status updates |
| `/api/admin/settings` | GET, PUT | Store configuration |
| `/api/admin/inventory/adjust` | POST | Signed integer stock change with reason |
| `/api/admin/logs` | GET | Latest activity and inventory logs |
| `/api/admin/stats` | GET | KPIs and order-derived charts |
| `/api/admin/reports/inventory` | GET | Category/brand aggregation and stock ≤10 |
| `/api/admin/import` | POST | `{csvContent, commit}` preview/import |
| `/api/admin/export?type=products` | GET | Products, orders or inventory CSV |
| `/api/seed` | POST | Explicitly enabled sample insertion; GET does not mutate |

Errors use `{success:false,error:...}`: validation 422, missing records 404, duplicate/conflicting writes 409, authentication 401, unavailable database 503. BSON ObjectIds become strings and datetimes become ISO 8601 values in JSON. Timestamps remain BSON dates in MongoDB.

The existing status vocabulary is preserved: `Draft`, `Active`, `Inactive`, `Archived`, `Out of Stock`. The submitted report's illustrative `title`/`created_at` fields correspond to actual `name`/`createdAt` fields. Only `Active` products appear publicly. Prices must be positive, stock must be a non-negative integer, reserved stock cannot exceed stock, and the selected category must exist.

Stock adjustments use optimistic compare-and-update to avoid losing concurrent changes. Inventory mutation and separate audit inserts are not a multi-document transaction. CSV imports validate the file before writing but are not transactional across the batch; a database error during commit can leave a partial import. Repeatable imports match SKU. Profit remains unavailable because order-time cost snapshots are absent; no estimated profit is presented as measured data.

## Tests and build

```bash
source .venv/bin/activate
python -m pytest backend/tests -q
npm run typecheck
npm run build
```

API tests use `mongomock` through a dependency override. They exercise the actual FastAPI validation, PyMongo operation paths, response serialization, duplicate indexes, inventory, aggregation and CSV behavior without modifying Atlas. They do not prove Atlas network connectivity or MongoDB transaction semantics. Test evidence is saved in `docs/evidence/`.

Production builds use Next.js's supported Webpack path and PostCSS/Tailwind. The original Turbopack build could not open its worker port in this execution environment. Cache Components/partial prefetching were removed from configuration; database-driven pages render dynamically and API fetches use `no-store`.

For a repeatable browser integration smoke test, start `uvicorn backend.tests.serve_fixture:app --port 8765`, then start the built frontend with `BACKEND_URL=http://127.0.0.1:8765 DEMO_MODE=false ADMIN_USERNAME=test ADMIN_PASSWORD=local-test-only npm start -- --port 3100`. Run `node scripts/smoke-pymongo.cjs`. This development-only fixture uses an isolated mock database; do not deploy it. The script expects Google Chrome at its standard macOS path.

## Netlify and Python deployment

Netlify hosts the Next.js application. FastAPI is a separate Python service; Netlify's Node functions do not run this PyMongo backend.

1. Deploy the repository's `render.yaml` as a Render Blueprint (or build `backend/Dockerfile` on a Python/container host).
2. Provide the real `MONGODB_URI` on that host. Render generates `BACKEND_API_KEY`; copy that value to Netlify. The start command provisions indexes before starting Uvicorn.
3. Verify the Python `/health/ready` endpoint returns `database: connected`.
4. On Netlify set `BACKEND_URL` to the Python HTTPS origin, `BACKEND_API_KEY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `DEMO_MODE=false`.
5. Deploy with the included `netlify.toml`, which uses Netlify's Next.js adapter and publishes `.next`. Rebuild after changing demo mode so static page notices match the chosen mode.

A preview deployment uses `DEMO_MODE=true` until the real Atlas URI and Python host are available. See `docs/DEPLOYMENT_STATUS.md` for the actual deployment result. The original PDF in Downloads is unchanged.

Deployment bundles must exclude local dotenv files. `next.config.ts` excludes them from tracing. The preview is built from a clean frontend staging directory and its function archive is scanned before upload. Publishing status is recorded in docs/DEPLOYMENT_STATUS.md. Keep Atlas credentials only on the Python host.

Regenerate the report with `python scripts/generate-report.py` and create a source archive with `python scripts/package-project.py`. The archive excludes `.env.local`, dependencies and build caches.
