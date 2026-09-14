import { headers } from "next/headers";

/**
 * Resolves the current site's base URL server-side, so shareable links (e.g.
 * invite links/QR codes) always point at wherever the app is actually
 * running - localhost in dev, the real domain on Vercel - instead of relying
 * on a hardcoded/env value that can drift.
 */
export async function getSiteUrl() {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");

  if (host) {
    return `${proto}://${host}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
