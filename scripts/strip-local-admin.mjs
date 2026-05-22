import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const adminOutput = path.join(root, "dist", "admin");

await rm(adminOutput, { recursive: true, force: true });

console.log("Production build cleanup: removed dist/admin local-only files.");
