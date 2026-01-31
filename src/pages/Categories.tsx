import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Link } from 'react-router-dom';
import { JOB_CATEGORIES } from '@/lib/constants';

export default function Categories() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="py-16 md:py-24 bg-gradient-to-b from-primary/10 to-background">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                            Service Categories
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground">
                            Browse through our comprehensive list of service categories. Find skilled professionals for any job, from home repairs to specialized services.
                        </p>
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {JOB_CATEGORIES.map((category) => {
                            const IconComponent = category.icon;
                            return (
                                <Link
                                    key={category.id}
                                    to={`/browse?category=${category.id}`}
                                    className="category-card group h-full"
                                >
                                    <div className="category-icon">
                                        <IconComponent className="w-7 h-7 text-primary-foreground" />
                                    </div>
                                    <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                                        {category.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground text-center">
                                        {category.description}
                                    </p>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Info Section */}
            <section className="py-16 md:py-24 bg-muted/50">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
                            Why Choose Our Platform?
                        </h2>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-lg text-foreground mb-2">
                                    Verified Workers
                                </h3>
                                <p className="text-muted-foreground">
                                    All workers are thoroughly vetted and verified before joining our platform
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-lg text-foreground mb-2">
                                    Competitive Pricing
                                </h3>
                                <p className="text-muted-foreground">
                                    Compare prices and find the best value for your budget
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-lg text-foreground mb-2">
                                    Trusted Reviews
                                </h3>
                                <p className="text-muted-foreground">
                                    Read real reviews from verified customers to make informed decisions
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
