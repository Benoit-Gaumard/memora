import type {
  EventInvite,
  EventMember,
  EventRecord,
  PhotoRecord,
  Profile,
} from "@/types/database";

export const demoUser: Profile = {
  id: "user_123",
  username: "paulmartin",
  display_name: "Paul Martin",
  email: "paul@memora.app",
  global_role: "user",
  account_status: "active",
  created_at: "2025-02-04T10:00:00.000Z",
  updated_at: "2025-02-04T10:00:00.000Z",
};

export const demoEvents: EventRecord[] = [
  {
    id: "event_1",
    name: "Weekend à Lyon",
    slug: "weekend-lyon",
    event_type: "Voyage",
    description: "Photos du week-end en famille et entre amis.",
    event_date: "2027-06-18T18:30:00.000Z",
    timezone: "Europe/Paris",
    cover_image_path: "/images/cover-lyon.jpg",
    bucket_name: "event_8d6f4e12",
    status: "ACTIVE",
    registration_enabled: true,
    upload_enabled: true,
    download_enabled: true,
    storage_limit_bytes: 1000000000,
    max_file_size_bytes: 25000000,
    max_files_per_upload: 50,
    created_by: demoUser.id,
    created_at: "2026-01-15T11:00:00.000Z",
    updated_at: "2026-01-15T11:00:00.000Z",
    deleted_at: null,
  },
  {
    id: "event_2",
    name: "Anniversaire Emma",
    slug: "anniversaire-emma",
    event_type: "Anniversaire",
    description: "Soirée anniversaire avec portrait et détails de la table.",
    event_date: "2027-07-03T19:00:00.000Z",
    timezone: "Europe/Paris",
    cover_image_path: "/images/cover-emma.jpg",
    bucket_name: "event_4cfb12aa",
    status: "ACTIVE",
    registration_enabled: true,
    upload_enabled: true,
    download_enabled: true,
    storage_limit_bytes: 500000000,
    max_file_size_bytes: 25000000,
    max_files_per_upload: 20,
    created_by: demoUser.id,
    created_at: "2026-03-12T09:00:00.000Z",
    updated_at: "2026-03-12T09:00:00.000Z",
    deleted_at: null,
  },
];

export const demoInvites: EventInvite[] = [
  {
    id: "invite_1",
    event_id: "event_1",
    code: "AB7KQ2",
    is_active: true,
    expires_at: "2030-12-31T00:00:00.000Z",
    max_uses: 50,
    current_uses: 12,
    approval_required: false,
    created_at: "2026-01-15T11:00:00.000Z",
    created_by: demoUser.id,
    disabled_at: null,
  },
  {
    id: "invite_2",
    event_id: "event_2",
    code: "MEMORA",
    is_active: true,
    expires_at: "2030-12-31T00:00:00.000Z",
    max_uses: 30,
    current_uses: 8,
    approval_required: false,
    created_at: "2026-03-12T09:00:00.000Z",
    created_by: demoUser.id,
    disabled_at: null,
  },
];

export const demoMembers: EventMember[] = [
  {
    id: "member_1",
    event_id: "event_1",
    user_id: demoUser.id,
    role: "organizer",
    status: "active",
    joined_at: "2026-01-15T12:00:00.000Z",
    joined_via: "invite",
    invite_id: "invite_1",
  },
  {
    id: "member_2",
    event_id: "event_2",
    user_id: demoUser.id,
    role: "participant",
    status: "active",
    joined_at: "2026-03-12T09:30:00.000Z",
    joined_via: "invite",
    invite_id: "invite_2",
  },
];

export const demoPhotos: PhotoRecord[] = [
  {
    id: "photo_1",
    event_id: "event_1",
    user_id: demoUser.id,
    original_filename: "lyon-001.jpg",
    stored_filename: "lyon-001.jpg",
    storage_original_path: "photos/photo_1/original.jpg",
    storage_display_path: "photos/photo_1/display.webp",
    storage_thumbnail_path: "photos/photo_1/thumbnail.webp",
    mime_type: "image/jpeg",
    file_size: 2812400,
    width: 4032,
    height: 3024,
    checksum: "sha256_1",
    captured_at: "2027-06-18T21:36:00.000Z",
    uploaded_at: "2027-06-18T22:00:00.000Z",
    status: "ready",
    error_code: null,
    deleted_at: null,
    deleted_by: null,
    created_at: "2027-06-18T22:00:00.000Z",
    updated_at: "2027-06-18T22:00:00.000Z",
  },
  {
    id: "photo_2",
    event_id: "event_1",
    user_id: demoUser.id,
    original_filename: "lyon-002.jpg",
    stored_filename: "lyon-002.jpg",
    storage_original_path: "photos/photo_2/original.jpg",
    storage_display_path: "photos/photo_2/display.webp",
    storage_thumbnail_path: "photos/photo_2/thumbnail.webp",
    mime_type: "image/jpeg",
    file_size: 2448000,
    width: 4000,
    height: 3000,
    checksum: "sha256_2",
    captured_at: "2027-06-19T09:12:00.000Z",
    uploaded_at: "2027-06-19T09:30:00.000Z",
    status: "ready",
    error_code: null,
    deleted_at: null,
    deleted_by: null,
    created_at: "2027-06-19T09:30:00.000Z",
    updated_at: "2027-06-19T09:30:00.000Z",
  },
  {
    id: "photo_3",
    event_id: "event_2",
    user_id: demoUser.id,
    original_filename: "emma-001.png",
    stored_filename: "emma-001.png",
    storage_original_path: "photos/photo_3/original.png",
    storage_display_path: "photos/photo_3/display.webp",
    storage_thumbnail_path: "photos/photo_3/thumbnail.webp",
    mime_type: "image/png",
    file_size: 3202000,
    width: 2560,
    height: 1920,
    checksum: "sha256_3",
    captured_at: "2027-07-03T20:15:00.000Z",
    uploaded_at: "2027-07-03T20:45:00.000Z",
    status: "ready",
    error_code: null,
    deleted_at: null,
    deleted_by: null,
    created_at: "2027-07-03T20:45:00.000Z",
    updated_at: "2027-07-03T20:45:00.000Z",
  },
];

export function getInvitationByCode(code: string) {
  return demoInvites.find((invite) => invite.code.toLowerCase() === code.toLowerCase());
}

export function getEventBySlug(slug: string) {
  return demoEvents.find((event) => event.slug === slug);
}

export function getMemberEvents(userId: string) {
  return demoEvents.filter((event) =>
    demoMembers.some(
      (member) =>
        member.user_id === userId && member.event_id === event.id && member.status === "active",
    ),
  );
}

export function getEventPhotos(eventId: string) {
  return demoPhotos.filter((photo) => photo.event_id === eventId && photo.status === "ready");
}

export function getPhotoById(photoId: string) {
  return demoPhotos.find((photo) => photo.id === photoId);
}

export function countPhotosForEvent(eventId: string) {
  return demoPhotos.filter(
    (photo) => photo.event_id === eventId && photo.status === "ready",
  ).length;
}
