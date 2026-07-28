"use client";

import { useCallback, useState } from "react";
import { ArrowRight, Star, X } from "lucide-react";
import type { PageBlock } from "@/lib/page-blocks";
import type { Product } from "@/lib/store-data";
import { useStorefront } from "@/lib/storefront-context";
import { useCart } from "@/lib/cart-context";

const SUPERFICIES = ["Muros", "Pisos", "Techo o azotea", "Madera"];
const UBICACIONES = ["Interior", "Exterior"];

export default function AsesorBlock({ block }: { block: PageBlock }) {
  const { data } = useStorefront();
  const { notify } = useCart();
  const [superficie, setSuperficie] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [resultado, setResultado] = useState<
    { producto: Product; motivo: string } | null
  >(null);

  const recomendar = useCallback(() => {
    // Se prefiere un producto concreto del catálogo publicado; si el CMS ya no
    // lo tiene, se busca por palabra clave dentro de lo que sí está publicado.
    const buscar = (slug: string, palabra: string) =>
      data.products.find((p) => p.slug === slug) ??
      data.products.find((p) =>
        `${p.category} ${p.name}`.toLowerCase().includes(palabra),
      );

    let producto: Product | undefined;
    let motivo = "";
    if (superficie === "Pisos") {
      producto = buscar("pintura-pisos-3800", "piso");
      motivo = "Para pisos de concreto: acabado satinado, antiderrapante y resistente al tráfico.";
    } else if (superficie === "Techo o azotea") {
      producto = buscar("impermeabilizante-acrilico", "impermeabilizante");
      motivo = "Para techos y azoteas: sella filtraciones y resiste sol y lluvia.";
    } else if (superficie === "Madera") {
      producto = buscar("barniz-maderas", "madera");
      motivo = "Para madera: realza la veta natural y protege de la humedad.";
    } else if (ubicacion === "Exterior") {
      producto = buscar("berelex-playa", "exterior");
      motivo = "Para muros exteriores: resiste sol, humedad y clima exigente sin decolorarse.";
    } else {
      producto = buscar("sellador-anti-salitre-530", "sellador");
      motivo = "Ideal para preparar y proteger muros interiores contra la humedad y el salitre.";
    }

    if (!producto) {
      notify("Todavía no hay un producto publicado para esa combinación.");
      return;
    }
    setResultado({ producto, motivo });
  }, [superficie, ubicacion, data.products, notify]);

  return (
    <>
      <section id="asesoria" className="advisor">
        {block.title && <p className="advisor-eyebrow">{block.title}</p>}
        {block.body && <h2>{block.body}</h2>}
        <span className="advisor-sub">
          Responde 2 preguntas y te decimos exactamente qué producto necesitas.
        </span>

        <div className="adv-q">
          <div className="adv-label">
            <b>1</b> ¿Qué vas a pintar o proteger?
          </div>
          <div className="adv-chips">
            {SUPERFICIES.map((opcion) => (
              <button
                key={opcion}
                className={superficie === opcion ? "adv-chip on" : "adv-chip"}
                onClick={() => setSuperficie(opcion)}
              >
                {opcion}
              </button>
            ))}
          </div>
          <small className={superficie ? "adv-hint done" : "adv-hint"}>
            {superficie ? `Elegiste: ${superficie}` : "Elige una opción"}
          </small>
        </div>

        <div className="adv-q">
          <div className="adv-label">
            <b>2</b> ¿Dónde está?
          </div>
          <div className="adv-chips">
            {UBICACIONES.map((opcion) => (
              <button
                key={opcion}
                className={ubicacion === opcion ? "adv-chip on" : "adv-chip"}
                onClick={() => setUbicacion(opcion)}
              >
                {opcion}
              </button>
            ))}
          </div>
          <small className={ubicacion ? "adv-hint done" : "adv-hint"}>
            {ubicacion ? `Elegiste: ${ubicacion}` : "Elige una opción"}
          </small>
        </div>

        <button
          className="adv-submit"
          onClick={recomendar}
          disabled={!superficie || !ubicacion}
        >
          Ver mi recomendación <ArrowRight />
        </button>
        {(!superficie || !ubicacion) && (
          <p className="adv-note">
            Responde las 2 preguntas para ver tu recomendación.
          </p>
        )}
      </section>

      {resultado && (
        <div
          className="adv-backdrop"
          onClick={(evento) => {
            if (evento.target === evento.currentTarget) setResultado(null);
          }}
        >
          <div className="adv-modal" role="dialog" aria-modal="true">
            <span className="adv-grab" />
            <div className="adv-mtop">
              <span className="adv-mtag">Tu recomendación</span>
              <button
                className="adv-x"
                onClick={() => setResultado(null)}
                aria-label="Cerrar"
              >
                <X />
              </button>
            </div>
            <div className="adv-prod">
              <img
                src={resultado.producto.image}
                alt={resultado.producto.name}
                decoding="async"
              />
              <div>
                <div className="adv-cat">{resultado.producto.category}</div>
                <h3>{resultado.producto.name}</h3>
                <div className="adv-rate">
                  <Star fill="currentColor" /> {resultado.producto.rating} · verificado
                </div>
              </div>
            </div>
            <div className="adv-reason">{resultado.motivo}</div>
            <div className="adv-macts">
              <button className="white-button" onClick={() => setResultado(null)}>
                Seguir viendo
              </button>
              <a
                className="red-button"
                href={`/producto/${resultado.producto.slug}`}
              >
                Ver producto <ArrowRight />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
