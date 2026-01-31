import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Search, UserCheck, Calendar, ThumbsUp } from 'lucide-react';

const steps = [
    {
        icon: Search,
        title: 'Search',
        description: 'Browse through our verified workers by category, location, or skill.',
        detailedDescription: 'Use our advanced search filters to find workers based on specific skills, experience level, location, and availability. Our platform makes it easy to narrow down your options.',
    },
    {
        icon: UserCheck,
        title: 'Compare',
        description: 'View profiles, ratings, reviews, and pricing to find your perfect match.',
        detailedDescription: 'Review detailed worker profiles including verified credentials, past work history, customer reviews, ratings, and competitive pricing. Make an informed decision with transparent information.',
    },
    {
        icon: Calendar,
        title: 'Hire',
        description: 'Send a hire request with your requirements and preferred schedule.',
        detailedDescription: 'Communicate directly with workers, discuss your project requirements, negotiate terms, and schedule appointments that work for both parties. Our secure messaging system keeps everything organized.',
    },
    {
        icon: ThumbsUp,
        title: 'Done',
        description: 'Get your work done by a trusted professional. Leave a review to help others.',
        detailedDescription: 'Once the job is completed, rate your experience and leave a review. Your feedback helps maintain quality standards and assists other customers in making the right choice.',
    },
];

export default function HowItWorks() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="py-16 md:py-24 bg-gradient-to-b from-primary/10 to-background">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                            How It Works
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground">
                            Hiring a skilled worker is simple and secure. Follow these four easy steps to connect with trusted professionals in your area.
                        </p>
                    </div>
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {steps.map((step, index) => {
                            const IconComponent = step.icon;
                            return (
                                <div
                                    key={step.title}
                                    className="flex gap-6 p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow"
                                >
                                    {/* Icon & Number */}
                                    <div className="flex-shrink-0">
                                        <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary">
                                            <IconComponent className="w-7 h-7 text-primary-foreground" />
                                            <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-accent-foreground text-sm font-bold flex items-center justify-center">
                                                {index + 1}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-2xl text-foreground mb-3">
                                            {step.title}
                                        </h3>
                                        <p className="text-muted-foreground font-medium mb-3">
                                            {step.description}
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                            {step.detailedDescription}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-24 bg-muted/50">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                            Ready to Get Started?
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            Join thousands of satisfied customers who have found reliable workers through our platform.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/browse"
                                className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
                            >
                                Browse Workers
                            </a>
                            <a
                                href="/auth"
                                className="px-8 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
                            >
                                Post a Job
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
