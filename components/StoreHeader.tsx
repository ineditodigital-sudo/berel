"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { useEffect, useState } from "react";
import { ChevronDown, Menu, ShoppingCart, X } from "lucide-react";
import { menuPages, slugify } from "@/lib/store-data";
import { useCart } from "@/lib/cart-context";

export default function StoreHeader() {
  const [open, setOpen] = useState(false);
  const { count: cartCount, openCart } = useCart();

  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", open);
    return () => document.body.classList.remove("mobile-menu-open");
  }, [open]);

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
        {menuPages.map((name) => (
          <a
            className={name === "Promociones" ? "sale" : ""}
            href={`/tienda/${slugify(name)}`}
            key={name}
            onClick={() => setOpen(false)}
          >
            {name}
          </a>
        ))}
        <a href="/#asesoria" onClick={() => setOpen(false)}>
          Encuentra tu producto
        </a>
      </nav>
    </header>
  );
}
