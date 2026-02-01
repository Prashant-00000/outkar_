-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('worker', 'customer');

-- Create enum for job categories
CREATE TYPE public.job_category AS ENUM ('cook', 'cleaner', 'driver', 'plumber', 'electrician', 'gardener', 'painter', 'carpenter', 'babysitter', 'caretaker');

-- Create profiles table for basic user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create worker_profiles table for worker-specific information
CREATE TABLE public.worker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10,2),
  city TEXT,
  state TEXT,
  is_available BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_jobs_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create skills table for worker skills
CREATE TABLE public.worker_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES public.worker_profiles(id) ON DELETE CASCADE NOT NULL,
  category job_category NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(worker_id, category)
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES public.worker_profiles(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hire_requests table
CREATE TABLE public.hire_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES public.worker_profiles(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hire_requests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Worker profiles policies
CREATE POLICY "Worker profiles are viewable by everyone" ON public.worker_profiles FOR SELECT USING (true);
CREATE POLICY "Workers can insert their own profile" ON public.worker_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Workers can update their own profile" ON public.worker_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Worker skills policies
CREATE POLICY "Worker skills are viewable by everyone" ON public.worker_skills FOR SELECT USING (true);
CREATE POLICY "Workers can manage their skills" ON public.worker_skills FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.worker_profiles WHERE id = worker_id AND user_id = auth.uid())
);
CREATE POLICY "Workers can delete their skills" ON public.worker_skills FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.worker_profiles WHERE id = worker_id AND user_id = auth.uid())
);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Customers can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Hire requests policies
CREATE POLICY "Workers can view their hire requests" ON public.hire_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.worker_profiles WHERE id = worker_id AND user_id = auth.uid())
  OR customer_id = auth.uid()
);
CREATE POLICY "Customers can create hire requests" ON public.hire_requests FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Workers can update hire request status" ON public.hire_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.worker_profiles WHERE id = worker_id AND user_id = auth.uid())
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_worker_profiles_updated_at BEFORE UPDATE ON public.worker_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hire_requests_updated_at BEFORE UPDATE ON public.hire_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update worker rating when review is added
CREATE OR REPLACE FUNCTION public.update_worker_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.worker_profiles
  SET 
    rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM public.reviews WHERE worker_id = NEW.worker_id),
    total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE worker_id = NEW.worker_id)
  WHERE id = NEW.worker_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_rating_on_review AFTER INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_worker_rating();