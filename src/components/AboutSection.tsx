import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function AboutSection() {
  const [content, setContent] = useState({
    heading: 'À propos de Villa Camaal',
    description: 'Découvrez notre villa d\'exception',
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('*')
          .eq('page', 'home')
          .eq('section', 'about');

        if (error) throw error;

        const contentMap: Record<string, string> = {};
        data?.forEach((item) => {
          contentMap[item.content_key] = item.content_value;
        });

        setContent({
          heading: contentMap.heading || content.heading,
          description: contentMap.description || content.description,
        });
      } catch (error) {
        console.error('Error fetching about content:', error);
      }
    };

    fetchContent();
  }, []);

  const images = [
    {
      url: '/placeholder.svg',
      title: 'Vue mer panoramique',
      description: 'Une vue imprenable sur la Méditerranée',
    },
    {
      url: '/placeholder.svg',
      title: 'Piscine à débordement',
      description: 'Piscine chauffée avec vue mer',
    },
    {
      url: '/placeholder.svg',
      title: 'Intérieur de luxe',
      description: 'Design contemporain et élégant',
    },
  ];

  return (
    <section id="about" className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-primary font-bold text-foreground mb-6">
            {content.heading}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {content.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group overflow-hidden rounded-lg card-luxury hover-lift animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-80 overflow-hidden">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-2xl font-primary font-bold mb-2">{image.title}</h3>
                <p className="text-white/90 font-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  {image.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
