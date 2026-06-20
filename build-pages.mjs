import { cp, mkdir, rm, writeFile } from "node:fs/promises";

const output = new URL("./dist/", import.meta.url);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await mkdir(new URL("./admin/", output), { recursive: true });

await Promise.all([
  cp(new URL("./index.html", import.meta.url), new URL("./index.html", output)),
  cp(new URL("./styles.css", import.meta.url), new URL("./styles.css", output)),
  cp(new URL("./app.js", import.meta.url), new URL("./app.js", output)),
  cp(new URL("./admin/index.html", import.meta.url), new URL("./admin/index.html", output)),
  cp(new URL("./admin/admin.js", import.meta.url),   new URL("./admin/admin.js", output)),
  cp(new URL("./admin/admin.css", import.meta.url),  new URL("./admin/admin.css", output)),
  writeFile(new URL("./_routes.json", output), JSON.stringify({
    version: 1,
    include: ["/api/*"],
    exclude: []
  }, null, 2)),
  writeFile(new URL("./_headers", output), `/*
  Cache-Control: no-store
  Content-Security-Policy: default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
  Referrer-Policy: strict-origin-when-cross-origin
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
`)
]);

console.log("Built Cloudflare Pages frontend");
