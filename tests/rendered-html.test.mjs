import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("builds the Berel storefront and Worker artifacts", async () => {
  await Promise.all([
    access(new URL("../dist/server/index.js", import.meta.url)),
    access(new URL("../dist/client", import.meta.url)),
    access(new URL("../dist/.openai/hosting.json", import.meta.url)),
  ]);
  const [home, layout] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(home, /Todo para pintar, proteger y renovar/);
  assert.match(home, /api\/storefront/);
  assert.match(layout, /lang="es-MX"/);
  assert.match(layout, /Quicksand/);
  assert.match(layout, /berel-icono\.png/);
  assert.doesNotMatch(home, /Your site is taking shape/i);
});

test("includes operational commerce and CMS surfaces", async () => {
  const [schema, checkout, admin, migration, hosting] = await Promise.all([
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/checkout/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/admin/AdminDashboard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0000_melodic_talos.sql", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
  ]);
  assert.match(schema, /export const products/);
  assert.match(schema, /export const orders/);
  assert.match(schema, /export const branches/);
  assert.match(checkout, /Envío local/);
  assert.match(checkout, /Retiro en sucursal/);
  assert.match(admin, /Importar CSV/);
  assert.match(migration, /Aguascalientes/);
  assert.match(migration, /cat-aerosoles/);
  assert.match(hosting, /"d1": "DB"/);
  assert.match(hosting, /"r2": "MEDIA"/);
});
