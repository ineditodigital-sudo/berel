"use client";

import {
  Boxes,
  Building2,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileText,
  Image as ImageIcon,
  LayoutGrid,
  Menu,
  MoreHorizontal,
  Package,
  PanelTop,
  Pencil,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Store,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { cmsResources, type CmsField } from "@/lib/cms-resources";
import ImageField from "@/components/admin/ImageField";

type Row = Record<string, string | number | boolean | null>;
type Lookup = { id: string; name?: string; title?: string };

declare global {
  interface Window {
    BEREL_PHP_CSRF?: string;
  }
}

function cmsFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (typeof window !== "undefined" && window.BEREL_PHP_CSRF) {
    headers.set("X-CSRF-Token", window.BEREL_PHP_CSRF);
  }
  return fetch(input, { ...init, headers });
}

const navigation = [
  ["products", Package],
  ["categories", Boxes],
  ["orders", ShoppingBag],
  ["pages", FileText],
  ["content", PanelTop],
  ["slides", ImageIcon],
  ["media", Upload],
  ["faqs", CircleHelp],
  ["branches", Building2],
  ["settings", Settings],
] as const;

const moduleCopy: Record<string, { eyebrow: string; description: string; empty: string }> = {
  products: { eyebrow: "CATÁLOGO", description: "Organiza productos, precios, existencias e imágenes.", empty: "Crea tu primer producto para empezar a vender." },
  categories: { eyebrow: "CATÁLOGO", description: "Agrupa los productos para que sea fácil encontrarlos.", empty: "Todavía no hay categorías." },
  orders: { eyebrow: "VENTAS", description: "Revisa pagos, entregas y datos de tus clientes.", empty: "Los nuevos pedidos aparecerán aquí." },
  pages: { eyebrow: "SITIO WEB", description: "Administra las páginas visibles de la tienda.", empty: "No hay páginas disponibles." },
  content: { eyebrow: "SITIO WEB", description: "Edita títulos, textos, botones y secciones.", empty: "Agrega un bloque para editar contenido." },
  slides: { eyebrow: "SITIO WEB", description: "Crea y ordena las campañas del carrusel principal.", empty: "Agrega una campaña al carrusel." },
  media: { eyebrow: "ARCHIVOS", description: "Imágenes y fichas técnicas en un solo lugar.", empty: "Sube imágenes o fichas PDF." },
  faqs: { eyebrow: "ATENCIÓN", description: "Resuelve las preguntas más comunes de tus clientes.", empty: "Agrega una pregunta frecuente." },
  branches: { eyebrow: "OPERACIÓN", description: "Direcciones, horarios, mapas y retiro en tienda.", empty: "Registra tu primera sucursal." },
  settings: { eyebrow: "CONFIGURACIÓN", description: "Datos de contacto, entregas, pagos y avisos.", empty: "No hay ajustes disponibles." },
};

function moneyFromCents(value: Row[string]) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(value ?? 0) / 100);
}

function displayInput(field: CmsField, value: Row[string]) {
  if (field.type === "boolean") return Boolean(value);
  if (field.type === "money") return value == null || value === "" ? "" : String(Number(value) / 100);
  if (field.key === "benefits_json" || field.key === "gallery_json") {
    try {
      return (JSON.parse(String(value || "[]")) as string[]).join("\n");
    } catch {
      return "";
    }
  }
  return value == null ? "" : String(value);
}

function valueForSave(field: CmsField, form: FormData) {
  if (field.type === "boolean") return form.get(field.key) === "on";
  const value = String(form.get(field.key) ?? "");
  if (field.key === "benefits_json" || field.key === "gallery_json") {
    return JSON.stringify(value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean));
  }
  return value;
}

function titleFor(row: Row) {
  return String(row.name ?? row.title ?? row.question ?? row.order_number ?? row.customer_name ?? row.key ?? "Sin título");
}

function subtitleFor(row: Row) {
  return String(row.sku ?? row.slug ?? row.customer_email ?? row.address ?? row.block_key ?? row.mime_type ?? "");
}

