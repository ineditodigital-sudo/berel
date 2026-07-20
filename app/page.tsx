"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Headphones,
  Heart,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Star,
  Trash2,
  Truck,
  X,
} from "lucide-react";

const categories = [
  { name: "Pinturas", count: 20, image: "/berel/playa.png", color: "#e83338" },
  {
    name: "Impermeabilizantes",
    count: 14,
    image: "/berel/imper.webp",
    color: "#178cc4",
  },
  { name: "Esmaltes", count: 12, image: "/berel/summa.png", color: "#f3b51b" },
  {
    name: "Selladores",
    count: 7,
    image: "/berel/salitre.png",
    color: "#323f9c",
  },
];

const products = [
  {
    slug: "pintura-pisos-3800",
    name: "Pintura para Pisos Serie 3800",
    category: "Base agua",
    image: "/berel/pisos.png",
    from: 1385,
    to: 6319,
    tag: "Alta resistencia",
    rating: 4.9,
  },
  {
    slug: "sellador-anti-salitre-530",
    name: "Sellador Anti-Salitre No. 530",
    category: "Selladores",
    image: "/berel/salitre.png",
    from: 195,
    to: 3165,
    tag: "Contra humedad",
    rating: 4.8,
  },
  {
    slug: "berelex-playa",
    name: "Berelex Pintura para Playa",
    category: "Exteriores",
    image: "/berel/playa.png",
    from: 835,
    to: 3559,
    tag: "Clima extremo",
    rating: 4.9,
  },
  {
    slug: "pintura-pizarron-4600",
    name: "Pintura para Pizarrón Serie 4600",
    category: "Decorativos",
    image: "/berel/pizarron.png",
    from: 283.5,
    old: 375,
    tag: "Oferta",
    rating: 4.7,
  },
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

const money = (n: number) =>
  n.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  });

