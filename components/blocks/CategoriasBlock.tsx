"use client";

import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { blockNumber, parseBlockConfig, type PageBlock } from "@/lib/page-blocks";
import { useStorefront } from "@/lib/storefront-context";

// Paleta de presentación de las tarjetas. Es estilo, no contenido: los
// nombres e imágenes vienen del CMS.
const COLORES = ["#e83338", "#178cc4", "#f3b51b", "#323f9c"];

export default function CategoriasBlock({ block }: { block: PageBlock }) {
  const { data } = useStorefront();
  const limite = blockNumber(parseBlockConfig(block), "limite", 4);

  const tarjetas = useMemo(() => {
    const conteo = new Map<string, number>();
    for (const producto of data.products) {
      conteo.set(producto.category, (conteo.get(producto.category) ?? 0) + 1);
    }
    return data.categories
      .map((categoria) => ({
        nombre: categoria.name,
        slug: categoria.slug,
        total: conteo.get(categoria.name) ?? 0,
        imagen:
          categoria.image_url ||
          data.products.find((p) => p.category === categoria.name)?.image ||
          "/berel-icono.png",
      }))
      .filter((c) => c.total > 0)
      // "Populares" son las que más catálogo publicado tienen.
      .sort((a, b) => b.total - a.total)
      .slice(0, limite)
      .map((c, indice) => ({ ...c, color: COLORES[indice % COLORES.length] }));
  }, [data.categories, data.products, limite]);

  if (tarjetas.length === 0) return null;

  return (
    <section id="categorias" className="content-section">
      <div className="section-title">
        <div>
          {block.title && <p>{block.title}</p>}
          {block.body && <h2>{block.body}</h2>}
        </div>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className="text-action" href="/tienda/todos">
          Ver catálogo completo <ArrowRight size={17} />
        </a>
      </div>
      <div className="category-grid">
        {tarjetas.map((c) => (
          <a
            className="category-card"
            href={`/tienda/${c.slug}`}
            key={c.slug}
            style={{ "--cat": c.color } as React.CSSProperties}
          >
            <div>
              <span>
                {c.total} producto{c.total === 1 ? "" : "s"}
              </span>
              <h3>{c.nombre}</h3>
              <small>
                Ver categoría <ArrowRight size={15} />
              </small>
            </div>
            <img src={c.imagen} alt="" loading="lazy" decoding="async" />
          </a>
        ))}
      </div>
    </section>
  );
}
