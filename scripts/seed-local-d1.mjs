#!/usr/bin/env node
/**
 * Aplica las migraciones de `drizzle/` a la base D1 local de Miniflare.
 *
 * El plugin de Cloudflare crea el archivo SQLite dentro de `.wrangler/state`
 * la primera vez que se levanta el entorno, así que hay que ejecutar
 * `npm run dev` (aunque sea unos segundos) antes de sembrar.
 *
 * Uso:
 *   npm run db:local           aplica las migraciones que falten
 *   npm run db:local -- --reset  borra las tablas y vuelve a aplicarlas
 */
import { DatabaseSync } from "node:sqlite";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const d1Directory = path.join(
  root,
  ".wrangler",
  "state",
  "v3",
  "d1",
  "miniflare-D1DatabaseObject",
);
const migrationsDirectory = path.join(root, "drizzle");

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

async function findDatabaseFile() {
  let entries;
  try {
    entries = await readdir(d1Directory);
  } catch {
    fail(
      `No existe ${path.relative(root, d1Directory)}.\n` +
        "  Levanta `npm run dev` una vez para que Miniflare cree la base local y vuelve a intentarlo.",
    );
  }
  // Miniflare guarda su índice en metadata.sqlite; la base real es el archivo
  // con nombre de hash derivado del binding.
  const candidates = entries.filter(
    (entry) => entry.endsWith(".sqlite") && entry !== "metadata.sqlite",
  );
  if (candidates.length === 0) {
    fail(
      "Miniflare todavía no creó la base D1 local.\n" +
        "  Levanta `npm run dev` una vez y vuelve a intentarlo.",
    );
  }
  if (candidates.length > 1) {
    console.warn(
      `⚠ Hay ${candidates.length} bases locales; se usará ${candidates[0]}.`,
    );
  }
  return path.join(d1Directory, candidates[0]);
}

async function readMigrations() {
  const files = (await readdir(migrationsDirectory))
    .filter((file) => file.endsWith(".sql"))
    .sort();
  if (files.length === 0) fail("No hay migraciones en `drizzle/`.");
  return Promise.all(
    files.map(async (file) => ({
      file,
      statements: (await readFile(path.join(migrationsDirectory, file), "utf8"))
        .split("--> statement-breakpoint")
        .map((statement) => statement.trim())
        .filter(Boolean),
    })),
  );
}

function listTables(db) {
  return db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%'",
    )
    .all()
    .map((row) => row.name);
}

const reset = process.argv.includes("--reset");
const databaseFile = await findDatabaseFile();
const migrations = await readMigrations();
const db = new DatabaseSync(databaseFile);

const existing = listTables(db);
if (existing.length > 0 && !reset) {
  console.log(
    `La base local ya tiene ${existing.length} tablas (${existing.join(", ")}).\n` +
      "Usa `npm run db:local -- --reset` para borrarlas y volver a sembrar.",
  );
  db.close();
  process.exit(0);
}

if (reset && existing.length > 0) {
  db.exec("PRAGMA foreign_keys=OFF");
  for (const table of existing) db.exec(`DROP TABLE IF EXISTS \`${table}\``);
  db.exec("PRAGMA foreign_keys=ON");
  console.log(`Tablas eliminadas: ${existing.join(", ")}`);
}

for (const migration of migrations) {
  for (const statement of migration.statements) db.exec(statement);
  console.log(`✔ ${migration.file} (${migration.statements.length} sentencias)`);
}

const counts = ["categories", "products", "carousel_slides", "faqs", "branches", "site_settings"]
  .map((table) => `${table}=${db.prepare(`SELECT COUNT(*) c FROM \`${table}\``).get().c}`)
  .join("  ");
db.close();

console.log(`\nBase local lista en ${path.relative(root, databaseFile)}`);
console.log(counts);
