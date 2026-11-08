/** Local browser smoke-test server backed by a throwaway in-memory MongoDB. Never deploy. */
import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../src/app.js";
import { ensureIndexes } from "../src/db.js";
import { seedCatalog } from "../src/seed.js";

const mongod = await MongoMemoryServer.create();
const client = await new MongoClient(mongod.getUri()).connect();
const db = client.db("browser_smoke");
await ensureIndexes(db);
await seedCatalog(db);

const port = Number(process.env.PORT || 8765);
createApp({ getDb: () => db }).listen(port, "127.0.0.1", () =>
  console.log(`Fixture API (in-memory MongoDB) on http://127.0.0.1:${port}`));
