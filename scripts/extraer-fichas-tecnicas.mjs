#!/usr/bin/env node
/**
 * Extrae las fichas técnicas oficiales que Berel ya publica y las asocia a los
 * productos del catálogo por slug.
 *
 * Las descripciones de WooCommerce enlazan PDFs alojados en berel.com.mx. Este
 * script los recupera, comprueba que cada archivo exista realmente y genera un
 * CSV con `slug,technical_sheet_url` para actualizar el catálogo.
 *
 * Uso: node scripts/extraer-fichas-tecnicas.mjs
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ORIGEN = "https://www.berelmexico.com/wp-json/wc/store/v1/products";
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const salida = path.join(raiz, "work", "fichas-tecnicas.csv");

async function traerPagina(pagina) {
  const respuesta = await fetch(`${ORIGEN}?per_page=100&page=${pagina}`, {
    headers: { accept: "application/json", "user-agent": "berel-fichas/1.0" },
  });
  if (!respuesta.ok) throw new Error(`API respondió ${respuesta.status}`);
  return {
    productos: await respuesta.json(),
    totalPaginas: Number(respuesta.headers.get("x-wp-totalpages") ?? 1),
  };
}

const productos = [];
let pagina = 1;
let totalPaginas = 1;
do {
  const lote = await traerPagina(pagina);
  totalPaginas = lote.totalPaginas;
  productos.push(...lote.productos);
  pagina += 1;
  if (pagina <= totalPaginas) await new Promise((r) => setTimeout(r, 400));
} while (pagina <= totalPaginas);

console.log(`Catálogo leído: ${productos.length} productos`);

const candidatos = [];
for (const producto of productos) {
  const texto = `${producto.description ?? ""} ${producto.short_description ?? ""}`;
  const encontrados = texto.match(/https?:\/\/[^\s"'<>]+\.pdf/gi) ?? [];
  const unico = [...new Set(encontrados.map((u) => u.replace(/&amp;/g, "&")))];
  if (unico.length > 0) {
    candidatos.push({ slug: producto.slug, nombre: producto.name, url: unico[0] });
  }
}

console.log(`Productos con ficha enlazada: ${candidatos.length}`);
console.log("Verificando que cada PDF exista…");

const verificados = [];
for (const ficha of candidatos) {
  try {
    const respuesta = await fetch(ficha.url, {
      method: "HEAD",
      headers: { "user-agent": "berel-fichas/1.0" },
    });
    const tipo = respuesta.headers.get("content-type") ?? "";
    const ok = respuesta.ok && tipo.includes("pdf");
    if (ok) verificados.push(ficha);
    console.log(`  ${ok ? "✔" : "✘"} ${respuesta.status} ${ficha.slug}`);
  } catch (error) {
    console.log(`  ✘ error ${ficha.slug}: ${(error instanceof Error ? error.message : error)}`);
  }
  await new Promise((r) => setTimeout(r, 250));
}

const campo = (valor) =>
  /[",\n]/.test(String(valor)) ? `"${String(valor).replace(/"/g, '""')}"` : String(valor);
const csv = [
  "slug,technical_sheet_url",
  ...verificados.map((f) => [f.slug, f.url].map(campo).join(",")),
].join("\n");

await writeFile(salida, `﻿${csv}`, "utf8");
console.log(`\nFichas verificadas: ${verificados.length} de ${candidatos.length}`);
console.log(`CSV: ${path.relative(raiz, salida)}`);
