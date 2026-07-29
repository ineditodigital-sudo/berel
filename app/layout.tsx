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
  const socialImage = new URL("/og.png", metadataBase).toString();

  return {
    metadataBase,
    title: "Berel México | Pinturas, impermeabilizantes y recubrimientos",
    description:
      "Compra pinturas, impermeabilizantes, barnices y accesorios Berel con asesoría especializada.",
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
