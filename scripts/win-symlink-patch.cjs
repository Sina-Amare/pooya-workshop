// Windows lacks unprivileged symlinks (no Developer Mode here), which breaks
// OpenNext's build step that symlinks pnpm store paths. Preload this with
// `node -r` to transparently fall back to junctions (dirs) or copies (files).
const fs = require("node:fs");
const path = require("node:path");

const origSymlink = fs.promises.symlink.bind(fs.promises);
const origSymlinkSync = fs.symlinkSync.bind(fs);

function fallbackSync(target, dest) {
  const resolved = path.resolve(path.dirname(dest), target);
  const stat = fs.statSync(resolved);
  if (stat.isDirectory()) {
    fs.symlinkSync(resolved, dest, "junction");
  } else {
    fs.copyFileSync(resolved, dest);
  }
}

fs.promises.symlink = async (target, dest, type) => {
  try {
    return await origSymlink(target, dest, type);
  } catch (err) {
    if (err.code !== "EPERM") throw err;
    fallbackSync(String(target), String(dest));
  }
};

fs.symlinkSync = (target, dest, type) => {
  try {
    return origSymlinkSync(target, dest, type);
  } catch (err) {
    if (err.code !== "EPERM") throw err;
    fallbackSync(String(target), String(dest));
  }
};
