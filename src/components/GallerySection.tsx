import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GalleryImage } from '@/types/supabase';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function GallerySection() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery_images')
          .select('*')
          .eq('visible', true)
          .order('display_order');

        if (error) throw error;
        setImages(data || []);
      } catch (error) {
        console.error('Error fetching gallery images:', error);
      }
    };

    fetchImages();
  }, []);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <section id="gallery" className="py-20 md:py-32 bg-muted/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-up">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-primary font-bold text-foreground mb-6">
            Galerie
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez notre villa en images
          </p>
        </div>

        {images.length > 0 ? (
          <div className="relative max-w-6xl mx-auto">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="flex-[0_0_100%] md:flex-[0_0_80%] lg:flex-[0_0_70%] min-w-0 px-4"
                  >
                    <div className="card-luxury overflow-hidden animate-fade-up" style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={image.image_url}
                          alt={image.title || `Gallery image ${index + 1}`}
                          className="w-full h-full object-cover hover-scale"
                        />
                        {image.title && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                            <h3 className="text-white text-xl md:text-2xl font-primary font-bold">
                              {image.title}
                            </h3>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm hover:bg-background border-border shadow-elegant z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm hover:bg-background border-border shadow-elegant z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">La galerie sera bientôt disponible</p>
          </div>
        )}
      </div>
    </section>
  );
}
