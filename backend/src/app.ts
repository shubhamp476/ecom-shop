/** Express API matching the existing Next.js contracts. */
import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import express, { type NextFunction, type Request, type RequestHandler, type Response } from "express";
import { parse as parseCsv } from "csv-parse/sync";
import { MongoError, MongoServerError, type Db, type Document, type Sort, type WithId } from "mongodb";
import { identity, now, serialize } from "./db.js";
import { HttpError, ValidationError } from "./errors.js";
import { buildStats, exportCsv, inventoryReport, type ExportKind } from "./reports.js";
import {
  ImportSchema, InventoryAdjustmentSchema, OrderPatchSchema, parse, parseBrand, parseCategory, parseCoupon,
  parseCustomer, parseProduct, parseSettings, parseSupplier, productDocument, type Product,
} from "./schemas.js";
import { seedCatalog } from "./seed.js";

export interface AppOptions {
  /** Returns the database, or null when MongoDB is not configured. */
  getDb: () => Db | null;
}

type Body = Record<string, unknown>;
type Handler = (req: Request, res: Response) => Promise<unknown> | unknown;

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const containsAny = (fields: string[], text: string) => ({
  $or: fields.map((f) => ({ [f]: { $regex: escapeRegex(text), $options: "i" } })),
});

const ok = (values: Record<string, unknown> = {}) => serialize({ success: true, ...values });

function safeEqual(a: string, b: string) {
  // Hash first so the comparison is constant-time regardless of length.
  const digest = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(digest(a), digest(b));
}

function query(req: Request, name: string): string {
  const value = req.query[name];
  return typeof value === "string" ? value : Array.isArray(value) && typeof value[0] === "string" ? value[0] : "";
}

function intQuery(req: Request, name: string, fallback: number, min: number, max = Infinity) {
  const raw = query(req, name);
  if (raw === "") return fallback;
  const value = Number(raw);
  if (!/^[+-]?\d+$/.test(raw.trim()) || value < min || value > max) {
    const bound = max === Infinity ? `>= ${min}` : `between ${min} and ${max}`;
    throw ValidationError.single(`Query parameter ${name} must be an integer ${bound}`, `query.${name}`);
  }
  return value;
}

function body(req: Request): Body {
  const value = req.body;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw ValidationError.single("Request body must be a JSON object", "body");
  }
  return value as Body;
}

function finite(value: unknown, field: string, fallback: number) {
  if (value === undefined) return fallback;
  const n = typeof value === "string" && value.trim() === "" ? NaN : Number(value);
  if (value === null || !Number.isFinite(n)) throw ValidationError.single(`${field} must be a number`, field);
  return n;
}

