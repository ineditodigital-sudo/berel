/* eslint-disable @next/next/no-html-link-for-pages */
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";

export const metadata = {
  title: "Aviso de privacidad | Berel México",
  description:
    "Cómo Berel México recaba, usa y protege los datos personales de quienes compran en la tienda en línea.",
  alternates: { canonical: "/privacidad" },
};

export default function PrivacyPage() {
  return (
    <main id="main-content">
      <StoreHeader />
      <section className="info-page">
        <div className="info-head">
          <p>LEGAL</p>
          <h1>Aviso de privacidad</h1>
          <span>
            Cómo recabamos, usamos y protegemos tus datos personales en esta
            tienda en línea.
          </span>
        </div>

        <div className="info-block">
          <h2>Responsable</h2>
          <p>
            Berel México es responsable del tratamiento de los datos personales
            que nos proporcionas al navegar, registrarte o realizar una compra.
          </p>
        </div>
        <div className="info-block">
          <h2>Datos que recabamos</h2>
          <p>
            Nombre, correo electrónico, teléfono, dirección de envío y datos
            fiscales cuando solicitas factura. No almacenamos datos completos de
            tarjetas de pago.
          </p>
        </div>
        <div className="info-block">
          <h2>Finalidades</h2>
          <p>
            Procesar pedidos, emitir facturas, dar seguimiento de entrega,
            brindar soporte y, si lo autorizas, enviarte promociones.
          </p>
        </div>
        <div className="info-block">
          <h2>Tus derechos (ARCO)</h2>
          <p>
            Puedes acceder, rectificar, cancelar u oponerte al uso de tus datos
            escribiéndonos desde la sección de <a href="/#contacto">Contacto</a>.
          </p>
        </div>
        <p className="info-note">
          Este es un aviso de privacidad de referencia para la propuesta de
          rediseño; deberá revisarse legalmente antes de su publicación.
        </p>

        <a className="info-back" href="/">
          ← Volver a la tienda
        </a>
      </section>
      <StoreFooter />
    </main>
  );
}
