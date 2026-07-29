"use client";

import { useEffect } from "react";

function fijarEtiqueta(selector: string, crear: () => HTMLElement, valor: string) {
  let nodo = document.head.querySelector(selector) as HTMLElement | null;
  if (!nodo) {
    nodo = crear();
    document.head.appendChild(nodo);
  }
  if (nodo instanceof HTMLLinkElement) nodo.href = valor;
  else nodo.setAttribute("content", valor);
}

/**
 * Ajusta título, descripción y canonical desde el navegador.
 *
 * Hace falta porque el catálogo y las fichas se sirven como un único documento
 * exportado: `/producto/ficha/index.html` responde a los 142 productos y
 * `/tienda/todos/index.html` a todas las categorías. Sin esto, cada producto
 * heredaría el título y la descripción de la portada, y un buscador vería
 * decenas de URLs con metadatos idénticos y sin canonical propio.
 *
 * No sustituye al renderizado en servidor: un rastreador que no ejecute
 * JavaScript sigue viendo el documento genérico. Es la mejor aproximación
 * mientras el catálogo no se dibuje en el servidor.
 */
export function useSeoDinamico(titulo: string | null, descripcion?: string) {
  useEffect(() => {
    if (!titulo) return;
    document.title = titulo;

    fijarEtiqueta(
      'link[rel="canonical"]',
      () => {
        const l = document.createElement("link");
        l.rel = "canonical";
        return l;
      },
      window.location.origin + window.location.pathname,
    );

    if (descripcion) {
      fijarEtiqueta(
        'meta[name="description"]',
        () => {
          const m = document.createElement("meta");
          m.name = "description";
          return m;
        },
        descripcion,
      );
    }
  }, [titulo, descripcion]);
}
