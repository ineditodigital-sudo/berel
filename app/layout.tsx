import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { headers } from "next/headers";
import { CartProvider } from "@/lib/cart-context";
import { StorefrontProvider } from "@/lib/storefront-context";
import { EditModeProvider } from "@/lib/edit-mode";
import { EditModeBar } from "@/components/blocks/BlockFrame";
import WhatsAppFloating from "@/components/WhatsAppFloating";
import "./globals.css";
import "./modern.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3001";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
  // JPEG y no PNG: es una imagen fotográfica y en PNG pesaba 1.6 MB.
  const socialImage = new URL("/og.jpg", metadataBase).toString();

  return {
    metadataBase,
    title: "Berel México | Pinturas, impermeabilizantes y recubrimientos",
    description:
      "Compra pinturas, impermeabilizantes, barnices y accesorios Berel con asesoría especializada.",
    // Sin canonical, cada categoría y cada ficha se sirven desde el mismo
    // documento exportado y un buscador puede tomarlas como duplicados. Cada
    // página lo ajusta con su propia ruta; aquí queda el de la portada.
    alternates: { canonical: "/" },
    openGraph: {
      title: "Berel México | Pinta con confianza",
      description:
        "Productos originales, asesoría especializada y compra segura.",
      images: [{ url: socialImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Berel México | Pinta con confianza",
      description:
        "Productos originales, asesoría especializada y compra segura.",
      images: [socialImage],
    },
    icons: {
      icon: "/berel-icono.png",
      shortcut: "/berel-icono.png",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX">
      <head>
        {/*
          Guarda el ancla de la URL y la quita ANTES de que cargue el bundle.

          El restaurador de scroll de vinext, mientras haya hash en la URL,
          vuelve a llamar a scrollIntoView en cada render: el visitante subía y
          la página lo jalaba de regreso varias veces por segundo. No sirve
          quitarlo desde React, porque para entonces vinext ya parcheó
          history.replaceState y su re-sincronización repone el hash. Aquí el
          parche todavía no existe, así que la limpieza se queda.

          El destino guardado lo consume useAnclaDePagina cuando las secciones
          del CMS ya están dibujadas.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var h=location.hash;if(h&&/^#[\\w-]+$/.test(h)){window.__berelAncla=h;' +
              'history.replaceState(history.state,"",location.pathname+location.search)}}catch(e){}',
          }}
        />
      </head>
      <body
        className={`${quicksand.variable} antialiased`}
      >
        <StorefrontProvider>
          <EditModeProvider>
            <CartProvider>
              {children}
              <WhatsAppFloating />
              <EditModeBar />
            </CartProvider>
          </EditModeProvider>
        </StorefrontProvider>
      </body>
    </html>
  );
}
