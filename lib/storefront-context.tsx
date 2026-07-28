"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  emptyStorefront,
  loadStorefront,
  reportStorefrontError,
  type Storefront,
} from "@/lib/storefront-client";

export type StorefrontStatus = "loading" | "ready" | "error";

type StorefrontState = { data: Storefront; status: StorefrontStatus };

const StorefrontContext = createContext<StorefrontState>({
  data: emptyStorefront,
  status: "loading",
});

/**
 * Carga el escaparate una sola vez y lo comparte con todos los bloques de la
 * página. Antes cada componente repetía el mismo efecto; con los bloques serían
 * muchos más.
 */
export function StorefrontProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<StorefrontState>({
    data: emptyStorefront,
    status: "loading",
  });

  useEffect(() => {
    let active = true;
    loadStorefront().then(
      (data) => {
        if (active) setState({ data, status: "ready" });
      },
      (error: unknown) => {
        reportStorefrontError(error);
        if (active) setState({ data: emptyStorefront, status: "error" });
      },
    );
    return () => {
      active = false;
    };
  }, []);

  return (
    <StorefrontContext.Provider value={state}>
      {children}
    </StorefrontContext.Provider>
  );
}

export function useStorefront(): StorefrontState {
  return useContext(StorefrontContext);
}
