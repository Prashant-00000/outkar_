import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { JOB_CATEGORIES, type JobCategoryId } from '@/lib/constants';
import { Search, MapPin, Star, Clock, Filter, Loader2, CheckCircle2 } from 'lucide-react';

interface WorkerWithProfile {
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
  profiles: {
    full_name: string;
    avatar_url: string | null;
  } | null;
  worker_skills: {
    category: string;
  }[];
}

export default function BrowseWorkers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [workers, setWorkers] = useState<WorkerWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<JobCategoryId | ''>( 
    (searchParams.get('category') as JobCategoryId) || ''
  );
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchWorkers();
  }, [selectedCategory]);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      // Fetch worker profiles with skills
      const { data: workersData, error: workersError } = await supabase
        .from('worker_profiles')
        .select(`
          *,
          worker_skills (category)
        `)
        .eq('is_available', true);

      if (workersError) throw workersError;

      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url');

      if (profilesError) throw profilesError;

      // Map profiles by user_id for quick lookup
      const profilesMap = new Map(
        profilesData?.map((p) => [p.user_id, { full_name: p.full_name, avatar_url: p.avatar_url }]) || []
      );

      // Combine data
      let combinedData: WorkerWithProfile[] = (workersData || []).map((worker) => ({
        ...worker,
        profiles: profilesMap.get(worker.user_id) || null,
      }));

      // Filter by category if selected
      if (selectedCategory) {
        combinedData = combinedData.filter((worker) =>
          worker.worker_skills?.some((skill: { category: string }) => skill.category === selectedCategory)
        );
      }

      setWorkers(combinedData);
    } catch (error) {
      console.error('Error fetching workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: JobCategoryId | '') => {
    setSelectedCategory(category);
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  const filteredWorkers = workers.filter((worker) => {
    if (!searchQuery) return true;
    const name = worker.profiles?.full_name?.toLowerCase() || '';
    const city = worker.city?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return name.includes(query) || city.includes(query);
  });

  const getCategoryName = (categoryId: string) => {
    const category = JOB_CATEGORIES.find((c) => c.id === categoryId);
    return category?.name || categoryId;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Find Workers
            </h1>
            <p className="text-muted-foreground">
              Browse through our verified professionals and find the right person for your needs
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button
              variant="outline"
              className="h-12 gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Category Filters */}
          {showFilters && (
            <div className="mb-8 p-4 rounded-xl bg-card border border-border animate-fade-in">
              <h3 className="font-semibold mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryChange('')}
                >
                  All
                </Button>
                {JOB_CATEGORIES.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCategoryChange(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Results Count */}
          <p className="text-muted-foreground mb-6">
            {loading ? 'Loading...' : `${filteredWorkers.length} workers found`}
          </p>

          {/* Workers Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">No workers found matching your criteria</p>
              <Button variant="outline" onClick={() => handleCategoryChange('')}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkers.map((worker) => (
                <Link
                  key={worker.id}
                  to={`/worker/${worker.id}`}
                  className="worker-card block"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                        {worker.profiles?.full_name?.charAt(0) || 'W'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground truncate">
                            {worker.profiles?.full_name || 'Worker'}
                          </h3>
                          {worker.verified && (
                            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                          )}
                        </div>
                        {(worker.city || worker.state) && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {[worker.city, worker.state].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {worker.worker_skills?.slice(0, 3).map((skill) => (
                        <span key={skill.category} className="skill-tag">
                          {getCategoryName(skill.category)}
                        </span>
                      ))}
                      {worker.worker_skills && worker.worker_skills.length > 3 && (
                        <span className="skill-tag">+{worker.worker_skills.length - 3}</span>
                      )}
                    </div>

                    {/* Bio */}
                    {worker.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {worker.bio}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-4">
                        {worker.rating && worker.rating > 0 ? (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-accent fill-accent" />
                            <span className="font-medium text-foreground">
                              {worker.rating.toFixed(1)}
                            </span>
                            <span className="text-muted-foreground text-sm">
                              ({worker.total_reviews})
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">New</span>
                        )}
                        {worker.experience_years && worker.experience_years > 0 && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {worker.experience_years}y exp
                          </div>
                        )}
                      </div>
                      {worker.hourly_rate && (
                        <span className="font-semibold text-primary">
                          ₹{worker.hourly_rate}/hr
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
