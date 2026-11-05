"""Build the final academic report from verified implementation and saved evidence."""
from pathlib import Path
import json
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parent.parent
EVIDENCE = ROOT/'docs/evidence'
DOC = Document()
sec = DOC.sections[0]
sec.top_margin=Inches(.75); sec.bottom_margin=Inches(.7)
sec.left_margin=Inches(.85); sec.right_margin=Inches(.85)
styles=DOC.styles
styles['Normal'].font.name='Calibri';styles['Normal'].font.size=Pt(11)
styles['Normal'].paragraph_format.space_after=Pt(7)
for name in ['Title','Heading 1','Heading 2']:
    styles[name].font.name='Calibri';styles[name].font.color.rgb=RGBColor.from_string('17365D')
header=sec.header.paragraphs[0];header.text='ECOM-SHOP  |  Final Project Report';header.style='Caption'
footer=sec.footer.paragraphs[0];footer.alignment=WD_ALIGN_PARAGRAPH.RIGHT
footer.add_run('Shubham · 12314083   |   Page ')
f=OxmlElement('w:fldSimple');f.set(qn('w:instr'),'PAGE');footer._p.append(f)

def para(text): DOC.add_paragraph(text)
def heading(text): DOC.add_heading(text,1)
def table(headers, rows):
    t=DOC.add_table(rows=1, cols=len(headers));t.style='Light Shading Accent 1'
    for c,v in zip(t.rows[0].cells,headers):c.text=str(v)
    for row in rows:
        for c,v in zip(t.add_row().cells,row):c.text=str(v)
    DOC.add_paragraph()
def code(text):
    p=DOC.add_paragraph();p.paragraph_format.space_after=Pt(10)
    r=p.add_run(text.strip());r.font.name='Consolas';r.font.size=Pt(8)
def picture(filename, caption):
    p=EVIDENCE/filename
    if p.exists():
        DOC.add_picture(str(p),width=Inches(6.45));DOC.add_paragraph(caption,'Caption')
def page():DOC.add_page_break()

# Cover
for txt in ['LOVELY PROFESSIONAL UNIVERSITY','School of Computer Science and Engineering']:
    p=DOC.add_paragraph(txt);p.alignment=WD_ALIGN_PARAGRAPH.CENTER;p.runs[0].bold=True
