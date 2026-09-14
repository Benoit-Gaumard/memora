import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full bg-[#fffaf3] text-[#1f1b18]">{children}</body>
    </html>
  );
}
