"use client";

import { Headphones, ShieldCheck, Truck } from "lucide-react";
import { money } from "@/lib/store-data";
import { useStorefront } from "@/lib/storefront-context";

export default function TrustbarBlock() {
  const { data } = useStorefront();
  const minimo = data.settings.commerce?.minimumOrderCents;

  return (
    <section className="trustbar">
      <span>
        <Truck /> Envío gratis{" "}
        <small>
          {minimo
            ? `en compras desde ${money(minimo / 100)}`
            : "en tu zona de entrega"}
        </small>
      </span>
      <span>
        <Headphones /> Asesoría en línea <small>para elegir mejor</small>
      </span>
      <span>
        <ShieldCheck /> Compra 100% segura <small>pago protegido</small>
      </span>
    </section>
  );
}
