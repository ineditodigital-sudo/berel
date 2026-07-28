"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Plus, Star } from "lucide-react";
import {
  blockNumber,
  blockText,
  parseBlockConfig,
  type PageBlock,
} from "@/lib/page-blocks";
import { money } from "@/lib/store-data";
import { useStorefront } from "@/lib/storefront-context";
import { useCart } from "@/lib/cart-context";

/**
 * Escaparate de productos: una selección, no el catálogo. Prioriza los
 * marcados como "Destacado" en el CMS y manda al catálogo completo.
 */
export default function ProductosBlock({ block }: { block: PageBlock }) {
  const { data } = useStorefront();
  const { add } = useCart();
  const carrusel = useRef<HTMLDivElement>(null);
  const config = parseBlockConfig(block);
  const limite = blockNumber(config, "limite", 8);
  const categoria = blockText(config, "categoria");

  const productos = useMemo(() => {
    const base = categoria
      ? data.products.filter(
          (p) => p.category.toLowerCase() === categoria.toLowerCase(),
        )
      : data.products;
    return [...base]
      .sort((a, b) => Number(b.featured) - Number(a.featured))
      .slice(0, limite);
  }, [data.products, categoria, limite]);

  const desplazar = useCallback(
    (direccion: number) =>
      carrusel.current?.scrollBy({ left: direccion * 340, behavior: "smooth" }),
    [],
  );

  // Avance automático del carrusel, que se detiene mientras el visitante lo
  // toca o pasa el cursor por encima.
  useEffect(() => {
    const el = carrusel.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let detenido = false;
    let reanudar: ReturnType<typeof setTimeout>;
    const sostener = () => {
      detenido = true;
      clearTimeout(reanudar);
    };
    const soltar = () => {
      clearTimeout(reanudar);
      reanudar = setTimeout(() => (detenido = false), 4500);
    };
    el.addEventListener("pointerdown", sostener);
    el.addEventListener("pointerup", soltar);
    el.addEventListener("mouseenter", sostener);
    el.addEventListener("mouseleave", soltar);
    const id = window.setInterval(() => {
      if (detenido) return;
      const maximo = el.scrollWidth - el.clientWidth;
      if (maximo <= 4) return;
      const paso = el.clientWidth * 0.82;
      if (el.scrollLeft >= maximo - 8) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: paso, behavior: "smooth" });
    }, 3200);
    return () => {
      clearInterval(id);
      clearTimeout(reanudar);
      el.removeEventListener("pointerdown", sostener);
      el.removeEventListener("pointerup", soltar);
      el.removeEventListener("mouseenter", sostener);
      el.removeEventListener("mouseleave", soltar);
    };
  }, [productos.length]);

  if (productos.length === 0) return null;

  const total = categoria
    ? productos.length
    : data.products.length;
  const hrefCatalogo = categoria
    ? `/tienda/${categoria.toLowerCase().replace(/\s+/g, "-")}`
    : "/tienda/todos";

  return (
    <section id="productos" className="content-section products-section">
      <div className="section-title">
        <div>
          {block.title && <p>{block.title}</p>}
          {block.body && <h2>{block.body}</h2>}
        </div>
        <div className="carousel-actions">
          <button onClick={() => desplazar(-1)} aria-label="Productos anteriores">
            <ChevronLeft />
          </button>
          <button onClick={() => desplazar(1)} aria-label="Productos siguientes">
            <ChevronRight />
          </button>
        </div>
      </div>
      <div className="products-grid carousel" ref={carrusel}>
        {productos.map((p) => (
          <article className="product-card" key={p.slug}>
            <div className="product-image">
              <span>{p.tag}</span>
              <a href={`/producto/${p.slug}`} aria-label={`Ver detalles de ${p.name}`}>
                <img src={p.image} alt={p.name} loading="lazy" decoding="async" />
              </a>
            </div>
            <div className="product-copy">
              <small>{p.category}</small>
              <h3>
                <a href={`/producto/${p.slug}`}>{p.name}</a>
              </h3>
              <div className="stars">
                <Star fill="currentColor" /> {p.rating}{" "}
                <span>Producto verificado</span>
              </div>
              <div className="product-bottom">
                <div>
                  {p.old && <del>{money(p.old)}</del>}
                  <b>{money(p.from)}</b>
                  {p.to && <small> – {money(p.to)}</small>}
                </div>
                <button
                  onClick={() =>
                    add({
                      slug: p.slug,
                      name: p.name,
                      image: p.image,
                      price: p.from,
                    })
                  }
                  aria-label={`Agregar ${p.name}`}
                >
                  <Plus />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="ver-catalogo">
        <a className="red-button" href={hrefCatalogo}>
          {total > productos.length
            ? `Ver los ${total} productos`
            : "Ver todo el catálogo"}
          <ArrowRight />
        </a>
      </div>
    </section>
  );
}
