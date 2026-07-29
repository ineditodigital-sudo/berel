"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { blockNumber, parseBlockConfig, type PageBlock } from "@/lib/page-blocks";
import { useStorefront } from "@/lib/storefront-context";

export default function HeroBlock({ block }: { block: PageBlock }) {
  const { data } = useStorefront();
  const slides = data.slides;
  const segundos = blockNumber(parseBlockConfig(block), "autoplaySeconds", 6);

  const [actual, setActual] = useState(0);
  const [pausadoAMano, setPausadoAMano] = useState(false);
  const [pausadoPorInteraccion, setPausadoPorInteraccion] = useState(false);
  const pausado = pausadoAMano || pausadoPorInteraccion;

  useEffect(() => {
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = slides.length;
    if (pausado || reducido || total < 2 || segundos <= 0) return;
    const temporizador = window.setInterval(
      () => setActual((valor) => (valor + 1) % total),
      segundos * 1000,
    );
    return () => clearInterval(temporizador);
  }, [pausado, slides.length, segundos]);

  const slide = slides[actual];
  if (!slide) return null;

  return (
    <section
      id="inicio"
      className={`hero-carousel theme-${slide.theme}`}
      aria-roledescription="carrusel"
      aria-label="Campañas destacadas"
      onMouseEnter={() => setPausadoPorInteraccion(true)}
      onMouseLeave={() => setPausadoPorInteraccion(false)}
      onFocusCapture={() => setPausadoPorInteraccion(true)}
      onBlurCapture={() => setPausadoPorInteraccion(false)}
    >
      <div
        className="hero-track"
        style={{ transform: `translateX(-${actual * 100}%)` }}
      >
        {slides.map((s, indice) => (
          <article
            className="hero-slide"
            key={s.id}
            aria-hidden={indice !== actual}
            inert={indice !== actual}
          >
            <div className="hero-panel">
              <p>{s.eyebrow}</p>
              <h1>{s.title}</h1>
              <span>{s.body}</span>
              <div>
                <a className="red-button" href={s.button_url || "/tienda/todos"}>
                  {s.button_label || "Comprar ahora"} <ArrowRight />
                </a>
                <a className="white-button" href="#asesoria">
                  Ayúdame a elegir
                </a>
              </div>
            </div>
            <div className="hero-product">
              {/* Si la campaña trae versión vertical, el celular la usa; si
                  no, cae en la de escritorio como hasta ahora. */}
              <picture>
                {s.image_url_mobile && (
                  <source media="(max-width:700px)" srcSet={s.image_url_mobile} />
                )}
                <img
                  src={s.image_url}
                  alt={s.title}
                  fetchPriority={indice === 0 ? "high" : undefined}
                  loading={indice === 0 ? undefined : "lazy"}
                  decoding="async"
                />
              </picture>
            </div>
          </article>
        ))}
      </div>
      {slides.length > 1 && (
        <>
          <button
            className="hero-arrow prev"
            onClick={() => setActual((actual - 1 + slides.length) % slides.length)}
            aria-label="Campaña anterior"
          >
            <ChevronLeft />
          </button>
          <button
            className="hero-arrow next"
            onClick={() => setActual((actual + 1) % slides.length)}
            aria-label="Campaña siguiente"
          >
            <ChevronRight />
          </button>
          <div className="hero-dots">
            {slides.map((s, i) => (
              <button
                className={i === actual ? "active" : ""}
                onClick={() => setActual(i)}
                aria-label={`Ver campaña ${i + 1}`}
                key={s.id}
              />
            ))}
            <button
              className="hero-pause"
              onClick={() => setPausadoAMano((valor) => !valor)}
              aria-pressed={pausadoAMano}
              aria-label={
                pausadoAMano
                  ? "Reanudar rotación del carrusel"
                  : "Pausar rotación del carrusel"
              }
            >
              {pausadoAMano ? <Play /> : <Pause />}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
