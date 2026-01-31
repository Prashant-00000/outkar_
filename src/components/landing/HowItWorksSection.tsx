import { Search, UserCheck, Calendar, ThumbsUp } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Search',
    description: 'Browse through our verified workers by category, location, or skill.',
  },
  {
    icon: UserCheck,
    title: 'Compare',
    description: 'View profiles, ratings, reviews, and pricing to find your perfect match.',
  },
  {
    icon: Calendar,
    title: 'Hire',
    description: 'Send a hire request with your requirements and preferred schedule.',
  },
  {
    icon: ThumbsUp,
    title: 'Done',
    description: 'Get your work done by a trusted professional. Leave a review to help others.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle mx-auto">
            Hiring a skilled worker is simple and secure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative text-center"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
              )}

              {/* Step Number & Icon */}
              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
                <step.icon className="w-7 h-7 text-primary-foreground" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-accent-foreground text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </span>
              </div>

              <h3 className="font-semibold text-lg text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
