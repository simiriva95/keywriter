import type { Metadata } from "next";
import { Archivo, Fragment_Mono } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const fragmentMono = Fragment_Mono({
  variable: "--font-fragment",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Keywriter — typing stazioni",
  description: "Typing game sulle stazioni ferroviarie italiane",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${archivo.variable} ${fragmentMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
