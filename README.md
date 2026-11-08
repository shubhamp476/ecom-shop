# ECOM-SHOP

Electronics storefront and administration application, written entirely in **TypeScript**: a **Next.js** (React) frontend and a **Node.js** (Express) API that uses the official **MongoDB Node.js driver** with **MongoDB Atlas**.

```text
Browser → Next.js pages and /api proxy → Node.js API (Express) → MongoDB driver → MongoDB Atlas
                                              ↓
                                     CSV import / export
```

## Implemented features

- Product browsing, category pages, product detail pages, cart and Razorpay checkout.
- Product CRUD with pagination, literal search, sorting, unique SKU/slug indexes and Zod validation.
- Category hierarchy, brands, suppliers, customers, coupons, store settings and order creation/updates.
- Stock adjustments, reserved-stock checks, activity and inventory logs.
- MongoDB aggregation for category totals and brand price statistics, plus low-stock reports.
- CSV preview/import and exports with quoted fields and spreadsheet formula protection.
- Production administrator Basic authentication over HTTPS and a server-to-server API key.

Customer authentication is not implemented. Historical sample data in `src/lib/admin-store.ts` is retained as reference and is not used for persistence.

## Requirements and layout

Node.js 22+ and a reachable MongoDB Atlas cluster.

```text
src/app/                   Storefront and admin pages
src/app/api/               Same-origin forwarding handlers (plus Razorpay checkout)
src/lib/backend.ts         Server-only API client
src/lib/data-service.ts    Storefront data access
src/models/                TypeScript API contracts
src/proxy.ts               Production admin authentication
backend/src/app.ts         Express routes, error handling and access checks
backend/src/db.ts          Pooled MongoClient, BSON serialization and indexes
backend/src/schemas.ts     Zod validation
backend/src/reports.ts     MongoDB aggregation, stats and CSV export
backend/src/manage.ts      Ping, index setup, live verification and catalog seeding
backend/src/server.ts      HTTP server entry point
backend/test/              Automated API tests (in-memory MongoDB)
netlify.toml               Next.js deployment configuration
render.yaml                Node.js API hosting blueprint
```

## Local setup

```bash
npm ci
npm run backend:install   # installs backend/ dependencies
```

Copy `.env.example` to `.env.local` only if that file does not already exist. Preserve existing credentials when editing it. Both the frontend and the backend read the repository-root `.env.local`/`.env`.

1. Set `MONGODB_URI` to your real Atlas connection string. URL-encode special characters in the database password. Replace all placeholders.
2. Use a database user restricted to the existing application database. Allow the API host's outbound addresses in Atlas Network Access.
3. The database in the URI is retained. `MONGODB_DB` can explicitly override it; the default is `ecom_shop_db` only when neither is provided. Existing collection names and camelCase fields are preserved.
4. Check connectivity, then create indexes:

```bash
cd backend
npm run manage:dev ping
npm run manage:dev indexes
# Optional live check in a temporary collection (removed afterwards):
npm run manage:dev verify
# Optional, explicit sample catalog insertion. Existing products are not overwritten:
npm run manage:dev seed
```

Index setup must pass before serving writes. If existing duplicate SKU/slug values prevent index creation, inspect and resolve them deliberately; setup never deletes or deduplicates data automatically.

Start the backend and frontend in separate terminals:

```bash
npm run backend   # Node.js API with reload on http://127.0.0.1:8000
```

```bash
npm run dev
```

Open `http://localhost:3000`, `/shop`, and `/admin`.

## Environment variables

| Variable | Host | Purpose |
|---|---|---|
| `MONGODB_URI` | API only | Atlas URI; never exposed to the browser |
| `MONGODB_DB` | API only | Optional database-name override |
| `APP_ENV` | API | Set `production` on deployed API |
| `PORT`, `HOST` | API | Listen address; defaults `8000` and `127.0.0.1` (`0.0.0.0` in production) |
| `BACKEND_URL` | Next.js only | API origin, without `/api`; local default `http://127.0.0.1:8000` |
| `BACKEND_API_KEY` | Both hosts | Same strong random secret on the API and Next.js |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Next.js | Administrator browser sign-in; required in production |
| `DEMO_MODE` | Next.js | `true` enables explicitly labelled, read-only sample storefront |
| `ALLOW_SEED` | API | Optional seed HTTP endpoint; disabled by default |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Next.js | Live Razorpay payments; simulated checkout when absent |

Do not prefix credentials with `NEXT_PUBLIC_`. In production missing admin credentials disable administration. The API key is forwarded only by the Next.js server. This is a basic single-administrator deployment gate; individual users, roles, rate limiting and session management remain future enhancements.

A database outage returns HTTP 503. Writes never silently fall back to memory. Empty collections remain empty. The optional demo catalog is deliberately selected with `DEMO_MODE=true`; it cannot accept administrative writes.

## API reference

The browser keeps its existing `/api/...` URLs; Next.js forwards them to the Node.js API.

