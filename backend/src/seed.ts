/** Non-destructive sample catalog insertion: existing documents are never overwritten. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Db } from "mongodb";
import { now } from "./db.js";
import { BACKEND_DIR } from "./env.js";
import { parseCategory, parseProduct, productDocument } from "./schemas.js";

interface Catalog {
  categories: Record<string, unknown>[];
  products: (Record<string, unknown> & { price: number; originalPrice?: number; inStock?: boolean })[];
}

export async function seedCatalog(db: Db) {
  const catalog: Catalog = JSON.parse(readFileSync(resolve(BACKEND_DIR, "catalog.json"), "utf8"));
  for (const row of catalog.categories) {
    const data = { ...parseCategory(row), createdAt: now(), updatedAt: now() };
    await db.collection("categories").updateOne({ slug: data.slug }, { $setOnInsert: data }, { upsert: true });
  }
  for (const [i, row] of catalog.products.entries()) {
    const product = parseProduct({
      ...row,
      sku: `GV-CATALOG-${String(i + 1).padStart(4, "0")}`,
      mrp: row.originalPrice ?? row.price,
      stock: row.inStock ? 10 : 0,
    });
    const data = { ...productDocument(product), createdAt: now(), updatedAt: now() };
    await db.collection("products").updateOne({ slug: data.slug }, { $setOnInsert: data }, { upsert: true });
  }
  return { categoriesSeeded: catalog.categories.length, productsSeeded: catalog.products.length };
}
