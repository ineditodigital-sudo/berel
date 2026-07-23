"use client";

import { useEffect, useState } from "react";

const OPTIONS = [
  { value: "relevantes", label: "Más relevantes" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "rating", label: "Mejor calificados" },
];

// Ordena las tarjetas ya renderizadas en el DOM (funciona en el sitio estático,
// sin depender del servidor).
function applySort(sort: string) {
  if (typeof document === "undefined") return;
  const grid = document.querySelector<HTMLElement>(".catalog-grid");
  if (!grid) return;
  const cards = Array.from(
    grid.querySelectorAll<HTMLElement>(".product-card"),
  );
  const num = (el: HTMLElement, attr: string) =>
    Number(el.dataset[attr] ?? 0);
  cards.sort((a, b) => {
    if (sort === "precio-asc") return num(a, "price") - num(b, "price");
    if (sort === "precio-desc") return num(b, "price") - num(a, "price");
    if (sort === "rating") return num(b, "rating") - num(a, "rating");
    return num(a, "order") - num(b, "order");
  });
  cards.forEach((card) => grid.appendChild(card));
}

export default function CatalogSort({ value }: { value: string }) {
  const [sort, setSort] = useState(value);

  // Al cargar, aplica el orden indicado en la URL (?sort=...).
  useEffect(() => {
    applySort(sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <select
      aria-label="Ordenar productos"
      value={sort}
      onChange={(event) => {
        const next = event.target.value;
        setSort(next);
        applySort(next);
        // Mantener la URL sincronizada (para compartir/recargar).
        const params = new URLSearchParams(window.location.search);
        if (next === "relevantes") params.delete("sort");
        else params.set("sort", next);
        const query = params.toString();
        window.history.replaceState(
          null,
          "",
          window.location.pathname + (query ? `?${query}` : ""),
        );
      }}
    >
      {OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
