import { Db, Decimal128, MongoClient, ObjectId, type Document, type Filter } from "mongodb";

export function createClient(): MongoClient | null {
  const uri = process.env.MONGODB_URI || "";
  if (!uri || uri.includes("<")) return null;
  return new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 10000,
    maxPoolSize: 20,
  });
}

/** Preserve the database named in the URI unless MONGODB_DB overrides it. */
export function databaseName(client: MongoClient): string {
  if (process.env.MONGODB_DB) return process.env.MONGODB_DB;
  // The driver reports "test" when the URI names no database.
  const name = client.db().databaseName;
  return name && name !== "test" ? name : "ecom_shop_db";
}

export async function ensureIndexes(db: Db) {
  const unique: Record<string, string[]> = {
    products: ["slug", "sku"], categories: ["slug"], brands: ["slug"],
    coupons: ["code"], customers: ["email"], orders: ["orderNumber"],
  };
  for (const [collection, fields] of Object.entries(unique)) {
    for (const field of fields) await db.collection(collection).createIndex({ [field]: 1 }, { unique: true });
  }
  await db.collection("products").createIndex({ categorySlug: 1, status: 1 });
  await db.collection("products").createIndex({ brand: 1 });
  await db.collection("products").createIndex({ stock: 1 });
  await db.collection("activitylogs").createIndex({ timestamp: -1 });
  await db.collection("inventorylogs").createIndex({ productId: 1, timestamp: -1 });
}

/** Match a document by ObjectId, legacy `id`, slug or SKU. */
export function identity(value: string): Filter<Document> {
  const alternatives: Filter<Document>[] = ["id", "slug", "sku"].map((field) => ({ [field]: value }));
  if (/^[0-9a-fA-F]{24}$/.test(value)) alternatives.unshift({ _id: new ObjectId(value) });
  return { $or: alternatives };
}

/** Convert BSON values into JSON-safe values. */
export function serialize(value: unknown): unknown {
  if (value instanceof ObjectId) return value.toHexString();
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Decimal128) return Number(value.toString());
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, serialize(v)]));
  }
  return value;
}

export const now = () => new Date();
