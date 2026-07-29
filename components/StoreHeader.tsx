"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { ChevronDown, Menu, Search, ShoppingCart, X } from "lucide-react";
import {
  loadStorefront,
  reportStorefrontError,
  type StorefrontCategory,
} from "@/lib/storefront-client";
import { useCart } from "@/lib/cart-context";

// En la barra solo caben unas cuantas categorías; el resto vive en el
// desplegable de "Todos los productos", que las lista todas.
const NAV_CATEGORY_LIMIT = 6;

function subscribeToNavigation(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

export default function StoreHeader() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState<StorefrontCategory[]>([]);
  const { count: cartCount, openCart } = useCart();
  const menuRef = useRef<HTMLDivElement>(null);

  // Al llegar a los resultados, el buscador conserva lo que se buscó.
  const search = useSyncExternalStore(
    subscribeToNavigation,
    () => window.location.search,
    () => "",
  );
  const terminoActual = new URLSearchParams(search).get("q") ?? "";

  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", open);
    return () => document.body.classList.remove("mobile-menu-open");
  }, [open]);

  // El menú refleja las categorías activas del CMS; no hay lista de respaldo.
  useEffect(() => {
    let active = true;
    loadStorefront().then(
      (data) => {
        if (active) setCategories(data.categories);
      },
      (error: unknown) => reportStorefrontError(error),
    );
    return () => {
      active = false;
    };
  }, []);

  // El desplegable se cierra al tocar fuera o con Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const alTocarFuera = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const alTeclear = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", alTocarFuera);
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("pointerdown", alTocarFuera);
      document.removeEventListener("keydown", alTeclear);
    };
  }, [menuOpen]);

  function buscar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const termino = new FormData(event.currentTarget).get("q");
    const texto = String(termino ?? "").trim();
    window.location.href = texto
      ? `/tienda/todos?q=${encodeURIComponent(texto)}`
      : "/tienda/todos";
  }

  const destacadas = categories.slice(0, NAV_CATEGORY_LIMIT);

  return (
    <header className="store-header">
      <a className="skip-link" href="#main-content">
        Saltar al contenido
      </a>
      <div className="header-main">
        <button
          className="mobile-button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
        <a className="berel-logo" href="/" aria-label="Berel México, inicio">
          <img src="/berel-icono.png" alt="Berel" />
        </a>
        <form className="searchbox" role="search" onSubmit={buscar}>
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            name="q"
            key={terminoActual}
            defaultValue={terminoActual}
            placeholder="Busca pinturas, impermeabilizantes…"
            aria-label="Buscar productos"
            autoComplete="off"
          />
          <button type="submit">Buscar</button>
        </form>
        <div className="head-actions header-actions">
          <button
            className="cart round-action"
            onClick={openCart}
            aria-label={`Carrito con ${cartCount} productos`}
          >
            <ShoppingCart />
            <b>{cartCount}</b>
          </button>
        </div>
      </div>
      <nav
        className={open ? "main-nav open" : "main-nav"}
        aria-label="Navegación principal"
      >
        {/* El encabezado compacto de móvil no tiene sitio para el buscador,
            así que aquí va el que se usa con el menú abierto. */}
        <form className="searchbox searchbox-movil" role="search" onSubmit={buscar}>
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            name="q"
            key={terminoActual}
            defaultValue={terminoActual}
            placeholder="Buscar productos…"
            aria-label="Buscar productos"
            autoComplete="off"
          />
          <button type="submit">Buscar</button>
        </form>
        <div className="nav-all-wrap" ref={menuRef}>
          <button
            type="button"
            className="nav-all"
            aria-expanded={menuOpen}
            aria-haspopup="true"
            aria-controls="menu-categorias"
            onClick={() => setMenuOpen((value) => !value)}
          >
            <Menu size={18} /> Todos los productos{" "}
            <ChevronDown size={15} className={menuOpen ? "girado" : ""} />
          </button>
          {menuOpen && (
            <div className="nav-dropdown" id="menu-categorias">
              <a className="nav-dropdown-todos" href="/tienda/todos">
                Ver el catálogo completo
              </a>
              <div className="nav-dropdown-grid">
                {categories.map((category) => (
                  <a
                    href={`/tienda/${category.slug}`}
                    key={category.id ?? category.slug}
                    onClick={() => {
                      setMenuOpen(false);
                      setOpen(false);
                    }}
                  >
                    {category.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        {destacadas.map((category) => (
          <a
            href={`/tienda/${category.slug}`}
            key={category.id ?? category.slug}
            onClick={() => setOpen(false)}
          >
            {category.name}
          </a>
        ))}
        <a
          className="sale"
          href="/tienda/promociones"
          onClick={() => setOpen(false)}
        >
          Promociones
        </a>
      </nav>
    </header>
  );
}
