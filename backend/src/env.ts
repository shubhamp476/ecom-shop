import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** backend/ directory; resolves the same from src/ (tsx) and dist/ (compiled). */
export const BACKEND_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const ROOT = resolve(BACKEND_DIR, "..");

/** Load .env.local then .env; variables already set by the host win. */
export function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const file = resolve(ROOT, name);
    if (existsSync(file)) process.loadEnvFile(file);
  }
}
