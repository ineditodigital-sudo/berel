"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, ChevronDown, CircleUserRound, Headphones, Heart, Menu, Minus, PackageCheck, Plus, Search, ShieldCheck, ShoppingCart, SlidersHorizontal, Star, Truck, X } from "lucide-react";

const categories = [
  { name: "Pinturas", count: 20, image: "/berel/playa.png", color: "#e83338" },
  { name: "Impermeabilizantes", count: 14, image: "/berel/imper.webp", color: "#178cc4" },
  { name: "Esmaltes", count: 12, image: "/berel/summa.png", color: "#f3b51b" },
  { name: "Selladores", count: 7, image: "/berel/salitre.png", color: "#323f9c" },
];

const products = [
  { name: "Pintura para Pisos Serie 3800", category: "Base agua", image: "/berel/pisos.png", from: 1385, to: 6319, tag: "Alta resistencia", rating: 4.9 },
  { name: "Sellador Anti-Salitre No. 530", category: "Selladores", image: "/berel/salitre.png", from: 195, to: 3165, tag: "Contra humedad", rating: 4.8 },
  { name: "Berelex Pintura para Playa", category: "Exteriores", image: "/berel/playa.png", from: 835, to: 3559, tag: "Clima extremo", rating: 4.9 },
  { name: "Pintura para Pizarrón Serie 4600", category: "Decorativos", image: "/berel/pizarron.png", from: 283.5, old: 375, tag: "Oferta", rating: 4.7 },
];

const money = (n:number) => n.toLocaleString("es-MX", { style:"currency", currency:"MXN", minimumFractionDigits:2 });

