"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Heart,
  Minus,
  PackageCheck,
  Pause,
  Play,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  X,
} from "lucide-react";
import StoreHeader from "@/components/StoreHeader";
import { cmsProductToStore, money, products, type CmsProductRow } from "@/lib/store-data";
import { useCart } from "@/lib/cart-context";

const categoryCards = [
  { name: "Pinturas", image: "/berel/playa.png", color: "#e83338" },
  { name: "Impermeabilizantes", image: "/berel/imper.png", color: "#178cc4" },
  { name: "Esmaltes", image: "/berel/summa.png", color: "#f3b51b" },
  { name: "Selladores", image: "/berel/salitre.png", color: "#323f9c" },
];

const heroSlides = [
  {
    eyebrow: "TIENDA OFICIAL BEREL MÉXICO",
    title: "Todo para pintar, proteger y renovar.",
    copy: "Productos originales, asesoría especializada y entrega directa.",
    image: "/hero-modern-berel.webp",
    theme: "yellow",
  },
  {
    eyebrow: "PROTECCIÓN TODO EL AÑO",
    title: "Que la lluvia no detenga tus proyectos.",
    copy: "Impermeabilizantes de alto desempeño para cuidar tu hogar.",
    image: "/hero-impermeabilizante-v2.webp",
    theme: "blue",
  },
  {
    eyebrow: "COLOR PARA EXTERIORES",
    title: "Fachadas que resisten y se ven increíbles.",
    copy: "Recubrimientos diseñados para sol, humedad y ambientes exigentes.",
    image: "/hero-exteriores-v2.webp",
    theme: "red",
  },
];

const FEATURED_SLUG = "pintura-pisos-3800";

