-- ==========================================
-- Instagram Post Generator - Supabase Schema
-- ==========================================

-- 1) PROFILES TABLE
-- Storing Brand Context (Target Audience, Voice, etc.)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  brand_name TEXT DEFAULT '',
  target_audience TEXT DEFAULT '',
  brand_voice_rules TEXT DEFAULT '',
  forbidden_words TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create Policies for Profiles
CREATE POLICY "Users can only read their own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2) POSTS TABLE
-- Storing Historical and Scheduled Generations
CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  price TEXT,
  tone TEXT,
  objective TEXT,
  content TEXT NOT NULL,         -- Structured stringified JSON payload
  status TEXT DEFAULT 'draft',   -- 'draft', 'scheduled', 'published'
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Optimization Indexes
CREATE INDEX idx_posts_user_status_created ON public.posts(user_id, status, created_at DESC);
CREATE INDEX idx_posts_user_status_scheduled ON public.posts(user_id, status, scheduled_at ASC);

-- Enable Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create Policies for Posts
CREATE POLICY "Users can only read their own posts" 
ON public.posts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own posts" 
ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- 3) AUTOMATIC PROFILE CREATION TRIGGER
-- When a user signs up on the app, automatically initialize an empty Profile row.
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
