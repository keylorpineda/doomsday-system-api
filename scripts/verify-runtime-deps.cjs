/* eslint-disable @typescript-eslint/no-var-requires, security/detect-non-literal-fs-filename --
   script CommonJS para Node puro dentro de la imagen; recorre solo dist/ */
// Verifica que todo módulo que `dist/` requiere se resuelva con las
// dependencias instaladas. Se ejecuta dentro de la imagen de producción en CI:
// pnpm no "eleva" dependencias transitivas, así que un paquete usado pero no
// declarado (p. ej. `express`) compila bien y falla recién al arrancar.
const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "dist";
const missing = new Map();

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Los seeds solo se corren en desarrollo (usan devDependencies)
      if (entry.name !== "seeds") walk(file);
      continue;
    }
    if (!file.endsWith(".js")) continue;
    const source = fs.readFileSync(file, "utf8");
    for (const [, request] of source.matchAll(/require\("([^".][^"]*)"\)/g)) {
      try {
        require.resolve(request, { paths: [path.dirname(file)] });
      } catch {
        missing.set(request, file);
      }
    }
  }
}

walk(root);

if (missing.size > 0) {
  for (const [request, file] of missing)
    console.error(`Missing runtime module "${request}" (required by ${file})`);
  process.exit(1);
}
console.log("All runtime modules resolve");