DOC.add_paragraph('\n')
p=DOC.add_paragraph('FINAL PROJECT REPORT','Title');p.alignment=WD_ALIGN_PARAGRAPH.CENTER
p=DOC.add_paragraph('ECOM-SHOP','Title');p.alignment=WD_ALIGN_PARAGRAPH.CENTER
p=DOC.add_paragraph('MongoDB-Based Electronics and Mobile\nE-Commerce Website');p.alignment=WD_ALIGN_PARAGRAPH.CENTER
DOC.add_paragraph('\n')
table(['Academic information','Details'],[
('Student','Shubham'),('Registration Number','12314083'),('Roll Number','21'),
('Academic Task Number','2'),('Course Code','CSE 494'),('Course Title','Intelligent NoSQL Databases'),
('Implementation review date','4 November 2026')])
para('Repository: https://github.com/shubhamp476/ecom-shop.git')
para('Previously reported website: https://ecommobileshop.vercel.app/ (historical reference; not used as evidence of this update).')
para('Implementation: Next.js → FastAPI → PyMongo → MongoDB Atlas. Current deployment status is recorded in Section 14.')
page()
heading('Contents')
sections=['Acknowledgement','Abstract','Problem Statement','Objectives','Technology Stack','System Overview and Architecture','Database and Document Design','Validation Rules','CRUD Operations Using PyMongo','MongoDB Aggregation and Reports','Python and PyMongo Integration','Role of Next.js, FastAPI and Pandas','Testing and Output Verification','Limitations and Future Enhancements','Conclusion','References']
for i,title in enumerate(sections,2):para(f'{i}. {title}')
para('The cover page is Section 1. The report follows the submitted PDF’s academic information and subject coverage, with implementation details corrected against the updated source.')
heading('2. Acknowledgement')
para('I acknowledge Lovely Professional University and the School of Computer Science and Engineering for the academic setting in which this project was developed. The course Intelligent NoSQL Databases provided the context for studying document-oriented storage, validation, CRUD operations and aggregation. I also acknowledge the official documentation and open-source communities behind MongoDB, PyMongo, FastAPI, Pydantic, Next.js and Pandas. No individual supervisor name has been added because it was not supplied in the reference report.')
heading('3. Abstract')
para('ECOM-SHOP is an electronics storefront and administrative catalog application. This update aligns the running code with the Python architecture described in the previously submitted academic report. The inspected implementation originally performed database operations in Next.js using Mongoose and could fall back to process-memory data after database errors. The revised implementation routes requests through FastAPI, validates documents with Pydantic and uses PyMongo for MongoDB operations. MongoDB Atlas remains the intended persistent database.')
para('The work covers product CRUD, category hierarchy, related administrative resources, stock adjustments, BSON-to-JSON conversion, duplicate constraints, MongoDB aggregation and CSV processing. Automated tests and browser checks are reported separately from external Atlas and hosting verification. The integration was verified in isolated API tests and separate live Atlas checks. External hosting limitations are stated explicitly.')
heading('4. Problem Statement')
para('Electronic products differ in brand, specifications, variants and inventory requirements. A document database accommodates this diversity, but flexible storage must be paired with clear validation and consistent update behavior. The existing code also differed from the report’s claimed Python architecture, creating a gap between documentation and implementation. A failed database write could appear successful because data was added to an in-memory fallback store; such data would not persist across server processes or deployments.')
para('The update therefore needs to preserve the user interface, move persistence into the documented Python layer, surface genuine failures, and provide verifiable product and inventory analysis without fabricated metrics.')
heading('5. Objectives')
for text in ['Retain the existing Next.js storefront and administration interface while replacing Mongoose database operations with PyMongo.', 'Maintain a clear separation between presentation, HTTP API, validation and database access.', 'Validate product information and prevent duplicate SKU and slug identifiers through MongoDB indexes.', 'Support correct CRUD and stock operations, including zero stock, reserved stock and missing-record errors.', 'Produce category, brand and low-stock reports from database records; support CSV import and export.', 'Verify the implementation using automated API tests and browser integration checks, and document all external-service limitations.']:
    DOC.add_paragraph(text,style='List Bullet')
