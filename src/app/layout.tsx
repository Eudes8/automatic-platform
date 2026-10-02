import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AUTOMATIC — Plateforme de pilotage digital premium",
  description:
    "Configurez, signez et suivez vos projets web & mobile en temps réel. Project Builder intelligent, signature électronique, chat temps réel et facturation transparente.",
  keywords: ["AUTOMATIC", "agence digitale", "création site web", "application mobile", "SaaS", "signature électronique"],
  authors: [{ name: "AUTOMATIC" }],
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
