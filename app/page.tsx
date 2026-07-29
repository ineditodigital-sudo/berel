"use client";

import { useEffect, useState } from "react";
import StoreHeader from "@/components/StoreHeader";
import {
  loadStorefront,
  reportStorefrontError,
  type StorefrontSettings,
} from "@/lib/storefront-client";
import PageBlocks, { usePageBlocks } from "@/components/blocks/PageBlocks";
import { useAnclaDePagina } from "@/lib/ancla-de-pagina";

export default function Home() {
  // Todas las secciones vienen de `content_blocks`; la página solo aporta el
  // marco: splash, barra de utilidades, encabezado y pie.
  const bloques = usePageBlocks("inicio");
  const [settings, setSettings] = useState<StorefrontSettings>({});
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    let active = true;
    loadStorefront().then(
      (data) => {
        if (active) setSettings(data.settings);
      },
      (error: unknown) => reportStorefrontError(error),
    );
    return () => {
      active = false;
    };
  }, []);

  const deliveryState = settings.commerce?.deliveryState;

  // El navegador restaura por su cuenta la posición al cargar, y como las
  // secciones llegan después del CMS, esa restauración pisa el salto al ancla.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Las secciones llegan después de consultar el CMS, así que al cargar
  // /#asesoria el ancla todavía no existe. Se espera a que haya bloques.
  useAnclaDePagina(bloques.length > 0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (entry) =>
            entry.isIntersecting && entry.target.classList.add("is-visible"),
        ),
      { threshold: 0.06, rootMargin: "0px 0px 18% 0px" },
    );
    const revealed = document.querySelectorAll("#asesoria, .service-grid, footer");
    revealed.forEach((section) => {
      section.classList.add("reveal");
      observer.observe(section);
    });
    // Red de seguridad: nunca dejar contenido oculto si el observador no dispara.
    const safety = window.setTimeout(
      () => revealed.forEach((s) => s.classList.add("is-visible")),
      1800,
    );
    return () => {
      observer.disconnect();
      clearTimeout(safety);
    };
  }, [bloques.length]);

  useEffect(() => {
    const splashWasSeen = window.sessionStorage.getItem("berel-splash-seen");
    if (splashWasSeen) {
      const immediateTimer = window.setTimeout(() => setSplash(false), 0);
      return () => clearTimeout(immediateTimer);
    }
    window.sessionStorage.setItem("berel-splash-seen", "true");
    const splashTimer = window.setTimeout(() => setSplash(false), 350);
    return () => {
      clearTimeout(splashTimer);
    };
  }, []);


  useEffect(() => {
    const onScroll = () => {
      const solid = window.scrollY > Math.max(0, window.innerHeight * 0.62);
      document.body.classList.toggle("home-scrolled", solid);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.body.classList.remove("home-scrolled");
    };
  }, []);

  return (
    <>
      {splash && (
        <div className="brand-splash">
          <div className="splash-logo">
            berel<small>PINTA CON CONFIANZA</small>
          </div>
          <span />
        </div>
      )}
      <main id="main-content" className="home-shell">
        <div className="utility">
          <span>{deliveryState ? `Envíos en ${deliveryState}` : ""}</span>
          <div>
            <a href="#ayuda">Preguntas frecuentes</a>
            <a href="#contacto">Contacto</a>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/cuenta#facturacion">Facturación</a>
          </div>
        </div>
        <StoreHeader />

        {/* Estas secciones ya se administran como bloques: se dibujan solo si
            están activas en el CMS. */}
        {/* Todas las secciones salen de `content_blocks`: orden,
            visibilidad y contenido se administran desde el CMS. */}
        <PageBlocks blocks={bloques} />

        <footer id="contacto">
          <div>
            <a className="berel-logo footer-logo" href="#inicio">
              <span>berel</span>
              <small>PINTA CON CONFIANZA</small>
            </a>
            <p>
              Tienda en línea de pinturas, recubrimientos y accesorios Berel
              México.
            </p>
          </div>
          <div>
            <h4>Compra</h4>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/tienda/todos">Tienda</a>
            <a href="#categorias">Categorías</a>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/tienda/promociones">Promociones</a>
          </div>
          <div>
            <h4>Ayuda</h4>
            <a href="#ayuda">Preguntas frecuentes</a>
            <a href="#contacto">Contacto</a>
          </div>
          <div>
            <h4>Información</h4>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/nosotros">Quiénes somos</a>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/privacidad">Aviso de privacidad</a>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/terminos">Términos y condiciones</a>
          </div>
          <small className="copyright">© 2026 Berel México</small>
        </footer>
      </main>
    </>
  );
}
