"use client";

import type { PageBlock } from "@/lib/page-blocks";

/**
 * Bloque de texto libre: sirve para avisos, secciones nuevas o cualquier
 * contenido que no encaje en los demás tipos. El cuerpo admite saltos de
 * línea y cada uno se dibuja como párrafo.
 */
export default function TextoBlock({ block }: { block: PageBlock }) {
  const parrafos = (block.body || "")
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean);

  if (!block.title && parrafos.length === 0) return null;

  return (
    <section className="content-section bloque-texto">
      {block.title && (
        <div className="section-title">
          <div>
            <h2>{block.title}</h2>
          </div>
        </div>
      )}
      <div className="bloque-texto-cuerpo">
        {parrafos.map((parrafo, indice) => (
          <p key={indice}>{parrafo}</p>
        ))}
      </div>
    </section>
  );
}
