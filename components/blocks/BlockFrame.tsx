"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, X } from "lucide-react";
import type { PageBlock } from "@/lib/page-blocks";
import { getBlockDefinition } from "@/lib/page-blocks";
import { useEditMode } from "@/lib/edit-mode";

/**
 * Envuelve cada sección cuando el modo edición está activo y añade sus
 * controles: mover, ocultar y editar los textos, sobre la propia página.
 */
export default function BlockFrame({
  block,
  anterior,
  siguiente,
  children,
}: {
  block: PageBlock;
  /** Bloques vecinos, para intercambiar posiciones al mover. */
  anterior?: PageBlock;
  siguiente?: PageBlock;
  children: React.ReactNode;
}) {
  const { activo, guardando, guardarBloque } = useEditMode();
  const [editando, setEditando] = useState(false);
  const [titulo, setTitulo] = useState(block.title);
  const [cuerpo, setCuerpo] = useState(block.body);

  if (!activo) return <>{children}</>;

  const definicion = getBlockDefinition(block.type);
  const etiqueta = definicion?.label ?? block.type;

  // Mover es intercambiar la posición con el vecino, no saltar al extremo.
  async function mover(vecino: PageBlock | undefined) {
    if (!vecino) return;
    const ok = await guardarBloque(block.id, { sort_order: vecino.sort_order });
    if (!ok) return;
    if (await guardarBloque(vecino.id, { sort_order: block.sort_order })) {
      window.location.reload();
    }
  }

  async function ocultar() {
    if (await guardarBloque(block.id, { is_active: false })) {
      window.location.reload();
    }
  }

  async function guardarTextos() {
    if (await guardarBloque(block.id, { title: titulo, body: cuerpo })) {
      window.location.reload();
    }
  }

  return (
    <div className="bloque-editable">
      <div className="bloque-barra">
        <span className="bloque-etiqueta">{etiqueta}</span>
        <div className="bloque-acciones">
          <button
            type="button"
            onClick={() => void mover(anterior)}
            disabled={!anterior || guardando}
            aria-label={`Subir ${etiqueta}`}
            title="Subir"
          >
            <ArrowUp size={16} />
          </button>
          <button
            type="button"
            onClick={() => void mover(siguiente)}
            disabled={!siguiente || guardando}
            aria-label={`Bajar ${etiqueta}`}
            title="Bajar"
          >
            <ArrowDown size={16} />
          </button>
          {definicion?.usesHeading && (
            <button
              type="button"
              onClick={() => setEditando((v) => !v)}
              aria-label={`Editar textos de ${etiqueta}`}
              title="Editar textos"
            >
              {editando ? <X size={16} /> : <Pencil size={16} />}
            </button>
          )}
          <button
            type="button"
            onClick={() => void ocultar()}
            disabled={guardando}
            aria-label={`Ocultar ${etiqueta}`}
            title="Ocultar esta sección"
          >
            <EyeOff size={16} />
          </button>
        </div>
      </div>

      {editando && (
        <div className="bloque-editor">
          <label>
            <span>Antetítulo</span>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </label>
          <label>
            <span>Título</span>
            <input value={cuerpo} onChange={(e) => setCuerpo(e.target.value)} />
          </label>
          <div>
            <button
              type="button"
              className="bloque-guardar"
              onClick={() => void guardarTextos()}
              disabled={guardando}
            >
              {guardando ? "Guardando…" : "Guardar cambios"}
            </button>
            <button type="button" onClick={() => setEditando(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}

/** Barra flotante para entrar y salir del modo edición. */
export function EditModeBar() {
  const { esAdmin, activo, aviso, alternar } = useEditMode();
  if (!esAdmin) return null;

  return (
    <div className={activo ? "barra-edicion activa" : "barra-edicion"}>
      <span>
        {activo ? (
          <>
            <Pencil size={15} /> Modo edición
          </>
        ) : (
          <>
            <Eye size={15} /> Estás viendo la tienda como administrador
          </>
        )}
      </span>
      {aviso && <small>{aviso}</small>}
      <button type="button" onClick={alternar}>
        {activo ? "Salir" : "Editar contenido"}
      </button>
    </div>
  );
}
