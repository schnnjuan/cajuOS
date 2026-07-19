#!/usr/bin/env node
// Gera src/lib/og-bg.ts a partir de public/og-bg.jpg
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "public", "og-bg.jpg");
const dest = path.join(__dirname, "..", "src", "lib", "og-bg.ts");

if (!fs.existsSync(src)) {
  console.warn("⚠  public/og-bg.jpg not found — skipping OG bg generation");
  return;
}

const buf = fs.readFileSync(src);
const b64 = buf.toString("base64");
const content = [
  "// gerado automaticamente por scripts/generate-og-bg.cjs",
  "// nao editar manualmente",
  `const data = "${b64}";`,
  "export default data;",
  "",
].join("\n");

fs.writeFileSync(dest, content);
console.log(`✓ og-bg.ts generated (${buf.length} bytes → ${b64.length} chars base64)`);
