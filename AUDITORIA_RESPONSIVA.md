# Auditoría de responsividad, adaptabilidad y movimiento

Fecha: 20 de julio de 2026  
Base revisada: commit `bb2334f`, equivalente a la versión 9 publicada en Sites. La inspección visual se ejecutó contra la compilación local exacta porque la URL publicada exige inicio de sesión privado.

## Veredicto

La base responsive ya es consistente: no existe desbordamiento horizontal del documento en 360, 390, 768, 1024 o 1440 px; el menú móvil, el catálogo y la zona de compra de la ficha de producto caben correctamente. Sin embargo, todavía hay cuatro fallos prioritarios de componente:

1. El asesor conserva dos columnas en móvil y recorta sus controles.
2. Las flechas del hero se superponen al texto de las campañas 2 y 3.
3. El primer clic sobre “pausar” no detiene el carrusel.
4. La navegación principal se recorta silenciosamente en 768 px.

## Recorrido auditado

| Paso | Vista / acción | Estado | Resultado |
|---|---|---|---|
| 1 | Inicio a 360 y 390 px | Atención | Header, buscador y hero caben; las flechas invaden el contenido del hero en las campañas con texto. |
| 2 | Inicio a 768 px | Deficiente | La navegación mide 1010 px dentro de 753 px; “Promociones” queda cortado y “Encuentra tu producto” sale del área visible. |
| 3 | Inicio a 1024 px | Atención | Sin overflow global, pero “Todos los productos” y “Encuentra tu producto” saltan a dos líneas. |
| 4 | Inicio a 1440 px | Sano | Jerarquía, espacios y hero se mantienen estables. |
| 5 | Categorías a 360 px | Atención | La retícula de dos columnas cabe, pero algunas imágenes invaden el CTA “Ver categoría”. |
| 6 | Asesor a 360 px | Deficiente | El componente queda en dos columnas: el título se vuelve demasiado estrecho y los pasos se recortan. |
| 7 | Tarjetas destacadas a 360 px | Atención | El carrusel conserva la tarjeta principal y asoma la siguiente, pero necesita una señal más clara de desplazamiento. |
| 8 | Menú móvil abierto | Sano | Ocupa el viewport, mantiene acciones táctiles amplias y no genera overflow. |
| 9 | Catálogo a 360 px | Atención | La retícula de dos columnas cabe; los filtros horizontales funcionan, aunque dependen de que el usuario descubra el gesto. |
| 10 | Ficha de producto / compra | Sano | Selector, cantidad, precio y CTAs caben sin colisiones en el primer bloque de compra. |
| 11 | Autoplay y pausa del hero | Deficiente | El autoplay avanza cada 6 s, pero el primer clic en pausa deja el control en estado “Pausar” y el track continúa avanzando. |

## Evidencia visual

![Comparativa de breakpoints](outputs/auditoria-responsiva/resumen-breakpoints.png)

![Flujo móvil](outputs/auditoria-responsiva/resumen-flujo-movil.png)

![Carrusel automático y primer clic en pausa](outputs/auditoria-responsiva/resumen-carrusel.png)

## Hallazgos priorizados

### P1 — Asesor móvil roto por la cascada de CSS

En 360 px, `.finder-steps` tiene 156 px visibles pero 176 px de contenido; cada botón mide aproximadamente 175 px. El texto de introducción queda en una columna demasiado angosta y los chevrons se cortan. El mismo patrón aparece en tablet.

La causa está en el orden de estilos: `globals.css` cambia `.finder` a una columna para `max-width: 1000px`, pero la regla base posterior de `modern.css` vuelve a declarar `grid-template-columns: .8fr 1.2fr`. El bloque móvil de `modern.css` ajusta márgenes y padding, pero no restablece la cuadrícula a una columna.

### P1 — Flechas del hero sobre el contenido

