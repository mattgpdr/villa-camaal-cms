import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Testimonial } from '@/types/supabase';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .eq('visible', true);

        if (error) throw error;
        setTestimonials(data || []);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      }
    };

    fetchTestimonials();
  }, []);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <section id="testimonials" className="py-20 md:py-32 bg-muted/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-up">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-primary font-bold text-foreground mb-6">
            Avis de nos clients
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Ce qu'ils pensent de leur séjour
          </p>
        </div>

        {testimonials.length > 0 ? (
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="flex-[0_0_100%] min-w-0 px-4">
                    <div className="card-luxury p-8 md:p-12 text-center animate-fade-up">
                      <Quote className="w-12 h-12 text-primary mx-auto mb-6 opacity-50" />
                      <div className="flex justify-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < testimonial.rating
                                ? 'text-primary fill-primary'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-lg md:text-xl text-foreground/80 font-secondary italic mb-8 leading-relaxed">
                        "{testimonial.comment}"
                      </p>
                      <div>
                        <p className="font-primary font-bold text-xl text-foreground">
                          {testimonial.author_name}
                        </p>
                        {testimonial.author_location && (
                          <p className="text-muted-foreground font-secondary">
                            {testimonial.author_location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {testimonials.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollPrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Les témoignages seront bientôt disponibles</p>
          </div>
        )}
      </div>
    </section>
  );
}