export function createApp({ getDb }: AppOptions) {
  const app = express();
  app.disable("x-powered-by");
  app.set("query parser", "simple");

  const db = (): Db => {
    const value = getDb();
    if (!value) throw new HttpError(503, "MongoDB is not configured. Set MONGODB_URI on the backend.");
    return value;
  };

  // Protect administration, seeding and every write with the shared server-to-server key.
  app.use((req, _res, next) => {
    const isProtected = req.path.startsWith("/api/admin") || req.path === "/api/seed"
      || !["GET", "HEAD", "OPTIONS"].includes(req.method);
    if (!isProtected) return next();
    const expected = process.env.BACKEND_API_KEY || "";
    if (!expected) {
      if ((process.env.APP_ENV || "development") === "production") {
        throw new HttpError(503, "Backend administration is not configured");
      }
      return next();
    }
    if (!safeEqual(req.get("x-api-key") || "", expected)) throw new HttpError(401, "Invalid API key");
    next();
  });

  app.use(express.json({ limit: "5mb" }));

  /** Register handlers for a path; other methods get 405 like the original API. */
  const route = (path: string, handlers: Partial<Record<"GET" | "POST" | "PUT" | "PATCH" | "DELETE", Handler>>,
    created: string[] = ["POST"]) => {
    app.all(path, (async (req, res) => {
      const method = req.method === "HEAD" ? "GET" : req.method;
      const handler = handlers[method as keyof typeof handlers];
      if (!handler) {
        res.set("Allow", Object.keys(handlers).join(", "));
        throw new HttpError(405, "Method Not Allowed");
      }
      const payload = await handler(req, res);
      if (res.headersSent) return;
      res.status(created.includes(method) ? 201 : 200).json(payload);
    }) as RequestHandler);
  };

  const audit = (action: string, entity: string, entityId: unknown = "", details = "") =>
    db().collection("activitylogs").insertOne({
      actor: "Super Admin", role: "Administrator", action, entity,
      entityId: String(entityId ?? ""), details: details || action, timestamp: now(),
    });

  const findProduct = async (value: string) => {
    const product = await db().collection("products").findOne(identity(value));
    if (!product) throw new HttpError(404, "Product not found");
    return product;
  };

  const validateCategory = async (categorySlug: string) => {
    if (!(await db().collection("categories").findOne({ slug: categorySlug }))) {
      throw new HttpError(422, "Category does not exist. Create it before adding products.");
    }
  };

  const productCreate = async (product: Product) => {
    await validateCategory(product.categorySlug);
    const data: Document = { ...productDocument(product), createdAt: now(), updatedAt: now() };
    data._id = (await db().collection("products").insertOne(data)).insertedId;
    await audit("PRODUCT_CREATED", "Product", data._id, `Created ${data.name}`);
    return data;
  };

  const productUpdate = async (value: string, changes: Body) => {
    const old = await findProduct(value);
    const product = parseProduct({ ...old, ...changes });
    await validateCategory(product.categorySlug);
    const data = { ...productDocument(product), updatedAt: now() };
    // Optimistic concurrency: only apply if nobody saved in between.
    const updated = await db().collection("products").findOneAndUpdate(
      { _id: old._id, updatedAt: old.updatedAt ?? null }, { $set: data }, { returnDocument: "after" });
    if (!updated) throw new HttpError(409, "Product changed concurrently; reload and try again");
    await audit("PRODUCT_UPDATED", "Product", old._id, `Updated ${data.name}`);
    return updated;
  };

  // Health
  route("/health", { GET: () => ok({ service: "ECOM-SHOP", driver: "mongodb-node" }) });
  route("/health/ready", {
    GET: async () => {
      await db().command({ ping: 1 });
      return ok({ database: "connected", driver: "mongodb-node" });
    },
  });

  // Public storefront
  route("/api/products", {
    GET: async (req) => {
      const filter: Document = { status: "Active" };
      const category = query(req, "category");
      if (category) filter.categorySlug = category;
      const limit = intQuery(req, "limit", 1000, 1, 1000);
      const data = await db().collection("products").find(filter).sort({ createdAt: -1 }).limit(limit).toArray();
      return ok({ source: "mongodb", count: data.length, data });
    },
    POST: async (req) => ok({ data: await productCreate(parseProduct(body(req))) }),
  });

  route("/api/products/:slug", {
    GET: async (req) => {
      const data = await db().collection("products").findOne({ slug: req.params.slug, status: "Active" });
      if (!data) throw new HttpError(404, "Product not found");
      return ok({ data });
    },
  });

  route("/api/categories", {
    GET: async () => ok({
      categories: await db().collection("categories").find({ status: "Active" }).sort({ sortOrder: 1 }).toArray(),
    }),
  });

  // Admin products
  route("/api/admin/products", {
    GET: async (req) => {
      const clauses: Document[] = [];
      const search = query(req, "search"), category = query(req, "category");
      const brand = query(req, "brand"), status = query(req, "status");
      if (search) clauses.push(containsAny(["name", "sku", "brand", "category"], search));
      if (category) clauses.push({ $or: [{ categorySlug: category }, { category }] });
      if (brand) clauses.push({ $or: [{ brandSlug: brand }, { brand }] });
      if (status) clauses.push({ status });
      const filter = clauses.length ? { $and: clauses } : {};
      const sorts: Record<string, [string, 1 | -1]> = {
        price_asc: ["price", 1], price_desc: ["price", -1], stock_low: ["stock", 1], name_asc: ["name", 1],
      };
      const [field, direction] = sorts[query(req, "sort")] ?? ["createdAt", -1];
      const page = intQuery(req, "page", 1, 1);
      const limit = intQuery(req, "limit", 10, 1, 1000);
      const products = db().collection("products");
      const total = await products.countDocuments(filter);
      const rows = await products.find(filter).sort({ [field]: direction, _id: 1 })
        .skip((page - 1) * limit).limit(limit).toArray();
      return ok({ products: rows, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } });
    },
    POST: async (req) => ok({ product: await productCreate(parseProduct(body(req))), message: "Product created successfully!" }),
  });

  const updateProduct: Handler = async (req) =>
    ok({ product: await productUpdate(String(req.params.value), body(req)), message: "Product updated successfully!" });
  route("/api/admin/products/:value", {
    GET: async (req) => ok({ product: await findProduct(String(req.params.value)) }),
    PUT: updateProduct,
    PATCH: updateProduct,
    DELETE: async (req) => {
      const data = await db().collection("products").findOneAndDelete(identity(String(req.params.value)));
      if (!data) throw new HttpError(404, "Product not found");
      await audit("PRODUCT_DELETED", "Product", data._id, `Deleted ${data.name}`);
      return ok({ message: "Product deleted successfully!" });
    },
  });

  // Ancillary resources keyed by natural keys in request bodies and query strings.
  const resource = (collection: string, singular: string, validate: (input: unknown) => Body, key: string,
    methods: ("GET" | "POST" | "PUT" | "PATCH" | "DELETE")[]) => {
    const coll = () => db().collection(collection);

    const validateParent = async (data: Body) => {
      if (collection !== "categories" || !data.parentId) return;
      let parent = data.parentId as string | null;
      const visited = new Set([data.slug as string]);
      while (parent) {
        if (visited.has(parent)) throw new HttpError(422, "Category hierarchy cannot contain a cycle");
        visited.add(parent);
        const doc: WithId<Document> | null = await coll().findOne({ slug: parent });
        if (!doc) throw new HttpError(422, "Parent category does not exist");
        parent = doc.parentId ?? null;
      }
    };

    const update: Handler = async (req) => {
      const input = body(req);
      const raw = input[key];
      if (typeof raw !== "string" || !raw.trim()) throw new HttpError(422, `${key} is required`);
      let value = raw;
      if (key === "email") value = value.toLowerCase().trim();
      if (key === "code") value = value.toUpperCase().trim();
      const old = await coll().findOne({ [key]: value });
      if (!old) throw new HttpError(404, `${singular} not found`);
      const data = { ...validate({ ...old, ...input, [key]: value }), updatedAt: now() };
      await validateParent(data);
      const updated = await coll().findOneAndUpdate({ _id: old._id }, { $set: data }, { returnDocument: "after" });
      await audit(`${collection.toUpperCase()}_UPDATED`, singular, old._id);
      return ok({ [singular]: updated });
    };

    const handlers: Record<string, Handler> = {
      GET: async (req) => {
        const search = query(req, "search");
        const filter = search && collection === "customers" ? containsAny(["name", "email", "phone", "city"], search) : {};
        const sort: Sort = collection === "categories" ? { sortOrder: 1 } : { createdAt: -1 };
        return ok({ [collection]: await coll().find(filter).sort(sort).toArray() });
      },
      POST: async (req) => {
        const data: Document = { ...validate(body(req)), createdAt: now(), updatedAt: now() };
        await validateParent(data);
        data._id = (await coll().insertOne(data)).insertedId;
        await audit(`${collection.toUpperCase()}_CREATED`, singular, data._id);
        return ok({ [singular]: data });
      },
      PUT: update,
      PATCH: update,
      DELETE: async (req) => {
        let value = query(req, key);
        if (!value) throw new HttpError(422, `${key} is required`);
        if (key === "code") value = value.toUpperCase();
        if (collection === "categories" && await db().collection("products").countDocuments({ categorySlug: value })) {
          throw new HttpError(409, "Move products to another category before deleting this category");
        }
        const old = await coll().findOneAndDelete({ [key]: value });
        if (!old) throw new HttpError(404, `${singular} not found`);
        if (collection === "categories") {
          await coll().updateMany({ parentId: value }, { $set: { parentId: old.parentId ?? null } });
        }
        await audit(`${collection.toUpperCase()}_DELETED`, singular, value);
        return ok({ message: `${singular} deleted` });
      },
    };
    route(`/api/admin/${collection}`, Object.fromEntries(methods.map((m) => [m, handlers[m]])));
  };

  resource("categories", "category", parseCategory, "slug", ["GET", "POST", "PUT", "DELETE"]);
  resource("brands", "brand", parseBrand, "slug", ["GET", "POST"]);
  resource("customers", "customer", parseCustomer, "email", ["GET", "POST", "PATCH"]);
  resource("coupons", "coupon", parseCoupon, "code", ["GET", "POST", "PATCH", "DELETE"]);
  resource("suppliers", "supplier", parseSupplier, "companyName", ["GET", "POST"]);

  // Orders
  const createOrder: Handler = async (req) => {
    const input = body(req);
    const d = db();
    let orderNumber = input.orderNumber ? String(input.orderNumber) : "";
    if (!orderNumber) {
      const settings = await d.collection("storesettings").findOne({});
      orderNumber = `${settings?.orderPrefix ?? "GV-"}${randomInt(100000, 1000000)}`;
    }
    const customer = (input.customer && typeof input.customer === "object" ? input.customer : {}) as Body;
    const items = (Array.isArray(input.items) ? input.items : []) as Body[];
    const order: Document = {
      orderNumber,
      customer,
      items,
      subtotal: finite(input.subtotal, "subtotal", 0),
      tax: finite(input.tax, "tax", 0),
      discount: finite(input.discount, "discount", 0),
      shipping: finite(input.shipping, "shipping", 0),
      total: finite(input.total, "total", 0),
      paymentMethod: input.paymentMethod ?? "Cash on Delivery",
      paymentStatus: input.paymentStatus ?? "Pending",
      fulfillmentStatus: input.fulfillmentStatus ?? "Confirmed",
      trackingNumber: input.trackingNumber ?? "",
      shippingCarrier: input.shippingCarrier ?? "Delhivery",
      customerNotes: input.customerNotes ?? "",
      adminNotes: input.adminNotes ?? "",
      razorpayOrderId: input.razorpayOrderId ?? null,
      razorpayPaymentId: input.razorpayPaymentId ?? null,
      createdAt: now(),
      updatedAt: now(),
    };

    // Deduct stock and record an inventory log for each item.
    for (const item of items) {
      const qty = Math.trunc(finite(item?.quantity, "items.quantity", 1));
      const lookup = item?.productId || item?.id || item?.slug || item?.sku;
      if (!lookup) continue;
      const product = await d.collection("products").findOne(identity(String(lookup)));
      if (!product) continue;
      const previousStock = product.stock ?? 0;
      const newStock = Math.max(0, previousStock - qty);
      await d.collection("products").updateOne({ _id: product._id }, {
        $set: { stock: newStock, inStock: newStock > 0, status: newStock === 0 ? "Out of Stock" : product.status ?? "Active",
          updatedAt: now() },
      });
      await d.collection("inventorylogs").insertOne({
        productId: String(product._id), productName: product.name ?? item.name ?? "", sku: product.sku ?? item.sku ?? "",
        type: "order", quantityChange: -qty, previousStock, newStock, reason: `Order #${orderNumber}`,
        actor: "Checkout", timestamp: now(),
      });
    }

    if (customer.email) {
      await d.collection("customers").updateOne({ email: customer.email }, {
        $setOnInsert: {
          name: customer.name ?? "", phone: customer.phone ?? "", shippingAddress: customer.shippingAddress ?? {},
          tier: "Bronze", notes: "", status: "Active", createdAt: now(),
        },
        $inc: { totalOrders: 1, totalSpend: order.total },
        $set: { lastOrderDate: now(), updatedAt: now() },
      }, { upsert: true });
    }

    if (input.couponCode) {
      await d.collection("coupons").updateOne({ code: String(input.couponCode).toUpperCase() }, { $inc: { usedCount: 1 } });
    }

    await d.collection("orders").insertOne(order);
    await audit("ORDER_CREATED", "Order", orderNumber, `Order created via ${order.paymentMethod}`);
    return ok({ order, message: "Order placed successfully" });
  };

  route("/api/orders", { POST: createOrder });
  route("/api/admin/orders", {
    GET: async (req) => {
      const clauses: Document[] = [];
      const search = query(req, "search"), status = query(req, "status");
      if (search) clauses.push(containsAny(["orderNumber", "customer.name", "customer.email"], search));
      if (status) clauses.push({ $or: [{ fulfillmentStatus: status }, { paymentStatus: status }] });
      const filter = clauses.length ? { $and: clauses } : {};
      return ok({ orders: await db().collection("orders").find(filter).sort({ createdAt: -1 }).toArray() });
    },
    POST: createOrder,
    PATCH: async (req) => {
      const { orderNumber, ...changes } = parse(OrderPatchSchema, body(req));
      const data = { ...Object.fromEntries(Object.entries(changes).filter(([, v]) => v != null)), updatedAt: now() };
      const updated = await db().collection("orders").findOneAndUpdate(
        { orderNumber }, { $set: data }, { returnDocument: "after" });
      if (!updated) throw new HttpError(404, "Order not found");
      await audit("ORDER_UPDATED", "Order", orderNumber);
      return ok({ order: updated });
    },
  });

  // Settings, logs and inventory
  route("/api/admin/settings", {
    GET: async () => ok({ settings: (await db().collection("storesettings").findOne({})) ?? parseSettings({}) }),
    PUT: async (req) => {
      const settings = db().collection("storesettings");
      const old: Document = (await settings.findOne({})) ?? {};
      const data = { ...parseSettings({ ...old, ...body(req) }), updatedAt: now() };
      const saved = await settings.findOneAndUpdate({ _id: old._id ?? "store" } as Document, { $set: data },
        { upsert: true, returnDocument: "after" });
      await audit("SETTINGS_UPDATED", "StoreSettings");
      return ok({ settings: saved });
    },
  });

  route("/api/admin/logs", {
    GET: async () => ok({
      activityLogs: await db().collection("activitylogs").find().sort({ timestamp: -1 }).limit(50).toArray(),
      inventoryLogs: await db().collection("inventorylogs").find().sort({ timestamp: -1 }).limit(50).toArray(),
    }),
  });

  route("/api/admin/inventory/adjust", {
    POST: async (req) => {
      const input = parse(InventoryAdjustmentSchema, body(req));
      let old: WithId<Document> | null = null;
      let previous = 0, stock = 0;
      for (let attempt = 0; attempt < 3; attempt++) {
        old = await findProduct(input.productId);
        previous = old.stock ?? 0;
        const reserved = old.reservedStock ?? 0;
        stock = previous + input.quantityChange;
        if (stock < reserved) throw new HttpError(409, "Adjustment would make stock negative or lower than reserved stock");
        let status = old.status ?? "Active";
        if (stock === 0 && status === "Active") status = "Out of Stock";
        else if (stock > 0 && status === "Out of Stock") status = "Active";
        const changed = await db().collection("products").findOneAndUpdate(
          { _id: old._id, stock: previous, updatedAt: old.updatedAt ?? null },
          { $set: { stock, availableStock: stock - reserved, inStock: stock > reserved, status, updatedAt: now() } },
          { returnDocument: "after" });
        if (changed) break;
        if (attempt === 2) throw new HttpError(409, "Concurrent inventory update; retry");
      }
      await db().collection("inventorylogs").insertOne({
        productId: String(old!._id), productName: old!.name, sku: old!.sku, type: input.type,
        quantityChange: input.quantityChange, previousStock: previous, newStock: stock, reason: input.reason,
        actor: input.actor, timestamp: now(),
      });
      await audit("STOCK_ADJUSTED", "Inventory", old!._id, input.reason);
      return ok({ previousStock: previous, newStock: stock, message: "Stock updated successfully" });
    },
  }, []);

  // Reports and CSV
  route("/api/admin/stats", { GET: async () => ok(await buildStats(db())) });
  route("/api/admin/reports/inventory", { GET: async () => ok(await inventoryReport(db())) });

  route("/api/admin/export", {
    GET: async (req, res) => {
      const type = query(req, "type") || "products";
      if (!["products", "orders", "inventory"].includes(type)) throw new HttpError(422, "Unsupported export type");
      const csv = await exportCsv(db(), type as ExportKind);
      res.status(200).type("text/csv; charset=utf-8")
        .set("Content-Disposition", `attachment; filename="${type}_export.csv"`).send(csv);
    },
  });

  route("/api/admin/import", {
    POST: async (req) => {
      const input = parse(ImportSchema, body(req));
      let records: string[][];
      try {
        records = parseCsv(input.csvContent, { relax_column_count: true, skip_empty_lines: true, bom: true });
      } catch {
        throw new HttpError(422, "CSV could not be parsed");
      }
      const [header, ...rows] = records;
      if (!header?.length) throw new HttpError(422, "CSV header required");
      if (rows.length > 5000) throw new HttpError(422, "Import is limited to 5000 rows");

      const valid: Body[] = [], errors: Body[] = [];
      const prepared: { old: WithId<Document> | null; product: Product }[] = [];
      const seen = new Set<string>();
      const products = db().collection("products");
      for (const [index, cells] of rows.entries()) {
        const row: Record<string, string | undefined> =
          Object.fromEntries(header.map((h, i) => [h, cells[i]]).filter(([h]) => h));
        const normalized: Record<string, string> = {};
        for (const [k, v] of Object.entries(row)) if (v !== undefined) normalized[k.toLowerCase().replace(/[^a-z]/g, "")] = v;
        try {
          const sku = (normalized.sku ?? "").trim();
          if (!sku) throw ValidationError.single("SKU is required for repeatable imports");
          if (seen.has(sku)) throw ValidationError.single("Duplicate SKU in CSV");
          seen.add(sku);
          const old = await products.findOne({ sku });
          const raw: Body = {
            ...(old ?? {}), sku, name: normalized.name ?? "", category: normalized.category ?? "", categorySlug: "",
            price: normalized.priceinr ?? normalized.price ?? "", stock: normalized.stock ?? "0",
          };
          for (const [csvKey, field] of [["brand", "brand"], ["mrpinr", "mrp"], ["costpriceinr", "costPrice"],
            ["status", "status"], ["barcode", "barcode"]]) {
            if (csvKey in normalized) raw[field] = normalized[csvKey];
          }
          const product = parseProduct(raw);
          await validateCategory(product.categorySlug);
          const conflict = await products.findOne({ slug: product.slug });
          if (conflict && (!old || !old._id.equals(conflict._id))) throw ValidationError.single("Duplicate product slug");
          valid.push({ sku: product.sku, name: product.name, category: product.category, price: product.price, stock: product.stock });
          prepared.push({ old, product });
        } catch (error) {
          if (!(error instanceof ValidationError || error instanceof HttpError)) throw error;
          errors.push({ row: index + 1, error: error.message, data: JSON.stringify(row) });
        }
      }
      let committed = false;
      if (input.commit && !errors.length && prepared.length) {
        for (const { old, product } of prepared) {
          if (old) await productUpdate(String(old._id), product);
          else await productCreate(product);
        }
        committed = true;
      }
      return ok({ committed, totalRows: rows.length, validCount: valid.length, errorCount: errors.length,
        validRows: valid, errors });
    },
  }, []);

  route("/api/seed", {
    POST: async () => {
      if (process.env.ALLOW_SEED !== "true") {
        throw new HttpError(403, "Seeding is disabled; use the explicit backend management command");
      }
      return ok(await seedCatalog(db()));
    },
  }, []);

  app.use(() => {
    throw new HttpError(404, "Not Found");
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof HttpError) {
      return res.status(error.status).json({ success: false, error: error.message });
    }
    if (error instanceof ValidationError) {
      return res.status(422).json({ success: false, error: error.message, details: error.issues });
    }
    const bodyError = error as { type?: string; status?: number };
    if (bodyError?.type === "entity.parse.failed") {
      return res.status(422).json({ success: false, error: "Request body is not valid JSON" });
    }
    if (bodyError?.type === "entity.too.large") {
      return res.status(413).json({ success: false, error: "Request body is too large" });
    }
    if (error instanceof MongoServerError && error.code === 11000) {
      return res.status(409).json({ success: false, error: "A record with that unique identifier already exists." });
    }
    if (error instanceof MongoError) {
      // Never echo driver messages: they can contain connection details.
      return res.status(503).json({
        success: false, error: "Database operation failed. Check backend connectivity and database configuration.",
      });
    }
    console.error(error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  });

  return app;
}
