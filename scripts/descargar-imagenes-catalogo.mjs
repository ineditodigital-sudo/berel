#!/usr/bin/env node
/**
 * Descarga a disco las imágenes del catálogo que hoy viven en berelmexico.com.
 *
 * Mientras apunten a su servidor, la tienda depende de que ellos no cambien
 * ni retiren las URLs. Este script las trae, las nombra por slug y deja un
 * mapa slug -> ruta local para actualizar la base después.
 *
 * Uso: node scripts/descargar-imagenes-catalogo.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const API = "https://berel.inedito.digital/api/storefront";
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const destino = path.join(raiz, "work", "imagenes-catalogo");
const EXTERNO = "berelmexico.com";

const respuesta = await fetch(`${API}?cb=${Math.floor(Math.random() * 1e9)}`);
if (!respuesta.ok) throw new Error(`La API respondió ${respuesta.status}`);
const { products } = await respuesta.json();

const pendientes = products.filter((p) => String(p.image_url || "").includes(EXTERNO));
console.log(`Productos con imagen externa: ${pendientes.length} de ${products.length}`);
await mkdir(destino, { recursive: true });

const mapa = [];
const fallos = [];
// Varias fichas comparten la misma imagen: se descarga una sola vez.
const cache = new Map();

for (const [indice, producto] of pendientes.entries()) {
  const url = producto.image_url;
  if (cache.has(url)) {
    mapa.push({ slug: producto.slug, archivo: cache.get(url) });
    continue;
  }

  try {
    const imagen = await fetch(url, { headers: { "user-agent": "berel-migracion-imagenes/1.0" } });
    if (!imagen.ok) throw new Error(`HTTP ${imagen.status}`);
    const tipo = imagen.headers.get("content-type") ?? "";
    if (!tipo.startsWith("image/")) throw new Error(`no es imagen (${tipo})`);

    const extension = (url.split("?")[0].split(".").pop() ?? "png").toLowerCase();
    const archivo = `${producto.slug}.${extension.replace(/[^a-z0-9]/g, "") || "png"}`;
    const bytes = Buffer.from(await imagen.arrayBuffer());
    await writeFile(path.join(destino, archivo), bytes);

    cache.set(url, archivo);
    mapa.push({ slug: producto.slug, archivo });
    process.stdout.write(`  ${indice + 1}/${pendientes.length} ${archivo} (${Math.round(bytes.length / 1024)} KB)\n`);
  } catch (error) {
    fallos.push({ slug: producto.slug, url, motivo: error instanceof Error ? error.message : String(error) });
    process.stdout.write(`  ${indice + 1}/${pendientes.length} FALLO ${producto.slug}: ${error}\n`);
  }
  await new Promise((r) => setTimeout(r, 200));
}

await writeFile(path.join(destino, "_mapa.json"), JSON.stringify(mapa, null, 1), "utf8");

console.log(`\nDescargadas: ${cache.size} imágenes únicas para ${mapa.length} productos`);
console.log(`Fallos: ${fallos.length}`);
for (const f of fallos.slice(0, 10)) console.log(`  - ${f.slug}: ${f.motivo}`);
console.log(`\nCarpeta: ${path.relative(raiz, destino)}`);
