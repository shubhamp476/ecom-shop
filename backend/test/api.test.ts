import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { after, afterEach, before, beforeEach, describe, test } from "node:test";
import { parse as parseCsv } from "csv-parse/sync";
import { MongoClient, MongoNetworkError, ObjectId, type Db } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../src/app.js";
import { ensureIndexes, identity } from "../src/db.js";
import { seedCatalog } from "../src/seed.js";

let mongod: MongoMemoryServer;
let client: MongoClient;
let db: Db;
let activeDb: Db | null;
let server: Server;
let base: string;
let dbCounter = 0;

interface Reply { status: number; json: any; text: string }

async function call(method: string, path: string, body?: unknown, headers: Record<string, string> = {}): Promise<Reply> {
  const res = await fetch(base + path, {
    method,
    headers: { ...(body !== undefined ? { "content-type": "application/json" } : {}), ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { /* CSV or empty body */ }
  return { status: res.status, json, text };
}
const get = (path: string, headers?: Record<string, string>) => call("GET", path, undefined, headers);
const post = (path: string, body?: unknown) => call("POST", path, body);

const product = () => ({
  name: "Test Phone", slug: "test-phone", sku: "TEST-001", category: "Phones", categorySlug: "phones",
  price: 100, mrp: 150, stock: 10,
});

async function create(data: Record<string, unknown>) {
  const r = await post("/api/admin/products", data);
  assert.equal(r.status, 201, r.text);
  return r.json.product;
}

before(async () => {
  mongod = await MongoMemoryServer.create();
  client = await new MongoClient(mongod.getUri()).connect();
  const app = createApp({ getDb: () => activeDb });
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await client.close();
  await mongod.stop();
});

describe("API", () => {
  const savedEnv = { ...process.env };

  beforeEach(async () => {
    process.env.APP_ENV = "development";
    delete process.env.BACKEND_API_KEY;
    delete process.env.ALLOW_SEED;
    db = client.db(`ecom_test_${++dbCounter}`);
    activeDb = db;
    await ensureIndexes(db);
    await post("/api/admin/categories", { name: "Phones", slug: "phones" });
  });

  afterEach(() => {
    process.env = { ...savedEnv };
  });

  test("CRUD, serialization and no static resurrection", async () => {
    let p = await create(product());
    assert.ok(ObjectId.isValid(p._id));
    assert.match(p.createdAt, /Z$/);
    for (const key of [p._id, p.slug, p.sku]) {
      assert.equal((await get("/api/admin/products/" + key)).json.product.sku, "TEST-001");
    }
    const r = await call("PUT", "/api/admin/products/" + p._id, { price: 120, stock: 0 });
    assert.equal(r.status, 200);
    p = r.json.product;
    assert.equal(p.stock, 0);
    assert.equal(p.availableStock, 0);
    assert.equal(p.inStock, false);
    assert.equal(p.discountAmount, 30);
    assert.equal((await call("DELETE", "/api/admin/products/" + p._id)).status, 200);
    assert.equal((await get("/api/admin/products/" + p._id)).status, 404);
    assert.deepEqual((await get("/api/products")).json.data, []);
  });

  for (const bad of [{ price: -1 }, { price: 0 }, { stock: -1 }, { stock: 1.5 }, { name: "   " }, { status: "nonsense" },
    { slug: "not a slug" }, { reservedStock: 11 }, { categorySlug: "missing" }]) {
    test(`invalid create and update rejected: ${JSON.stringify(bad)}`, async () => {
      assert.equal((await post("/api/admin/products", { ...product(), ...bad })).status, 422);
      const p = await create(product());
      assert.equal((await call("PATCH", "/api/admin/products/" + p._id, bad)).status, 422);
      assert.equal(await db.collection("products").countDocuments({}), 1);
      assert.equal((await db.collection("products").findOne())!.price, 100);
    });
  }

  test("duplicates and literal search", async () => {
    await create(product());
    assert.equal((await post("/api/admin/products", { ...product(), slug: "different" })).status, 409);
    assert.equal((await post("/api/admin/products", { ...product(), sku: "different" })).status, 409);
    assert.deepEqual((await get("/api/admin/products?search=.*")).json.products, []);
    assert.equal((await get("/api/admin/products?search=phone&limit=1")).json.pagination.total, 1);
    assert.equal((await get("/api/admin/products?page=0")).status, 422);
    assert.equal((await get("/api/admin/products?limit=-1")).status, 422);
    assert.equal((await call("PATCH", "/api/admin/products/missing", { price: 50 })).status, 404);
    assert.equal((await call("DELETE", "/api/admin/products/missing")).status, 404);
  });

  test("inventory and reports", async () => {
    const p = await create(product());
    let r = await post("/api/admin/inventory/adjust", { productId: p._id, quantityChange: -10, reason: "Stock count" });
    assert.equal(r.status, 200);
    assert.equal(r.json.newStock, 0);
    assert.equal((await post("/api/admin/inventory/adjust", { productId: p._id, quantityChange: -1, reason: "Count" })).status, 409);
    assert.equal((await post("/api/admin/inventory/adjust", { productId: p._id, quantityChange: 1.5, reason: "Count" })).status, 422);
    assert.equal(await db.collection("inventorylogs").countDocuments({}), 1);
    r = await get("/api/admin/reports/inventory");
    assert.equal(r.json.categories[0].totalStock, 0);
    assert.equal(r.json.brands[0].averagePrice, 100);
    assert.equal(r.json.lowStock.length, 1);
    r = await get("/api/admin/stats");
    assert.equal(r.json.kpis.totalInventoryValue, 0);
    assert.equal(r.json.kpis.totalOrders, 0);
    assert.deepEqual(r.json.charts.salesOverTime, []);
    assert.deepEqual(r.json.charts.ordersByStatus, []);
    assert.equal(r.json.kpis.grossProfit, null);
  });

  test("public endpoints only publish active products", async () => {
    await create({ ...product(), status: "Draft" });
    assert.deepEqual((await get("/api/products")).json.data, []);
    assert.equal((await get("/api/products/test-phone")).status, 404);
    assert.equal((await get("/api/admin/products")).json.products.length, 1);
  });

  test("import/export with quoted CSV", async () => {
    const payload = { csvContent: 'SKU,Name,Category,Price,Stock\nIMP-1,"Phone, Large",Phones,200,0\n', commit: false };
    let r = await post("/api/admin/import", payload);
    assert.equal(r.status, 200);
    assert.equal(r.json.validCount, 1);
    assert.equal(await db.collection("products").countDocuments({}), 0);
    r = await post("/api/admin/import", { ...payload, commit: true });
    assert.equal(r.json.committed, true);
    assert.equal((await db.collection("products").findOne())!.stock, 0);
    const exported = await get("/api/admin/export");
    assert.match(exported.text, /^SKU,Name,/);
    const rows: Record<string, string>[] = parseCsv(exported.text, { columns: true });
    assert.equal(rows[0].Name, "Phone, Large");
    assert.equal(rows[0].Stock, "0");
    assert.equal((await post("/api/admin/import", { csvContent: exported.text, commit: true })).json.committed, true);
    assert.equal(await db.collection("products").countDocuments({}), 1);
    r = await post("/api/admin/import", { csvContent: "SKU,Name,Category,Price,Stock\nBAD,Bad,Phones,-1,2", commit: true });
    assert.equal(r.json.committed, false);
    assert.equal(r.json.errorCount, 1);
  });

  test("export neutralises spreadsheet formulas", async () => {
    await create({ ...product(), name: "=HYPERLINK(1)" });
    const text = (await get("/api/admin/export?type=inventory")).text;
    assert.ok(text.includes("'=HYPERLINK(1)"));
    assert.equal((await get("/api/admin/export?type=secrets")).status, 422);
  });

  test("resources and settings", async () => {
    for (const [resource, data] of [
      ["brands", { name: "Test Brand" }],
      ["customers", { name: "Test", email: "TEST@example.com", phone: "123" }],
      ["coupons", { code: "test", discountValue: 10 }],
      ["suppliers", { name: "Test", companyName: "Company" }],
    ] as const) {
      assert.equal((await post("/api/admin/" + resource, data)).status, 201);
      assert.equal((await get("/api/admin/" + resource)).json[resource].length, 1);
    }
    assert.equal((await call("PATCH", "/api/admin/customers", { email: "test@example.com", tier: "VIP" })).json.customer.tier, "VIP");
    assert.equal((await call("PATCH", "/api/admin/coupons", { code: "test", status: "Disabled" })).json.coupon.status, "Disabled");
    assert.equal((await call("DELETE", "/api/admin/coupons?code=test")).status, 200);
    assert.equal((await call("PUT", "/api/admin/settings", { storeName: "ECOM-SHOP", defaultTaxRate: 0 })).status, 200);
    assert.equal((await get("/api/admin/settings")).json.settings.defaultTaxRate, 0);
    assert.equal((await post("/api/admin/categories", { name: "Child", parentId: "phones" })).status, 201);
    assert.equal((await call("PUT", "/api/admin/categories", { slug: "phones", parentId: "child" })).status, 422);
    assert.equal((await call("DELETE", "/api/admin/categories?slug=phones")).status, 200);
    assert.equal((await db.collection("categories").findOne({ slug: "child" }))!.parentId, null);
  });

  test("database errors do not claim success or leak details", async () => {
    // Make product inserts fail like an unreachable cluster would.
    activeDb = new Proxy(db, {
      get(target, prop, receiver) {
        if (prop !== "collection") return Reflect.get(target, prop, receiver);
        return (name: string) => {
          const collection = target.collection(name);
          if (name !== "products") return collection;
          return new Proxy(collection, {
            get(c, p, r) {
              if (p === "insertOne") return () => { throw new MongoNetworkError("secret-uri-must-not-leak"); };
              const value = Reflect.get(c, p, r);
              return typeof value === "function" ? value.bind(c) : value;
            },
          });
        };
      },
    });
    const r = await post("/api/admin/products", product());
    assert.equal(r.status, 503);
    assert.equal(r.json.success, false);
    assert.ok(!r.text.includes("secret-uri"));
  });

  test("API key auth and health", async () => {
    process.env.BACKEND_API_KEY = "test-key";
    assert.equal((await get("/health")).status, 200);
    assert.equal((await get("/api/products")).status, 200);
    assert.equal((await get("/api/admin/products")).status, 401);
    assert.equal((await get("/api/admin/products", { "x-api-key": "test-key" })).status, 200);
    delete process.env.BACKEND_API_KEY;
    process.env.APP_ENV = "production";
    assert.equal((await get("/api/admin/products")).status, 503);
  });

  test("seeding is non-destructive and disabled over HTTP by default", async () => {
    await seedCatalog(db);
    const products = db.collection("products");
    const p = (await products.findOne())!;
    await products.updateOne({ _id: p._id }, { $set: { price: 123 } });
    const count = await products.countDocuments({});
    await seedCatalog(db);
    assert.equal(await products.countDocuments({}), count);
    assert.equal((await products.findOne({ _id: p._id }))!.price, 123);
    assert.equal((await get("/api/seed")).status, 405);
    assert.equal((await post("/api/seed")).status, 403);
  });

  test("order creation deducts stock and upserts the customer", async () => {
    const p = await create(product());
    const r = await post("/api/admin/orders", {
      orderNumber: "GV-TEST-001",
      customer: { name: "Rohan Sharma", email: "rohan@example.com", phone: "9876543210" },
      items: [{ productId: p._id, name: p.name, price: p.price, quantity: 2 }],
      subtotal: p.price * 2, tax: 0, discount: 0, shipping: 0, total: p.price * 2,
      paymentMethod: "Razorpay", paymentStatus: "Paid", fulfillmentStatus: "Confirmed",
    });
    assert.equal(r.status, 201);
    assert.equal(r.json.order.orderNumber, "GV-TEST-001");
    assert.equal((await db.collection("products").findOne(identity(p._id)))!.stock, 8);
    const customer = await db.collection("customers").findOne({ email: "rohan@example.com" });
    assert.equal(customer?.totalOrders, 1);
    assert.equal((await get("/api/admin/orders")).json.orders.length, 1);
    const patched = await call("PATCH", "/api/admin/orders", { orderNumber: "GV-TEST-001", fulfillmentStatus: "Shipped" });
    assert.equal(patched.json.order.fulfillmentStatus, "Shipped");
    assert.equal((await post("/api/orders", { total: "not-a-number" })).status, 422);
  });

  test("missing database configuration returns 503", async () => {
    activeDb = null;
    assert.equal((await get("/health")).status, 200);
    assert.equal((await get("/health/ready")).status, 503);
    assert.equal((await get("/api/products")).status, 503);
    assert.equal((await get("/nope")).status, 404);
  });
});
