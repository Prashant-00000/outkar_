import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { JOB_CATEGORIES, type JobCategoryId } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  User,
  Briefcase,
  Settings,
  LogOut,
  Save,
  Eye,
  Clock,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Globe,
} from 'lucide-react';

interface Profile {
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
}

interface WorkerProfileData {
  id: string;
  bio: string | null;
  experience_years: number | null;
  hourly_rate: number | null;
  city: string | null;
  state: string | null;
  is_available: boolean | null;
}

interface HireRequest {
  id: string;
  message: string | null;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
}

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { translateTexts, isTranslating } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfileData | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [hireRequests, setHireRequests] = useState<HireRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'requests'>('profile');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      setError(null);
      console.log('Fetching profile for user:', user.id);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }

      if (profileData) {
        console.log('Profile data loaded:', profileData);
        setProfile(profileData);
        setFullName(profileData.full_name);
        setPhone(profileData.phone || '');
      } else {
        console.warn('No profile data found for user');
        setError('Profile not found. Please try refreshing the page.');
        return;
      }

      // If worker, fetch worker profile
      if (profileData?.role === 'worker') {
        const { data: workerData, error: workerError } = await supabase
          .from('worker_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (workerError) throw workerError;

        if (workerData) {
          setWorkerProfile(workerData);
          setBio(workerData.bio || '');
          setExperienceYears(workerData.experience_years?.toString() || '');
          setHourlyRate(workerData.hourly_rate?.toString() || '');
          setCity(workerData.city || '');
          setState(workerData.state || '');
          setIsAvailable(workerData.is_available ?? true);

          // Fetch skills
          const { data: skillsData } = await supabase
            .from('worker_skills')
            .select('category')
            .eq('worker_id', workerData.id);

          const skillCategories = skillsData?.map((s) => s.category) || [];
          setSkills(skillCategories);
          setSelectedSkills(skillCategories);

          // Fetch hire requests
          const { data: requestsData } = await supabase
            .from('hire_requests')
            .select(`
              id,
              message,
              status,
              created_at,
              profiles:customer_id (full_name)
            `)
            .eq('worker_id', workerData.id)
            .order('created_at', { ascending: false });

          setHireRequests(requestsData as unknown as HireRequest[] || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setLoading(true);
    fetchData();
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Prepare texts for translation
      const textsToTranslate = [
        { field: 'full_name', value: fullName },
      ];

      if (profile?.role === 'worker') {
        textsToTranslate.push(
          { field: 'bio', value: bio },
          { field: 'city', value: city },
          { field: 'state', value: state }
        );
      }

      // Translate all texts at once
      const translations = await translateTexts(textsToTranslate);

      // Map translations by field for easy access
      const translationMap = new Map(translations.map(t => [t.field, t]));

      const nameTranslation = translationMap.get('full_name');

      // Update profile with translation data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: nameTranslation?.translated || fullName,
          full_name_original: nameTranslation?.isTranslated ? fullName : null,
          full_name_language: nameTranslation?.detectedLanguage || null,
          phone: phone || null,
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // If worker, update worker profile with translations
      if (profile?.role === 'worker' && workerProfile) {
        const bioTranslation = translationMap.get('bio');
        const cityTranslation = translationMap.get('city');
        const stateTranslation = translationMap.get('state');

        const { error: workerError } = await supabase
          .from('worker_profiles')
          .update({
            bio: bioTranslation?.translated || bio || null,
            bio_original: bioTranslation?.isTranslated ? bio : null,
            bio_language: bioTranslation?.detectedLanguage || null,
            experience_years: experienceYears ? parseInt(experienceYears) : null,
            hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
            city: cityTranslation?.translated || city || null,
            city_original: cityTranslation?.isTranslated ? city : null,
            city_language: cityTranslation?.detectedLanguage || null,
            state: stateTranslation?.translated || state || null,
            state_original: stateTranslation?.isTranslated ? state : null,
            state_language: stateTranslation?.detectedLanguage || null,
            is_available: isAvailable,
          })
          .eq('user_id', user.id);

        if (workerError) throw workerError;

        // Update skills - delete existing and insert new
        await supabase
          .from('worker_skills')
          .delete()
          .eq('worker_id', workerProfile.id);

        if (selectedSkills.length > 0) {
          const skillsToInsert = selectedSkills.map((skill) => ({
            worker_id: workerProfile.id,
            category: skill as JobCategoryId,
          }));

          const { error: skillsError } = await supabase
            .from('worker_skills')
            .insert(skillsToInsert);

          if (skillsError) throw skillsError;
        }
      }

      toast({
        title: 'Profile Updated',
        description: 'Your changes have been saved successfully.',
      });

      fetchData();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('hire_requests')
        .update({ status: action })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: action === 'accepted' ? 'Request Accepted' : 'Request Declined',
        description: action === 'accepted'
          ? 'The customer has been notified.'
          : 'The request has been declined.',
      });

      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((s) => s !== skillId)
        : [...prev, skillId]
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Show error state with retry option
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="card-elevated p-8">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  {error || 'Unable to Load Profile'}
                </h2>
                <p className="text-muted-foreground mb-6">
                  We couldn't load your profile data. This might be a temporary issue.
                </p>
                <div className="space-y-3">
                  <Button onClick={handleRetry} className="w-full">
                    <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>
                {retryCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-4">
                    Retry attempts: {retryCount}
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isWorker = profile.role === 'worker';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card-elevated p-6 sticky top-24">
                {/* User Info */}
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl mx-auto mb-4">
                    {fullName.charAt(0)}
                  </div>
                  <h2 className="font-semibold text-foreground">{fullName}</h2>
                  <p className="text-sm text-muted-foreground capitalize">{profile.role}</p>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'profile'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary text-foreground'
                      }`}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  {isWorker && (
                    <button
                      onClick={() => setActiveTab('requests')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'requests'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-secondary text-foreground'
                        }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Hire Requests
                      {hireRequests.filter((r) => r.status === 'pending').length > 0 && (
                        <span className="ml-auto bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full">
                          {hireRequests.filter((r) => r.status === 'pending').length}
                        </span>
                      )}
                    </button>
                  )}
                  {isWorker && workerProfile && (
                    <Link
                      to={`/worker/${workerProfile.id}`}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary text-foreground transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Public Profile
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'profile' ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
                    <Button onClick={handleSaveProfile} disabled={saving || isTranslating}>
                      {saving || isTranslating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {isTranslating ? 'Translating...' : 'Save Changes'}
                    </Button>
                  </div>

                  {/* Basic Info */}
                  <div className="card-elevated p-6">
                    <h2 className="font-semibold text-lg mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={profile.email}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Worker Profile */}
                  {isWorker && (
                    <>
                      <div className="card-elevated p-6">
                        <h2 className="font-semibold text-lg mb-4">Professional Details</h2>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                              id="bio"
                              value={bio}
                              onChange={(e) => setBio(e.target.value)}
                              placeholder="Tell customers about yourself, your experience, and what makes you great... (You can type in any Indian language)"
                              rows={4}
                            />
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              You can write in Hindi, Kannada, Telugu, Tamil, or any Indian language
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="experience">Years of Experience</Label>
                              <Input
                                id="experience"
                                type="number"
                                value={experienceYears}
                                onChange={(e) => setExperienceYears(e.target.value)}
                                placeholder="e.g. 5"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="rate">Hourly Rate (₹)</Label>
                              <Input
                                id="rate"
                                type="number"
                                value={hourlyRate}
                                onChange={(e) => setHourlyRate(e.target.value)}
                                placeholder="e.g. 500"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="city">City</Label>
                              <Input
                                id="city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Enter city"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="state">State</Label>
                              <Input
                                id="state"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                placeholder="Enter state"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id="available"
                              checked={isAvailable}
                              onChange={(e) => setIsAvailable(e.target.checked)}
                              className="w-4 h-4 rounded border-border"
                            />
                            <Label htmlFor="available" className="cursor-pointer">
                              Available for hire
                            </Label>
                          </div>
                        </div>
                      </div>

                      <div className="card-elevated p-6">
                        <h2 className="font-semibold text-lg mb-4">Skills & Services</h2>
                        <p className="text-muted-foreground text-sm mb-4">
                          Select the services you offer
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {JOB_CATEGORIES.map((category) => (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => toggleSkill(category.id)}
                              className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${selectedSkills.includes(category.id)
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border hover:border-primary/50 text-foreground'
                                }`}
                            >
                              {category.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-foreground">Hire Requests</h1>

                  {hireRequests.length === 0 ? (
                    <div className="card-elevated p-12 text-center">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No hire requests yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {hireRequests.map((request) => (
                        <div key={request.id} className="card-elevated p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-foreground">
                                {request.profiles?.full_name || 'Customer'}
                              </h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(request.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${request.status === 'pending'
                                ? 'bg-accent/10 text-accent'
                                : request.status === 'accepted'
                                  ? 'bg-success/10 text-success'
                                  : 'bg-destructive/10 text-destructive'
                                }`}
                            >
                              {request.status}
                            </span>
                          </div>

                          {request.message && (
                            <p className="text-muted-foreground mb-4">{request.message}</p>
                          )}

                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleRequestAction(request.id, 'accepted')}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRequestAction(request.id, 'rejected')}
                              >
                                <XCircle className="w-4 h-4" />
                                Decline
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
