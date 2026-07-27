"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { useEffect, useState } from "react";
import { ChevronDown, Menu, ShoppingCart, X } from "lucide-react";
import {
  loadStorefront,
  reportStorefrontError,
  type StorefrontCategory,
} from "@/lib/storefront-client";
import { useCart } from "@/lib/cart-context";

// El CMS puede tener decenas de categorías activas; en la barra principal solo
// caben las primeras por `sort_order`. El resto se alcanza desde "Todos los
// productos" y desde el filtro lateral del catálogo.
const NAV_CATEGORY_LIMIT = 8;

export default function StoreHeader() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<StorefrontCategory[]>([]);
  const { count: cartCount, openCart } = useCart();

  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", open);
    return () => document.body.classList.remove("mobile-menu-open");
  }, [open]);

  // El menú refleja las categorías activas del CMS; no hay lista de respaldo.
  useEffect(() => {
    let active = true;
    loadStorefront().then(
      (data) => {
        if (active) setCategories(data.categories.slice(0, NAV_CATEGORY_LIMIT));
      },
      (error: unknown) => reportStorefrontError(error),
    );
    return () => {
      active = false;
    };
  }, []);

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
        <a
          className="nav-all"
          href="/tienda/todos"
          onClick={() => setOpen(false)}
        >
          <Menu size={18} /> Todos los productos <ChevronDown size={15} />
        </a>
        {categories.map((category) => (
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
        <a href="/#asesoria" onClick={() => setOpen(false)}>
          Encuentra tu producto
        </a>
      </nav>
    </header>
  );
}
