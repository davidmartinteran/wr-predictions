import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SWRegister } from "@/components/sw-register";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Porra Mundial 2026",
  description: "Pronósticos del Mundial 2026 entre amigos",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Porra WC",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  // Necesario para que env(safe-area-inset-*) reporte valores reales en
  // móvil (home indicator iOS / barra de gestos Android edge-to-edge)
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${jetbrainsMono.variable} dark h-dvh overflow-hidden antialiased`}
    >
      <body className="h-full flex flex-col overflow-hidden bg-background text-foreground">
        <SWRegister />
        {children}
      </body>
    </html>
  );
}
