-- ============================================
-- False App — Media & Storage Migration
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Add media columns to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS media_url text,
ADD COLUMN IF NOT EXISTS media_type text;

-- 2. Create storage buckets
-- This ensures 'avatars' and 'post-media' buckets exist and are public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/*']), -- 5MB limit
    ('post-media', 'post-media', true, 52428800, ARRAY['image/*', 'video/*']) -- 50MB limit
ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Just in case policies were missed, here are the simplified storage policies again
-- (It's safe to run these even if they exist, but normally setup.sql handled them)

-- Allow public access to all files in these buckets
CREATE POLICY "Public Access" ON storage.objects FOR SELECT
USING ( bucket_id IN ('avatars', 'post-media') );

-- Allow authenticated uploads
CREATE POLICY "Authenticated Uploads" ON storage.objects FOR INSERT
WITH CHECK ( bucket_id IN ('avatars', 'post-media') AND auth.role() = 'authenticated' );

-- Allow owners to update/delete their own files (optional specific logic, but simplified here)
-- Note: You might see "Policy already exists" errors for these if setup.sql ran. That is fine.
