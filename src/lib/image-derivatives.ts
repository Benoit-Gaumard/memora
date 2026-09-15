/**
 * Redimensionnement d'image côté navigateur, avant l'envoi.
 *
 * Une photo de smartphone pèse 4 à 6 Mo pour 4000 px de large. L'afficher
 * telle quelle dans une vignette de 200 px fait transiter mille fois trop
 * d'octets. On produit donc deux dérivées au moment du dépôt :
 *
 * - `display`  : 1600 px max, ce qu'on montre en plein écran (~200 Ko) ;
 * - `thumbnail` :  640 px max, ce qu'on montre dans la grille (~40 Ko).
 *
 * L'original n'est jamais touché : il reste la source de vérité et c'est lui
 * qui part dans le ZIP de l'album.
 */

const DISPLAY_MAX_EDGE = 1600;
const THUMBNAIL_MAX_EDGE = 640;
const DISPLAY_QUALITY = 0.82;
const THUMBNAIL_QUALITY = 0.72;

export type ImageDerivative = {
  blob: Blob;
  contentType: string;
  extension: string;
};

export type ImageDerivatives = {
  width: number | null;
  height: number | null;
  display: ImageDerivative | null;
  thumbnail: ImageDerivative | null;
};

/**
 * Le navigateur décide du meilleur format disponible. WebP est accepté
 * partout depuis 2020 et divise le poids par deux face au JPEG à qualité
 * équivalente ; on retombe sur le JPEG si `toBlob` le refuse.
 */
function pickOutputType(canvas: HTMLCanvasElement): { mime: string; extension: string } {
  const supportsWebp = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  return supportsWebp
    ? { mime: "image/webp", extension: "webp" }
    : { mime: "image/jpeg", extension: "jpg" };
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mime, quality);
  });
}

async function resizeTo(
  source: ImageBitmap,
  maxEdge: number,
  quality: number,
): Promise<ImageDerivative | null> {
  const scale = Math.min(1, maxEdge / Math.max(source.width, source.height));

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));

  const context = canvas.getContext("2d");
  if (!context) return null;

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, canvas.width, canvas.height);

  const { mime, extension } = pickOutputType(canvas);
  const blob = await canvasToBlob(canvas, mime, quality);
  if (!blob) return null;

  return { blob, contentType: mime, extension };
}

/**
 * Produit les dérivées d'un fichier image. Renvoie des dérivées nulles quand
 * le fichier n'est pas une image, quand le navigateur ne sait pas la décoder,
 * ou quand la réduction ne ferait rien gagner : l'appelant retombe alors sur
 * l'original, ce qui dégrade la performance mais jamais le résultat.
 */
export async function buildImageDerivatives(file: File): Promise<ImageDerivatives> {
  const empty: ImageDerivatives = { width: null, height: null, display: null, thumbnail: null };

  if (!file.type.startsWith("image/") || typeof createImageBitmap !== "function") {
    return empty;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return empty;
  }

  try {
    const [display, thumbnail] = await Promise.all([
      resizeTo(bitmap, DISPLAY_MAX_EDGE, DISPLAY_QUALITY),
      resizeTo(bitmap, THUMBNAIL_MAX_EDGE, THUMBNAIL_QUALITY),
    ]);

    return {
      width: bitmap.width,
      height: bitmap.height,
      // Une dérivée plus lourde que l'original n'a aucun intérêt : cela
      // arrive sur les captures d'écran PNG déjà petites.
      display: display && display.blob.size < file.size ? display : null,
      thumbnail,
    };
  } finally {
    bitmap.close();
  }
}
