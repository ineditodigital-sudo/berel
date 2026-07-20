"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  CircleUserRound,
  Heart,
  Menu,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";
import { menuPages, products, slugify } from "@/lib/store-data";

type StoreHeaderProps = {
  cartCount?: number;
  favoritesCount?: number;
  onCartClick?: () => void;
  onFavoritesClick?: () => void;
};

export default function StoreHeader({
  cartCount = 0,
  favoritesCount = 0,
  onCartClick,
  onFavoritesClick,
}: StoreHeaderProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();
  const results = useMemo(
    () =>
      query.trim().length > 1
        ? products
            .filter((product) => {
              const term = query.toLocaleLowerCase("es-MX");
              return [
                product.name,
                product.category,
                product.description,
                product.uses,
              ].some((value) =>
                value.toLocaleLowerCase("es-MX").includes(term),
              );
            })
            .slice(0, 5)
        : [],
    [query],
  );

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setSearchOpen(false);
    if (results[0]) router.push(`/producto/${results[0].slug}`);
    else router.push(`/tienda/todos?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="store-header">
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
          <span>berel</span>
          <small>PINTA CON CONFIANZA</small>
        </a>
        <form className="searchbox search-live" onSubmit={submit} role="search">
          <Search size={19} aria-hidden="true" />
          <label className="sr-only" htmlFor="global-search">
            Buscar productos
          </label>
          <input
            id="global-search"
            role="combobox"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setSearchOpen(false);
            }}
            aria-autocomplete="list"
            aria-controls="global-search-results"
            aria-expanded={searchOpen && query.trim().length > 1}
            placeholder="¿Qué necesitas pintar?"
          />
          <button type="submit">Buscar</button>
          {searchOpen && query.trim().length > 1 && (
            <div
              className="search-results"
              id="global-search-results"
              role="listbox"
              aria-label="Sugerencias de productos"
            >
              {results.length ? (
                results.map((product) => (
                  <button
                    type="button"
                    role="option"
                    aria-selected="false"
                    key={product.slug}
                    onClick={() => router.push(`/producto/${product.slug}`)}
                  >
                    <img src={product.image} alt="" />
                    <span>
                      <b>{product.name}</b>
                      <small>{product.category}</small>
                    </span>
                  </button>
                ))
              ) : (
                <p className="search-empty">No encontramos coincidencias.</p>
              )}
            </div>
          )}
        </form>
        <div className="head-actions header-actions">
          <a href="#cuenta" aria-label="Ir a mi cuenta">
            <CircleUserRound />
            <span>
              <small>Bienvenido</small>
              Mi cuenta
            </span>
          </a>
          <button
            className="round-action"
            onClick={onFavoritesClick}
            aria-label={`Favoritos: ${favoritesCount}`}
          >
            <Heart fill={favoritesCount ? "currentColor" : "none"} />
          </button>
          {onCartClick ? (
            <button
              className="cart round-action"
              onClick={onCartClick}
              aria-label={`Carrito con ${cartCount} productos`}
            >
              <ShoppingCart />
              <b>{cartCount}</b>
            </button>
          ) : (
            <a
              className="cart round-action"
              href="/tienda/todos"
              aria-label="Ir al catálogo"
            >
              <ShoppingCart />
              <b>{cartCount}</b>
            </a>
          )}
        </div>
      </div>
      <nav
        className={open ? "main-nav open" : "main-nav"}
        aria-label="Navegación principal"
      >
        <a className="nav-all" href="/tienda/todos">
          <Menu size={18} /> Todos los productos <ChevronDown size={15} />
        </a>
        {menuPages.map((name) => (
          <a
            className={name === "Promociones" ? "sale" : ""}
            href={`/tienda/${slugify(name)}`}
            key={name}
          >
            {name}
          </a>
        ))}
        <a href="/#asesoria">Encuentra tu producto</a>
      </nav>
    </header>
  );
}
