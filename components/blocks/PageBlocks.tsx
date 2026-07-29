"use client";

import type { ComponentType } from "react";
import type { PageBlock } from "@/lib/page-blocks";
import { useStorefront } from "@/lib/storefront-context";
import BlockFrame from "@/components/blocks/BlockFrame";
import TrustbarBlock from "@/components/blocks/TrustbarBlock";
import FaqBlock from "@/components/blocks/FaqBlock";
import TextoBlock from "@/components/blocks/TextoBlock";
import BannerBlock from "@/components/blocks/BannerBlock";
import HeroBlock from "@/components/blocks/HeroBlock";
import CategoriasBlock from "@/components/blocks/CategoriasBlock";
import AsesorBlock from "@/components/blocks/AsesorBlock";
import ProductosBlock from "@/components/blocks/ProductosBlock";

/**
 * Dibuja las secciones de una página a partir de `content_blocks`.
 *
 * El orden, la visibilidad y el contenido salen de la base: reordenar la
 * página es cambiar `sort_order`, no tocar código. Cada bloque se basta a sí
 * mismo, así que agregar un tipo nuevo es sumar una entrada aquí y su
 * componente en esta carpeta.
 */

const COMPONENTES: Record<string, ComponentType<{ block: PageBlock }>> = {
  hero: HeroBlock,
  trustbar: TrustbarBlock,
  categorias: CategoriasBlock,
  asesor: AsesorBlock,
  productos: ProductosBlock,
  faq: FaqBlock,
  texto: TextoBlock,
  banner: BannerBlock,
};

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
  const dibujables = blocks.filter((bloque) => COMPONENTES[bloque.type]);
  return (
    <>
      {dibujables.map((bloque, indice) => {
        const Componente = COMPONENTES[bloque.type];
        return (
          <BlockFrame
            key={bloque.id}
            block={bloque}
            anterior={dibujables[indice - 1]}
            siguiente={dibujables[indice + 1]}
          >
            <Componente block={bloque} />
          </BlockFrame>
        );
      })}
    </>
  );
}
