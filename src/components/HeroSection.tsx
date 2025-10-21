import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export function HeroSection() {
  const [content, setContent] = useState({
    title: 'Villa Camaal',
    subtitle: 'Villa de luxe dans le Golfe de Saint-Tropez',
    tagline: 'Un séjour d\'exception vous attend',
    capacity: 'Jusqu\'à 12 personnes',
    heroImage: '',
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Fetch hero content
        const { data: contentData, error: contentError } = await supabase
          .from('site_content')
          .select('*')
          .eq('page', 'home')
          .eq('section', 'hero');

        if (contentError) throw contentError;

        const contentMap: Record<string, string> = {};
        contentData?.forEach((item) => {
          contentMap[item.content_key] = item.content_value;
        });

        // Fetch hero image
        const { data: appearanceData, error: appearanceError } = await supabase
          .from('site_appearance')
          .select('hero_image_url')
          .single();

        if (appearanceError) throw appearanceError;

        setContent({
          title: contentMap.title || content.title,
          subtitle: contentMap.subtitle || content.subtitle,
          tagline: contentMap.tagline || content.tagline,
          capacity: contentMap.capacity || content.capacity,
          heroImage: appearanceData?.hero_image_url || '',
        });
      } catch (error) {
        console.error('Error fetching hero content:', error);
      }
    };

    fetchContent();
  }, []);

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: content.heroImage
          ? `url(${content.heroImage})`
          : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl animate-fade-up">
        <p className="text-primary text-xl md:text-2xl font-secondary font-medium mb-4 animate-fade-in">
          {content.tagline}
        </p>
        <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-primary font-bold text-white mb-6 animate-fade-up animate-delay-100">
          {content.title}
        </h1>
        <p className="text-xl md:text-2xl lg:text-3xl text-white/90 font-secondary mb-4 animate-fade-up animate-delay-200">
          {content.subtitle}
        </p>
        <p className="text-lg md:text-xl text-white/80 font-secondary mb-12 animate-fade-up animate-delay-300">
          {content.capacity}
        </p>
        <Button 
          onClick={scrollToContact}
          size="lg"
          className="btn-hero text-lg px-8 py-6 animate-scale-in animate-delay-300"
        >
          Nous contacter
        </Button>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0 wave-divider">
        <svg 
          viewBox="0 0 1440 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path 
            d="M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,80C672,85,768,75,864,64C960,53,1056,43,1152,48C1248,53,1344,75,1392,85.3L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" 
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}
