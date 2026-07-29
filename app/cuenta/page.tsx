/* eslint-disable @next/next/no-html-link-for-pages */
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import AnclaDePagina from "@/components/AnclaDePagina";
import { CircleUserRound, FileText, MapPin, Package } from "lucide-react";

export const metadata = {
  title: "Mi cuenta | Berel México",
};

export default function AccountPage() {
  return (
    <main id="main-content">
      {/* /cuenta#facturacion es un ancla real, y sin esto el router insistiría
          en volver a ella cada vez que el visitante se desplaza. */}
      <AnclaDePagina />
      <StoreHeader />
      <section className="info-page">
        <div className="info-head">
          <p>MI CUENTA</p>
          <h1>Hola, bienvenido a Berel</h1>
          <span>
            Administra tus pedidos, direcciones y datos de facturación desde un
            solo lugar.
          </span>
        </div>

        <div className="account-grid">
          <article>
            <CircleUserRound />
            <h3>Datos personales</h3>
            <p>Actualiza tu nombre, correo y teléfono de contacto.</p>
          </article>
          <article>
            <Package />
            <h3>Mis pedidos</h3>
            <p>Consulta el estado y el historial de tus compras.</p>
          </article>
          <article>
            <MapPin />
            <h3>Direcciones</h3>
            <p>Guarda direcciones de envío para comprar más rápido.</p>
          </article>
        </div>

        <div id="facturacion" className="info-block">
          <h2>
            <FileText size={22} /> Facturación
          </h2>
          <p>
            Solicita tu factura (CFDI) por tus compras en línea. Ten a la mano
            tu RFC, razón social, uso de CFDI y el número de pedido. La
            facturación está disponible dentro del mismo mes de tu compra.
          </p>
          <ol>
            <li>Ingresa el folio o número de pedido.</li>
            <li>Captura o selecciona tus datos fiscales.</li>
            <li>Recibe tu factura en PDF y XML por correo.</li>
          </ol>
          <p className="info-note">
            El portal de facturación en línea se habilitará próximamente.
            Mientras tanto, escríbenos desde <a href="/#contacto">Contacto</a> y
            te ayudamos con tu factura.
          </p>
        </div>

        <a className="info-back" href="/">
          ← Volver a la tienda
        </a>
      </section>
      <StoreFooter />
    </main>
  );
}
