"use client";

import {
  Boxes,
  Building2,
  ChevronRight,
  CircleHelp,
  FileText,
  Image,
  LayoutDashboard,
  Menu,
  Package,
  PanelTop,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShoppingBag,
  Upload,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { cmsResources, type CmsField } from "@/lib/cms-resources";

type Row = Record<string, string | number | boolean | null>;

const navigation = [
  ["products", Package],
  ["categories", Boxes],
  ["orders", ShoppingBag],
  ["pages", FileText],
  ["content", PanelTop],
  ["slides", Image],
  ["media", Upload],
  ["faqs", CircleHelp],
  ["branches", Building2],
  ["settings", Settings],
] as const;

function inputValue(field: CmsField, value: Row[string]) {
  if (field.type === "boolean") return Boolean(value);
  return value == null ? "" : String(value);
}

export default function AdminDashboard({ userName }: { userName: string }) {
  const [active, setActive] = useState("products");
  const [items, setItems] = useState<Row[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const resource = cmsResources[active];

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/${active}`);
      const data = (await response.json()) as { items?: Row[]; error?: string };
      if (!response.ok) throw new Error(data.error);
      setItems(data.items ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo cargar.");
    } finally {
      setBusy(false);
    }
  }, [active]);

  useEffect(() => {
    // Load the selected external CMS resource when navigation changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const needle = query.toLowerCase().trim();
    if (!needle) return items;
    return items.filter((item) =>
      Object.values(item).some((value) =>
        String(value ?? "").toLowerCase().includes(needle),
      ),
    );
  }, [items, query]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(
      resource.fields.map((field) => [
        field.key,
        field.type === "boolean"
          ? form.get(field.key) === "on"
          : form.get(field.key) ?? "",
      ]),
    );
    const id = editing?.id ?? editing?.key;
    const response = await fetch(
      id ? `/api/admin/${active}/${id}` : `/api/admin/${active}`,
      {
        method: id ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const data = (await response.json()) as { error?: string };
    setBusy(false);
    if (!response.ok) {
      setMessage(data.error ?? "No se pudo guardar.");
      return;
    }
    setEditing(null);
    setCreating(false);
    setMessage(`${resource.singular} guardado correctamente.`);
    await load();
  }

  async function remove(row: Row) {
    if (!window.confirm(`¿Eliminar este ${resource.singular}?`)) return;
    setBusy(true);
    const response = await fetch(`/api/admin/${active}/${row.id}`, {
      method: "DELETE",
    });
    setBusy(false);
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setMessage(data.error ?? "No se pudo eliminar.");
      return;
    }
    setMessage(`${resource.singular} eliminado.`);
    await load();
  }

  async function importCsv(file: File) {
    setBusy(true);
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/admin/import-products", {
      method: "POST",
      body: form,
    });
    const data = (await response.json()) as {
      created?: number;
      updated?: number;
      error?: string;
    };
    setBusy(false);
    if (!response.ok) setMessage(data.error ?? "No se pudo importar.");
    else {
      setMessage(`${data.created} creados · ${data.updated} actualizados.`);
      await load();
    }
  }

  async function uploadMedia(file: File) {
    setBusy(true);
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/admin/media", { method: "POST", body: form });
    const data = (await response.json()) as { error?: string; name?: string };
    setBusy(false);
    if (!response.ok) setMessage(data.error ?? "No se pudo subir el archivo.");
    else {
      setMessage(`${data.name ?? "Archivo"} subido correctamente.`);
      await load();
    }
  }

  const formOpen = creating || Boolean(editing);

  return (
    <main className="admin-shell">
      <aside className={mobileNav ? "admin-sidebar open" : "admin-sidebar"}>
        <div className="admin-brand">
          <img src="/berel-icono.png" alt="Berel" />
          <div><b>Commerce</b><span>Panel de control</span></div>
          <button onClick={() => setMobileNav(false)} aria-label="Cerrar menú"><X /></button>
        </div>
        <nav aria-label="Módulos del CMS">
          <small>GESTIÓN</small>
          {navigation.map(([key, Icon]) => (
            <button
              className={active === key ? "active" : ""}
              onClick={() => { setActive(key); setMobileNav(false); }}
              key={key}
            >
              <Icon /> {cmsResources[key].label}<ChevronRight />
            </button>
          ))}
        </nav>
        <div className="admin-user">
          <span>{userName.slice(0, 1).toUpperCase()}</span>
          <div><b>{userName}</b><a href="/signout-with-chatgpt?return_to=/">Cerrar sesión</a></div>
        </div>
      </aside>

      <section className="admin-workspace">
        <header>
          <button className="admin-menu" onClick={() => setMobileNav(true)} aria-label="Abrir menú"><Menu /></button>
          <div><small>BEREL COMMERCE</small><h1>{resource.label}</h1></div>
          <a href="/" target="_blank">Ver tienda</a>
        </header>

        <div className="admin-metrics">
          <article><span><LayoutDashboard /></span><div><small>Registros</small><b>{items.length}</b></div></article>
          <article><span><RefreshCw /></span><div><small>Estado</small><b>{busy ? "Actualizando" : "Sincronizado"}</b></div></article>
        </div>

        <div className="admin-toolbar">
          <label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Buscar en ${resource.label.toLowerCase()}…`} /></label>
          {active === "products" && (
            <label className="csv-button"><Upload /> Importar CSV<input type="file" accept=".csv,text/csv" onChange={(event) => event.target.files?.[0] && void importCsv(event.target.files[0])} /></label>
          )}
          {active === "media" && (
            <label className="csv-button"><Upload /> Subir archivo<input type="file" accept="image/jpeg,image/png,image/webp,image/avif,application/pdf" onChange={(event) => event.target.files?.[0] && void uploadMedia(event.target.files[0])} /></label>
          )}
          {active !== "orders" && active !== "settings" && active !== "media" && <button onClick={() => setCreating(true)}><Plus /> Nuevo</button>}
        </div>

        {message && <div className="admin-notice">{message}<button onClick={() => setMessage("")}><X /></button></div>}

        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>Nombre / referencia</th><th>Estado</th><th>Última actualización</th><th /></tr></thead>
            <tbody>
              {visible.map((row) => (
                <tr key={String(row.id ?? row.key)}>
                  <td><b>{String(row.name ?? row.title ?? row.question ?? row.order_number ?? row.customer_name ?? row.key ?? "Sin título")}</b><small>{String(row.slug ?? row.sku ?? row.customer_email ?? row.id ?? "Configuración global")}</small></td>
                  <td><span className={row.is_active === 0 ? "status off" : "status"}>{row.status ? String(row.status) : row.is_active === 0 ? "Inactivo" : "Activo"}</span></td>
                  <td>{String(row.updated_at ?? row.created_at ?? "—").slice(0, 16)}</td>
                  <td><button className="row-action" onClick={() => setEditing(row)}>Editar</button>{active !== "orders" && active !== "settings" && <button className="row-action danger" onClick={() => void remove(row)}>Eliminar</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visible.length && !busy && <div className="admin-empty">No hay registros que coincidan.</div>}
        </div>
      </section>

      {formOpen && (
        <div className="admin-modal-backdrop" onMouseDown={() => { setEditing(null); setCreating(false); }}>
          <aside className="admin-modal" onMouseDown={(event) => event.stopPropagation()}>
            <header><div><small>{editing ? "EDITAR" : "NUEVO"}</small><h2>{resource.singular}</h2></div><button onClick={() => { setEditing(null); setCreating(false); }}><X /></button></header>
            <form onSubmit={save}>
              {resource.fields.map((field) => (
                <label className={field.type === "textarea" || field.type === "json" ? "wide" : ""} key={field.key}>
                  <span>{field.label}{field.required && " *"}</span>
                  {field.type === "textarea" || field.type === "json" ? (
                    <textarea name={field.key} defaultValue={String(inputValue(field, editing?.[field.key] ?? (field.type === "json" ? field.key.includes("gallery") || field.key.includes("benefits") ? "[]" : "{}" : "")))} required={field.required} />
                  ) : field.type === "boolean" ? (
                    <input type="checkbox" name={field.key} defaultChecked={editing ? Boolean(editing[field.key]) : true} />
                  ) : (
                    <input name={field.key} type={field.type ?? "text"} defaultValue={String(inputValue(field, editing?.[field.key] ?? ""))} required={field.required} />
                  )}
                </label>
              ))}
              <footer><button type="button" onClick={() => { setEditing(null); setCreating(false); }}>Cancelar</button><button type="submit" disabled={busy}>{busy ? "Guardando…" : "Guardar cambios"}</button></footer>
            </form>
          </aside>
        </div>
      )}
    </main>
  );
}
