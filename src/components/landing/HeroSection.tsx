import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Shield, Star, Users } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="hero-gradient pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <Shield className="w-4 h-4" />
            Trusted by 50,000+ households
          </div>

          {/* Headline */}
          <h1 className="hero-title mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Find Trusted Workers
            <br />
            <span className="text-primary">For Every Job</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Connect with verified cooks, cleaners, drivers, plumbers, and more on OutKar. 
            Hire skilled professionals with confidence.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Button variant="hero" size="xl" asChild>
              <Link to="/browse">
                <Search className="w-5 h-5" />
                Find Workers
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/auth?mode=signup&role=worker">
                Join as Worker
              </Link>
            </Button>
          </div>

          {/* Trust Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">10,000+</strong> Verified Workers
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-accent fill-accent" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">4.8</strong> Average Rating
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-success" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">100%</strong> Background Checked
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
