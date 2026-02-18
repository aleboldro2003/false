-- ============================================
-- False App — Supabase Database Setup
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================
-- Your tables already exist. This script adds:
--   1. Auto-profile creation on signup
--   2. Row Level Security policies for ALL tables
--   3. Storage policies for avatars & post-media
--   4. Indexes for performance
--   5. Sample podcasts

-- ─── 1. Auto-create profile when a new user signs up ───

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 2. Row Level Security ─────────────────────────────

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
CREATE POLICY "Posts are viewable by everyone"
    ON posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON posts;
CREATE POLICY "Authenticated users can insert posts"
    ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
CREATE POLICY "Users can delete own posts"
    ON posts FOR DELETE USING (auth.uid() = author_id);

-- Podcasts
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Podcasts are viewable by everyone" ON podcasts;
CREATE POLICY "Podcasts are viewable by everyone"
    ON podcasts FOR SELECT USING (true);

-- Comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
CREATE POLICY "Comments are viewable by everyone"
    ON comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON comments;
CREATE POLICY "Authenticated users can insert comments"
    ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Likes
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON likes;
CREATE POLICY "Likes are viewable by everyone"
    ON likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert own likes" ON likes;
CREATE POLICY "Users can insert own likes"
    ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own likes" ON likes;
CREATE POLICY "Users can delete own likes"
    ON likes FOR DELETE USING (auth.uid() = user_id);

-- Follows
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON follows;
CREATE POLICY "Follows are viewable by everyone"
    ON follows FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert own follows" ON follows;
CREATE POLICY "Users can insert own follows"
    ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
DROP POLICY IF EXISTS "Users can delete own follows" ON follows;
CREATE POLICY "Users can delete own follows"
    ON follows FOR DELETE USING (auth.uid() = follower_id);

-- ─── 3. Storage Policies ───────────────────────────────
-- Run these ONLY if you've created the 'avatars' and 'post-media' buckets

-- Avatars: anyone can view, owner can upload/update
CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Post media: anyone can view, authenticated users can upload
CREATE POLICY "Post media is publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'post-media');

CREATE POLICY "Authenticated users can upload post media"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'post-media' AND auth.role() = 'authenticated');

-- ─── 4. Indexes ────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- ─── 5. Seed sample podcasts ──────────────────────────

INSERT INTO podcasts (title, artist, cover_url, duration, views) VALUES
    ('React Native in 2026', 'Tech Deep Dive', 'https://picsum.photos/seed/rn2026/800/450', '55:47', '890K views'),
    ('The Art of Minimalism in UI', 'Design Weekly', 'https://picsum.photos/seed/minui/800/450', '42:15', '1.2M views'),
    ('Building Startups Solo', 'Indie Hackers Pod', 'https://picsum.photos/seed/startup/800/450', '1:08:30', '456K views')
ON CONFLICT DO NOTHING;
