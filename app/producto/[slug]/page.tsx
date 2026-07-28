/* eslint-disable @next/next/no-html-link-for-pages */
"use client";
import {
  use,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { notFound } from "next/navigation";
import {
  Check,
  Heart,
  Minus,
  MessageCircle,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import { money, slugify, type Product } from "@/lib/store-data";
import { loadStorefront, reportStorefrontError } from "@/lib/storefront-client";
import { useCart } from "@/lib/cart-context";

function subscribeToNavigation(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const routeSlug = use(params).slug;
  // El catálogo tiene más productos que rutas exportadas, así que el mismo
  // documento sirve para cualquier ficha: el slug se lee de la URL real y no
  // del valor que quedó congelado al exportar.
  const pathname = useSyncExternalStore(
    subscribeToNavigation,
    () => window.location.pathname,
    () => "",
  );
  const slugFromUrl = pathname.match(/\/producto\/([^/]+)/)?.[1];
  const slug = slugFromUrl ? decodeURIComponent(slugFromUrl) : routeSlug;
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const p = catalogProducts.find((item) => item.slug === slug);
  const { add, openCart, notify } = useCart();
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("4 L");
  const [whatsapp, setWhatsapp] = useState("");
  const [minimumOrder, setMinimumOrder] = useState<number | null>(null);

  // La ficha se arma únicamente con lo que publica el CMS: no se mezclan
  // productos locales, así que un producto borrado deja de existir en la tienda.
  useEffect(() => {
    let active = true;
    loadStorefront().then(
      (data) => {
        if (!active) return;
        setCatalogProducts(data.products);
        setWhatsapp(data.settings.contact?.whatsapp?.replace(/\D/g, "") ?? "");
        setMinimumOrder(data.settings.commerce?.minimumOrderCents ?? null);
        setStatus("ready");
      },
      (error: unknown) => {
        reportStorefrontError(error);
        if (active) setStatus("error");
      },
    );
    return () => {
      active = false;
    };
  }, []);

  // Solo hay selector de presentación cuando el producto tiene un segundo
  // precio real. Con un único precio, ofrecer dos opciones idénticas engaña.
  const presentations = useMemo(
    () =>
      p?.to && p.to !== p.from
        ? [
            { label: "4 L", price: p.from },
            { label: "19 L", price: p.to },
          ]
        : [],
    [p],
  );
  if (!p) {
    if (status === "loading") {
      return (
        <main id="main-content">
          <StoreHeader />
          <section className="catalog-hero">
            <p>TIENDA BEREL</p>
            <h1>Cargando producto…</h1>
          </section>
          <StoreFooter />
        </main>
      );
    }
    if (status === "error") {
      return (
        <main id="main-content">
          <StoreHeader />
          <section className="catalog-hero">
            <p>TIENDA BEREL</p>
            <h1>No pudimos cargar este producto</h1>
            <span>
              Estamos teniendo un problema para consultar el catálogo. Vuelve a
              intentarlo en unos minutos.
            </span>
          </section>
          <StoreFooter />
        </main>
      );
    }
    return notFound();
  }

  const price =
    presentations.find((option) => option.label === size)?.price ?? p.from;

  return (
    <main id="main-content">
      <StoreHeader />
      <div className="breadcrumbs">
        <a href="/">Inicio</a> /{" "}
        <a href={`/tienda/${slugify(p.category)}`}>{p.category}</a> / {p.name}
      </div>
      <section className="product-detail">
        <div className="product-gallery">
          <span>{p.tag}</span>
          <img src={p.image} alt={p.name} />
          <div className="gallery-thumbs">
            <button className="active" aria-label="Vista frontal">
              <img src={p.image} alt="Vista frontal" />
            </button>
            <button aria-label="Vista de presentación">
              <img src={p.image} alt="Vista de presentación" />
            </button>
            <button
              className="tech-thumb"
              onClick={() => {
                if (p.technicalSheetUrl) window.open(p.technicalSheetUrl, "_blank");
                else notify("Ficha técnica disponible próximamente");
              }}
            >
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
          {presentations.length > 0 && (
            <label>
              Presentación
              <select value={size} onChange={(e) => setSize(e.target.value)}>
                {presentations.map((option) => (
                  <option key={option.label}>{option.label}</option>
                ))}
              </select>
            </label>
          )}
          <div className="detail-price">
            <div>
              <small>{presentations.length > 0 ? `Precio ${size}` : "Precio"}</small>
              <b>{money(price)}</b>
            </div>
            <div className="qty">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                aria-label="Disminuir cantidad"
              >
                <Minus />
              </button>
              <b>{qty}</b>
              <button
                onClick={() => setQty(qty + 1)}
                aria-label="Aumentar cantidad"
              >
                <Plus />
              </button>
            </div>
          </div>
          <button
            className="detail-add"
            onClick={() => {
              add(
                {
                  slug: p.slug,
                  name: p.name,
                  image: p.image,
                  price,
                  presentation: presentations.length > 0 ? size : "",
                },
                qty,
              );
              openCart();
            }}
          >
            <ShoppingCart />
            Añadir al carrito
          </button>
          {whatsapp && (
            <a
              className="detail-whatsapp"
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                p.whatsappMessage || `Hola, me gustaría más información sobre ${p.name}.`,
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle /> Solicitar información por WhatsApp
            </a>
          )}
          <div className="detail-trust">
            <span>
              <Truck />
              {minimumOrder
                ? `Envío gratis · compra mínima ${money(minimumOrder / 100)}`
                : "Envío gratis"}
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
          {catalogProducts
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
      <StoreFooter />
    </main>
  );
}
