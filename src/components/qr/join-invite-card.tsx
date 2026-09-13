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
    <div className="rounded-3xl border border-[#f0d9bf] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-[#8b7267]">Invitation</div>
          <div className="mt-2 text-2xl font-black tracking-[0.2em] text-[#231d1a]">{code}</div>
        </div>
        <div className="rounded-2xl bg-[#fff4e9] p-3 text-[#d57f45]">
          <QrCode className="h-7 w-7" />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center rounded-3xl bg-[#fffaf3] p-4">
        {image ? (
          <Image
            src={image}
            alt={`QR code ${code}`}
            width={176}
            height={176}
            unoptimized
            className="h-44 w-44 rounded-2xl object-cover"
          />
        ) : null}
      </div>

      <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#fff5ed] p-3 text-sm text-[#4d4039]">
        <span className="truncate">{link}</span>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(link)}
          className="inline-flex items-center gap-2 rounded-full bg-[#f4b178] px-3 py-2 text-xs font-semibold text-white"
        >
          <Copy className="h-3.5 w-3.5" />
          Copier
        </button>
      </div>
    </div>
  );
}
