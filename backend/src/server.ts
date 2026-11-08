import { createApp } from "./app.js";
import { createClient, databaseName } from "./db.js";
import { loadEnv } from "./env.js";

loadEnv();

const client = createClient();
const db = client ? client.db(databaseName(client)) : null;
if (!client) console.warn("MONGODB_URI is missing or contains a placeholder; data endpoints will return 503.");

// Index provisioning is explicit (`npm run manage indexes`); startup never mutates collections.
const app = createApp({ getDb: () => db });
const port = Number(process.env.PORT || 8000);
const host = process.env.HOST || (process.env.APP_ENV === "production" ? "0.0.0.0" : "127.0.0.1");

const server = app.listen(port, host, () => console.log(`ECOM-SHOP API listening on http://${host}:${port}`));

const shutdown = () => {
  server.close(async () => {
    await client?.close();
    process.exit(0);
  });
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
