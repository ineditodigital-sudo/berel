"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

/**
 * Modo edición: permite cambiar el contenido desde la propia tienda.
 *
 * Quien administra no debería tener que traducir entre "la fila del CMS" y
 * "lo que se ve". Si ya inició sesión en /admin, al volver a la tienda puede
 * mover, ocultar y editar cada sección donde está.
 *
 * La sesión se comprueba contra el servidor, nunca en el navegador: sin
 * cookie válida la sonda responde `authenticated: false` y no aparece nada.
 */

type EstadoEdicion = {
  esAdmin: boolean;
  activo: boolean;
  guardando: boolean;
  aviso: string;
  alternar: () => void;
  guardarBloque: (id: string, cambios: Record<string, unknown>) => Promise<boolean>;
};

const Contexto = createContext<EstadoEdicion>({
  esAdmin: false,
  activo: false,
  guardando: false,
  aviso: "",
  alternar: () => {},
  guardarBloque: async () => false,
});

const CLAVE = "berel-modo-edicion";

export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const [esAdmin, setEsAdmin] = useState(false);
  const [csrf, setCsrf] = useState("");
  const [activo, setActivo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    let vivo = true;
    fetch("/api/admin/session", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : { authenticated: false }))
      .then((datos: { authenticated?: boolean; csrf?: string }) => {
        if (!vivo || !datos.authenticated) return;
        setEsAdmin(true);
        setCsrf(datos.csrf ?? "");
        setActivo(window.sessionStorage.getItem(CLAVE) === "1");
      })
      .catch(() => undefined);
    return () => {
      vivo = false;
    };
  }, []);

  const alternar = useCallback(() => {
    setActivo((valor) => {
      const siguiente = !valor;
      window.sessionStorage.setItem(CLAVE, siguiente ? "1" : "0");
      return siguiente;
    });
  }, []);

  const guardarBloque = useCallback(
    async (id: string, cambios: Record<string, unknown>) => {
      setGuardando(true);
      setAviso("");
      try {
        const respuesta = await fetch(`/api/admin/content/${id}`, {
          method: "PATCH",
          credentials: "same-origin",
          headers: {
            "content-type": "application/json",
            ...(csrf ? { "X-CSRF-Token": csrf } : {}),
          },
          body: JSON.stringify(cambios),
        });
        if (!respuesta.ok) {
          const datos = (await respuesta.json().catch(() => ({}))) as { error?: string };
          setAviso(datos.error ?? "No se pudo guardar el cambio.");
          return false;
        }
        setAviso("Cambio guardado.");
        return true;
      } catch {
        setAviso("No se pudo guardar el cambio.");
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [csrf],
  );

  return (
    <Contexto.Provider
      value={{ esAdmin, activo, guardando, aviso, alternar, guardarBloque }}
    >
      {children}
    </Contexto.Provider>
  );
}

export function useEditMode() {
  return useContext(Contexto);
}
