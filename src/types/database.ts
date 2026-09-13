export type GlobalRole = "user" | "super_admin";
export type AccountStatus = "active" | "blocked";
export type EventStatus = "DRAFT" | "ACTIVE" | "CLOSED" | "ARCHIVED";
export type EventMemberRole = "participant" | "organizer";
export type EventMemberStatus = "pending" | "active" | "blocked" | "removed";
export type PhotoStatus = "uploading" | "processing" | "ready" | "failed" | "deleted";

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  email?: string | null;
  global_role: GlobalRole;
  account_status: AccountStatus;
  created_at: string;
  updated_at: string;
}

export interface EventRecord {
  id: string;
  name: string;
  slug: string;
  event_type: string;
  description: string;
  event_date: string;
  timezone: string;
  cover_image_path?: string | null;
  bucket_name: string;
  status: EventStatus;
  registration_enabled: boolean;
  upload_enabled: boolean;
  download_enabled: boolean;
  storage_limit_bytes: number;
  max_file_size_bytes: number;
  max_files_per_upload: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface EventInvite {
  id: string;
  event_id: string;
  code: string;
  is_active: boolean;
  expires_at: string | null;
  max_uses: number | null;
  current_uses: number;
  approval_required: boolean;
  created_at: string;
  created_by: string;
  disabled_at?: string | null;
}

export interface EventMember {
  id: string;
  event_id: string;
  user_id: string;
  role: EventMemberRole;
  status: EventMemberStatus;
  joined_at: string;
  joined_via: "invite" | "admin";
  invite_id?: string | null;
}

export interface PhotoRecord {
  id: string;
  event_id: string;
  user_id: string;
  original_filename: string;
  stored_filename: string;
  storage_original_path: string;
  storage_display_path: string;
  storage_thumbnail_path: string;
  mime_type: string;
  file_size: number;
  width?: number | null;
  height?: number | null;
  checksum: string;
  captured_at?: string | null;
  uploaded_at?: string | null;
  status: PhotoStatus;
  error_code?: string | null;
  deleted_at?: string | null;
  deleted_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_user_id: string;
  event_id?: string | null;
  action: string;
  resource_type?: string | null;
  resource_id?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile };
      events: { Row: EventRecord };
      event_invites: { Row: EventInvite };
      event_members: { Row: EventMember };
      photos: { Row: PhotoRecord };
      audit_logs: { Row: AuditLog };
    };
  };
}
