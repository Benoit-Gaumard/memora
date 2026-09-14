export const PRIVATE_PHOTO_ROUTE = "/api/private-photo";

export function getPrivatePhotoUrl(storagePath: string): string {
  return `${PRIVATE_PHOTO_ROUTE}?path=${encodeURIComponent(storagePath)}`;
}
