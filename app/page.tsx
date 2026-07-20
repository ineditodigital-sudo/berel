"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, ChevronDown, Droplets, Menu, Minus, PaintBucket, Plus, Search, ShieldCheck, ShoppingBag, Sparkles, Star, Truck } from "lucide-react";

const projects = [
  { name: "Interiores", note: "Salas, recámaras y pasillos", color: "#ef476f" },
  { name: "Exteriores", note: "Fachadas resistentes al clima", color: "#ff9f1c" },
  { name: "Impermeabilizar", note: "Protección contra lluvia y humedad", color: "#2ec4b6" },
  { name: "Madera y metal", note: "Esmaltes y acabados durables", color: "#4361ee" },
];

const products = [
  { name: "Muro Total Mate", type: "Interior · Bajo olor", price: 1249, coverage: "8–10 m²/L", color: "#e63946", badge: "Más vendido" },
  { name: "Exterior Máxima", type: "Exterior · Lavable", price: 1689, coverage: "7–9 m²/L", color: "#ffb703", badge: "10 años" },
  { name: "Escudo Imper", type: "Azotea · Fibratado", price: 2149, coverage: "1.2 m²/L", color: "#00b4d8", badge: "Temporada" },
];

export default function Home() {
  const [selected, setSelected] = useState("Interiores");
  const [area, setArea] = useState(24);
  const [cart, setCart] = useState(0);
  const liters = useMemo(() => Math.max(4, Math.ceil((area * 2) / 9)), [area]);

  return (
    <main>
      <div className="promo">Envío gratis desde $899 <span>·</span> Compra segura <span>·</span> Asesoría experta</div>
      <header className="header">
        <a className="brand" href="#inicio" aria-label="Colora inicio"><span>COLORA</span><small>PINTA MEJOR</small></a>
        <nav aria-label="Navegación principal">
          <a href="#proyectos">Soluciones</a><a href="#productos">Productos</a><a href="#inspiracion">Inspiración</a><a href="#ayuda">Ayuda</a>
        </nav>
        <div className="actions"><button className="search" aria-label="Buscar"><Search size={20}/><span>Buscar</span></button><button className="bag" aria-label={`Carrito con ${cart} productos`}><ShoppingBag size={21}/><b>{cart}</b></button><button className="menu" aria-label="Abrir menú"><Menu/></button></div>
      </header>

      <section id="inicio" className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><Sparkles size={16}/> Encuentra tu pintura sin complicarte</p>
          <h1>Tu espacio merece<br/>un color <em>extraordinario.</em></h1>
          <p className="lead">Te ayudamos a elegir el producto, acabado y cantidad ideal para que tu proyecto quede bien desde la primera mano.</p>
          <div className="hero-actions"><a className="primary" href="#proyectos">Encuentra tu pintura <ArrowRight size={19}/></a><a className="secondary" href="#calculadora">Calcular cuánto necesito</a></div>
          <div className="proof"><span><Check/> Asesoría incluida</span><span><Check/> Entrega nacional</span><span><Check/> Pago protegido</span></div>
        </div>
        <div className="hero-art" aria-label="Composición de colores para interiores">
          <div className="arch"><div className="sun"/><div className="vase"/><div className="plant">✦</div></div>
          <div className="paint-card"><span className="swatch"/><div><b>Terracota Viva</b><small>Color 04-14</small></div><button aria-label="Guardar color">＋</button></div>
          <div className="rating"><Star fill="currentColor"/> 4.9 <small>+2,400 proyectos</small></div>
        </div>
      </section>

      <section id="proyectos" className="section projects">
        <div className="section-head"><div><p className="eyebrow">EMPIEZA POR TU PROYECTO</p><h2>¿Qué quieres transformar?</h2></div><p>No necesitas saber de pinturas. Elige tu objetivo y te mostramos solo lo que funciona.</p></div>
        <div className="project-grid">{projects.map((p,i)=><button key={p.name} className={selected===p.name?"project active":"project"} onClick={()=>setSelected(p.name)} style={{"--tone":p.color} as React.CSSProperties}><span className="project-number">0{i+1}</span><span className="project-icon">{i===2?<Droplets/>:<PaintBucket/>}</span><strong>{p.name}</strong><small>{p.note}</small><ArrowRight className="arrow"/></button>)}</div>
        <div className="recommend"><div><span>Recomendación para</span><h3>{selected}</h3><p>Acabado mate lavable, excelente cobertura y aplicación sencilla.</p></div><a href="#productos">Ver productos recomendados <ArrowRight size={18}/></a></div>
      </section>

      <section id="calculadora" className="calculator">
        <div><p className="eyebrow">CALCULADORA RÁPIDA</p><h2>Compra lo justo.<br/>Pinta sin pausas.</h2><p>Calculamos una estimación para dos manos de pintura.</p></div>
        <div className="calc-card"><label>Superficie aproximada</label><div className="counter"><button onClick={()=>setArea(Math.max(4,area-4))} aria-label="Reducir metros"><Minus/></button><strong>{area} <small>m²</small></strong><button onClick={()=>setArea(area+4)} aria-label="Aumentar metros"><Plus/></button></div><div className="result"><span>Necesitarás aproximadamente</span><b>{liters} litros</b><small>Incluye 10% de margen</small></div><button className="primary full" onClick={()=>setCart(cart+1)}>Agregar recomendación <ShoppingBag size={18}/></button></div>
      </section>

      <section id="productos" className="section products"><div className="section-head"><div><p className="eyebrow">SELECCIÓN EXPERTA</p><h2>Favoritos que sí cumplen</h2></div><a href="#productos">Ver todos <ArrowRight size={18}/></a></div><div className="product-grid">{products.map((p)=><article className="product" key={p.name}><div className="product-visual" style={{"--paint":p.color} as React.CSSProperties}><span className="badge">{p.badge}</span><div className="can"><span>COLORA</span><b>{p.name.split(" ")[0]}</b><small>19 L</small></div></div><div className="product-info"><small>{p.type}</small><h3>{p.name}</h3><div className="spec"><span>Rendimiento</span><b>{p.coverage}</b></div><div className="price"><div><small>Desde</small><strong>${p.price.toLocaleString("es-MX")}</strong></div><button onClick={()=>setCart(cart+1)} aria-label={`Agregar ${p.name}`}><Plus/></button></div></div></article>)}</div></section>

      <section id="inspiracion" className="inspiration"><div className="color-stack"><i/><i/><i/><i/></div><div><p className="eyebrow">COLOR CON CONFIANZA</p><h2>No elijas a ciegas.</h2><p>Explora combinaciones curadas para hogares mexicanos y guarda tus favoritas antes de decidir.</p><a className="primary" href="#inicio">Explorar paletas <ArrowRight size={18}/></a></div></section>

      <section id="ayuda" className="benefits"><div><Truck/><b>Envío gratis</b><span>En compras desde $899</span></div><div><ShieldCheck/><b>Compra protegida</b><span>Pagos y devoluciones simples</span></div><div><Sparkles/><b>Te asesoramos</b><span>Antes, durante y después</span></div></section>
      <footer><a className="brand light" href="#inicio"><span>COLORA</span><small>PINTA MEJOR</small></a><p>Soluciones claras para transformar espacios con color.</p><div><a href="#productos">Productos</a><a href="#ayuda">Soporte</a><a href="#inicio">Privacidad</a></div><small>Concepto de demostración · México 2026</small></footer>
    </main>
  );
}
