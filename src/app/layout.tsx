import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Memora | Private event gallery",
  description:
    "A secure, shared photo gallery for private events with QR invites, per-event buckets and strict member access.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full bg-[#fffaf3] text-[#1f1b18]">{children}</body>
    </html>
  );
}