page()
heading('6. Technology Stack')
table(['Technology','Implemented role'],[
('Next.js 16.4.1 / React / TypeScript','Existing storefront, admin pages, server-side data access and same-origin API proxy'),
('Python 3.12 / FastAPI','HTTP endpoints and backend lifecycle'),('PyMongo 4.x','Pooled MongoClient, collection operations and aggregation'),
('MongoDB Atlas','Persistent document database; connection configured by environment variable'),('Pydantic 2.x','Typed request validation and derived product fields'),
('Pandas','Product, order and inventory CSV export'),('Tailwind CSS / PostCSS','Existing styling; supported Webpack production build'),
('pytest / mongomock / HTTPX','Isolated API regression tests'),('Puppeteer / Google Chrome','Browser integration checks and captured screenshots'),
('Netlify / Render blueprint','Next.js frontend deployment / separate Python API hosting configuration')])
para('Version ranges are recorded in requirements.txt and package.json. Installed Python versions are captured in docs/evidence/python-versions.txt when available. Pandas is used for export; primary aggregation is performed by MongoDB.')
heading('7. System Overview and Architecture')
table(['Layer','Responsibilities','Main files'],[
('Browser','Browse products and operate existing admin forms','src/app; src/components'),
('Next.js server','Forward existing /api routes and protect admin access','src/lib/backend.ts; src/proxy.ts'),
('FastAPI','Validate requests, enforce API key, select CRUD/report operation','backend/main.py; backend/schemas.py'),
('PyMongo','Manage client pool and execute document queries','backend/db.py'),
('MongoDB Atlas','Persist collections and maintain indexes','Existing application database')])
code('''Customer / Administrator\n          │ HTTPS\n          ▼\n    Next.js on Netlify\n          │ server-side HTTP + X-API-Key for protected operations\n          ▼\n   Python FastAPI service\n          │ Pydantic validation\n          ▼\n    PyMongo MongoClient\n          │ authenticated TLS connection\n          ▼\n      MongoDB Atlas\n          └── products, categories, orders, inventorylogs, ...''')
para('A browser request to /api/admin/products keeps the existing frontend URL. The Next.js route passes the method, query and body to the configured BACKEND_URL. FastAPI validates the request and executes PyMongo operations. The response preserves the existing success/product/products/pagination shapes. Database credentials are held only by the Python process; the browser never receives the Atlas URI or backend API key.')
para('Netlify does not run this Python service inside its Node functions. The deployment therefore has two hosts. render.yaml and backend/Dockerfile provide the Python startup path, including explicit index provisioning before API startup.')
picture('architecture.png','Architecture diagram. The Python service uses a separate host from Next.js.')
heading('8. Database and Document Design')
para('Database selection preserves the name in MONGODB_URI unless MONGODB_DB explicitly overrides it. The newly supplied URI selects mydatabase. The reference PDF’s ecom_shop_db remains the fallback only when no database name is configured. No database is silently renamed or copied.')
table(['Collection','Purpose / representative fields'],[
('products','name, slug, sku, categorySlug, brand, price, mrp, stock, reservedStock, specs, variants'),
('categories','name, slug, parentId, status, sortOrder, specTemplate'),('brands / suppliers','Brand and supplier information'),
('customers / orders','Existing customer records and order status management'),('coupons / storesettings','Promotion rules and store settings'),
('inventorylogs','productId, quantityChange, previousStock, newStock, reason, timestamp'),
('activitylogs','actor, action, entity, entityId, details, timestamp')])
para('The actual product field is name, not the illustrative title in the previous report. Dates use createdAt and updatedAt. Existing capitalized status values are retained. Specifications are a list of label/value objects; variants hold SKU, attributes, pricing and stock. This alignment avoids introducing a second incompatible document shape.')
code('''{
  "_id": "ObjectId serialized as a string in API responses",
  "name": "Test Phone",
  "slug": "test-phone",
  "sku": "TEST-001",
  "category": "Phones",
  "categorySlug": "phones",
  "price": 100.0,
  "mrp": 150.0,
  "stock": 10,
  "reservedStock": 0,
  "availableStock": 10,
  "status": "Active",
  "specs": [],
  "createdAt": "BSON datetime in MongoDB; ISO 8601 in JSON"
}''')
para('This example uses the automated test fixture and is not a claimed production product. Unique indexes protect products.slug and products.sku, category/brand slugs, customer email, coupon code and order number. Additional indexes support category/status queries, stock queries and log access. Index creation deliberately fails if conflicting existing data needs review; it does not delete records.')
page()
heading('9. Validation Rules')
table(['Input / condition','Implemented rule'],[
('name and category','Non-empty trimmed strings'),('price','Positive finite numeric value'),('mrp','Non-negative; normalized to price if omitted; cannot be below selling price'),
('stock and reservedStock','Non-negative integer values; reservedStock cannot exceed stock'),('slug','Lowercase URL-safe letters/digits separated by hyphens; generated from name when omitted'),
('sku / slug','Unique database indexes; duplicate key maps to HTTP 409'),('categorySlug','Must reference an existing category'),
('status','Draft, Active, Inactive, Archived or Out of Stock'),('category hierarchy','Parent must exist; cycles are rejected'),
('coupon','Allowed status/type, valid date order, percentage no greater than 100'),('pagination','page ≥1 and limit between 1 and 1000')])
para('The request models normalize data before persistence. Patch requests merge the submitted fields with the existing product and validate the complete result. Derived fields, including availableStock, inStock and discount values, are recomputed. Pydantic validation returns HTTP 422 with readable errors; it does not replace the database’s unique indexes.')
para('MongoDB collection-level JSON Schema validators are not installed by this update. Data written outside the API must therefore respect the same contract or be validated by a separate migration process.')
heading('10. CRUD Operations Using PyMongo')
table(['Operation','Methods used','Behavior'],[
('Create','insert_one','Validate product/category, add BSON dates, insert and log'),('Read','find / find_one / count_documents','Filter, sort, paginate and return matching records'),
('Update','find_one_and_update with $set','Validate merged input and return the updated document'),('Delete','find_one_and_delete','Delete an identified product; missing records return 404'),
('Seed','update_one with $setOnInsert','Insert missing sample catalog records without overwriting existing products')])
para('The following shortened excerpts reflect the implementation. Identifiers are accepted as BSON ObjectIds only when ObjectId.is_valid succeeds; otherwise the query safely checks legacy id, slug and sku strings. This avoids passing malformed ObjectId values to the driver.')
code('''data = model.document()
validate_category(db, data)
data.update(createdAt=now(), updatedAt=now())
data["_id"] = db.products.insert_one(data).inserted_id

query = {"_id": old["_id"], "updatedAt": old.get("updatedAt")}
updated = db.products.find_one_and_update(
    query, {"$set": data}, return_document=ReturnDocument.AFTER
)
if updated is None:
    raise HTTPException(409, "Product changed concurrently")''')