En las campañas 2 y 3, las flechas permanecen a 43% de la altura del hero. En 390 px coinciden con el título y la descripción; el texto queda atravesado por ambos controles. Es un problema de legibilidad y de área táctil, no un overflow del documento.

### P1 — El control de pausa falla en el primer clic

La prueba encontró un único botón con el nombre accesible “Pausar rotación del carrusel”. Al hacer clic por primera vez, el foco entra al hero y `onFocusCapture` establece la pausa; enseguida el `onClick` invierte ese mismo estado y vuelve a activar el autoplay. Después de 6.5 s, el track cambió de `0` a `-351 px` y la etiqueta siguió siendo “Pausar rotación del carrusel”.

### P1 — Navegación tablet recortada sin indicación

A 768 px, `.main-nav` tiene 753 px visibles y 1010 px de contenido. El contenedor permite desbordamiento horizontal, pero no presenta scrollbar ni una pista visual de que se puede desplazar. Esto oculta rutas principales.

### P2 — Tarjetas de categoría con interferencia interna

En móvil, cada tarjeta tiene unos 154 px visibles y 163 px internos. La imagen usa desplazamiento negativo a la derecha y el contenedor oculta el excedente. El recorte es intencional, pero en “Pinturas” e “Impermeabilizantes” la lata invade el texto y la flecha del CTA.

### P2 — Carruseles horizontales con affordance desigual

La franja de confianza mide 345 px visibles frente a 960 px desplazables en 360 px. El carrusel de productos muestra parcialmente la siguiente tarjeta, lo cual comunica mejor el gesto; la franja de confianza no ofrece el mismo indicio. Los filtros del catálogo también dependen del gesto horizontal, aunque allí sí se ve parte del siguiente chip.

### P2 — Navegación compacta a 1024 px

No hay recorte global, pero dos enlaces saltan a dos líneas dentro de una barra de altura contenida. El resultado es visualmente apretado y reduce la consistencia del header entre 1024 y 1440 px.

### P2 — Densidad de movimiento

La implementación combina splash, transición del hero de 0.7 s, autoplay cada 6 s, reveals de sección de 0.7 s y microinteracciones de tarjetas. Las animaciones no crean overflow, pero el reveal aplicado a casi todas las secciones puede producir una sensación de carga tardía al navegar por anclas. La base de accesibilidad de movimiento es positiva: CSS reduce animaciones y transiciones con `prefers-reduced-motion`, y el autoplay también consulta esa preferencia en JavaScript.

## Lo que ya funciona bien

- No hay overflow horizontal del documento en ninguno de los cinco breakpoints probados.
- El header móvil mantiene buscador y acciones visibles con objetivos táctiles de 44 px.
- El menú móvil usa todo el alto disponible y bloquea el scroll del contenido de fondo.
- El catálogo y la ficha de producto conservan jerarquía y CTAs utilizables a 360 px.
- El carrusel del hero usa `aria-hidden` e `inert` en slides no activas y ofrece etiquetas descriptivas en sus controles.
- Existe soporte explícito para reducción de movimiento.

## Orden recomendado de corrección

1. Corregir la cuadrícula del asesor en `max-width: 1000px` y `max-width: 700px`.
2. Reubicar las flechas del hero móvil fuera del bloque de texto o integrarlas en la zona inferior de controles.
3. Separar pausa manual de pausa temporal por foco/hover para que el primer clic siempre detenga el autoplay.
4. Convertir la navegación de 701–1100 px a menú compacto o distribución adaptable sin scroll oculto.
5. Ajustar el arte de categorías y añadir pistas de desplazamiento a las franjas horizontales.
6. Reservar reveals para bloques de apoyo y mostrar de inmediato contenido crítico y destinos de ancla.

## Límites de esta auditoría

La revisión valida layout, estados visibles e interacción del carrusel en el navegador. No sustituye una auditoría completa con lector de pantalla, navegación exhaustiva por teclado, medición formal de contraste o perfil de rendimiento en dispositivos físicos de gama baja.
