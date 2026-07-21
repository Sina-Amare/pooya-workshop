// Post-build patch for the Cloudflare bundle: Next's server lazily
// `require()`s middleware-manifest.json at runtime, which esbuild cannot
// resolve inside a Worker. This site has no middleware, so returning null
// (what Next's minimal mode does) is exact and safe.
import { readFileSync, writeFileSync } from "node:fs";

const FILE = ".open-next/server-functions/default/handler.mjs";
const BROKEN =
  "getMiddlewareManifest(){return this.minimalMode?null:require(this.middlewareManifestPath)}";
const FIXED = "getMiddlewareManifest(){return null}";

const source = readFileSync(FILE, "utf8");
const count = source.split(BROKEN).length - 1;
if (count === 0) {
  console.log("patch-worker: pattern not found (already patched or Next changed)");
  process.exit(0);
}
writeFileSync(FILE, source.split(BROKEN).join(FIXED));
console.log(`patch-worker: patched ${count} occurrence(s)`);
