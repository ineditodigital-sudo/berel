"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function WhatsAppFloating() {
  const [number, setNumber] = useState("");
  useEffect(() => {
    fetch("/api/storefront")
      .then((response) => response.json())
      .then((data: { settings?: { contact?: { whatsapp?: string } } }) =>
        setNumber(data.settings?.contact?.whatsapp?.replace(/\D/g, "") ?? ""),
      )
      .catch(() => undefined);
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
