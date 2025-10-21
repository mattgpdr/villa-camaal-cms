import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MiniHero } from '@/components/MiniHero';
import { supabase } from '@/integrations/supabase/client';
import { LearnMoreSection } from '@/types/supabase';
import { useSectionBackgrounds } from '@/hooks/useSectionBackgrounds';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function LearnMore() {
  const [sections, setSections] = useState<LearnMoreSection[]>([]);
  const [loading, setLoading] = useState(true);
  const { getSectionStyle, getSectionOverlayStyle } = useSectionBackgrounds('learn_more');

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const { data, error } = await supabase
          .from('learn_more_sections')
          .select('*')
          .eq('visible', true)
          .order('display_order');

        if (error) throw error;
        setSections(data || []);
      } catch (error) {
        console.error('Error fetching learn more sections:', error);
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
        <MiniHero />
        
        <section 
          className="py-16 md:py-24 relative"
          style={getSectionStyle('content')}
        >
          {getSectionOverlayStyle('content') && (
            <div style={getSectionOverlayStyle('content')!} />
          )}
          <div className="container mx-auto px-4 relative z-10">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Chargement...</p>
              </div>
            ) : sections.length > 0 ? (
              <Accordion type="single" collapsible className="max-w-4xl mx-auto">
                {sections.map((section, index) => (
                  <AccordionItem 
                    key={section.id} 
                    value={`item-${index}`}
                    className="border-b border-border last:border-b-0"
                  >
                    <AccordionTrigger className="text-left font-primary text-xl md:text-2xl py-6 hover:text-primary transition-colors">
                      {section.title}
                    </AccordionTrigger>
                    <AccordionContent className="font-secondary text-foreground/80 text-base md:text-lg leading-relaxed pb-6">
                      <div dangerouslySetInnerHTML={{ __html: section.content }} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
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
