/** Explicit, non-destructive database setup: `manage ping | indexes | seed | verify`. */
import { randomUUID } from "node:crypto";
import { MongoServerError, ObjectId, type Db } from "mongodb";
import { createClient, databaseName, ensureIndexes, now, serialize } from "./db.js";
import { loadEnv } from "./env.js";
import { parseProduct, productDocument } from "./schemas.js";
import { seedCatalog } from "./seed.js";

const commands = ["ping", "indexes", "seed", "verify"];

/** Live smoke test in a new temporary collection; touches only its own test data. */
async function verify(db: Db) {
  const checks = ["Atlas authenticated ping"];
  const collection = db.collection(`_ecom_migration_check_${randomUUID().replace(/-/g, "")}`);
  try {
    await collection.createIndex({ sku: 1 }, { unique: true });
    const data = { ...productDocument(parseProduct({ name: "Temporary integration fixture", category: "Testing",
      price: 100, mrp: 120, stock: 4, sku: "SMOKE-1" })), createdAt: now() };
    const { insertedId } = await collection.insertOne(data);
    const row = await collection.findOne({ _id: insertedId });
    if (row?.stock !== 4 || typeof (serialize(row) as { _id: unknown })._id !== "string") throw new Error("Insert check failed");
    checks.push("Product insert, retrieval and BSON serialization");
    try {
      await collection.insertOne({ ...data, _id: new ObjectId() });
      throw new Error("Duplicate was accepted");
    } catch (error) {
      if (!(error instanceof MongoServerError && error.code === 11000)) throw error;
      checks.push("Unique SKU rejects duplicate");
    }
    await collection.updateOne({ _id: insertedId }, { $set: { stock: 0, updatedAt: now() } });
    if ((await collection.findOne({ _id: insertedId }))?.stock !== 0) throw new Error("Zero-stock update lost");
    checks.push("Update preserves zero stock");
    const [report] = await collection.aggregate([{ $group: { _id: "$category", count: { $sum: 1 }, stock: { $sum: "$stock" } } }]).toArray();
    if (report?.count !== 1 || report.stock !== 0) throw new Error("Aggregation check failed");
    checks.push("MongoDB aggregation");
    if ((await collection.deleteOne({ _id: insertedId })).deletedCount !== 1 || await collection.countDocuments({}) !== 0) {
      throw new Error("Delete check failed");
    }
    checks.push("Delete and empty result");
  } finally {
    await collection.drop().catch(() => undefined);
    checks.push("Temporary test collection removed");
  }
  return { status: "passed", scope: "One temporary collection; application documents were not modified", checks };
}

async function main(command: string | undefined): Promise<number> {
  if (!command || !commands.includes(command)) {
    console.error(`Usage: manage <${commands.join("|")}>`);
    return 2;
  }
  loadEnv();
  const client = createClient();
  if (!client) {
    console.log("MongoDB URI is missing or contains a placeholder. No database operations executed.");
    return 1;
  }
  try {
    const db = client.db(databaseName(client));
    await db.command({ ping: 1 });
    if (command === "indexes" || command === "seed") await ensureIndexes(db);
    if (command === "seed") console.log(JSON.stringify(await seedCatalog(db)));
    else if (command === "verify") console.log(JSON.stringify(await verify(db), null, 2));
    else console.log(`${command}: passed`);
    return 0;
  } catch (error) {
    // Never print a URI, password, or server error containing credentials.
    console.log(`${command}: failed (${(error as Error)?.name ?? "Error"}). Check Atlas configuration.`);
    return 1;
  } finally {
    await client.close();
  }
}

process.exitCode = await main(process.argv[2]);
