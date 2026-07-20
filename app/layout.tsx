import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./modern.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Berel México | Pinturas, impermeabilizantes y recubrimientos",
  description: "Compra pinturas, impermeabilizantes, barnices y accesorios Berel con asesoría especializada.",
  openGraph: {
    title: "Berel México | Pinta con confianza",
    description: "Productos originales, asesoría especializada y compra segura.",
    images: [{ url: "/hero-modern-berel.webp", width: 1600, height: 894 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Berel México | Pinta con confianza",
    description: "Productos originales, asesoría especializada y compra segura.",
    images: ["/hero-modern-berel.webp"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