export default function Home() {
  const [cart, setCart] = useState(0);
  const [query, setQuery] = useState("");
  const [mobile, setMobile] = useState(false);
  const [size, setSize] = useState("19 L");
  const [qty, setQty] = useState(1);
  const [category, setCategory] = useState("Todos");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [finder, setFinder] = useState([
    "Muros y plafones",
    "Interior",
    "Fácil de limpiar",
  ]);
  const [hero, setHero] = useState(0);
  const [splash, setSplash] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const visible = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) &&
          (category === "Todos" ||
            p.category.toLowerCase().includes(category.toLowerCase())),
      ),
    [query, category],
  );
  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }, []);
  const addToCart = useCallback(
    (amount = 1) => {
      setCart((value) => value + amount);
      notify("Producto agregado al carrito");
    },
    [notify],
  );
  const toggleFavorite = useCallback((name: string) => {
    setFavorites((items) =>
      items.includes(name)
        ? items.filter((item) => item !== name)
        : [...items, name],
    );
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
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (entry) =>
            entry.isIntersecting && entry.target.classList.add("is-visible"),
        ),
      { threshold: 0.12 },
    );
    document.querySelectorAll("section, footer").forEach((section) => {
      section.classList.add("reveal");
      observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const splashTimer = window.setTimeout(() => setSplash(false), 1500);
    const slider = window.setInterval(
      () => setHero((v) => (v + 1) % heroSlides.length),
      5500,
    );
    return () => {
      clearTimeout(splashTimer);
      clearInterval(slider);
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
      <main>
        <div className="utility">
          <span>Envíos en CDMX y Edo. Méx.</span>
          <div>
            <a href="#ayuda">Preguntas frecuentes</a>
            <a href="#contacto">Contacto</a>
            <a href="#cuenta">Facturación</a>
          </div>
        </div>
        <header>
          <div className="header-main">
            <button
              className="mobile-button"
              onClick={() => setMobile(!mobile)}
              aria-label={mobile ? "Cerrar menú" : "Abrir menú"}
            >
              {mobile ? <X /> : <Menu />}
            </button>
            <a
              className="berel-logo"
              href="#inicio"
              aria-label="Berel México inicio"
            >
              <span>berel</span>
              <small>PINTA CON CONFIANZA</small>
            </a>
            <form
              className="searchbox search-live"
              onSubmit={(e) => {
                e.preventDefault();
                visible[0]
                  ? (window.location.href = `/producto/${visible[0].slug}`)
                  : (window.location.href = `/tienda/todos?q=${encodeURIComponent(query)}`);
              }}
            >
              <Search size={19} />
              <input
                aria-label="Buscar productos"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="¿Qué producto estás buscando?"
              />
              <button>Buscar</button>
              {query.length > 1 && (
                <div className="search-results">
                  {visible.slice(0, 4).map((p) => (
                    <button
                      type="button"
                      key={p.slug}
                      onClick={() =>
                        (window.location.href = `/producto/${p.slug}`)
                      }
                    >
                      <img src={p.image} alt="" />
                      <span>
                        <b>{p.name}</b>
                        <small>{p.category}</small>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </form>
            <div className="head-actions">
              <a href="#cuenta">
                <CircleUserRound />
                <span>
                  <small>Bienvenido</small>Mi cuenta
                </span>
              </a>
              <button
                className="round-action"
                onClick={() =>
                  notify(
                    `${favorites.length} producto${favorites.length === 1 ? "" : "s"} en favoritos`,
                  )
                }
                aria-label="Favoritos"
              >
                <Heart fill={favorites.length ? "currentColor" : "none"} />
              </button>
              <button
                className="cart round-action"
                onClick={() => setCartOpen(true)}
                aria-label={`Carrito con ${cart} productos`}
              >
                <ShoppingCart />
                <b>{cart}</b>
              </button>
            </div>
          </div>
          <nav
            className={mobile ? "main-nav open" : "main-nav"}
            aria-label="Navegación principal"
          >
            <a className="nav-all" href="/tienda/todos">
              <Menu size={18} /> Todos los productos <ChevronDown size={15} />
            </a>
            <a href="/tienda/pinturas">Pinturas</a>
            <a href="/tienda/impermeabilizantes">Impermeabilizantes</a>
            <a href="/tienda/esmaltes">Esmaltes</a>
            <a href="/tienda/maderas">Maderas</a>
            <a href="/tienda/accesorios">Accesorios</a>
            <a className="sale" href="/tienda/promociones">
              Promociones
            </a>
            <a href="#asesoria">Encuentra tu producto</a>
          </nav>
        </header>

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
        >
          <div
            className="hero-track"
            style={{ transform: `translateX(-${hero * 100}%)` }}
          >
            {heroSlides.map((slide, index) => (
              <article className="hero-slide" key={slide.title}>
                <div className="hero-panel">
                  <p>{slide.eyebrow}</p>
                  <h1>{slide.title}</h1>
                  <span>{slide.copy}</span>
                  <div>
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
                document
                  .querySelector("#productos")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Ver catálogo completo <ArrowRight size={17} />
            </button>
          </div>
          <div className="category-grid">
            {categories.map((c) => (
              <button
                onClick={() => {
                  setCategory(
                    c.name === "Pinturas"
                      ? "Base agua"
                      : c.name === "Selladores"
                        ? "Selladores"
                        : "Todos",
                  );
                  document
                    .querySelector("#productos")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="category-card"
                key={c.name}
                style={{ "--cat": c.color } as React.CSSProperties}
              >
                <div>
                  <span>{c.count} productos</span>
                  <h3>{c.name}</h3>
                  <small>
                    Ver categoría <ArrowRight size={15} />
                  </small>
                </div>
                <img src={c.image} alt="" loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        </section>

        <section id="asesoria" className="finder">
          <div>
            <p>ELIGE CON CONFIANZA</p>
            <h2>No todas las pinturas sirven para lo mismo.</h2>
            <span>
              Cuéntanos qué vas a pintar y te llevamos al producto correcto.
            </span>
          </div>
          <div className="finder-steps">
            <button
              onClick={() =>
                setFinder((v) => [
                  v[0] === "Muros y plafones" ? "Pisos" : "Muros y plafones",
                  v[1],
                  v[2],
                ])
              }
            >
              <b>1</b>
              <span>
                <small>Superficie</small>
                {finder[0]}
              </span>
              <ChevronDown />
            </button>
            <button
              onClick={() =>
                setFinder((v) => [
                  v[0],
                  v[1] === "Interior" ? "Exterior" : "Interior",
                  v[2],
                ])
              }
            >
              <b>2</b>
              <span>
                <small>Ubicación</small>
                {finder[1]}
              </span>
              <ChevronDown />
            </button>
            <button
              onClick={() =>
                setFinder((v) => [
                  v[0],
                  v[1],
                  v[2] === "Fácil de limpiar"
                    ? "Alta resistencia"
                    : "Fácil de limpiar",
                ])
              }
            >
              <b>3</b>
              <span>
                <small>Necesidad</small>
                {finder[2]}
              </span>
              <ChevronDown />
            </button>
            <button
              className="finder-submit"
              onClick={() => {
                setCategory(finder[0] === "Pisos" ? "Base agua" : "Todos");
                document
                  .querySelector("#productos")
                  ?.scrollIntoView({ behavior: "smooth" });
                notify("Recomendación actualizada");
              }}
            >
              Ver recomendación <ArrowRight />
            </button>
          </div>
        </section>

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
              {visible.length} productos{" "}
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
          <div className="products-grid carousel" ref={carouselRef}>
            {visible.map((p) => (
              <article className="product-card" key={p.name}>
                <div className="product-image">
                  <span>{p.tag}</span>
                  <button
                    className={
                      favorites.includes(p.name)
                        ? "favorite active"
                        : "favorite"
                    }
                    onClick={() => toggleFavorite(p.name)}
                    aria-label={`Guardar ${p.name}`}
                  >
                    <Heart
                      fill={
                        favorites.includes(p.name) ? "currentColor" : "none"
                      }
                    />
                  </button>
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
                      onClick={() => addToCart()}
                      aria-label={`Agregar ${p.name}`}
                    >
                      <Plus />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="featured-product">
          <div className="featured-image">
            <img
              src="/berel/pisos.png"
              alt="Pintura para Pisos Serie 3800"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="featured-copy">
            <p>PRODUCTO DESTACADO</p>
            <h2>
              Pintura para Pisos
              <br />
              Serie 3800
            </h2>
            <p className="desc">
              Acabado satinado para proteger y decorar pisos de concreto y
              mortero con tráfico peatonal y vehicular ligero.
            </p>
            <div className="chips">
              <span>
                <Check /> Interior y exterior
              </span>
              <span>
                <Check /> Antideslizante
              </span>
              <span>
                <Check /> Sin plomo
              </span>
              <span>
                <Check /> 4–5 m²/L a dos manos
              </span>
            </div>
            <div className="buy-row">
              <label>
                Medida
                <select value={size} onChange={(e) => setSize(e.target.value)}>
                  <option>4 L</option>
                  <option>19 L</option>
                </select>
              </label>
              <label>
                Cantidad
                <div className="qty">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}>
                    <Minus />
                  </button>
                  <b>{qty}</b>
                  <button onClick={() => setQty(qty + 1)}>
                    <Plus />
                  </button>
                </div>
              </label>
            </div>
            <div className="featured-price">
              <div>
                <small>Precio desde</small>
                <b>{money(size === "19 L" ? 6319 : 1385)}</b>
              </div>
              <button className="red-button" onClick={() => addToCart(qty)}>
                Añadir al carrito <ShoppingCart />
              </button>
            </div>
            <div className="delivery">
              <PackageCheck />
              <span>
                <b>Entrega gratuita</b>
                <small>Disponible en CDMX y Estado de México</small>
              </span>
            </div>
          </div>
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
            <a href="#productos">Tienda</a>
            <a href="#categorias">Categorías</a>
            <a href="#productos">Promociones</a>
          </div>
          <div>
            <h4>Ayuda</h4>
            <a href="#asesoria">Encuentra tu producto</a>
            <a href="#ayuda">Preguntas frecuentes</a>
            <a href="#contacto">Contacto</a>
          </div>
          <div>
            <h4>Información</h4>
            <a href="#inicio">Quiénes somos</a>
            <a href="#inicio">Aviso de privacidad</a>
            <a href="#inicio">Términos y condiciones</a>
          </div>
          <small className="copyright">
            © 2026 Berel México · Propuesta conceptual de rediseño
          </small>
        </footer>
        <div
          className={cartOpen ? "drawer-backdrop open" : "drawer-backdrop"}
          onClick={() => setCartOpen(false)}
        />
        <aside
          className={cartOpen ? "cart-drawer open" : "cart-drawer"}
          aria-hidden={!cartOpen}
        >
          <div className="drawer-head">
            <div>
              <small>Tu compra</small>
              <h3>Carrito ({cart})</h3>
            </div>
            <button
              onClick={() => setCartOpen(false)}
              aria-label="Cerrar carrito"
            >
              <X />
            </button>
          </div>
          {cart ? (
            <div className="drawer-item">
              <img src="/berel/pisos.png" alt="Producto Berel" />
              <div>
                <b>Productos Berel</b>
                <small>
                  {cart} artículo{cart === 1 ? "" : "s"}
                </small>
              </div>
              <button onClick={() => setCart(0)} aria-label="Vaciar carrito">
                <Trash2 />
              </button>
            </div>
          ) : (
            <div className="empty-cart">
              <ShoppingCart />
              <h4>Tu carrito está vacío</h4>
              <p>Explora los productos destacados y agrega tus favoritos.</p>
            </div>
          )}
          <div className="drawer-footer">
            <button
              disabled={!cart}
              onClick={() => notify("Checkout listo para conectar")}
            >
              Continuar compra <ArrowRight />
            </button>
          </div>
        </aside>
        {toast && (
          <div className="toast" role="status">
            <Check />
            {toast}
          </div>
        )}
      </main>
    </>
  );
}
