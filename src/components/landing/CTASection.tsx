import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import outkarLogo from '@/assets/outkar-logo.jpeg';

export function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <img src={outkarLogo} alt="OutKar" className="w-16 h-16 rounded-2xl mx-auto mb-6 object-cover" />
          
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Get Started?
          </h2>
          
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Whether you're looking to hire or looking for work, 
            OutKar connects you with the right people.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="xl"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              asChild
            >
              <Link to="/browse">
                Find Workers
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              asChild
            >
              <Link to="/auth?mode=signup&role=worker">
                Join as Worker
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
