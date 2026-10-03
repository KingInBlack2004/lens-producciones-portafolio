import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lens Producciones | Productora Audiovisual & Dirección Cinematográfica",
  description:
    "Portafolio cinematográfico de Lens Producciones. Especialistas en cobertura de conciertos en vivo, festivales de música, aftermovies y piezas audiovisuales.",
  keywords: [
    "cineasta",
    "filmmaker",
    "director de fotografía",
    "productora audiovisual",
    "Lens Producciones",
    "festivales",
    "conciertos",
    "aftermovies",
    "videoclips"
  ],
  authors: [{ name: "Lens Producciones" }],
  openGraph: {
    title: "Lens Producciones | Productora Audiovisual",
    description: "Cobertura de festivales, conciertos y piezas cinematográficas en vivo.",
    type: "website",
    locale: "es_ES",
  },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark scroll-smooth">
      <body className="bg-background text-foreground antialiased min-h-screen selection:bg-neutral-800 selection:text-white">
        {children}
      </body>
    </html>
  );
}
