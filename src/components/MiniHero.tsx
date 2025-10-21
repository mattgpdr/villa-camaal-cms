import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MiniHeroProps {
  title?: string;
  subtitle?: string;
}

export function MiniHero({ title: propTitle, subtitle: propSubtitle }: MiniHeroProps) {
  const [content, setContent] = useState({
    title: propTitle || '',
    subtitle: propSubtitle || '',
    textColor: '#ffffff',
    backgroundImage: '',
  });

  useEffect(() => {
    // Only fetch from database if no props are provided
    if (!propTitle && !propSubtitle) {
      const fetchContent = async () => {
        try {
          const { data, error } = await supabase
            .from('site_content')
            .select('*')
            .eq('page', 'learn_more')
            .eq('section', 'mini_hero');

          if (error) throw error;

          const contentMap: Record<string, string> = {};
          data?.forEach((item) => {
            contentMap[item.content_key] = item.content_value;
          });

          setContent({
            title: contentMap.title || '',
            subtitle: contentMap.subtitle || '',
            textColor: contentMap.text_color || '#ffffff',
            backgroundImage: contentMap.background_image_url || '',
          });
        } catch (error) {
          console.error('Error fetching mini hero content:', error);
        }
      };

      fetchContent();
    }
  }, [propTitle, propSubtitle]);

  const displayTitle = propTitle || content.title;
  const displaySubtitle = propSubtitle || content.subtitle;

  return (
    <section 
      className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: content.backgroundImage ? `url(${content.backgroundImage})` : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl animate-fade-up">
        {displayTitle && (
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-primary font-bold mb-4"
            style={{ color: content.textColor }}
          >
            {displayTitle}
          </h1>
        )}
        {displaySubtitle && (
          <p 
            className="text-lg md:text-xl font-secondary"
            style={{ color: content.textColor }}
          >
            {displaySubtitle}
          </p>
        )}
      </div>
    </section>
  );
}
