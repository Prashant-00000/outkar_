import { Link } from 'react-router-dom';
import { JOB_CATEGORIES } from '@/lib/constants';

export function CategoriesSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="section-title">Popular Categories</h2>
          <p className="section-subtitle mx-auto">
            Browse through our most requested service categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {JOB_CATEGORIES.map((category) => {
            const IconComponent = category.icon;
            return (
              <Link
                key={category.id}
                to={`/browse?category=${category.id}`}
                className="category-card group"
              >
                <div className="category-icon">
                  <IconComponent className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
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
  );
}
