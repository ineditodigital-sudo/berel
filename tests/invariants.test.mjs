/**
 * Estas pruebas verifican invariantes entre archivos, no textos de la interfaz.
 * Cambiar un titular o un copy de marketing no debe romper la suite; romper el
 * contrato entre el CMS, el esquema de la base y el puerto PHP sí debe romperla.
 */
import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import test from "node:test";

const read = (relativePath) =>
  readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");

/**
 * Devuelve un Map<tabla, Set<columna>> leyendo TODAS las migraciones en orden,
 * incluidos los ALTER TABLE posteriores. Mirando solo la primera, un campo
 * agregado después parecería inexistente.
 */
async function parseSqliteSchema() {
  const carpeta = new URL("../drizzle/", import.meta.url);
  const archivos = (await readdir(carpeta)).filter((f) => f.endsWith(".sql")).sort();

  const tables = new Map();
  for (const archivo of archivos) {
    const sql = await readFile(new URL(archivo, carpeta), "utf8");

    for (const match of sql.matchAll(/CREATE TABLE `([^`]+)` \(([\s\S]*?)\n\);/g)) {
      const [, table, body] = match;
      const columns = new Set();
      for (const line of body.split("\n")) {
        const column = line.trim().match(/^`([^`]+)`/);
        if (column) columns.add(column[1]);
      }
      tables.set(table, columns);
    }

    for (const match of sql.matchAll(
      /ALTER TABLE\s+`?(\w+)`?\s+ADD COLUMN\s+`?(\w+)`?/gi,
    )) {
      const [, table, column] = match;
      if (tables.has(table)) tables.get(table).add(column);
    }
  }
  return tables;
}

/** Devuelve un Map<recurso, {table, fields[]}> leyendo lib/cms-resources.ts. */
function parseCmsResources(source) {
  const registry = source.slice(source.indexOf("export const cmsResources"));
  const resources = new Map();
  for (const match of registry.matchAll(/^ {2}(\w+): \{\n([\s\S]*?)^ {2}\},$/gm)) {
    const [, name, body] = match;
    const table = body.match(/table:\s*"([^"]+)"/)?.[1];
    const fields = [...body.matchAll(/\{\s*key:\s*"([^"]+)"/g)].map((f) => f[1]);
    resources.set(name, { table, fields });
  }
  return resources;
}

test("el build genera los artefactos del Worker", async () => {
  await Promise.all([
    access(new URL("../dist/server/index.js", import.meta.url)),
    access(new URL("../dist/client", import.meta.url)),
    access(new URL("../dist/.openai/hosting.json", import.meta.url)),
  ]);
});

test("hosting.json declara los bindings que usa el código", async () => {
  const hosting = JSON.parse(await read(".openai/hosting.json"));
  assert.equal(hosting.d1, "DB", "db/index.ts y las rutas esperan el binding DB");
  assert.equal(hosting.r2, "MEDIA", "las rutas de media esperan el binding MEDIA");
});

test("cada recurso del CMS existe en el esquema de la base", async () => {
  const resources = parseCmsResources(await read("lib/cms-resources.ts"));
  const schema = await parseSqliteSchema();

  assert.ok(resources.size >= 10, "no se pudo leer el registro de recursos del CMS");
  for (const [name, { table, fields }] of resources) {
    assert.ok(table, `el recurso ${name} no declara tabla`);
    const columns = schema.get(table);
    assert.ok(columns, `la tabla ${table} del recurso ${name} no existe en la migración`);
    for (const field of fields) {
      assert.ok(
        columns.has(field),
        `el campo ${field} del recurso ${name} no existe como columna de ${table}`,
      );
    }
  }
});

test("el puerto PHP administra los mismos recursos y campos", async () => {
  const [resourcesSource, php] = await Promise.all([
    read("lib/cms-resources.ts"),
    read("php-cpanel/src/Resources.php"),
  ]);
  const resources = parseCmsResources(resourcesSource);

  for (const [name, { table, fields }] of resources) {
    const block = php.match(
      new RegExp(`'${name}' => \\[([\\s\\S]*?)\\],\\n(?= {8}'|\\s*\\];)`),
    )?.[1];
    assert.ok(block, `php-cpanel/src/Resources.php no administra el recurso ${name}`);
    assert.match(
      block,
      new RegExp(`'table' => '${table}'`),
      `el recurso ${name} apunta a otra tabla en el puerto PHP`,
    );
    const phpFields = [...block.matchAll(/'([a-z_]+)'/g)]
      .map((match) => match[1])
      .filter((value) => fields.includes(value));
    for (const field of fields) {
      assert.ok(
        phpFields.includes(field),
        `el campo ${field} de ${name} falta en el puerto PHP`,
      );
    }
  }
});

