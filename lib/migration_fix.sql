-- ============================================
-- False App — Comments & Schema Fix
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Add 'content' column to comments if missing
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS content text;

-- 2. Ensure 'text' column exists or copy content to it if needed (optional)
-- If your app uses 'text', we can alias it, but post-detail uses 'content'.

-- 3. Verify 'posts' table columns again just in case
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS media_url text,
ADD COLUMN IF NOT EXISTS media_type text;

-- 4. Grant permissions (just in case)
GRANT ALL ON TABLE public.comments TO authenticated;
GRANT ALL ON TABLE public.comments TO anon;
GRANT ALL ON TABLE public.posts TO authenticated;
GRANT ALL ON TABLE public.posts TO anon;
