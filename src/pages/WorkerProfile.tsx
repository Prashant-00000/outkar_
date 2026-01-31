import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { JOB_CATEGORIES } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import {
  MapPin,
  Star,
  Clock,
  CheckCircle2,
  Calendar,
  Briefcase,
  MessageSquare,
  ArrowLeft,
  Loader2,
  Globe,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface WorkerProfile {
  id: string;
  user_id: string;
  bio: string | null;
  experience_years: number | null;
  hourly_rate: number | null;
  city: string | null;
  state: string | null;
  is_available: boolean | null;
  verified: boolean | null;
  rating: number | null;
  total_reviews: number | null;
  total_jobs_completed: number | null;
  created_at: string;
}

interface Profile {
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
}

export default function WorkerProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { translateSingle, isTranslating } = useTranslation();
  const { toast } = useToast();
  
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [hireDialogOpen, setHireDialogOpen] = useState(false);
  const [hireMessage, setHireMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (id) {
      fetchWorkerProfile();
    }
  }, [id]);

  const fetchWorkerProfile = async () => {
    try {
      // Fetch worker profile
      const { data: workerData, error: workerError } = await supabase
        .from('worker_profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (workerError) throw workerError;
      if (!workerData) {
        setLoading(false);
        return;
      }

      setWorker(workerData);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, phone')
        .eq('user_id', workerData.user_id)
        .maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch skills
      const { data: skillsData, error: skillsError } = await supabase
        .from('worker_skills')
        .select('category')
        .eq('worker_id', id);

      if (skillsError) throw skillsError;
      setSkills(skillsData?.map((s) => s.category) || []);

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          profiles:customer_id (full_name)
        `)
        .eq('worker_id', id)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      setReviews(reviewsData as unknown as Review[] || []);
    } catch (error) {
      console.error('Error fetching worker:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHireRequest = async () => {
    if (!user || !worker) return;

    setSending(true);
    try {
      // Translate the message if it's in an Indian language
      const translation = await translateSingle('message', hireMessage);
      
      const translatedMessage = translation?.translated || hireMessage;
      const originalMessage = translation?.isTranslated ? hireMessage : null;
      const detectedLanguage = translation?.detectedLanguage || null;

      const { error } = await supabase.from('hire_requests').insert({
        worker_id: worker.id,
        customer_id: user.id,
        message: translatedMessage,
        message_original: originalMessage,
        message_language: detectedLanguage,
      });

      if (error) throw error;

      toast({
        title: 'Request Sent!',
        description: 'Your hire request has been sent to the worker.',
      });
      setHireDialogOpen(false);
      setHireMessage('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send hire request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = JOB_CATEGORIES.find((c) => c.id === categoryId);
    return category?.name || categoryId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!worker || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 text-center">
          <h1 className="text-2xl font-bold mb-4">Worker Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The worker profile you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link to="/browse">Browse Workers</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Browse
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Header */}
              <div className="card-elevated p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl flex-shrink-0">
                    {profile.full_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl font-bold text-foreground">
                        {profile.full_name}
                      </h1>
                      {worker.verified && (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      )}
                    </div>
                    {(worker.city || worker.state) && (
                      <p className="text-muted-foreground flex items-center gap-1 mb-4">
                        <MapPin className="w-4 h-4" />
                        {[worker.city, worker.state].filter(Boolean).join(', ')}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4">
                      {worker.rating && worker.rating > 0 && (
                        <div className="stat-badge">
                          <Star className="w-4 h-4 fill-current" />
                          {worker.rating.toFixed(1)} ({worker.total_reviews} reviews)
                        </div>
                      )}
                      {worker.experience_years && worker.experience_years > 0 && (
                        <div className="stat-badge">
                          <Clock className="w-4 h-4" />
                          {worker.experience_years} years experience
                        </div>
                      )}
                      {worker.total_jobs_completed && worker.total_jobs_completed > 0 && (
                        <div className="stat-badge">
                          <Briefcase className="w-4 h-4" />
                          {worker.total_jobs_completed} jobs completed
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {worker.bio && (
                <div className="card-elevated p-6">
                  <h2 className="font-semibold text-lg mb-3">About</h2>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {worker.bio}
                  </p>
                </div>
              )}

              {/* Skills */}
              <div className="card-elevated p-6">
                <h2 className="font-semibold text-lg mb-3">Skills & Services</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span key={skill} className="skill-tag">
                      {getCategoryName(skill)}
                    </span>
                  ))}
                  {skills.length === 0 && (
                    <p className="text-muted-foreground">No skills listed yet</p>
                  )}
                </div>
              </div>

              {/* Reviews */}
              <div className="card-elevated p-6">
                <h2 className="font-semibold text-lg mb-4">
                  Reviews ({reviews.length})
                </h2>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                              {review.profiles?.full_name?.charAt(0) || 'U'}
                            </div>
                            <span className="font-medium text-foreground">
                              {review.profiles?.full_name || 'Anonymous'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'text-accent fill-accent'
                                    : 'text-muted'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-muted-foreground">{review.comment}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No reviews yet</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Hire Card */}
              <div className="card-elevated p-6 sticky top-24">
                <div className="mb-6">
                  {worker.hourly_rate ? (
                    <>
                      <span className="text-3xl font-bold text-foreground">
                        ₹{worker.hourly_rate}
                      </span>
                      <span className="text-muted-foreground">/hour</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Rate negotiable</span>
                  )}
                </div>

                {worker.is_available ? (
                  <div className="availability-available mb-6">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    Available for hire
                  </div>
                ) : (
                  <div className="availability-unavailable mb-6">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                    Currently unavailable
                  </div>
                )}

                {user ? (
                  <Dialog open={hireDialogOpen} onOpenChange={setHireDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg" disabled={!worker.is_available}>
                        <MessageSquare className="w-4 h-4" />
                        Send Hire Request
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Hire {profile.full_name}</DialogTitle>
                        <DialogDescription>
                          Send a message describing your requirements
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Describe your job requirements, preferred schedule, location, etc... You can type in Hindi, Kannada, Telugu, Tamil, or any Indian language."
                          value={hireMessage}
                          onChange={(e) => setHireMessage(e.target.value)}
                          rows={5}
                        />
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          You can write in any Indian language - it will be translated automatically
                        </p>
                        <Button
                          className="w-full"
                          onClick={handleHireRequest}
                          disabled={sending || isTranslating || !hireMessage.trim()}
                        >
                          {(sending || isTranslating) && <Loader2 className="w-4 h-4 animate-spin" />}
                          {isTranslating ? 'Translating...' : 'Send Request'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button className="w-full" size="lg" asChild>
                    <Link to="/auth">Sign in to Hire</Link>
                  </Button>
                )}

                <p className="text-center text-sm text-muted-foreground mt-4">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Member since {new Date(worker.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