test("la tienda no tiene catálogo hardcodeado de respaldo", async () => {
  const [storeData, home, product, catalog, header] = await Promise.all([
    read("lib/store-data.ts"),
    read("app/page.tsx"),
    read("app/producto/[slug]/page.tsx"),
    read("app/tienda/[categoria]/page.tsx"),
    read("components/StoreHeader.tsx"),
  ]);

  assert.doesNotMatch(
    storeData,
    /export const (products|menuPages)\b/,
    "lib/store-data.ts volvió a exportar contenido fijo; el catálogo vive en el CMS",
  );

  const importsProductList =
    /import\s*\{[^}]*\bproducts\b[^}]*\}\s*from\s*"@\/lib\/store-data"/;
  for (const [name, source] of [
    ["app/page.tsx", home],
    ["app/producto/[slug]/page.tsx", product],
    ["app/tienda/[categoria]/page.tsx", catalog],
    ["components/StoreHeader.tsx", header],
  ]) {
    assert.doesNotMatch(
      source,
      importsProductList,
      `${name} volvió a importar una lista de productos fija`,
    );
  }
});

test("las páginas de tienda leen el catálogo en vivo, no el HTML exportado", async () => {
  const [home, product, catalog, header] = await Promise.all([
    read("app/page.tsx"),
    read("app/producto/[slug]/page.tsx"),
    read("app/tienda/[categoria]/page.tsx"),
    read("components/StoreHeader.tsx"),
  ]);
  for (const [name, source] of [
    ["app/page.tsx", home],
    ["app/producto/[slug]/page.tsx", product],
    ["app/tienda/[categoria]/page.tsx", catalog],
    ["components/StoreHeader.tsx", header],
  ]) {
    assert.match(
      source,
      /loadStorefront\(/,
      `${name} debe pedir los datos a /api/storefront en el navegador`,
    );
  }
  // El catálogo por categoría se sirve como documento estático para varias
  // rutas: la categoría tiene que salir de la URL real, no del HTML exportado.
  assert.match(
    catalog,
    /window\.location\.pathname/,
    "app/tienda/[categoria]/page.tsx debe resolver la categoría desde la URL",
  );
});

test("el bypass del CMS exige vista previa y desarrollo a la vez", async () => {
  const source = await read("lib/admin-auth.ts");

  assert.match(
    source,
    /ADMIN_PREVIEW === "true"\s*&&\s*(?:\/\/[^\n]*\n\s*)*process\.env\.NODE_ENV === "development"/,
    "el bypass debe exigir ADMIN_PREVIEW y NODE_ENV=development con &&",
  );
  assert.doesNotMatch(
    source,
    /ADMIN_PREVIEW === "true"\s*\|\|/,
    "ADMIN_PREVIEW por sí sola no debe abrir el CMS",
  );
  assert.doesNotMatch(
    source,
    /\|\|\s*(?:\/\/[^\n]*\n\s*)*process\.env\.NODE_ENV === "development"/,
    "NODE_ENV=development por sí sola no debe abrir el CMS",
  );
  assert.match(
    source,
    /requireChatGPTUser|getChatGPTUser/,
    "el CMS debe seguir validando al usuario autenticado",
  );
});

test("el cliente consume las claves que publica /api/storefront", async () => {
  const [route, client] = await Promise.all([
    read("app/api/storefront/route.ts"),
    read("lib/storefront-client.ts"),
  ]);
  for (const key of ["products", "categories", "slides", "settings"]) {
    assert.match(
      route,
      new RegExp(`\\b${key}\\b`),
      `/api/storefront dejó de publicar ${key}`,
    );
    assert.match(
      client,
      new RegExp(`data\\.${key}`),
      `lib/storefront-client.ts dejó de leer ${key}`,
    );
  }
});

// Prueba de humo real contra un servidor ya levantado. Se omite salvo que se
// indique la URL, para que `npm test` no dependa de un proceso externo:
//   BEREL_TEST_BASE_URL=http://localhost:3000 npm test
const baseUrl = process.env.BEREL_TEST_BASE_URL;

test("el servidor sirve la tienda con datos del CMS", { skip: !baseUrl }, async () => {
  const storefront = await fetch(`${baseUrl}/api/storefront`);
  assert.equal(storefront.status, 200);
  const data = await storefront.json();
  assert.ok(Array.isArray(data.products), "/api/storefront debe devolver products");
  assert.ok(data.products.length > 0, "el catálogo administrado está vacío");

  for (const path of ["/", "/tienda/todos"]) {
    const response = await fetch(`${baseUrl}${path}`);
    assert.equal(response.status, 200, `${path} respondió ${response.status}`);
  }
});
