"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, MapPin, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { money } from "@/lib/store-data";
import {
  loadStorefront,
  reportStorefrontError,
  type StorefrontBranch,
  type StorefrontSettings,
} from "@/lib/storefront-client";
import StoreFooter from "@/components/StoreFooter";
import "./checkout.css";

type Commerce = NonNullable<StorefrontSettings["commerce"]>;

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");
  const [branches, setBranches] = useState<StorefrontBranch[]>([]);
  const [commerce, setCommerce] = useState<Commerce>({ minimumOrderCents: 80000, deliveryPromiseHours: 24 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    loadStorefront().then(
      (data) => {
        if (!active) return;
        setBranches(data.branches);
        setCommerce((current) => data.settings.commerce ?? current);
      },
      (error: unknown) => reportStorefrontError(error),
    );
    return () => {
      active = false;
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      customerName: form.get("name"),
      customerEmail: form.get("email"),
      customerPhone: form.get("phone"),
      fulfillmentType: fulfillment,
      branchId: form.get("branchId"),
      address: {
        street: form.get("street"),
        neighborhood: form.get("neighborhood"),
        postalCode: form.get("postalCode"),
        // El backend valida el estado contra commerce.deliveryState.
        city: commerce.deliveryState ?? "Aguascalientes",
        state: commerce.deliveryState ?? "Aguascalientes",
        references: form.get("references"),
      },
      notes: form.get("notes"),
      items: items.map((item) => ({ slug: item.slug, quantity: item.qty, presentation: item.presentation })),
    };
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as {
      error?: string;
      paymentUrl?: string | null;
      confirmationUrl?: string;
    };
    setBusy(false);
    if (!response.ok) {
      setError(data.error ?? "No se pudo crear el pedido.");
      return;
    }
    clear();
    window.location.href = data.paymentUrl || data.confirmationUrl || "/";
  }

  const minimum = Number(commerce.minimumOrderCents ?? 80000) / 100;

  return (
    <main className="checkout-shell">
      <header><Link href="/"><ArrowLeft /> Volver a la tienda</Link><img src="/berel-icono.png" alt="Berel" /><span><ShieldCheck /> Compra segura</span></header>
      <div className="checkout-layout">
        <section>
          <div className="checkout-heading"><small>FINALIZAR COMPRA</small><h1>¿Cómo recibes tu pedido?</h1><p>Entregamos en Aguascalientes en un máximo de {commerce.deliveryPromiseHours ?? 24} horas después de confirmar el pago.</p></div>
          <form onSubmit={submit}>
            <div className="fulfillment-options">
              <button type="button" className={fulfillment === "delivery" ? "active" : ""} onClick={() => setFulfillment("delivery")}><Truck /><span><b>Envío local</b><small>Gratis en Aguascalientes</small></span>{fulfillment === "delivery" && <Check />}</button>
              <button type="button" className={fulfillment === "pickup" ? "active" : ""} onClick={() => setFulfillment("pickup")}><PackageCheck /><span><b>Retiro en sucursal</b><small>Te avisamos cuando esté listo</small></span>{fulfillment === "pickup" && <Check />}</button>
            </div>
            <fieldset><legend>Datos de contacto</legend><div className="form-grid"><label>Nombre completo<input name="name" required /></label><label>Teléfono<input name="phone" type="tel" required /></label><label className="wide">Correo electrónico<input name="email" type="email" required /></label></div></fieldset>
            {fulfillment === "delivery" ? (
              <fieldset><legend><MapPin /> Dirección en Aguascalientes</legend><div className="form-grid"><label className="wide">Calle y número<input name="street" required /></label><label>Colonia<input name="neighborhood" required /></label><label>Código postal<input name="postalCode" inputMode="numeric" required /></label><label className="wide">Referencias<textarea name="references" /></label></div></fieldset>
            ) : (
              <fieldset><legend>Selecciona sucursal</legend><label>Sucursal<select name="branchId" required><option value="">Seleccionar…</option>{branches.map((branch) => <option value={branch.id} key={branch.id}>{branch.name} · {branch.address}</option>)}</select></label></fieldset>
            )}
            <fieldset><legend>Notas del pedido</legend><label>Indicaciones opcionales<textarea name="notes" /></label></fieldset>
            {error && <div className="checkout-error">{error}</div>}
            <button className="checkout-submit" disabled={busy || !items.length || total < minimum}>{busy ? "Creando pedido…" : "Continuar al pago"}</button>
            {total < minimum && <p className="minimum-note">La compra mínima es de {money(minimum)}. Agrega {money(minimum - total)} para continuar.</p>}
          </form>
        </section>
        <aside><h2>Resumen</h2>{items.map((item) => <article key={`${item.slug}-${item.presentation}`}><img src={item.image} alt="" /><div><b>{item.name}</b><small>{item.qty} × {money(item.price)}</small></div><strong>{money(item.qty * item.price)}</strong></article>)}<div className="checkout-totals"><span>Subtotal<b>{money(total)}</b></span><span>Envío<b>Gratis</b></span><span className="grand">Total<b>{money(total)}</b></span></div><p><ShieldCheck /> Tus datos y el pago se procesan de forma segura.</p></aside>
      </div>
      <StoreFooter />
    </main>
  );
}
