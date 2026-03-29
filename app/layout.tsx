import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";

import { getSafeMetadataBase, publicBusinessConfig } from "@/lib/env";

const title = `${publicBusinessConfig.name} | Taller mecánico en ${publicBusinessConfig.city}`;
const description =
  `Diagnóstico automotriz con IA, cambio de aceite, mantenciones y frenos en ${publicBusinessConfig.city}. ` +
  `Atención rápida, cercana y con ubicación en ${publicBusinessConfig.address}.`;

export const metadata: Metadata = {
  metadataBase: getSafeMetadataBase(),
  title,
  description,
  keywords: [
    `taller mecánico en ${publicBusinessConfig.city}`,
    `mecánica automotriz ${publicBusinessConfig.city}`,
    `diagnóstico automotriz con IA ${publicBusinessConfig.city}`,
    `cambio de aceite en ${publicBusinessConfig.city}`,
    "mantenciones automotrices",
    "frenos y seguridad",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: publicBusinessConfig.name,
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#111827",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es-CL">
      <body>{children}</body>
    </html>
  );
}
