"use client";

const OPTIONS = [
  { value: "relevantes", label: "Más relevantes" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "rating", label: "Mejor calificados" },
];

// El catálogo se ordena en React; aquí solo se reporta el valor y se mantiene
// la URL sincronizada para poder compartir o recargar el mismo orden.
export default function CatalogSort({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <select
      aria-label="Ordenar productos"
      value={value}
      onChange={(event) => {
        const next = event.target.value;
        onChange(next);
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
