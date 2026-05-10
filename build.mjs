import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const dist = join(root, "dist");

function copyRecursive(source, target) {
    cpSync(source, target, { recursive: true });
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

copyRecursive(join(root, "src/webpagina/"), dist);
copyRecursive(join(root, "src/webpagina/stijl.css"), join(dist, "stijl.css"));
copyRecursive(join(root, "src/js"), join(dist, "js"));
copyRecursive(join(root, "data"), join(dist, "data"));
// Prevent GitHub Pages from using Jekyll processing which can hide files/folders
writeFileSync(join(dist, ".nojekyll"), "");