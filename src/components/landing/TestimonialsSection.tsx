import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Homeowner',
    content: 'Found an amazing cook through OutKar. The whole process was smooth and the verification gave me peace of mind.',
    rating: 5,
    avatar: 'PS',
  },
  {
    name: 'Rajesh Kumar',
    role: 'Business Owner',
    content: 'We hired 3 drivers for our delivery business. The quality of workers and their professionalism exceeded our expectations.',
    rating: 5,
    avatar: 'RK',
  },
  {
    name: 'Anita Desai',
    role: 'Working Professional',
    content: 'As a working mom, finding reliable household help was always stressful. OutKar made it incredibly easy.',
    rating: 5,
    avatar: 'AD',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="section-title">What Our Users Say</h2>
          <p className="section-subtitle mx-auto">
            Join thousands of satisfied hirers and workers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="card-elevated p-6 relative"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/10" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="rating-star" />
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground mb-6">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