export default function Home() {
  const [cart, setCart] = useState(0);
  const [query, setQuery] = useState("");
  const [mobile, setMobile] = useState(false);
  const [size, setSize] = useState("19 L");
  const [qty, setQty] = useState(1);
  const visible = useMemo(() => products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())), [query]);

  return <main>
    <div className="utility"><span>Envíos en CDMX y Edo. Méx.</span><div><a href="#ayuda">Preguntas frecuentes</a><a href="#contacto">Contacto</a><a href="#cuenta">Facturación</a></div></div>
    <header>
      <div className="header-main">
        <button className="mobile-button" onClick={()=>setMobile(!mobile)} aria-label="Abrir menú">{mobile?<X/>:<Menu/>}</button>
        <a className="berel-logo" href="#inicio" aria-label="Berel México inicio"><span>berel</span><small>PINTA CON CONFIANZA</small></a>
        <form className="searchbox" onSubmit={e=>e.preventDefault()}><Search size={19}/><input aria-label="Buscar productos" value={query} onChange={e=>setQuery(e.target.value)} placeholder="¿Qué producto estás buscando?"/><button>Buscar</button></form>
        <div className="head-actions"><a href="#cuenta"><CircleUserRound/><span><small>Bienvenido</small>Mi cuenta</span></a><a href="#favoritos" aria-label="Favoritos"><Heart/></a><a className="cart" href="#productos" aria-label={`Carrito con ${cart} productos`}><ShoppingCart/><b>{cart}</b></a></div>
      </div>
      <nav className={mobile?"main-nav open":"main-nav"} aria-label="Navegación principal"><button><Menu size={18}/> Todos los productos <ChevronDown size={15}/></button><a href="#categorias">Pinturas</a><a href="#categorias">Impermeabilizantes</a><a href="#categorias">Esmaltes</a><a href="#categorias">Maderas</a><a href="#productos">Accesorios</a><a className="sale" href="#productos">Promociones</a><a href="#asesoria">Encuentra tu producto</a></nav>
    </header>

    <section className="trustbar"><span><Truck/> Envío gratis <small>en compras desde $999</small></span><span><Headphones/> Asesoría en línea <small>para elegir mejor</small></span><span><ShieldCheck/> Compra 100% segura <small>pago protegido</small></span></section>

    <section id="inicio" className="hero-berel">
      <img src="/berel/berel-logo.png" alt="Promoción mundialista Berel: 20% de descuento en toda la tienda"/>
      <div className="hero-panel"><p>TIENDA OFICIAL BEREL MÉXICO</p><h1>Todo para pintar,<br/>proteger y renovar.</h1><span>Productos originales, asesoría especializada y entrega directa.</span><div><a className="red-button" href="#productos">Comprar ahora <ArrowRight/></a><a className="white-button" href="#asesoria">Ayúdame a elegir</a></div></div>
    </section>

    <section id="categorias" className="content-section"><div className="section-title"><div><p>COMPRA POR CATEGORÍA</p><h2>Encuentra lo que necesitas</h2></div><a href="#productos">Ver catálogo completo <ArrowRight size={17}/></a></div><div className="category-grid">{categories.map(c=><a href="#productos" className="category-card" key={c.name} style={{"--cat":c.color} as React.CSSProperties}><div><span>{c.count} productos</span><h3>{c.name}</h3><small>Ver categoría <ArrowRight size={15}/></small></div><img src={c.image} alt=""/></a>)}</div></section>

    <section id="asesoria" className="finder"><div><p>ELIGE CON CONFIANZA</p><h2>No todas las pinturas sirven para lo mismo.</h2><span>Cuéntanos qué vas a pintar y te llevamos al producto correcto.</span></div><div className="finder-steps"><button><b>1</b><span><small>Superficie</small>Muros y plafones</span><ChevronDown/></button><button><b>2</b><span><small>Ubicación</small>Interior</span><ChevronDown/></button><button><b>3</b><span><small>Necesidad</small>Fácil de limpiar</span><ChevronDown/></button><a href="#productos">Ver recomendación <ArrowRight/></a></div></section>

    <section id="productos" className="content-section products-section"><div className="section-title"><div><p>PRODUCTOS DESTACADOS</p><h2>Los favoritos de nuestros clientes</h2></div><button className="filter"><SlidersHorizontal/> Filtrar productos</button></div>{query && <div className="query-note">Resultados para “{query}” · {visible.length} productos</div>}<div className="products-grid">{visible.map(p=><article className="product-card" key={p.name}><div className="product-image"><span>{p.tag}</span><button aria-label={`Guardar ${p.name}`}><Heart/></button><img src={p.image} alt={p.name}/></div><div className="product-copy"><small>{p.category}</small><h3>{p.name}</h3><div className="stars"><Star fill="currentColor"/> {p.rating} <span>Producto verificado</span></div><div className="product-bottom"><div>{p.old&&<del>{money(p.old)}</del>}<b>{money(p.from)}</b>{p.to&&<small> – {money(p.to)}</small>}</div><button onClick={()=>setCart(cart+1)} aria-label={`Agregar ${p.name}`}><Plus/></button></div></div></article>)}</div></section>

    <section className="featured-product"><div className="featured-image"><img src="/berel/pisos.png" alt="Pintura para Pisos Serie 3800"/></div><div className="featured-copy"><p>PRODUCTO DESTACADO</p><h2>Pintura para Pisos<br/>Serie 3800</h2><p className="desc">Acabado satinado para proteger y decorar pisos de concreto y mortero con tráfico peatonal y vehicular ligero.</p><div className="chips"><span><Check/> Interior y exterior</span><span><Check/> Antideslizante</span><span><Check/> Sin plomo</span><span><Check/> 4–5 m²/L a dos manos</span></div><div className="buy-row"><label>Medida<select value={size} onChange={e=>setSize(e.target.value)}><option>4 L</option><option>19 L</option></select></label><label>Cantidad<div className="qty"><button onClick={()=>setQty(Math.max(1,qty-1))}><Minus/></button><b>{qty}</b><button onClick={()=>setQty(qty+1)}><Plus/></button></div></label></div><div className="featured-price"><div><small>Precio desde</small><b>{money(size==="19 L"?6319:1385)}</b></div><button className="red-button" onClick={()=>setCart(cart+qty)}>Añadir al carrito <ShoppingCart/></button></div><div className="delivery"><PackageCheck/><span><b>Entrega gratuita</b><small>Disponible en CDMX y Estado de México</small></span></div></div></section>

    <section id="ayuda" className="service-grid"><article><b>01</b><h3>¿Cuánta pintura necesito?</h3><p>Calcula litros según superficie, rendimiento y número de manos.</p><a href="#asesoria">Calcular ahora <ArrowRight/></a></article><article><b>02</b><h3>Prepara bien tu superficie</h3><p>Aprende a limpiar, sellar y reparar antes de pintar.</p><a href="#asesoria">Ver guía <ArrowRight/></a></article><article><b>03</b><h3>Habla con un experto</h3><p>Resolvemos dudas de producto, aplicación y compatibilidad.</p><a href="#contacto">Solicitar asesoría <ArrowRight/></a></article></section>

    <footer id="contacto"><div><a className="berel-logo footer-logo" href="#inicio"><span>berel</span><small>PINTA CON CONFIANZA</small></a><p>Tienda en línea de pinturas, recubrimientos y accesorios Berel México.</p></div><div><h4>Compra</h4><a href="#productos">Tienda</a><a href="#categorias">Categorías</a><a href="#productos">Promociones</a></div><div><h4>Ayuda</h4><a href="#asesoria">Encuentra tu producto</a><a href="#ayuda">Preguntas frecuentes</a><a href="#contacto">Contacto</a></div><div><h4>Información</h4><a href="#inicio">Quiénes somos</a><a href="#inicio">Aviso de privacidad</a><a href="#inicio">Términos y condiciones</a></div><small className="copyright">© 2026 Berel México · Propuesta conceptual de rediseño</small></footer>
  </main>;
}
