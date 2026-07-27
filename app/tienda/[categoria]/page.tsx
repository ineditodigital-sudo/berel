/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import {
  use,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import CatalogSort from "@/components/CatalogSort";
import { money, slugify, type Product } from "@/lib/store-data";
import {
  loadStorefront,
  reportStorefrontError,
  type StorefrontCategory,
} from "@/lib/storefront-client";

function subscribeToNavigation(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

const readLocation = () =>
  `${window.location.pathname}${window.location.search}`;

export default function CategoryPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const routeCategory = decodeURIComponent(use(params).categoria);
  // La URL manda sobre el HTML exportado: el sitio estático sirve este mismo
  // documento para cualquier categoría, incluidas las que se creen en el CMS
  // después de publicar. En el servidor no hay location, así que ahí se usa el
  // parámetro de la ruta.
  const currentLocation = useSyncExternalStore(
    subscribeToNavigation,
    readLocation,
    () => "",
  );
  const [pathname, search] = currentLocation.split("?");
  const categoryFromUrl = pathname?.match(/\/tienda\/([^/]+)/)?.[1];
  const category = categoryFromUrl
    ? decodeURIComponent(categoryFromUrl)
    : routeCategory;
  const urlParams = new URLSearchParams(search ?? "");
  const q = urlParams.get("q") ?? "";
  const [sortOverride, setSortOverride] = useState<string | null>(null);
  const sort = sortOverride ?? urlParams.get("sort") ?? "relevantes";

  const [products, setProducts] = useState<Product[]>([]);
  const [categoryRecords, setCategoryRecords] = useState<StorefrontCategory[]>(
    [],
  );
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  // Catálogo y categorías siempre en vivo desde el CMS: una edición se ve al
  // recargar, sin volver a exportar el sitio.
  useEffect(() => {
    let active = true;
    loadStorefront().then(
      (data) => {
        if (!active) return;
        setProducts(data.products);
        setCategoryRecords(data.categories);
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

  const categories = [
    "todos",
    ...categoryRecords.map((item) => item.slug),
    "promociones",
  ];

  const title =
    category === "todos"
      ? "Todos los productos"
      : category === "promociones"
        ? "Promociones"
        : (categoryRecords.find((item) => item.slug === category)?.name ??
          category.replace(/-/g, " "));

  const list = useMemo(
    () =>
      products
        .filter(
          (product) =>
            (category === "todos" || category === "promociones"
              ? category !== "promociones" || Boolean(product.old)
              : slugify(product.category) === category) &&
            (!q || product.name.toLowerCase().includes(q.toLowerCase())),
        )
        .sort((a, b) => {
          if (sort === "precio-asc") return a.from - b.from;
          if (sort === "precio-desc") return b.from - a.from;
          if (sort === "rating") return b.rating - a.rating;
          return 0;
        }),
    [products, category, q, sort],
  );

  return (
    <main id="main-content">
      <StoreHeader />
      <section className="catalog-hero">
        <p>TIENDA BEREL</p>
        <h1>{title}</h1>
        <span>
          Soluciones profesionales para transformar, proteger y renovar cada
          espacio.
        </span>
      </section>
      <section className="catalog-layout">
        <aside aria-label="Categorías de productos">
          <b>Categorías</b>
          {categories.map((item) => (
            <a
              className={item === category ? "active" : ""}
              href={`/tienda/${item}`}
              key={item}
            >
              {item.replace(/-/g, " ")}
            </a>
          ))}
        </aside>
        <div>
          <div className="catalog-count">
            <span className="catalog-count-label">
              {status === "ready"
                ? `${list.length} producto${list.length === 1 ? "" : "s"}`
                : "Cargando…"}
            </span>
            <CatalogSort value={sort} onChange={setSortOverride} />
          </div>
          <div className="catalog-grid">
            {list.map((product) => (
              <a
                className="product-card"
                href={`/producto/${product.slug}`}
                key={product.slug}
              >
                <div className="product-image">
                  <span>{product.tag}</span>
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="product-copy">
                  <small>{product.category}</small>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="product-bottom">
                    <b>{money(product.from)}</b>
                    <span>Ver producto →</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
          {!list.length && status === "loading" && (
            <div className="empty-results">
              <h2>Cargando catálogo…</h2>
            </div>
          )}
          {!list.length && status === "error" && (
            <div className="empty-results">
              <h2>No pudimos cargar el catálogo</h2>
              <p>
                Estamos teniendo un problema para consultar los productos.
                Vuelve a intentarlo en unos minutos.
              </p>
              <a href="/tienda/todos">Reintentar</a>
            </div>
          )}
          {!list.length && status === "ready" && (
            <div className="empty-results">
              <h2>No encontramos productos</h2>
              <p>Prueba con otro término o explora el catálogo completo.</p>
              <a href="/tienda/todos">Ver todos los productos</a>
            </div>
          )}
        </div>
      </section>
      <StoreFooter />
    </main>
  );
}
