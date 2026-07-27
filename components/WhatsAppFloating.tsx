"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { loadStorefront, reportStorefrontError } from "@/lib/storefront-client";

export default function WhatsAppFloating() {
  const [number, setNumber] = useState("");
  useEffect(() => {
    let active = true;
    loadStorefront().then(
      (data) => {
        if (active) {
          setNumber(data.settings.contact?.whatsapp?.replace(/\D/g, "") ?? "");
        }
      },
      (error: unknown) => reportStorefrontError(error),
    );
    return () => {
      active = false;
    };
  }, []);
  if (!number) return null;
  const message = encodeURIComponent(
    "Hola, me gustaría recibir asesoría sobre los productos Berel.",
  );
  return (
    <a
      className="whatsapp-floating"
      href={`https://wa.me/${number}?text=${message}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Hablar con Berel por WhatsApp"
    >
      <MessageCircle />
      <span>¿Te ayudamos?</span>
    </a>
  );
}
