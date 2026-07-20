"use client";
import {useMemo,useState} from "react";
import {useRouter} from "next/navigation";
import {ChevronDown,Menu,Search,ShoppingCart,X} from "lucide-react";
import {menuPages,products,slugify} from "@/lib/store-data";

export default function StoreHeader(){
 const [query,setQuery]=useState(""); const [open,setOpen]=useState(false); const router=useRouter();
 const results=useMemo(()=>query.trim().length>1?products.filter(p=>p.name.toLowerCase().includes(query.toLowerCase())).slice(0,5):[],[query]);
 const submit=(e:React.FormEvent)=>{e.preventDefault(); if(results[0]) router.push(`/producto/${results[0].slug}`); else router.push(`/tienda/todos?q=${encodeURIComponent(query)}`)};
 return <header className="store-header"><div className="header-main"><button className="mobile-button" onClick={()=>setOpen(!open)} aria-label={open?"Cerrar menú":"Abrir menú"}>{open?<X/>:<Menu/>}</button><a className="berel-logo" href="/"><span>berel</span><small>PINTA CON CONFIANZA</small></a><form className="searchbox search-live" onSubmit={submit}><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} aria-label="Buscar productos" placeholder="¿Qué producto estás buscando?"/><button>Buscar</button>{results.length>0&&<div className="search-results">{results.map(p=><button type="button" key={p.slug} onClick={()=>router.push(`/producto/${p.slug}`)}><img src={p.image} alt=""/><span><b>{p.name}</b><small>{p.category}</small></span></button>)}</div>}</form><a className="header-cart-link" href="/tienda/todos" aria-label="Ir al catálogo"><ShoppingCart/></a></div><nav className={open?"main-nav open":"main-nav"}><a className="nav-all" href="/tienda/todos"><Menu size={18}/> Todos los productos <ChevronDown size={15}/></a>{menuPages.map(name=><a className={name==="Promociones"?"sale":""} href={`/tienda/${slugify(name)}`} key={name}>{name}</a>)}<a href="/#asesoria">Encuentra tu producto</a></nav></header>
}
