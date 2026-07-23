/* eslint-disable @next/next/no-html-link-for-pages */
import StoreHeader from "@/components/StoreHeader";

export const metadata = {
  title: "Términos y condiciones | Berel México",
};

export default function TermsPage() {
  return (
    <main id="main-content">
      <StoreHeader />
      <section className="info-page">
        <div className="info-head">
          <p>LEGAL</p>
          <h1>Términos y condiciones</h1>
          <span>
            Condiciones de uso de la tienda en línea, compras, envíos y
            devoluciones.
          </span>
        </div>

        <div className="info-block">
          <h2>Compras</h2>
          <p>
            Los precios están expresados en pesos mexicanos (MXN) e incluyen
            impuestos salvo que se indique lo contrario. La disponibilidad puede
            variar según existencias.
          </p>
        </div>
        <div className="info-block">
          <h2>Envíos</h2>
          <p>
            Envío gratis en compras desde $999 con cobertura en CDMX y Estado de
            México. Los tiempos de entrega se confirman al finalizar la compra.
          </p>
        </div>
        <div className="info-block">
          <h2>Devoluciones</h2>
          <p>
            Aceptamos cambios y devoluciones de producto sin abrir dentro del
            plazo vigente, conservando su empaque original y comprobante de
            compra.
          </p>
        </div>
        <p className="info-note">
          Documento de referencia para la propuesta de rediseño; deberá
          revisarse legalmente antes de su publicación.
        </p>

        <a className="info-back" href="/">
          ← Volver a la tienda
        </a>
      </section>
    </main>
  );
}
