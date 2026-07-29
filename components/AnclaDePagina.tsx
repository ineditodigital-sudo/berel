"use client";

import { useAnclaDePagina } from "@/lib/ancla-de-pagina";

/**
 * No dibuja nada: existe para que una página de servidor pueda activar el
 * manejo de anclas, que necesita ejecutarse en el navegador.
 */
export default function AnclaDePagina({ listo = true }: { listo?: boolean }) {
  useAnclaDePagina(listo);
  return null;
}
