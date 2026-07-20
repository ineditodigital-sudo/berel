/* eslint-disable @next/next/no-html-link-for-pages */
"use client";
import { use, useState } from "react";
import { notFound } from "next/navigation";
import {
  Check,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";
import StoreHeader from "@/components/StoreHeader";
import { money, products } from "@/lib/store-data";

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { slug } = use(params);
  const p = products.find((item) => item.slug === slug);
  if (!p) return notFound();
  return (
    <main id="main-content">
      <StoreHeader />
      <div className="breadcrumbs">
        <a href="/">Inicio</a> /{" "}
        <a href={`/tienda/${p.category.toLowerCase()}`}>{p.category}</a> /{" "}
        {p.name}
      </div>
      <section className="product-detail">
        <div className="product-gallery">
          <span>{p.tag}</span>
          <img src={p.image} alt={p.name} />
          <div className="gallery-thumbs">
            <button className="active">
              <img src={p.image} alt="Vista frontal" />
            </button>
            <button>
              <img src={p.image} alt="Vista de presentación" />
            </button>
            <button className="tech-thumb">
              Ficha
              <br />
              técnica
            </button>
          </div>
        </div>
        <div className="product-info">
          <small>{p.category.toUpperCase()}</small>
          <h1>{p.name}</h1>
          <div className="detail-rating">
            ★ {p.rating} · Producto verificado
          </div>
          <p>{p.description}</p>
          <div className="detail-benefits">
            {p.benefits.map((x) => (
              <span key={x}>
                <Check />
                {x}
              </span>
            ))}
          </div>
          <label>
            Presentación
            <select>
              <option>4 L</option>
              <option>19 L</option>
            </select>
          </label>
          <div className="detail-price">
            <div>
              <small>Precio desde</small>
              <b>{money(p.from)}</b>
            </div>
            <div className="qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))}>
                <Minus />
              </button>
              <b>{qty}</b>
              <button onClick={() => setQty(qty + 1)}>
                <Plus />
              </button>
            </div>
          </div>
          <button className="detail-add" onClick={() => setAdded(true)}>
            {added ? <Check /> : <ShoppingCart />}
            {added ? "Agregado al carrito" : "Añadir al carrito"}
          </button>
          <button className="detail-favorite">
            <Heart /> Guardar en favoritos
          </button>
          <div className="detail-trust">
            <span>
              <Truck />
              Envío gratis desde $999
            </span>
            <span>
              <ShieldCheck />
              Compra protegida
            </span>
          </div>
        </div>
      </section>
      <section className="product-description">
        <div>
          <p>APLICACIÓN RECOMENDADA</p>
          <h2>Resultados profesionales en cada proyecto</h2>
        </div>
        <p>
          {p.uses} Consulta la ficha técnica y prepara correctamente la
          superficie antes de aplicar para obtener el mejor rendimiento.
        </p>
      </section>
      <section className="product-specs">
        <div>
          <p>INFORMACIÓN TÉCNICA</p>
          <h2>Todo lo que necesitas saber</h2>
        </div>
        <div className="spec-list">
          <details open>
            <summary>Preparación de la superficie</summary>
            <p>
              La superficie debe estar limpia, seca y libre de polvo, grasa o
              pintura suelta. Repara grietas y aplica el sellador recomendado
              cuando sea necesario.
            </p>
          </details>
          <details>
            <summary>Aplicación y rendimiento</summary>
            <p>
              Mezcla perfectamente antes de usar. Aplica dos manos uniformes
              respetando los tiempos de secado. El rendimiento puede variar
              según la porosidad.
            </p>
          </details>
          <details>
            <summary>Seguridad y almacenamiento</summary>
            <p>
              Trabaja en áreas ventiladas, utiliza protección adecuada y
              conserva el envase cerrado en un lugar fresco y seco.
            </p>
          </details>
        </div>
      </section>
      <section className="related-products">
        <div>
          <p>COMPLETA TU PROYECTO</p>
          <h2>También te puede interesar</h2>
        </div>
        <div>
          {products
            .filter((item) => item.slug !== p.slug)
            .slice(0, 3)
            .map((item) => (
              <a href={`/producto/${item.slug}`} key={item.slug}>
                <img src={item.image} alt={item.name} />
                <small>{item.category}</small>
                <h3>{item.name}</h3>
                <b>{money(item.from)}</b>
              </a>
            ))}
        </div>
      </section>
    </main>
  );
}
