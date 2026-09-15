/**
 * Rattrapage des vignettes des photos déjà déposées.
 *
 * Avant l'introduction des dérivées, les trois colonnes de chemin d'une photo
 * (`storage_original_path`, `storage_display_path`, `storage_thumbnail_path`)
 * pointaient vers le même fichier : l'original. Les galeries téléchargeaient
 * donc des originaux de plusieurs mégaoctets pour remplir des vignettes de
 * 200 pixels. Ce script régénère les deux dérivées manquantes.
 *
 * Il est idempotent : une photo dont les chemins diffèrent déjà de l'original
 * est ignorée, on peut donc le relancer sans risque après une interruption.
 *
 * Utilisation :
 *
 *   # .env.local doit contenir NEXT_PUBLIC_SUPABASE_URL et
 *   # SUPABASE_SERVICE_ROLE_KEY (clé secrète, jamais exposée au navigateur)
 *   node scripts/backfill-photo-derivatives.mjs --dry-run
 *   node scripts/backfill-photo-derivatives.mjs
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { readFileSync } from "node:fs";

const BUCKET = "event-photos";
const DISPLAY_MAX_EDGE = 1600;
const THUMBNAIL_MAX_EDGE = 640;
const DISPLAY_QUALITY = 82;
const THUMBNAIL_QUALITY = 72;
const PAGE_SIZE = 200;

const dryRun = process.argv.includes("--dry-run");

/** Lit .env.local sans dépendance : le format y est trivial. */
function loadEnvFile() {
  let contents;
  try {
    contents = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  } catch {
    return;
  }

  for (const line of contents.split(/\r?\n/)) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!match) continue;
    const value = match[2].replace(/^["']|["']$/g, "");
    process.env[match[1]] ??= value;
  }
}

loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Il manque NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY.\n" +
      "La clé service_role se trouve dans Supabase > Project Settings > API.",
  );
  process.exit(1);
}

// La clé service_role contourne RLS : c'est nécessaire ici pour parcourir les
// photos de tous les événements, et c'est la raison pour laquelle ce script
// tourne en local et jamais dans le navigateur.
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function fetchStaleRows() {
  const rows = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("photos")
      .select("id, storage_original_path, storage_display_path, storage_thumbnail_path, mime_type")
      .order("uploaded_at", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data?.length) break;

    rows.push(
      ...data.filter(
        (row) =>
          row.storage_original_path &&
          (row.storage_display_path === row.storage_original_path ||
            row.storage_thumbnail_path === row.storage_original_path),
      ),
    );

    if (data.length < PAGE_SIZE) break;
  }

  return rows;
}

async function uploadDerivative(originalPath, suffix, buffer) {
  const path = `${originalPath.replace(/\.[^./]+$/, "")}-${suffix}.webp`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: "image/webp", upsert: true });

  if (error) throw error;
  return path;
}

async function processRow(row) {
  const { data: blob, error } = await supabase.storage
    .from(BUCKET)
    .download(row.storage_original_path);

  if (error || !blob) {
    throw new Error(`fichier introuvable dans le bucket (${error?.message ?? "sans détail"})`);
  }

  const source = Buffer.from(await blob.arrayBuffer());

  // `rotate()` sans argument applique l'orientation EXIF : sans lui, les
  // photos prises en portrait ressortent couchées.
  const [displayBuffer, thumbnailBuffer] = await Promise.all([
    sharp(source)
      .rotate()
      .resize({
        width: DISPLAY_MAX_EDGE,
        height: DISPLAY_MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: DISPLAY_QUALITY })
      .toBuffer(),
    sharp(source)
      .rotate()
      .resize({
        width: THUMBNAIL_MAX_EDGE,
        height: THUMBNAIL_MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: THUMBNAIL_QUALITY })
      .toBuffer(),
  ]);

  if (dryRun) {
    return { before: source.length, after: thumbnailBuffer.length };
  }

  const [displayPath, thumbnailPath] = await Promise.all([
    uploadDerivative(row.storage_original_path, "display", displayBuffer),
    uploadDerivative(row.storage_original_path, "thumb", thumbnailBuffer),
  ]);

  // La ligne n'est mise à jour qu'une fois les deux objets en place : une
  // interruption laisse au pire deux fichiers inutilisés, jamais une photo
  // dont la base pointe vers un fichier absent.
  const { error: updateError } = await supabase
    .from("photos")
    .update({ storage_display_path: displayPath, storage_thumbnail_path: thumbnailPath })
    .eq("id", row.id);

  if (updateError) throw updateError;

  return { before: source.length, after: thumbnailBuffer.length };
}

function formatBytes(bytes) {
  const megabytes = bytes / 1024 / 1024;
  return megabytes >= 1 ? `${megabytes.toFixed(1)} Mo` : `${Math.round(bytes / 1024)} Ko`;
}

const rows = await fetchStaleRows();

if (!rows.length) {
  console.log("Rien à rattraper : toutes les photos ont déjà leurs dérivées.");
  process.exit(0);
}

console.log(
  `${rows.length} photo(s) à traiter${dryRun ? " (simulation, rien ne sera écrit)" : ""}.\n`,
);

let done = 0;
let failed = 0;
let totalSaved = 0;

for (const row of rows) {
  try {
    const { before, after } = await processRow(row);
    totalSaved += before - after;
    done += 1;
    console.log(
      `  [${done + failed}/${rows.length}] ${row.storage_original_path} ` +
        `${formatBytes(before)} -> ${formatBytes(after)} en vignette`,
    );
  } catch (processError) {
    failed += 1;
    console.error(
      `  [${done + failed}/${rows.length}] ${row.storage_original_path} : ${processError.message}`,
    );
  }
}

console.log(
  `\n${done} photo(s) traitée(s), ${failed} en échec. ` +
    `Poids épargné sur une grille complète : ${formatBytes(totalSaved)}.`,
);

if (failed > 0) process.exit(1);
