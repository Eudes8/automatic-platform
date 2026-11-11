import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { Toaster } from "sonner";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://automatic-platform-beige.vercel.app"),
  title: {
    default: "AUTOMATIC · Votre projet numérique, piloté jusqu'à la livraison",
    template: "%s · AUTOMATIC",
  },
  description:
    "AUTOMATIC conçoit vos applications web et mobiles sur mesure et vous donne un espace unique pour suivre le cahier des charges, les tâches, les livrables et les paiements.",
  keywords: [
    "développement web",
    "application mobile",
    "logiciel sur mesure",
    "gestion de projet",
    "Côte d'Ivoire",
    "Afrique de l'Ouest",
  ],
  authors: [{ name: "AUTOMATIC" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "AUTOMATIC",
    title: "AUTOMATIC · Votre projet numérique, piloté jusqu'à la livraison",
    description:
      "De l'idée à la livraison : un seul espace pour votre projet, votre équipe et vos paiements.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AUTOMATIC" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AUTOMATIC · Votre projet numérique, piloté jusqu'à la livraison",
    description: "De l'idée à la livraison, dans un seul espace.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${bricolage.variable} ${figtree.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <Toaster
            position="bottom-center"
            toastOptions={{
              className: "!rounded-[10px] !border !border-border !bg-card !text-foreground !text-sm",
            }}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
