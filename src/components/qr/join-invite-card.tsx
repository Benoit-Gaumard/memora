"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Copy, QrCode } from "lucide-react";
import QRCode from "qrcode";

export function JoinInviteCard({ code, link }: { code: string; link: string }) {
  const [image, setImage] = useState("");

  useEffect(() => {
    QRCode.toDataURL(link, { width: 220, margin: 2, errorCorrectionLevel: "M" })
      .then((dataUrl) => setImage(dataUrl))
      .catch(() => setImage(""));
  }, [link]);

  return (
    <div className="paper p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-display text-lg font-extrabold text-ink">Code d’invitation</div>
          <div className="marker mt-1 text-2xl font-black tracking-[0.2em] text-ink">{code}</div>
        </div>
        <QrCode className="h-7 w-7 text-fuchsia" />
      </div>

      <div className="mt-5 flex items-center justify-center rounded-2xl border-2 border-ink bg-white p-4">
        {image ? (
          <Image
            src={image}
            alt={`QR code ${code}`}
            width={176}
            height={176}
            unoptimized
            className="h-44 w-44 object-cover"
          />
        ) : null}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 text-sm text-ink-soft">
        <span className="truncate">{link}</span>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(link)}
          className="btn btn-sm btn-citron shrink-0"
        >
          <Copy className="h-3.5 w-3.5" />
          Copier
        </button>
      </div>
    </div>
  );
}
