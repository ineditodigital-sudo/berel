# Design QA — Berel local

## Alcance

- Referencia de escritorio: `outputs/auditoria-berel/01-inicio-escritorio.png`
- Referencia móvil: `outputs/auditoria-berel/06-inicio-movil.png`
- Implementación de escritorio: `outputs/qa-local/inicio-desktop-final.png`
- Implementación móvil: `outputs/qa-local/inicio-mobile-final.png`
- Estado adicional del carrusel: `outputs/qa-local/hero-slide-2-desktop-final.png`
- Estados interactivos: `outputs/qa-local/menu-mobile-final.png` y `outputs/qa-local/buscador-mobile-final.png`
- Comparaciones completas: `outputs/qa-local/comparacion-desktop-final.png` y `outputs/qa-local/comparacion-mobile-final.png`

## Viewports y estados

- Escritorio: 1440 × 900, inicio, campaña 1.
- Escritorio: 1440 × 900, campaña 2 seleccionada manualmente.
- Móvil: 390 × 844, inicio, campaña 1.
- Móvil: 390 × 844, menú abierto y búsqueda con el término `pisos`.

## Hallazgos y correcciones

- P1 corregido: el encabezado variaba entre inicio, catálogo y producto; ahora usa un componente compartido.
- P1 corregido: la primera campaña recortaba el mensaje en móvil; ahora conserva el producto como fondo y presenta contenido HTML legible con acciones completas.
- P1 corregido: el botón secundario de la segunda campaña perdía contraste; ahora mantiene texto oscuro sobre fondo blanco.
- P2 corregido: la búsqueda móvil no estaba disponible en el primer viewport; ahora aparece debajo de la fila principal y devuelve sugerencias reales.
- P2 corregido: el carrusel no ofrecía control de pausa; ahora tiene pausa/reanudación, se detiene con hover/foco y respeta `prefers-reduced-motion`.
- P2 corregido: faltaban estados consistentes de foco; ahora los controles principales tienen foco visible.
- P3 aceptado: en móvil el panel de contenido cubre parte del arte del hero. La prioridad deliberada es legibilidad y conversión; el producto sigue siendo identificable.

## Historial de comparación

1. La primera comparación detectó recorte de contenido en móvil y disparidad entre encabezados.
2. La segunda iteración unificó navegación, añadió el panel móvil, búsqueda y controles accesibles del carrusel.
3. La revisión enfocada de la campaña 2 detectó el contraste del CTA secundario y se corrigió.
4. La comparación final no presenta hallazgos P0, P1 o P2 abiertos.

## Validación funcional

- Carrusel: selección manual y control de pausa disponibles.
- Menú móvil: abre y cierra correctamente.
- Buscador: `pisos` muestra `Pintura para Pisos Serie 3800`.
- Consola: sin errores de aplicación durante la revisión; solo mensajes informativos de Vite y React en desarrollo.

## Resultado

passed
