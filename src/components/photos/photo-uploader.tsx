"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { uploadEventPhoto } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

export function PhotoUploader({ eventId }: { eventId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;

    setIsUploading(true);
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Vous devez être connecté pour ajouter des photos.");
      setIsUploading(false);
      return;
    }

    const fileList = Array.from(files);
    setProgress({ done: 0, total: fileList.length });

    let successCount = 0;
    let failureCount = 0;

    for (const file of fileList) {
      const { error } = await uploadEventPhoto({ eventId, userId: user.id, file });
      if (error) {
        failureCount += 1;
      } else {
        successCount += 1;
      }
      setProgress((prev) => (prev ? { ...prev, done: prev.done + 1 } : prev));
    }

    setIsUploading(false);
    setProgress(null);
    setMessage(
      failureCount
        ? `${successCount} photo(s) ajoutée(s), ${failureCount} échec(s).`
        : `${successCount} photo(s) ajoutée(s).`,
    );

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    if (successCount) {
      router.refresh();
    }
  }

  const progressPercent = progress ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="btn btn-fuchsia btn-sm"
      >
        <Upload className="h-4 w-4" />
        {isUploading ? "Envoi en cours…" : "Ajouter des photos"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
      {progress ? (
        <div className="w-48">
          <div className="h-3 overflow-hidden rounded-full border-2 border-ink bg-white">
            <div
              className="h-full bg-turquoise transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-1 text-right text-sm font-semibold text-ink-soft">
            {progress.done}/{progress.total} envoyée(s)
          </div>
        </div>
      ) : null}
      {message ? <div className="text-sm font-semibold text-ink-soft">{message}</div> : null}
    </div>
  );
}
