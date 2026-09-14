-- Memora: close any previously public event-photos bucket.
-- Run this once in the Supabase SQL editor, after 007_photo_author_visibility.sql.

update storage.buckets
set public = false
where id = 'event-photos';
