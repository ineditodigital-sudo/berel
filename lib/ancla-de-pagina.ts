"use client";

import { useEffect } from "react";

type VentanaConAncla = Window & { __berelAncla?: string };

function desplazarA(destino: string): boolean {
  const elemento = document.querySelector(destino);
  if (!elemento) return false;
  elemento.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

/**
 * Atiende los enlaces de ancla (#asesoria, #ayuda, #facturacion…) sin que el
 * hash llegue nunca a la URL.
 *
 * El motivo es el restaurador de scroll de vinext: mientras `location.hash`
 * tenga valor, en cada render vuelve a llamar a `scrollIntoView` sobre esa
 * sección. El visitante subía y la página lo devolvía al ancla varias veces por
 * segundo; eso es lo que se sentía como "la página se traba".
 *
 * Quitar el hash desde React no funciona: vinext parchea
 * `history.replaceState`, y su re-sincronización lo repone. Peor aún, si además
 * se escucha `hashchange` para volver a limpiarlo, los dos manejadores se
 * alimentan entre sí y el tirón se duplica.
 *
 * Por eso el trabajo está repartido:
 *  - la carga directa la limpia un script del `<head>` (app/layout.tsx), que
 *    corre antes de que vinext parchee nada y deja el destino en
 *    `window.__berelAncla`;
 *  - los clics internos se atienden aquí, con `preventDefault`, de modo que el
 *    hash no entra en la URL y no hay nada que restaurar.
 *
 * Efecto secundario aceptado: la barra de direcciones ya no muestra `#seccion`
 * al pulsar un enlace interno. A cambio, el scroll obedece.
 *
 * @param listo si el contenido que contiene el ancla ya está dibujado. Las
 * secciones llegan del CMS después de la carga inicial, y antes de eso
 * `querySelector` no encontraría a dónde ir.
 */
export function useAnclaDePagina(listo: boolean) {
  useEffect(() => {
    if (!listo) return;
    const ventana = window as VentanaConAncla;
    const pendiente = ventana.__berelAncla;
    if (pendiente && desplazarA(pendiente)) {
      ventana.__berelAncla = undefined;
    }
  }, [listo]);

  useEffect(() => {
    const alPulsar = (evento: MouseEvent) => {
      // Clic secundario o con modificador: es "abrir en otra pestaña", no toca.
      if (
        evento.defaultPrevented ||
        evento.button !== 0 ||
        evento.metaKey ||
        evento.ctrlKey ||
        evento.shiftKey ||
        evento.altKey
      ) {
        return;
      }
      const origen = evento.target as Element | null;
      const enlace = origen?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!enlace) return;
      const destino = enlace.getAttribute("href") ?? "";
      if (!/^#[\w-]+$/.test(destino)) return;
      // Si la sección no está en esta página se deja pasar el enlace tal cual.
      if (!desplazarA(destino)) return;
      evento.preventDefault();
    };
    document.addEventListener("click", alPulsar);
    return () => document.removeEventListener("click", alPulsar);
  }, []);
}
