/* eslint-disable @next/next/no-html-link-for-pages */
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";

export const metadata = {
  title: "Términos y condiciones | Berel México",
  description:
    "Condiciones de compra, envío, retiro en sucursal, pagos y devoluciones de la tienda en línea de Berel México.",
  alternates: { canonical: "/terminos" },
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
            Envío gratis dentro del estado de Aguascalientes al alcanzar la
            compra mínima vigente, que se indica en el carrito y al finalizar la
            compra. También puedes elegir retiro en sucursal.
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
      <StoreFooter />
    </main>
  );
}
