-- Add translation fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name_original TEXT,
ADD COLUMN IF NOT EXISTS full_name_language TEXT;

-- Add translation fields to worker_profiles table
ALTER TABLE public.worker_profiles 
ADD COLUMN IF NOT EXISTS bio_original TEXT,
ADD COLUMN IF NOT EXISTS bio_language TEXT,
ADD COLUMN IF NOT EXISTS city_original TEXT,
ADD COLUMN IF NOT EXISTS city_language TEXT,
ADD COLUMN IF NOT EXISTS state_original TEXT,
ADD COLUMN IF NOT EXISTS state_language TEXT;

-- Add translation fields to hire_requests table
ALTER TABLE public.hire_requests 
ADD COLUMN IF NOT EXISTS message_original TEXT,
ADD COLUMN IF NOT EXISTS message_language TEXT;

-- Add translation fields to reviews table
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS comment_original TEXT,
ADD COLUMN IF NOT EXISTS comment_language TEXT;

-- Add index for faster language-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_language ON public.profiles(full_name_language);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_bio_language ON public.worker_profiles(bio_language);
CREATE INDEX IF NOT EXISTS idx_hire_requests_language ON public.hire_requests(message_language);
CREATE INDEX IF NOT EXISTS idx_reviews_language ON public.reviews(comment_language);