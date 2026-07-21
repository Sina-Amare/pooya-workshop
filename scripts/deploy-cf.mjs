// Cross-platform Cloudflare deploy: build with the CF flag (preloading the
// Windows symlink fallback), patch the worker bundle, deploy with wrangler.
// Usage: node scripts/deploy-cf.mjs
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const require = createRequire(import.meta.url);
const cli = path.join(
  path.dirname(require.resolve("@opennextjs/cloudflare/package.json")),
  "dist",
  "cli",
  "index.js",
);
const patch = path.join(root, "scripts", "win-symlink-patch.cjs");
const env = { ...process.env, CF_BUILD: "1" };

const node = (args) => execFileSync(process.execPath, args, { stdio: "inherit", env, cwd: root });

node(["--require", patch, cli, "build"]);
node([path.join(root, "scripts", "patch-worker.mjs")]);
node([cli, "deploy"]);
