#!/usr/bin/env node
/**
 * Extrae el catálogo público de berelmexico.com y genera el CSV que acepta el
 * importador del CMS (Productos → Importar CSV).
 *
 * Usa la API REST pública de WooCommerce (`/wp-json/wc/store/v1/products`), no
 * raspa HTML: los datos llegan estructurados y estables. El robots.txt del sitio
 * permite el acceso; aun así las peticiones van en serie y con pausa.
 *
 * Uso:
 *   node scripts/extraer-catalogo-berel.mjs
 *   node scripts/extraer-catalogo-berel.mjs --stock 25 --salida work/catalogo.csv
 *
 * Notas sobre los datos de origen:
 *  - Los productos variables (57 de 139) publican un rango de precio por
 *    presentación. Se toma el mínimo, que es el precio "desde" que muestra la
 *    tienda. Las presentaciones se anotan en la descripción para no perderlas.
 *  - WooCommerce no publica inventario real, solo si hay o no existencia. El
 *    valor de `existencia` es un marcador que debes ajustar en el CMS.
 *  - Las imágenes quedan apuntando a berelmexico.com. Para no depender de ese
 *    servidor, súbelas después a la biblioteca del CMS.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ORIGEN = "https://www.berelmexico.com/wp-json/wc/store/v1/products";
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function argumento(nombre, porDefecto) {
  const indice = process.argv.indexOf(`--${nombre}`);
  return indice > -1 && process.argv[indice + 1]
    ? process.argv[indice + 1]
    : porDefecto;
}

const stockPorDefecto = Number(argumento("stock", "20"));
const salida = path.resolve(
  raiz,
  argumento("salida", "work/catalogo-berelmexico.csv"),
);

const ENTIDADES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú",
  ntilde: "ñ", Ntilde: "Ñ", uuml: "ü", deg: "°", hellip: "…",
  Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú",
};

function decodificar(texto) {
  return String(texto ?? "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&([a-zA-Z]+);/g, (todo, nombre) => ENTIDADES[nombre] ?? todo);
}

/** Convierte el HTML de WooCommerce en texto plano legible. */
function aTextoPlano(html) {
  return decodificar(
    String(html ?? "")
      .replace(/<\s*(br|\/p|\/li|\/h[1-6])\s*\/?>/gi, "\n")
      .replace(/<li[^>]*>/gi, "• ")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

function campoCsv(valor) {
  const texto = String(valor ?? "");
  return /[",\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

async function traerPagina(pagina) {
  const respuesta = await fetch(`${ORIGEN}?per_page=100&page=${pagina}`, {
    headers: { accept: "application/json", "user-agent": "berel-catalogo-import/1.0" },
  });
  if (!respuesta.ok) {
    throw new Error(`La API respondió ${respuesta.status} en la página ${pagina}`);
  }
  return {
    productos: await respuesta.json(),
    totalPaginas: Number(respuesta.headers.get("x-wp-totalpages") ?? 1),
    total: Number(respuesta.headers.get("x-wp-total") ?? 0),
  };
}

const productos = [];
let pagina = 1;
let totalPaginas = 1;
let total = 0;

do {
  const lote = await traerPagina(pagina);
  totalPaginas = lote.totalPaginas;
  total = lote.total;
  productos.push(...lote.productos);
  process.stdout.write(`  página ${pagina}/${totalPaginas} → ${productos.length}/${total}\n`);
  pagina += 1;
  if (pagina <= totalPaginas) await new Promise((r) => setTimeout(r, 400));
} while (pagina <= totalPaginas);

const COLUMNAS = [
  "sku", "name", "slug", "category",
  "short_description", "description",
  "price", "stock", "image_url", "technical_sheet_url",
];

const filas = [];
const avisos = { sinCategoria: 0, sinPrecio: 0, sinImagen: 0, variables: 0 };

for (const producto of productos) {
  const nombre = decodificar(producto.name).replace(/\s+/g, " ").trim();
  const precios = producto.prices ?? {};
  const rango = precios.price_range;
  const minimoCentavos = Number(rango?.min_amount ?? precios.price ?? 0);
  const unidadMenor = Number(precios.currency_minor_unit ?? 2);
  const precio = minimoCentavos / 10 ** unidadMenor;

  const presentaciones = (producto.attributes ?? [])
    .filter((a) => a.has_variations && a.terms?.length)
    .map((a) => `${a.name}: ${a.terms.map((t) => decodificar(t.name)).join(", ")}`);
  if (rango) avisos.variables += 1;

  const descripcion = [aTextoPlano(producto.description), ...presentaciones]
    .filter(Boolean)
    .join("\n");
  const corta =
    aTextoPlano(producto.short_description) ||
    descripcion.split("\n").find((l) => l.length > 25) ||
    "";

  const categoria = decodificar(producto.categories?.[0]?.name ?? "");
  if (!categoria) avisos.sinCategoria += 1;
  if (!minimoCentavos) avisos.sinPrecio += 1;
  if (!producto.images?.length) avisos.sinImagen += 1;

  filas.push([
    producto.sku ?? "",
    nombre,
    producto.slug ?? "",
    categoria,
    corta.slice(0, 400),
    descripcion.slice(0, 1800),
    precio.toFixed(2),
    stockPorDefecto,
    producto.images?.[0]?.src ?? "",
    "",
  ]);
}

const csv = [COLUMNAS.join(","), ...filas.map((f) => f.map(campoCsv).join(","))].join("\n");
await writeFile(salida, `﻿${csv}`, "utf8");

const categorias = new Set(filas.map((f) => f[3]).filter(Boolean));
const pesoKb = Math.round(Buffer.byteLength(csv, "utf8") / 1024);

console.log(`\nCSV generado: ${path.relative(raiz, salida)}  (${pesoKb} KB)`);
console.log(`Productos: ${filas.length}   Categorías distintas: ${categorias.size}`);
console.log(`  con precio en rango (varias presentaciones): ${avisos.variables}`);
console.log(`  sin categoría: ${avisos.sinCategoria}   sin precio: ${avisos.sinPrecio}   sin imagen: ${avisos.sinImagen}`);
console.log(`\nRevisa el archivo antes de importarlo en /admin → Productos → Importar CSV.`);
console.log(`La existencia quedó en ${stockPorDefecto} para todos: ajústala en el CMS.`);