para('Zero stock is preserved instead of being replaced with a default quantity. A stock adjustment is rejected when it would reduce stock below reserved stock. Optimistic compare-and-update detects competing changes. The stock document and separate audit inserts are not enclosed in a multi-document transaction, which remains a limitation.')
heading('11. MongoDB Aggregation and Reports')
para('The category report groups products by category, counts products, totals units and calculates inventory value as price multiplied by stock. The brand report returns product count and minimum, maximum and average selling prices. The low-stock report selects products with ten units or fewer, matching the academic report’s threshold. The dashboard separately uses each product’s reorderLevel for operational alerts.')
code('''CATEGORY_PIPELINE = [
  {"$group": {
    "_id": "$category",
    "productCount": {"$sum": 1},
    "totalStock": {"$sum": "$stock"},
    "inventoryValue": {"$sum": {"$multiply": ["$price", "$stock"]}}
  }},
  {"$sort": {"_id": 1}}
]
rows = list(db.products.aggregate(CATEGORY_PIPELINE))''')
para('The reports page calls /api/admin/reports/inventory and renders these returned values. Previous hard-coded category revenue and profit examples have been removed. Dashboard monthly revenue uses stored paid orders and dates; empty datasets produce empty series. Gross profit is unavailable until order-time cost snapshots exist, rather than being inferred from an arbitrary cost percentage.')
heading('12. Python and PyMongo Integration')
para('Each FastAPI worker owns a lazy MongoClient with a bounded connection pool, timezone-aware dates and finite server-selection, connection and socket timeouts. FastAPI’s lifespan closes the client during shutdown. Database selection and credentials are configured by environment variables; no Atlas URI is committed in source or included in this report.')
code('''MongoClient(
    uri,
    connect=False,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=5000,
    socketTimeoutMS=10000,
    maxPoolSize=20,
    tz_aware=True,
)''')
para('Synchronous API functions run through FastAPI’s threadpool, keeping blocking PyMongo operations off the main asynchronous event loop. The health endpoint checks process availability; /health/ready performs a MongoDB ping. DuplicateKeyError maps to 409, database exceptions to 503, missing documents to 404 and validation errors to 422. Detailed database errors are not returned to the browser.')
para('BSON ObjectIds are recursively converted to strings. Datetime values are represented as ISO 8601 strings in HTTP responses, while their stored MongoDB type remains Date. Decimal128 is converted to a JSON number if encountered. The existing price contract remains floating point; a future financial system should define exact decimal storage and rounding policies.')
heading('13. Role of Next.js, FastAPI and Pandas')
para('Next.js preserves the customer and administrator screens and acts as a same-origin HTTP proxy. Database-driven product/category pages render dynamically and backend fetches disable caching to avoid stale catalog changes. TypeScript model files retain interface definitions but no longer initialize Mongoose models.')
para('FastAPI owns database operations, Pydantic validation, protected administration, inventory rules and consistent JSON errors. Production access is gated by administrator Basic authentication over HTTPS at Next.js and a shared backend API key. This is a single-administrator gate, not a complete role-based identity system.')
para('Pandas turns database rows into structured CSV exports. Import uses Python’s CSV parser, which correctly handles quoted commas. Preview validates rows before a commit. Imports match SKU for repeatable updates; an operational failure partway through a commit can still leave a partial batch because batch-wide transactions are not implemented.')
page()
heading('14. Testing and Output Verification')
backend_text=(EVIDENCE/'backend-tests.txt').read_text() if (EVIDENCE/'backend-tests.txt').exists() else 'No saved test output.'
browser_text=(EVIDENCE/'browser-tests.txt').read_text() if (EVIDENCE/'browser-tests.txt').exists() else 'No saved browser test output.'
atlas=(EVIDENCE/'atlas-connectivity.txt').read_text() if (EVIDENCE/'atlas-connectivity.txt').exists() else 'Atlas verification pending.'
if (EVIDENCE/'atlas-crud.json').exists(): atlas += '\n'+(EVIDENCE/'atlas-crud.json').read_text()
if (EVIDENCE/'atlas-setup.txt').exists(): atlas += '\nCatalog setup: '+(EVIDENCE/'atlas-setup.txt').read_text()
deploy=(ROOT/'docs/DEPLOYMENT_STATUS.md').read_text() if (ROOT/'docs/DEPLOYMENT_STATUS.md').exists() else 'Deployment status not yet recorded.'
para('Test evidence is generated from execution output. The isolated database is mongomock, not MongoDB Atlas; mock success does not prove remote connectivity, server-specific edge cases or transactional semantics. No production performance or load measurements were collected.')
table(['Verification','Evidence / scope'],[
('Backend regression suite','19 automated cases covering CRUD, duplicates, validation, inventory, aggregation, CSV, ancillary resources, errors and access checks'),
('Browser integration','Next.js → FastAPI response, create/read/update/delete, storefront/admin rendering and product edit fetch'),
('Frontend build','Supported Next.js Webpack production build; saved build log'),
('Atlas connectivity','Authenticated ping, insert/read/update/delete, unique SKU and aggregation passed in a temporary Atlas collection; fixture collection removed afterward'),
('Deployment','Actual Netlify/hosting status below')])
DOC.add_heading('14.1 Automated test output',2);code(backend_text)
DOC.add_heading('14.2 Browser integration output',2);code(browser_text)
DOC.add_heading('14.3 Atlas connectivity',2);code(atlas[:2000])
DOC.add_heading('14.4 Deployment status',2);para(deploy)
DOC.add_heading('14.5 Actual application screenshots',2)
para('The following screenshots were captured from the updated local application during browser verification, using an isolated seeded test database. They are not screenshots of production Atlas data. Any preview notice identifies the build configuration used during capture; test products and quantities are fixtures.')
picture('storefront.png','Figure 1. Updated storefront reading the catalog through the Next.js and FastAPI integration.')
picture('admin-products.png','Figure 2. Existing product administration interface with a browser integration test product.')
picture('inventory-report.png','Figure 3. Updated inventory report using category and brand aggregation from the test database.')
page()
heading('15. Limitations and Future Enhancements')
table(['Current limitation','Future enhancement'],[
('Separate Python host must be configured for a live PyMongo application','Deploy Render/container API and connect Netlify BACKEND_URL; verify /health/ready'),
('Mock tests cannot prove all Atlas behavior','Maintain a dedicated real MongoDB integration-test environment'),
('Single administrator gate; no customer authentication','Individual accounts, role-based authorization, rate limits and session management'),
('Existing cart is frontend state; no verified payments','Implement checkout, payment callbacks and order placement safely'),
('Inventory and audit updates are separate operations','Use MongoDB transactions or an outbox for atomic audit delivery'),
('CSV commits are not transactional across the entire batch','Add resumable jobs, import manifests and transactional batch handling'),
('No order-time cost snapshots','Record exact product cost and tax information when orders are created'),
('Broad reports read collections into memory','Introduce bounded pagination, indexed aggregation and measured query optimization'),
('No MongoDB JSON Schema installation','Plan compatible collection validators and a reviewed legacy-data migration'),
('Floating-point price contract','Define fixed-point/Decimal128 monetary calculation and storage policies')])
para('The update preserves existing visual content and frontend demonstrations. Those elements should not be interpreted as evidence of a completed commerce, payment, review or fulfillment system. Deployment and connectivity claims remain limited to the actual recorded checks.')
heading('16. Conclusion')
para('The updated ECOM-SHOP source now follows the architecture stated in the academic project: Next.js communicates with FastAPI, and PyMongo performs MongoDB operations. The migration removes the Mongoose persistence dependency and eliminates silent in-memory write fallback. It retains the existing interface contracts while adding explicit validation, BSON serialization, inventory checks, database-derived reports and repeatable tests.')
para('The documented tests support the correctness of the implemented integration in its tested environment. Live database and hosting status are reported separately. The project provides a concrete basis for further work on authentication, transactional inventory, reliable imports and complete order/payment workflows.')
heading('17. References')
refs=[
('Submitted project report','Shubham, “ECOM-SHOP — MongoDB-Based Electronics and Mobile E-Commerce Website”, supplied PDF, 11 pages. Local reference: 12314083shubham21 - Google Docs.pdf. Original file preserved.'),
('MongoDB PyMongo documentation','https://www.mongodb.com/docs/languages/python/pymongo-driver/current/'),
('MongoDB aggregation','https://www.mongodb.com/docs/manual/aggregation/'),('MongoDB indexes','https://www.mongodb.com/docs/manual/indexes/'),
('FastAPI documentation','https://fastapi.tiangolo.com/'),('Pydantic documentation','https://docs.pydantic.dev/latest/'),('Pandas CSV export','https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.to_csv.html'),
('Next.js documentation','https://nextjs.org/docs — implementation also checked against the installed Next.js 16.4.1 guides in node_modules/next/dist/docs/'),
('Netlify Next.js integration','https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/'),('Render Python hosting','https://render.com/docs/deploy-fastapi'),
('Source repository','https://github.com/shubhamp476/ecom-shop.git — updated local working tree, not a claim that changes have been pushed')]
for i,(title,value) in enumerate(refs,1):para(f'[{i}] {title}. {value}')
DOC.core_properties.title='ECOM-SHOP — Final Project Report'
DOC.core_properties.author='Shubham'
DOC.core_properties.subject='CSE 494 — Intelligent NoSQL Databases'
DOC.core_properties.keywords='ECOM-SHOP, PyMongo, MongoDB, FastAPI, Next.js'
output=ROOT/'Final_Project_Report.docx';DOC.save(output)
print(output)
print(f'{len(DOC.paragraphs)} paragraphs; {len(DOC.tables)} tables; {len(DOC.inline_shapes)} screenshots')
