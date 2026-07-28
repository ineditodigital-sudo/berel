"use client";

import { ArrowRight } from "lucide-react";
import { blockText, parseBlockConfig, type PageBlock } from "@/lib/page-blocks";

/**
 * Banner ancho con imagen, mensaje y botón. Admite una imagen distinta para
 * móvil, que es lo que pidió el cliente para las campañas.
 */
export default function BannerBlock({ block }: { block: PageBlock }) {
  const config = parseBlockConfig(block);
  const imagen = blockText(config, "imagen");
  const imagenMovil = blockText(config, "imagenMovil");
  const botonTexto = blockText(config, "botonTexto");
  const botonUrl = blockText(config, "botonUrl");

  if (!imagen && !block.title) return null;

  return (
    <section className="bloque-banner">
      {imagen && (
        <picture>
          {imagenMovil && (
            <source media="(max-width:700px)" srcSet={imagenMovil} />
          )}
          <img src={imagen} alt={block.title || ""} loading="lazy" decoding="async" />
        </picture>
      )}
      {(block.title || block.body || botonTexto) && (
        <div className="bloque-banner-copy">
          {block.title && <h2>{block.title}</h2>}
          {block.body && <p>{block.body}</p>}
          {botonTexto && botonUrl && (
            <a className="red-button" href={botonUrl}>
              {botonTexto} <ArrowRight />
            </a>
          )}
        </div>
      )}
    </section>
  );
}