function SettingsEditor({
  items,
  onSave,
  busy,
}: {
  items: Row[];
  onSave: (key: string, value: Record<string, unknown>) => Promise<void>;
  busy: boolean;
}) {
  const initial = Object.fromEntries(
    items.map((item) => {
      try {
        return [String(item.key), JSON.parse(String(item.value_json || "{}"))];
      } catch {
        return [String(item.key), {}];
      }
    }),
  ) as Record<string, Record<string, unknown>>;
  const [draft, setDraft] = useState(initial);

  const change = (group: string, key: string, value: unknown) =>
    setDraft((current) => ({
      ...current,
      [group]: { ...(current[group] ?? {}), [key]: value },
    }));

  return (
    <div className="settings-grid">
      <section className="settings-card">
        <div className="settings-card-head"><span><Store /></span><div><h2>Contacto</h2><p>Información que verán tus clientes.</p></div></div>
        <label>Teléfono<input value={String(draft.contact?.phone ?? "")} onChange={(event) => change("contact", "phone", event.target.value)} /></label>
        <label>WhatsApp<input value={String(draft.contact?.whatsapp ?? "")} onChange={(event) => change("contact", "whatsapp", event.target.value)} placeholder="Ej. 524491234567" /></label>
        <label>Correo público<input type="email" value={String(draft.contact?.email ?? "")} onChange={(event) => change("contact", "email", event.target.value)} /></label>
        <button disabled={busy} onClick={() => onSave("contact", draft.contact ?? {})}>Guardar contacto</button>
      </section>

      <section className="settings-card">
        <div className="settings-card-head"><span><Package /></span><div><h2>Envíos y retiro</h2><p>Reglas para completar una compra.</p></div></div>
        <div className="settings-pair">
          <label>Compra mínima (MXN)<input type="number" value={Number(draft.commerce?.minimumOrderCents ?? 80000) / 100} onChange={(event) => change("commerce", "minimumOrderCents", Math.round(Number(event.target.value) * 100))} /></label>
          <label>Entrega máxima (horas)<input type="number" value={Number(draft.commerce?.deliveryPromiseHours ?? 24)} onChange={(event) => change("commerce", "deliveryPromiseHours", Number(event.target.value))} /></label>
        </div>
        <label>Zona de entrega<input value={String(draft.commerce?.deliveryState ?? "Aguascalientes")} onChange={(event) => change("commerce", "deliveryState", event.target.value)} /></label>
        <label className="visual-toggle"><input type="checkbox" checked={Boolean(draft.commerce?.freeShipping)} onChange={(event) => change("commerce", "freeShipping", event.target.checked)} /><span /><div><b>Envío gratuito</b><small>No agrega costo al pedido</small></div></label>
        <label className="visual-toggle"><input type="checkbox" checked={Boolean(draft.commerce?.pickupEnabled)} onChange={(event) => change("commerce", "pickupEnabled", event.target.checked)} /><span /><div><b>Retiro en sucursal</b><small>Permite elegir un punto de recolección</small></div></label>
        <button disabled={busy} onClick={() => onSave("commerce", draft.commerce ?? {})}>Guardar entregas</button>
      </section>

      <section className="settings-card">
        <div className="settings-card-head"><span><ShoppingBag /></span><div><h2>Pagos</h2><p>Activa el cobro cuando las credenciales estén listas.</p></div></div>
        <label>Proveedor<select value={String(draft.payments?.provider ?? "mercadopago")} onChange={(event) => change("payments", "provider", event.target.value)}><option value="mercadopago">Mercado Pago</option><option value="manual">Pago coordinado manualmente</option></select></label>
        <label className="visual-toggle"><input type="checkbox" checked={Boolean(draft.payments?.enabled)} onChange={(event) => change("payments", "enabled", event.target.checked)} /><span /><div><b>Pagos en línea</b><small>Envía al cliente a la pasarela</small></div></label>
        <label className="visual-toggle"><input type="checkbox" checked={Boolean(draft.payments?.testMode)} onChange={(event) => change("payments", "testMode", event.target.checked)} /><span /><div><b>Modo de pruebas</b><small>No usar para ventas reales</small></div></label>
        <button disabled={busy} onClick={() => onSave("payments", draft.payments ?? {})}>Guardar pagos</button>
      </section>

      <section className="settings-card">
        <div className="settings-card-head"><span><Clock3 /></span><div><h2>Avisos de venta</h2><p>Quién recibe información de cada pedido.</p></div></div>
        <label>Correo del administrador<input type="email" value={String(draft.notifications?.adminEmail ?? "")} onChange={(event) => change("notifications", "adminEmail", event.target.value)} /></label>
        <label className="visual-toggle"><input type="checkbox" checked={Boolean(draft.notifications?.customerConfirmation)} onChange={(event) => change("notifications", "customerConfirmation", event.target.checked)} /><span /><div><b>Confirmar al cliente</b><small>Envía el resumen de su pedido</small></div></label>
        <label className="visual-toggle"><input type="checkbox" checked={Boolean(draft.notifications?.adminNewOrder)} onChange={(event) => change("notifications", "adminNewOrder", event.target.checked)} /><span /><div><b>Avisar al equipo</b><small>Notifica cada nueva venta</small></div></label>
        <button disabled={busy} onClick={() => onSave("notifications", draft.notifications ?? {})}>Guardar avisos</button>
      </section>
    </div>
  );
}