| Endpoint | Methods | Function |
|---|---|---|
| `/health`, `/health/ready` (API) | GET | Process health / actual MongoDB ping |
| `/api/products` | GET, POST | Published catalog / protected creation |
| `/api/products/{slug}` (API) | GET | Published product |
| `/api/categories` (API) | GET | Active categories |
| `/api/orders` | POST | Checkout order creation (stock deduction, customer upsert) |
| `/api/admin/products` | GET, POST | Filtered product list / create |
| `/api/admin/products/{id}` | GET, PUT, PATCH, DELETE | ObjectId, legacy ID, slug or SKU lookup |
| `/api/admin/categories` | GET, POST, PUT, DELETE | Hierarchy; update/delete by slug |
| `/api/admin/brands`, `/api/admin/suppliers` | GET, POST | Resource management |
| `/api/admin/customers` | GET, POST, PATCH | Customer management by email |
| `/api/admin/coupons` | GET, POST, PATCH, DELETE | Coupon management by code |
| `/api/admin/orders` | GET, POST, PATCH | Orders and status updates |
| `/api/admin/settings` | GET, PUT | Store configuration |
| `/api/admin/inventory/adjust` | POST | Signed integer stock change with reason |
| `/api/admin/logs` | GET | Latest activity and inventory logs |
| `/api/admin/stats` | GET | KPIs and order-derived charts |
| `/api/admin/reports/inventory` | GET | Category/brand aggregation and stock ≤10 |
| `/api/admin/import` | POST | `{csvContent, commit}` preview/import |
| `/api/admin/export?type=products` | GET | Products, orders or inventory CSV |
| `/api/seed` | POST | Explicitly enabled sample insertion; GET does not mutate |

Errors use `{success:false,error:...}`: validation 422, missing records 404, duplicate/conflicting writes 409, authentication 401, unavailable database 503. BSON ObjectIds become strings and datetimes become ISO 8601 (UTC, `Z`) values in JSON. Timestamps remain BSON dates in MongoDB.

The existing status vocabulary is preserved: `Draft`, `Active`, `Inactive`, `Archived`, `Out of Stock`. Only `Active` products appear publicly. Prices must be positive, stock must be a non-negative integer, reserved stock cannot exceed stock, and the selected category must exist.

Stock adjustments use optimistic compare-and-update to avoid losing concurrent changes. Inventory mutation and separate audit inserts are not a multi-document transaction. CSV imports validate the file before writing but are not transactional across the batch; a database error during commit can leave a partial import. Repeatable imports match SKU. Profit remains unavailable because order-time cost snapshots are absent; no estimated profit is presented as measured data.

## Tests and build

```bash
npm run test:backend               # API tests against a throwaway in-memory MongoDB
npm --prefix backend run build     # compile the API to backend/dist
npm run typecheck
npm run build
```

API tests use `mongodb-memory-server`, which starts a real, temporary `mongod` (downloaded on first run). They exercise validation, driver operations, response serialization, unique indexes, inventory, aggregation and CSV behavior without touching Atlas. They do not prove Atlas network connectivity.

Production builds use Next.js's supported Webpack path and PostCSS/Tailwind. Database-driven pages render dynamically and API fetches use `no-store`.

For a repeatable browser integration smoke test, start `npm --prefix backend run fixture` (in-memory MongoDB on port 8765), then start the built frontend with `BACKEND_URL=http://127.0.0.1:8765 DEMO_MODE=false ADMIN_USERNAME=test ADMIN_PASSWORD=local-test-only npm start -- --port 3100`. Run `node scripts/smoke-api.cjs`. This development-only fixture uses an isolated database; do not deploy it. The script expects Google Chrome at its standard macOS path.

## Deployment

Netlify hosts the Next.js application. The Node.js API runs as a separate service.

1. Deploy the repository's `render.yaml` as a Render Blueprint (or build `backend/Dockerfile` with `docker build -t ecom-shop-api backend`).
2. Provide the real `MONGODB_URI` on that host. Render generates `BACKEND_API_KEY`; copy that value to Netlify. The start command provisions indexes before starting the API.
3. Verify the API's `/health/ready` endpoint returns `database: connected`.
4. On Netlify set `BACKEND_URL` to the API HTTPS origin, `BACKEND_API_KEY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `DEMO_MODE=false`.
5. Deploy with the included `netlify.toml`, which uses Netlify's Next.js adapter and publishes `.next`. Rebuild after changing demo mode so static page notices match the chosen mode.

Alternatively, the root `Dockerfile` builds a single container that runs both the API and the Next.js server (`deploy/start.sh`).

Deployment bundles must exclude local dotenv files. `next.config.ts` excludes them from tracing. Keep Atlas credentials only on the API host. See `docs/DEPLOYMENT_STATUS.md` for earlier deployment history.

Create a source archive of the committed tree with `npm run package` (local `.env*` files are never included). The academic report generator `scripts/generate-report.py` and `Final_Project_Report.docx` document the earlier Python implementation and have not been regenerated.
