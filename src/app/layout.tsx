import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Memora | Vos albums d'événements",
  description:
    "Retrouvez et partagez les photos de vos événements avec vos proches, en toute simplicité.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full bg-[#fffaf3] text-[#1f1b18]">{children}</body>
    </html>
  );
}
