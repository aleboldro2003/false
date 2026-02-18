-- Add banner_url to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Ensure storage bucket 'banners' exists (or use existing 'post-media' or 'avatars' with folder)
-- We'll reusing 'avatars' bucket for user-related images to simplify policies, 
-- or create a new 'banners' bucket. 
-- Let's use 'avatars' bucket, storing as `banners/{user_id}/...`

-- If we need a separate bucket 'banners':
INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true) 
ON CONFLICT (id) DO NOTHING;

-- Policies for banners bucket
CREATE POLICY "Banner images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'banners');

CREATE POLICY "Users can upload their own banner"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'banners' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own banner"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);
