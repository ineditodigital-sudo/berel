import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Colora | Pinta mejor",
  description: "Encuentra la pintura, el color y la cantidad ideal para transformar tu espacio.",
  openGraph: {
    title: "Colora | Pinta mejor",
    description: "Tu espacio merece un color extraordinario.",
    images: [{ url: "/og.png", width: 1680, height: 939 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Colora | Pinta mejor",
    description: "Tu espacio merece un color extraordinario.",
    images: ["/og.png"],
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
