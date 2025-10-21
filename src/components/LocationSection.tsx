import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MapPin } from 'lucide-react';

export function LocationSection() {
  const [content, setContent] = useState({
    heading: 'Notre Emplacement',
    description: 'Située dans le Golfe de Saint-Tropez',
    mapUrl: '',
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('*')
          .eq('page', 'home')
          .eq('section', 'location');

        if (error) throw error;

        const contentMap: Record<string, string> = {};
        data?.forEach((item) => {
          contentMap[item.content_key] = item.content_value;
        });

        setContent({
          heading: contentMap.heading || content.heading,
          description: contentMap.description || content.description,
          mapUrl: contentMap.map_url || '',
        });
      } catch (error) {
        console.error('Error fetching location content:', error);
      }
    };

    fetchContent();
  }, []);

  return (
    <section id="location" className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          <div className="space-y-6 animate-fade-up">
            <div className="flex items-center gap-3 text-primary">
              <MapPin className="w-8 h-8" />
              <span className="text-lg font-secondary font-semibold">Localisation</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-primary font-bold text-foreground">
              {content.heading}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {content.description}
            </p>
          </div>

          <div className="animate-fade-up animate-delay-200">
            {content.mapUrl ? (
              <div className="card-luxury overflow-hidden aspect-video">
                <iframe
                  src={content.mapUrl}
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Villa Camaal Location"
                />
              </div>
            ) : (
              <div className="card-luxury aspect-video flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">Carte à venir</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
