/* eslint-disable @next/next/no-html-link-for-pages */
import StoreHeader from "@/components/StoreHeader";
import { money, products, slugify } from "@/lib/store-data";

const categories = [
  "todos",
  "pinturas",
  "impermeabilizantes",
  "esmaltes",
  "maderas",
  "accesorios",
  "promociones",
];

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ categoria: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { categoria } = await params;
  const { q = "" } = await searchParams;
  const category = decodeURIComponent(categoria);
  const title =
    category === "todos"
      ? "Todos los productos"
      : category === "promociones"
        ? "Promociones"
        : category.replace(/-/g, " ");
  const list = products.filter(
    (product) =>
      (category === "todos" || category === "promociones"
        ? category !== "promociones" || Boolean(product.old)
        : slugify(product.category) === category) &&
      (!q || product.name.toLowerCase().includes(q.toLowerCase())),
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
            <span>{list.length} productos</span>
            <select aria-label="Ordenar productos">
              <option>Más relevantes</option>
              <option>Precio: menor a mayor</option>
              <option>Mejor calificados</option>
            </select>
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
          {!list.length && (
            <div className="empty-results">
              <h2>No encontramos productos</h2>
              <p>Prueba con otro término o explora el catálogo completo.</p>
              <a href="/tienda/todos">Ver todos los productos</a>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
