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

const sourceHtml = readFileSync(join(root, "src/webpagina/hoofdpagina.html"), "utf8");
const distHtml = sourceHtml.replace("../js/main.js", "./js/main.js");

writeFileSync(join(dist, "index.html"), distHtml);
copyRecursive(join(root, "src/webpagina/stijl.css"), join(dist, "stijl.css"));
copyRecursive(join(root, "src/js"), join(dist, "js"));
copyRecursive(join(root, "data"), join(dist, "data"));