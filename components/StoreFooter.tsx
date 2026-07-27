/* eslint-disable @next/next/no-html-link-for-pages */
import "./store-footer.css";

export default function StoreFooter() {
  return (
    <footer id="contacto" className="store-footer">
      <div>
        <a className="berel-logo footer-logo" href="/" aria-label="Berel México, inicio">
          <img src="/berel-icono.png" alt="Berel" />
          <small>PINTA CON CONFIANZA</small>
        </a>
        <p>
          Tienda en línea de pinturas, recubrimientos y accesorios Berel
          México.
        </p>
      </div>
      <div>
        <h4>Compra</h4>
        <a href="/tienda/todos">Tienda</a>
        <a href="/tienda/todos">Categorías</a>
        <a href="/tienda/promociones">Promociones</a>
      </div>
      <div>
        <h4>Ayuda</h4>
        <a href="/#asesoria">Encuentra tu producto</a>
        <a href="/#ayuda">Preguntas frecuentes</a>
        <a href="/#contacto">Contacto</a>
      </div>
      <div>
        <h4>Información</h4>
        <a href="/nosotros">Quiénes somos</a>
        <a href="/privacidad">Aviso de privacidad</a>
        <a href="/terminos">Términos y condiciones</a>
      </div>
      <small className="copyright">© 2026 Berel México</small>
    </footer>
  );
}
