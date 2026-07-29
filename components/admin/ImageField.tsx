"use client";

import { useRef, useState, type DragEvent } from "react";

/**
 * Campo de imagen: se arrastra el archivo o se toca para elegirlo.
 *
 * Antes había que subir el archivo en Biblioteca, copiar su URL y pegarla en
 * el producto. Eso obliga a entender qué es una URL, que es justo lo que el
 * panel no debe pedir. La ruta resultante sigue guardándose en el mismo campo,
 * así que el resto del CMS y la tienda no cambian.
 */
export default function ImageField({
  name,
  valorInicial,
  subir,
}: {
  name: string;
  valorInicial: string;
  /** Sube el archivo y devuelve la ruta pública, o null si falla. */
  subir: (file: File) => Promise<string | null>;
}) {
  const [valor, setValor] = useState(valorInicial);
  const [encima, setEncima] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  async function procesar(archivos: FileList | null) {
    const archivo = archivos?.[0];
    if (!archivo) return;
    if (!archivo.type.startsWith("image/")) {
      setError("Ese archivo no es una imagen.");
      return;
    }
    setError("");
    setSubiendo(true);
    const ruta = await subir(archivo);
    setSubiendo(false);
    if (ruta) setValor(ruta);
    else setError("No se pudo subir la imagen. Inténtalo de nuevo.");
  }

  function alSoltar(evento: DragEvent<HTMLDivElement>) {
    evento.preventDefault();
    setEncima(false);
    void procesar(evento.dataTransfer.files);
  }

  return (
    <div className="campo-imagen">
      {/* El valor viaja en el formulario como siempre. */}
      <input type="hidden" name={name} value={valor} readOnly />

      {valor ? (
        <div className="campo-imagen-previo">
          <img src={valor} alt="" />
          <div>
            <button type="button" onClick={() => input.current?.click()}>
              Cambiar imagen
            </button>
            <button
              type="button"
              className="quitar"
              onClick={() => setValor("")}
            >
              Quitar
            </button>
          </div>
        </div>
      ) : (
        <div
          className={encima ? "campo-imagen-zona encima" : "campo-imagen-zona"}
          onDragOver={(e) => {
            e.preventDefault();
            setEncima(true);
          }}
          onDragLeave={() => setEncima(false)}
          onDrop={alSoltar}
          onClick={() => input.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") input.current?.click();
          }}
        >
          {subiendo ? (
            <strong>Subiendo imagen…</strong>
          ) : (
            <>
              <strong>Arrastra la imagen aquí</strong>
              <small>o toca para elegirla de tu dispositivo</small>
              <small className="formatos">JPG, PNG o WebP</small>
            </>
          )}
        </div>
      )}

      {error && <p className="campo-imagen-error">{error}</p>}

      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        hidden
        onChange={(e) => void procesar(e.target.files)}
      />
    </div>
  );
}