export default function Home() {
  const { add } = useCart();
  const [catalogProducts, setCatalogProducts] = useState(products);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [advSurface, setAdvSurface] = useState("");
  const [advLocation, setAdvLocation] = useState("");
  const [advResult, setAdvResult] = useState<
    { p: (typeof products)[number]; reason: string } | null
  >(null);
  const recommend = useCallback(() => {
    const find = (s: string) =>
      catalogProducts.find((p) => p.slug === s) ??
      products.find((p) => p.slug === s)!;
    let p, reason;
    if (advSurface === "Pisos") {
      p = find("pintura-pisos-3800");
      reason = "Para pisos de concreto: acabado satinado, antiderrapante y resistente al tráfico.";
    } else if (advSurface === "Techo o azotea") {
      p = find("impermeabilizante-acrilico");
      reason = "Para techos y azoteas: sella filtraciones y resiste sol y lluvia.";
    } else if (advSurface === "Madera") {
      p = find("barniz-maderas");
      reason = "Para madera: realza la veta natural y protege de la humedad.";
    } else if (advLocation === "Exterior") {
      p = find("berelex-playa");
      reason = "Para muros exteriores: resiste sol, humedad y clima exigente sin decolorarse.";
    } else {
      p = find("sellador-anti-salitre-530");
      reason = "Ideal para preparar y proteger muros interiores contra la humedad y el salitre.";
    }
    setAdvResult({ p, reason });
  }, [advSurface, advLocation, catalogProducts]);
  const [hero, setHero] = useState(0);
  const [heroManuallyPaused, setHeroManuallyPaused] = useState(false);
  const [heroInteractionPaused, setHeroInteractionPaused] = useState(false);
  const [splash, setSplash] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const heroPaused = heroManuallyPaused || heroInteractionPaused;

  const visible = useMemo(
    () =>
      catalogProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) &&
          (category === "Todos" || p.category === category),
      ),
    [query, category, catalogProducts],
  );

  useEffect(() => {
    fetch("/api/storefront")
      .then((response) => response.json())
      .then((data: { products?: CmsProductRow[] }) => {
        if (data.products?.length) {
          setCatalogProducts(data.products.map(cmsProductToStore));
        }
      })
      .catch(() => undefined);
  }, []);

  const goToProducts = useCallback(() => {
    document
      .querySelector("#productos")
      ?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const scrollProducts = useCallback(
    (direction: number) =>
      carouselRef.current?.scrollBy({
        left: direction * 340,
        behavior: "smooth",
      }),
    [],
  );

  useEffect(() => {
    // Evita que la página salte automáticamente a una sección (p. ej. #asesoria)
    // al cargar: siempre inicia arriba y limpia el ancla de la URL.
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    if (window.location.hash) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (entry) =>
            entry.isIntersecting && entry.target.classList.add("is-visible"),
        ),
      { threshold: 0.06, rootMargin: "0px 0px 18% 0px" },
    );
    const revealed = document.querySelectorAll(
      "#asesoria, .service-grid, footer",
    );
    revealed.forEach((section) => {
      section.classList.add("reveal");
      observer.observe(section);
    });
    // Safety net: never leave content hidden if the observer never fires.
    const safety = window.setTimeout(
      () => revealed.forEach((s) => s.classList.add("is-visible")),
      1800,
    );
    return () => {
      observer.disconnect();
      clearTimeout(safety);
    };
  }, []);

  useEffect(() => {
    const splashWasSeen = window.sessionStorage.getItem("berel-splash-seen");
    if (splashWasSeen) {
      const immediateTimer = window.setTimeout(() => setSplash(false), 0);
      return () => clearTimeout(immediateTimer);
    }
    window.sessionStorage.setItem("berel-splash-seen", "true");
    const splashTimer = window.setTimeout(() => setSplash(false), 350);
    return () => {
      clearTimeout(splashTimer);
    };
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (heroPaused || reducedMotion) return;
    const slider = window.setInterval(
      () => setHero((value) => (value + 1) % heroSlides.length),
      6000,
    );
    return () => clearInterval(slider);
  }, [heroPaused]);
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let paused = false;
    let resume: ReturnType<typeof setTimeout>;
    const hold = () => {
      paused = true;
      clearTimeout(resume);
    };
    const release = () => {
      clearTimeout(resume);
      resume = setTimeout(() => (paused = false), 4500);
    };
    el.addEventListener("pointerdown", hold);
    el.addEventListener("pointerup", release);
    el.addEventListener("mouseenter", hold);
    el.addEventListener("mouseleave", release);
    const id = window.setInterval(() => {
      if (paused) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 4) return;
      const step = el.clientWidth * 0.82;
      if (el.scrollLeft >= max - 8) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: step, behavior: "smooth" });
    }, 3200);
    return () => {
      clearInterval(id);
      clearTimeout(resume);
      el.removeEventListener("pointerdown", hold);
      el.removeEventListener("pointerup", release);
      el.removeEventListener("mouseenter", hold);
      el.removeEventListener("mouseleave", release);
    };
  }, [visible.length]);

  useEffect(() => {
    const onScroll = () => {
      const solid = window.scrollY > Math.max(0, window.innerHeight * 0.62);
      document.body.classList.toggle("home-scrolled", solid);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.body.classList.remove("home-scrolled");
    };
  }, []);

  return (
    <>
      {splash && (
        <div className="brand-splash">
          <div className="splash-logo">
            berel<small>PINTA CON CONFIANZA</small>
          </div>
          <span />
        </div>
      )}
      <main id="main-content" className="home-shell">
        <div className="utility">
          <span>Envíos en CDMX y Edo. Méx.</span>
          <div>
            <a href="#ayuda">Preguntas frecuentes</a>
            <a href="#contacto">Contacto</a>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/cuenta#facturacion">Facturación</a>
          </div>
        </div>
        <StoreHeader />

        <section className="trustbar">
          <span>
            <Truck /> Envío gratis <small>en compras desde $999</small>
          </span>
          <span>
            <Headphones /> Asesoría en línea <small>para elegir mejor</small>
          </span>
          <span>
            <ShieldCheck /> Compra 100% segura <small>pago protegido</small>
          </span>
        </section>

        <section
          id="inicio"
          className={`hero-carousel theme-${heroSlides[hero].theme}`}
          aria-roledescription="carrusel"
          aria-label="Campañas destacadas"
          onMouseEnter={() => setHeroInteractionPaused(true)}
          onMouseLeave={() => setHeroInteractionPaused(false)}
          onFocusCapture={() => setHeroInteractionPaused(true)}
          onBlurCapture={() => setHeroInteractionPaused(false)}
        >
          <div
            className="hero-track"
            style={{ transform: `translateX(-${hero * 100}%)` }}
          >
            {heroSlides.map((slide, index) => (
              <article
                className="hero-slide"
                key={slide.title}
                aria-hidden={index !== hero}
                inert={index !== hero}
              >
                <div className="hero-panel">
                  <p>{slide.eyebrow}</p>
                  <h1>{slide.title}</h1>
                  <span>{slide.copy}</span>
                  <div>
                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                    <a className="red-button" href="/tienda/todos">
                      Comprar ahora <ArrowRight />
                    </a>
                    <a className="white-button" href="#asesoria">
                      Ayúdame a elegir
                    </a>
                  </div>
                </div>
                <div className="hero-product">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    fetchPriority={index === 0 ? "high" : undefined}
                    loading={index === 0 ? undefined : "lazy"}
                    decoding="async"
                  />
                </div>
              </article>
            ))}
          </div>
          <button
            className="hero-arrow prev"
            onClick={() =>
              setHero((hero - 1 + heroSlides.length) % heroSlides.length)
            }
            aria-label="Campaña anterior"
          >
            <ChevronLeft />
          </button>
          <button
            className="hero-arrow next"
            onClick={() => setHero((hero + 1) % heroSlides.length)}
            aria-label="Campaña siguiente"
          >
            <ChevronRight />
          </button>
          <div className="hero-dots">
            {heroSlides.map((_, i) => (
              <button
                className={i === hero ? "active" : ""}
                onClick={() => setHero(i)}
                aria-label={`Ver campaña ${i + 1}`}
                key={i}
              />
            ))}
            <button
              className="hero-pause"
              onClick={() => setHeroManuallyPaused((value) => !value)}
              aria-pressed={heroManuallyPaused}
              aria-label={
                heroManuallyPaused
                  ? "Reanudar rotación del carrusel"
                  : "Pausar rotación del carrusel"
              }
            >
              {heroManuallyPaused ? <Play /> : <Pause />}
            </button>
          </div>
        </section>

        <section id="categorias" className="content-section">
          <div className="section-title">
            <div>
              <p>COMPRA POR CATEGORÍA</p>
              <h2>Encuentra lo que necesitas</h2>
            </div>
            <button
              className="text-action"
              onClick={() => {
                setCategory("Todos");
                goToProducts();
              }}
            >
              Ver catálogo completo <ArrowRight size={17} />
            </button>
          </div>
          <div className="category-grid">
            {categoryCards.map((c) => {
              const count = catalogProducts.filter(
                (p) => p.category === c.name,
              ).length;
              return (
                <button
                  onClick={() => {
                    setCategory(c.name);
                    goToProducts();
                  }}
                  className="category-card"
                  key={c.name}
                  style={{ "--cat": c.color } as React.CSSProperties}
                >
                  <div>
                    <span>{count} producto{count === 1 ? "" : "s"}</span>
                    <h3>{c.name}</h3>
                    <small>
                      Ver categoría <ArrowRight size={15} />
                    </small>
                  </div>
                  <img src={c.image} alt="" loading="lazy" decoding="async" />
                </button>
              );
            })}
          </div>
        </section>

        <section id="asesoria" className="advisor">
          <p className="advisor-eyebrow">ASESOR DE PRODUCTO</p>
          <h2>¿No sabes cuál elegir?</h2>
          <span className="advisor-sub">
            Responde 2 preguntas y te decimos exactamente qué producto necesitas.
          </span>

          <div className="adv-q">
            <div className="adv-label">
              <b>1</b> ¿Qué vas a pintar o proteger?
            </div>
            <div className="adv-chips">
              {["Muros", "Pisos", "Techo o azotea", "Madera"].map((o) => (
                <button
                  key={o}
                  className={advSurface === o ? "adv-chip on" : "adv-chip"}
                  onClick={() => setAdvSurface(o)}
                >
                  {o}
                </button>
              ))}
            </div>
            <small className={advSurface ? "adv-hint done" : "adv-hint"}>
              {advSurface ? `Elegiste: ${advSurface}` : "Elige una opción"}
            </small>
          </div>

          <div className="adv-q">
            <div className="adv-label">
              <b>2</b> ¿Dónde está?
            </div>
            <div className="adv-chips">
              {["Interior", "Exterior"].map((o) => (
                <button
                  key={o}
                  className={advLocation === o ? "adv-chip on" : "adv-chip"}
                  onClick={() => setAdvLocation(o)}
                >
                  {o}
                </button>
              ))}
            </div>
            <small className={advLocation ? "adv-hint done" : "adv-hint"}>
              {advLocation ? `Elegiste: ${advLocation}` : "Elige una opción"}
            </small>
          </div>

          <button
            className="adv-submit"
            onClick={recommend}
            disabled={!advSurface || !advLocation}
          >
            Ver mi recomendación <ArrowRight />
          </button>
          {(!advSurface || !advLocation) && (
            <p className="adv-note">
              Responde las 2 preguntas para ver tu recomendación.
            </p>
          )}
        </section>

        {advResult && (
          <div
            className="adv-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) setAdvResult(null);
            }}
          >
            <div className="adv-modal" role="dialog" aria-modal="true">
              <span className="adv-grab" />
              <div className="adv-mtop">
                <span className="adv-mtag">Tu recomendación</span>
                <button
                  className="adv-x"
                  onClick={() => setAdvResult(null)}
                  aria-label="Cerrar"
                >
                  <X />
                </button>
              </div>
              <div className="adv-prod">
                <img
                  src={advResult.p.image}
                  alt={advResult.p.name}
                  decoding="async"
                />
                <div>
                  <div className="adv-cat">{advResult.p.category}</div>
                  <h3>{advResult.p.name}</h3>
                  <div className="adv-rate">
                    <Star fill="currentColor" /> {advResult.p.rating} · verificado
                  </div>
                </div>
              </div>
              <div className="adv-reason">{advResult.reason}</div>
              <div className="adv-macts">
                <button
                  className="white-button"
                  onClick={() => setAdvResult(null)}
                >
                  Seguir viendo
                </button>
                <a className="red-button" href={`/producto/${advResult.p.slug}`}>
                  Ver producto <ArrowRight />
                </a>
              </div>
            </div>
          </div>
        )}

        <section id="productos" className="content-section products-section">
          <div className="section-title">
            <div>
              <p>PRODUCTOS DESTACADOS</p>
              <h2>Los favoritos de nuestros clientes</h2>
            </div>
            <div className="carousel-actions">
              <button
                onClick={() => scrollProducts(-1)}
                aria-label="Productos anteriores"
              >
                <ChevronLeft />
              </button>
              <button
                onClick={() => scrollProducts(1)}
                aria-label="Productos siguientes"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
          {(query || category !== "Todos") && (
            <div className="query-note">
              {query ? `Resultados para “${query}”` : category} ·{" "}
              {visible.length} producto{visible.length === 1 ? "" : "s"}{" "}
              <button
                onClick={() => {
                  setQuery("");
                  setCategory("Todos");
                }}
              >
                Limpiar
              </button>
            </div>
          )}
          {visible.length ? (
            <div className="products-grid carousel" ref={carouselRef}>
              {visible.map((p) => (
                <article className="product-card" key={p.slug}>
                  <div className="product-image">
                    <span>{p.tag}</span>
                    <a
                      href={`/producto/${p.slug}`}
                      aria-label={`Ver detalles de ${p.name}`}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        decoding="async"
                      />
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
          ) : (
            <div className="query-note">
              No encontramos productos para esta búsqueda.{" "}
              <button
                onClick={() => {
                  setQuery("");
                  setCategory("Todos");
                }}
              >
                Ver todo
              </button>
            </div>
          )}
        </section>

        <section id="ayuda" className="service-grid">
          <article>
            <b>01</b>
            <h3>¿Cuánta pintura necesito?</h3>
            <p>
              Calcula litros según superficie, rendimiento y número de manos.
            </p>
            <a href="#asesoria">
              Calcular ahora <ArrowRight />
            </a>
          </article>
          <article>
            <b>02</b>
            <h3>Prepara bien tu superficie</h3>
            <p>Aprende a limpiar, sellar y reparar antes de pintar.</p>
            <a href="#asesoria">
              Ver guía <ArrowRight />
            </a>
          </article>
          <article>
            <b>03</b>
            <h3>Habla con un experto</h3>
            <p>Resolvemos dudas de producto, aplicación y compatibilidad.</p>
            <a href="#contacto">
              Solicitar asesoría <ArrowRight />
            </a>
          </article>
        </section>

        <footer id="contacto">
          <div>
            <a className="berel-logo footer-logo" href="#inicio">
              <span>berel</span>
              <small>PINTA CON CONFIANZA</small>
            </a>
            <p>
              Tienda en línea de pinturas, recubrimientos y accesorios Berel
              México.
            </p>
          </div>
          <div>
            <h4>Compra</h4>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/tienda/todos">Tienda</a>
            <a href="#categorias">Categorías</a>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/tienda/promociones">Promociones</a>
          </div>
          <div>
            <h4>Ayuda</h4>
            <a href="#asesoria">Encuentra tu producto</a>
            <a href="#ayuda">Preguntas frecuentes</a>
            <a href="#contacto">Contacto</a>
          </div>
          <div>
            <h4>Información</h4>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/nosotros">Quiénes somos</a>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/privacidad">Aviso de privacidad</a>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/terminos">Términos y condiciones</a>
          </div>
          <small className="copyright">
            © 2026 Berel México · Propuesta conceptual de rediseño
          </small>
        </footer>
      </main>
    </>
  );
}
