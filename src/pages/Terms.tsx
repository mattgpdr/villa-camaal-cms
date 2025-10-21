import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MiniHero } from '@/components/MiniHero';
import { supabase } from '@/integrations/supabase/client';
import { TermsSection } from '@/types/supabase';
import { useSectionBackgrounds } from '@/hooks/useSectionBackgrounds';

export default function Terms() {
  const [sections, setSections] = useState<TermsSection[]>([]);
  const [loading, setLoading] = useState(true);
  const { getSectionStyle, getSectionOverlayStyle } = useSectionBackgrounds('terms');

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const { data, error } = await supabase
          .from('terms_sections')
          .select('*')
          .eq('visible', true)
          .order('display_order');

        if (error) throw error;
        setSections(data || []);
      } catch (error) {
        console.error('Error fetching terms sections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <MiniHero title="Conditions Générales d'Utilisation" />
        
        <section 
          className="py-16 md:py-24 relative"
          style={getSectionStyle('content')}
        >
          {getSectionOverlayStyle('content') && (
            <div style={getSectionOverlayStyle('content')!} />
          )}
          <div className="container mx-auto px-4 max-w-4xl relative z-10">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Chargement...</p>
              </div>
            ) : sections.length > 0 ? (
              <div className="space-y-12">
                {sections.map((section) => (
                  <div key={section.id} className="space-y-4">
                    <h2 
                      className="font-primary text-2xl md:text-3xl"
                      style={{
                        color: section.title_color || undefined,
                        fontWeight: section.title_weight || undefined,
                      }}
                    >
                      {section.title}
                    </h2>
                    <div 
                      className="font-secondary text-base md:text-lg leading-relaxed prose prose-lg max-w-none"
                      style={{
                        color: section.content_color || undefined,
                        fontWeight: section.content_weight || undefined,
                      }}
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucune section disponible pour le moment.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
