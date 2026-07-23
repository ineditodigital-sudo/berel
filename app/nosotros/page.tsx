/* eslint-disable @next/next/no-html-link-for-pages */
import StoreHeader from "@/components/StoreHeader";

export const metadata = {
  title: "Quiénes somos | Berel México",
};

export default function AboutPage() {
  return (
    <main id="main-content">
      <StoreHeader />
      <section className="info-page">
        <div className="info-head">
          <p>QUIÉNES SOMOS</p>
          <h1>Pinta con confianza</h1>
          <span>
            Berel es una marca mexicana de pinturas, recubrimientos e
            impermeabilizantes con presencia nacional y décadas acompañando a
            profesionales y hogares.
          </span>
        </div>

        <div className="info-block">
          <h2>Nuestra misión</h2>
          <p>
            Ofrecer soluciones de recubrimiento de alto desempeño que protejan,
            decoren y renueven cada espacio, respaldadas por asesoría
            especializada y productos originales.
          </p>
        </div>
        <div className="info-block">
          <h2>Por qué elegirnos</h2>
          <p>
            Combinamos calidad probada, cobertura de entrega en CDMX y Estado de
            México, y un equipo listo para ayudarte a elegir el producto
            correcto para tu proyecto.
          </p>
        </div>

        <a className="info-back" href="/">
          ← Volver a la tienda
        </a>
      </section>
    </main>
  );
}
