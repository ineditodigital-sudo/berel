"use client";

import {
  cmsProductToStore,
  type CmsProductRow,
  type Product,
} from "@/lib/store-data";
import type { PageBlock } from "@/lib/page-blocks";

export type StorefrontCategory = {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  sort_order?: number;
};

export type StorefrontSlide = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  image_url: string;
  image_url_mobile: string;
  button_label: string;
  button_url: string;
  theme: string;
};

export type StorefrontFaq = {
  id: string;
  question: string;
  answer: string;
};

export type StorefrontBranch = {
  id: string;
  name: string;
  address: string;
};

export type StorefrontSettings = {
  contact?: { whatsapp?: string; phone?: string; email?: string };
  commerce?: {
    minimumOrderCents?: number;
    deliveryPromiseHours?: number;
    deliveryState?: string;
    freeShipping?: boolean;
  };
};

export type Storefront = {
  products: Product[];
  categories: StorefrontCategory[];
  slides: StorefrontSlide[];
  faqs: StorefrontFaq[];
  branches: StorefrontBranch[];
  blocks: Array<PageBlock & { page_slug: string }>;
  settings: StorefrontSettings;
};

type StorefrontPayload = {
  products?: CmsProductRow[];
  categories?: StorefrontCategory[];
  slides?: StorefrontSlide[];
  faqs?: StorefrontFaq[];
  branches?: StorefrontBranch[];
  blocks?: Array<PageBlock & { page_slug: string }>;
  settings?: StorefrontSettings;
};

export const emptyStorefront: Storefront = {
  products: [],
  categories: [],
  slides: [],
  faqs: [],
  branches: [],
  blocks: [],
  settings: {},
};

// Varios componentes de la misma página (home, ficha, encabezado) necesitan el
// mismo payload. La promesa vive en globalThis y no en el módulo porque el
// bundler duplica este módulo entre chunks: con una variable local, cada chunk
// tendría su propia copia y la página pediría el catálogo más de una vez.
const CACHE = "__berelStorefrontRequest";
type StorefrontCache = typeof globalThis & {
  [CACHE]?: Promise<Storefront> | null;
};
const cache = globalThis as StorefrontCache;

export function loadStorefront(): Promise<Storefront> {
  cache[CACHE] ??= fetch("/api/storefront")
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`/api/storefront respondió ${response.status}`);
      }
      const data = (await response.json()) as StorefrontPayload;
      return {
        products: (data.products ?? []).map(cmsProductToStore),
        categories: data.categories ?? [],
        slides: data.slides ?? [],
        faqs: data.faqs ?? [],
        branches: data.branches ?? [],
        blocks: data.blocks ?? [],
        settings: data.settings ?? {},
      };
    })
    .catch((error: unknown) => {
      // Se descarta la promesa fallida para permitir un reintento posterior.
      cache[CACHE] = null;
      throw error;
    });
  return cache[CACHE];
}

export function reportStorefrontError(error: unknown) {
  console.error(
    "No se pudo cargar el catálogo administrado desde /api/storefront. " +
      "La tienda no usa datos de respaldo: revisa el binding D1 y que la migración esté aplicada.",
    error,
  );
}
