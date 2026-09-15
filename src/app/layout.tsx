import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
  display: "swap",
});

const text = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-text",
  display: "swap",
});

const siteUrl = "https://memora-taupe-eta.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Memora | Vos albums d'événements",
    template: "%s | Memora",
  },
  description:
    "Retrouvez et partagez les photos de vos événements avec vos proches, en toute simplicité.",
  keywords: ["album photo", "événement", "partage de photos", "souvenirs", "invités"],
  applicationName: "Memora",
  authors: [{ name: "Memora" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Memora",
    url: siteUrl,
    title: "Memora | Vos albums d'événements",
    description:
      "Retrouvez et partagez les photos de vos événements avec vos proches, en toute simplicité.",
  },
  twitter: {
    card: "summary",
    title: "Memora | Vos albums d'événements",
    description:
      "Retrouvez et partagez les photos de vos événements avec vos proches, en toute simplicité.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`h-full antialiased ${display.variable} ${text.variable}`}>
      <body className="min-h-full bg-paper text-ink">{children}</body>
    </html>
  );
}
