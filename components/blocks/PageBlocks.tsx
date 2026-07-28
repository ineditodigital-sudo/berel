"use client";

import type { ComponentType } from "react";
import type { PageBlock } from "@/lib/page-blocks";
import { useStorefront } from "@/lib/storefront-context";
import TrustbarBlock from "@/components/blocks/TrustbarBlock";
import FaqBlock from "@/components/blocks/FaqBlock";
import TextoBlock from "@/components/blocks/TextoBlock";
import BannerBlock from "@/components/blocks/BannerBlock";

/**
 * Dibuja las secciones de una página a partir de `content_blocks`.
 *
 * El orden, la visibilidad y el contenido salen de la base, así que reordenar
 * la página es cambiar `sort_order`, no tocar código. Los tipos que todavía
 * viven dentro de app/page.tsx (hero, categorías, asesor, productos) se
 * dibujan ahí mismo y aquí se declaran como "propios de la página" para no
 * duplicarlos mientras dura la migración.
 */

const COMPONENTES: Record<string, ComponentType<{ block: PageBlock }>> = {
  trustbar: TrustbarBlock,
  faq: FaqBlock,
  texto: TextoBlock,
  banner: BannerBlock,
};

/** Tipos que la página sigue dibujando por su cuenta. */
export const TIPOS_EN_PAGINA = new Set([
  "hero",
  "categorias",
  "asesor",
  "productos",
]);

export function usePageBlocks(pageSlug: string): PageBlock[] {
  const { data } = useStorefront();
  return data.blocks
    .filter((bloque) => bloque.page_slug === pageSlug)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export default function PageBlocks({
  blocks,
}: {
  blocks: PageBlock[];
}) {
  return (
    <>
      {blocks.map((bloque) => {
        const Componente = COMPONENTES[bloque.type];
        if (!Componente) return null;
        return <Componente key={bloque.id} block={bloque} />;
      })}
    </>
  );
}