export default function AdminDashboard({ userName }: { userName: string }) {
  const [active, setActive] = useState("products");
  const [items, setItems] = useState<Row[]>([]);
  const [categories, setCategories] = useState<Lookup[]>([]);
  const [pages, setPages] = useState<Lookup[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const resource = cmsResources[active];
  const copy = moduleCopy[active];

  useEffect(() => {
    const controller = new AbortController();
    const requestedResource = active;
    // Loading state is synchronized with the selected remote CMS resource.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBusy(true);
    cmsFetch(`/api/admin/${requestedResource}`, { signal: controller.signal })
      .then(async (response) => {
        const data = (await response.json()) as { items?: Row[]; error?: string };
        if (!response.ok) throw new Error(data.error);
        return data.items ?? [];
      })
      .then((nextItems) => {
        if (!controller.signal.aborted) setItems(nextItems);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setMessage(error instanceof Error ? error.message : "No se pudo cargar.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    return () => controller.abort();
  }, [active, refresh]);

  useEffect(() => {
    Promise.all([
      cmsFetch("/api/admin/categories").then((response) => response.json()),
      cmsFetch("/api/admin/pages").then((response) => response.json()),
    ])
      .then(([categoryData, pageData]) => {
        setCategories((categoryData as { items?: Lookup[] }).items ?? []);
        setPages((pageData as { items?: Lookup[] }).items ?? []);
      })
      .catch(() => undefined);
  }, []);

  const visible = useMemo(() => {
    const needle = query.toLowerCase().trim();
    if (!needle) return items;
    return items.filter((item) =>
      Object.values(item).some((value) => String(value ?? "").toLowerCase().includes(needle)),
    );
  }, [items, query]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(resource.fields.map((field) => [field.key, valueForSave(field, form)]));
    const id = editing?.id ?? editing?.key;
    const response = await cmsFetch(id ? `/api/admin/${active}/${id}` : `/api/admin/${active}`, {
      method: id ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };
    setBusy(false);
    if (!response.ok) return setMessage(data.error ?? "No se pudo guardar.");
    setEditing(null);
    setCreating(false);
    setMessage("Los cambios se guardaron correctamente.");
    setRefresh((value) => value + 1);
  }

  async function saveSetting(key: string, value: Record<string, unknown>) {
    setBusy(true);
    const response = await cmsFetch(`/api/admin/settings/${key}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value_json: JSON.stringify(value) }),
    });
    setBusy(false);
    if (!response.ok) return setMessage("No se pudo guardar la configuración.");
    setMessage("Configuración actualizada.");
    setRefresh((current) => current + 1);
  }

  async function remove(row: Row) {
    if (!window.confirm(`¿Eliminar “${titleFor(row)}”? Esta acción no se puede deshacer.`)) return;
    setBusy(true);
    const response = await cmsFetch(`/api/admin/${active}/${row.id}`, { method: "DELETE" });
    setBusy(false);
    if (!response.ok) return setMessage("No se pudo eliminar.");
    setMessage("El elemento fue eliminado.");
    setRefresh((value) => value + 1);
  }

  async function upload(file: File, endpoint: string) {
    setBusy(true);
    const form = new FormData();
    form.append("file", file);
    const response = await cmsFetch(endpoint, { method: "POST", body: form });
    const data = (await response.json()) as { error?: string; created?: number; updated?: number; name?: string };
    setBusy(false);
    if (!response.ok) return setMessage(data.error ?? "No se pudo subir el archivo.");
    setMessage(endpoint.includes("import") ? `${data.created ?? 0} productos creados y ${data.updated ?? 0} actualizados.` : `${data.name ?? "Archivo"} se subió correctamente.`);
    setRefresh((value) => value + 1);
  }

  /** Sube una imagen y devuelve su ruta publica, sin recargar la lista. */
  async function subirImagen(file: File): Promise<string | null> {
    const form = new FormData();
    form.append("file", file);
    const response = await cmsFetch("/api/admin/media", { method: "POST", body: form });
    const data = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !data.url) {
      setMessage(data.error ?? "No se pudo subir la imagen.");
      return null;
    }
    return data.url;
  }

  const formOpen = creating || Boolean(editing);
  const advancedFields = resource.fields.filter((field) => field.type === "json" && !["benefits_json", "gallery_json"].includes(field.key));
  const regularFields = resource.fields.filter((field) => !advancedFields.includes(field));

  return (
    <main className="admin-shell">
      <aside className={mobileNav ? "admin-sidebar open" : "admin-sidebar"}>
        <div className="admin-brand">
          <img src="/berel-icono.png" alt="Berel" />
          <div><b>Berel Commerce</b><span>Administración</span></div>
          <button onClick={() => setMobileNav(false)} aria-label="Cerrar menú"><X /></button>
        </div>
        <nav aria-label="Módulos del CMS">
          <small>MENÚ PRINCIPAL</small>
          {navigation.map(([key, Icon]) => (
            <button
              className={active === key ? "active" : ""}
              onClick={() => {
                setActive(key);
                setQuery("");
                setItems([]);
                setMobileNav(false);
              }}
              key={key}
            >
              <Icon /><span>{cmsResources[key].label}</span><ChevronRight />
            </button>
          ))}
        </nav>
        <div className="admin-user">
          <span>{userName.slice(0, 1).toUpperCase()}</span>
          <div><b>{userName}</b><a href="/admin?logout=1">Cerrar sesión</a></div>
        </div>
      </aside>

      <section className="admin-workspace">
        <header className="admin-topbar">
          <button className="admin-menu" onClick={() => setMobileNav(true)} aria-label="Abrir menú"><Menu /></button>
          <div><small>{copy.eyebrow}</small><h1>{resource.label}</h1><p>{copy.description}</p></div>
          <a href="/" target="_blank"><Store /> Ver tienda</a>
        </header>

        {active !== "settings" && (
          <div className="admin-toolbar">
            <label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Buscar en ${resource.label.toLowerCase()}…`} /></label>
            {active === "products" && <label className="secondary-action"><Upload /> Importar CSV<input type="file" accept=".csv,text/csv" onChange={(event) => event.target.files?.[0] && void upload(event.target.files[0], "/api/admin/import-products")} /></label>}
            {active === "media" && <label className="secondary-action"><Upload /> Subir archivo<input type="file" accept="image/jpeg,image/png,image/webp,image/avif,application/pdf" onChange={(event) => event.target.files?.[0] && void upload(event.target.files[0], "/api/admin/media")} /></label>}
            {!["orders", "media"].includes(active) && <button className="primary-action" onClick={() => setCreating(true)}><Plus /> Crear {resource.singular}</button>}
          </div>
        )}

        {message && <div className="admin-notice" role="status"><Check />{message}<button onClick={() => setMessage("")} aria-label="Cerrar aviso"><X /></button></div>}

        {busy && !items.length ? (
          <div className="admin-card-grid loading-grid">{[0, 1, 2, 3, 4, 5].map((item) => <div className="admin-skeleton" key={item} />)}</div>
        ) : active === "settings" ? (
          <SettingsEditor key={`${refresh}-${items.length}`} items={items} onSave={saveSetting} busy={busy} />
        ) : (
          <div className={`admin-card-grid resource-${active}`}>
            {visible.map((row) => {
              const visual = String(row.image_url ?? row.url ?? "");
              return (
                <article className="resource-card" key={String(row.id ?? row.key)}>
                  {(active === "products" || active === "media" || active === "slides") && (
                    <div className="resource-visual">
                      {visual && !String(row.mime_type ?? "").includes("pdf") ? <img src={visual} alt={String(row.alt_text ?? titleFor(row))} /> : <ImageIcon />}
                      {active === "products" && <span>{Number(row.stock ?? 0)} disponibles</span>}
                    </div>
                  )}
                  <div className="resource-card-body">
                    <div className="resource-card-top">
                      <div className="resource-meta">
                        <span className={row.is_active === 0 ? "state-pill off" : "state-pill"}>{row.status ? String(row.status) : row.is_active === 0 ? "Oculto" : "Visible"}</span>
                        {subtitleFor(row) && <span className="resource-reference">{subtitleFor(row)}</span>}
                      </div>
                      {!["orders"].includes(active) && (
                        <details className="resource-menu">
                          <summary aria-label={`Opciones de ${titleFor(row)}`}><MoreHorizontal /></summary>
                          <div>
                            <button onClick={() => void remove(row)}><Trash2 /> Eliminar</button>
                          </div>
                        </details>
                      )}
                    </div>
                    <h2>{titleFor(row)}</h2>
                    {active === "products" && <strong>{moneyFromCents(row.price_cents)}</strong>}
                    {active === "orders" && <strong>{moneyFromCents(row.total_cents)}</strong>}
                    {active === "faqs" && <p className="card-excerpt">{String(row.answer ?? "")}</p>}
                    {active === "branches" && <p className="card-excerpt">{String(row.schedule ?? "")}</p>}
                  </div>
                  <footer>
                    <button onClick={() => setEditing(row)}><Pencil /> {active === "products" ? "Editar producto" : "Editar"}</button>
                  </footer>
                </article>
              );
            })}
            {!visible.length && <div className="admin-empty"><span><LayoutGrid /></span><h2>No hay elementos</h2><p>{copy.empty}</p>{!["orders", "media"].includes(active) && <button onClick={() => setCreating(true)}><Plus /> Crear ahora</button>}</div>}
          </div>
        )}
      </section>

      {formOpen && (
        <div className="admin-modal-backdrop" onMouseDown={() => { setEditing(null); setCreating(false); }}>
          <aside className="admin-modal" onMouseDown={(event) => event.stopPropagation()} aria-label={`Editar ${resource.singular}`}>
            <header><div><small>{editing ? "EDITAR" : "CREAR"}</small><h2>{editing ? titleFor(editing) : `Nuevo ${resource.singular}`}</h2><p>Completa los datos y guarda cuando estés listo.</p></div><button onClick={() => { setEditing(null); setCreating(false); }} aria-label="Cerrar"><X /></button></header>
            <form onSubmit={save}>
              <div className="form-section">
                {regularFields.map((field) => (
                  <label className={field.type === "textarea" || field.type === "image" || ["description", "benefits_json", "gallery_json"].includes(field.key) ? "wide" : ""} key={field.key}>
                    <span>{field.label}{field.required && " *"}</span>
                    {field.key === "category_id" ? (
                      <select name={field.key} defaultValue={String(editing?.[field.key] ?? "")} required={field.required}><option value="">Selecciona una categoría</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select>
                    ) : field.key === "page_id" ? (
                      <select name={field.key} defaultValue={String(editing?.[field.key] ?? "")} required={field.required}><option value="">Selecciona una página</option>{pages.map((page) => <option value={page.id} key={page.id}>{page.title}</option>)}</select>
                    ) : field.type === "textarea" || field.key === "benefits_json" || field.key === "gallery_json" ? (
                      <textarea name={field.key} defaultValue={String(displayInput(field, editing?.[field.key] ?? ""))} required={field.required} placeholder={field.key === "benefits_json" || field.key === "gallery_json" ? "Escribe un elemento por línea" : ""} />
                    ) : field.type === "image" ? (
                      <ImageField
                        name={field.key}
                        valorInicial={String(editing?.[field.key] ?? "")}
                        subir={subirImagen}
                      />
                    ) : field.type === "boolean" ? (
                      <label className="visual-toggle form-toggle"><input type="checkbox" name={field.key} defaultChecked={editing ? Boolean(editing[field.key]) : true} /><span /><div><b>{field.label}</b><small>Puedes cambiarlo más adelante</small></div></label>
                    ) : (
                      <input name={field.key} type={field.type === "money" ? "number" : field.type ?? "text"} step={field.type === "money" ? "0.01" : undefined} defaultValue={String(displayInput(field, editing?.[field.key] ?? ""))} required={field.required} />
                    )}
                  </label>
                ))}
              </div>
              {advancedFields.length > 0 && (
                <details className="advanced-options"><summary>Opciones avanzadas</summary>{advancedFields.map((field) => <label key={field.key}><span>{field.label}</span><textarea name={field.key} defaultValue={String(displayInput(field, editing?.[field.key] ?? "{}"))} /></label>)}</details>
              )}
              <footer><button type="button" onClick={() => { setEditing(null); setCreating(false); }}>Cancelar</button><button type="submit" disabled={busy}>{busy ? "Guardando…" : "Guardar cambios"}</button></footer>
            </form>
          </aside>
        </div>
      )}
    </main>
  );
}
