import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import AuthSync from "@/components/auth/AuthSync";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { Toaster } from "sonner";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://automatic.com'),
  title: {
    default: "AUTOMATIC | Boutique d'Ingénierie Digitale Premium",
    template: "%s | AUTOMATIC"
  },
  description: "Accélérez votre transformation numérique avec des solutions SaaS, Web et IA de haute performance. Design premium, exécution agile et pilotage en temps réel.",
  keywords: ["SaaS", "Next.js", "Développement Web", "IA", "Automatisation", "France", "Boutique Ingénierie"],
  authors: [{ name: "AUTOMATIC Team" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://automatic.com",
    siteName: "AUTOMATIC",
    title: "AUTOMATIC | Boutique d'Ingénierie Digitale",
    description: "La plateforme de pilotage de vos actifs numériques.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AUTOMATIC Nexus" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AUTOMATIC | Boutique d'Ingénierie Digitale",
    description: "Transformez vos idées en actifs numériques.",
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
      <body className={`${outfit.variable} ${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthSync />
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: "glass-premium rounded-2xl border-premium p-4 font-bold text-xs uppercase tracking-widest",
            }}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}