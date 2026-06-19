/* build-web.mjs — assemble a clean static bundle in ./www for Capacitor / hosting.
   Copies only the runtime assets (no node_modules, tests, or config). */
import { cp, rm, mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "www");

const ITEMS = [
  "index.html", "styles.css", "manifest.webmanifest", "sw.js", "src", "icons", "audio", "fonts",
];

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
for (const item of ITEMS) {
  await cp(join(ROOT, item), join(OUT, item), { recursive: true });
}
console.log(`✓ built www/ (${ITEMS.length} entries)`);
