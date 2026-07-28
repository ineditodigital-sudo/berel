"use client";

import { ArrowRight } from "lucide-react";
import { blockNumber, parseBlockConfig, type PageBlock } from "@/lib/page-blocks";
import { useStorefront } from "@/lib/storefront-context";

export default function FaqBlock({ block }: { block: PageBlock }) {
  const { data } = useStorefront();
  const limite = blockNumber(parseBlockConfig(block), "limite", 6);
  const faqs = data.faqs.slice(0, limite);

  if (faqs.length === 0) return null;

  return (
    <section id="ayuda" className="service-grid">
      {faqs.map((faq, indice) => (
        <article key={faq.id}>
          <b>{String(indice + 1).padStart(2, "0")}</b>
          <h3>{faq.question}</h3>
          <p>{faq.answer}</p>
          <a href="#asesoria">
            Encuentra tu producto <ArrowRight />
          </a>
        </article>
      ))}
    </section>
  );
}
