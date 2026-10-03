import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lens Producciones | Productora Audiovisual & Dirección Cinematográfica",
  description:
    "Portafolio cinematográfico de Lens Producciones. Especialistas en comerciales, cinematografía automotriz, festivales y documentales.",
  keywords: [
    "cineasta",
    "filmmaker",
    "director de fotografía",
    "productora audiovisual",
    "Lens Producciones",
    "comerciales",
    "automotriz",
  ],
  authors: [{ name: "Lens Producciones" }],
  openGraph: {
    title: "Lens Producciones | Productora Audiovisual",
    description: "Cine comercial, automotriz y narrativo de alta calidad.",
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
