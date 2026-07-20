# Design QA — Berel mobile first

## Evidencia

- Fuente visual: `outputs/qa-local/inicio-mobile-final.png`
- Implementación principal: `outputs/qa-local/mobile-first-home-390-final.png`
- Comparación de vista completa: `outputs/qa-local/comparacion-mobile-first-final.png`
- Menú abierto: `outputs/qa-local/mobile-first-menu-390-v2.png`
- Búsqueda activa: `outputs/qa-local/mobile-first-search-390.png`
- Catálogo: `outputs/qa-local/mobile-first-catalog-390.png`
- Ficha de producto: `outputs/qa-local/mobile-first-product-390.png`
- Compra en ficha: `outputs/qa-local/mobile-first-product-purchase-390-v2.png`
- Anchos complementarios: `outputs/qa-local/mobile-first-home-375.png` y `outputs/qa-local/mobile-first-home-768-v2.png`

## Viewports y estados

- 390 × 844: inicio, menú abierto, búsqueda con `pisos`, catálogo y producto.
- 375 × 812: inicio.
- 768 × 1024: transición a tableta.
- Sin desbordamiento horizontal: `scrollWidth` coincide con `clientWidth` en 375, 390 y 768.

## Comparación visual

La comparación de vista completa confirma que el contenido prioritario cabe mejor en el primer viewport: la búsqueda, el beneficio principal, el mensaje completo del hero, sus dos acciones y el inicio de categorías permanecen visibles. El arte original, la paleta Berel y la jerarquía editorial se conservan.

Se usaron vistas enfocadas porque los detalles críticos —menú, resultados de búsqueda, grilla de catálogo y controles de compra— no podían juzgarse con precisión en la comparación general.

## Superficies de fidelidad

- Tipografía: Geist se mantiene; cuerpo e inputs móviles usan 16 px o más, encabezados tienen interlineado compacto y no hay truncamientos.
- Espaciado y ritmo: gutter base de 16 px, radios de 18–20 px, separación táctil mínima de 8 px y objetivos de 44 px.
- Colores y tokens: se conservan rojo, negro, blanco, azul y amarillo Berel con contraste legible.
- Imágenes: se reutilizan los artes y productos reales del proyecto; el crop móvil del primer hero prioriza envases y elimina texto fragmentado.
- Copy: se conserva el contenido aprobado y las etiquetas de comercio; el catálogo respeta mayúsculas naturales en español.

## Hallazgos

- No quedan hallazgos P0, P1 o P2 abiertos.
- [P3] La navegación horizontal de tableta muestra parcialmente el siguiente enlace como indicación de desplazamiento. Es deliberado y no bloquea interacción.
- [P3] El panel del primer hero cubre parte del envase principal. Se acepta para priorizar legibilidad y conversión en una pantalla estrecha.

## Historial de comparación

1. [P1] El menú móvil conservaba una altura de escritorio y solo mostraba el primer enlace. Se convirtió en una hoja de navegación de altura completa; la evidencia posterior es `mobile-first-menu-390-v2.png`.
2. [P1] El selector de cantidad heredaba el ancho de otro componente y se superponía al precio. Se acotó la regla al bloque destacado; la evidencia posterior es `mobile-first-product-purchase-390-v2.png`.
3. [P2] A 768 px el encabezado usaba dos columnas y recortaba logo, acciones y navegación. Se añadió una transición específica de tableta; la evidencia posterior es `mobile-first-home-768-v2.png`.
4. [P2] El crop inicial del hero dejaba fragmentos grandes del texto integrado en la imagen. Se desplazó el foco hacia los productos; la evidencia posterior es `mobile-first-home-390-final.png`.

## Interacciones y ejecución

- Menú: abre, bloquea el fondo, muestra todas las rutas y permite cerrarse.
- Buscador: `pisos` muestra `Pintura para Pisos Serie 3800`.
- Carrusel: controles anterior, siguiente, indicadores y pausa permanecen disponibles.
- Consola: sin errores ni advertencias de ejecución en la captura final.
- Compilación: completada correctamente.

## Checklist de implementación

- [x] Header sticky y buscador de 48 px.
- [x] Beneficios desplazables y visibles.
- [x] Hero móvil legible sin recortes de UI.
- [x] Categorías y catálogo en grilla táctil.
- [x] Ficha de producto y controles de compra sin solapamientos.
- [x] Menú, búsqueda, 375 px, 390 px y 768 px comprobados.

final result: passed
