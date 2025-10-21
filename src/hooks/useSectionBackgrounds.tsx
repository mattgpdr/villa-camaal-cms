import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SectionBackground } from '@/types/supabase';

export function useSectionBackgrounds(page: string) {
  const [backgrounds, setBackgrounds] = useState<Record<string, SectionBackground>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBackgrounds = async () => {
      try {
        const { data, error } = await supabase
          .from('section_backgrounds')
          .select('*')
          .eq('page', page);

        if (error) throw error;

        // Convert array to object keyed by section_name
        const bgMap: Record<string, SectionBackground> = {};
        data?.forEach((bg) => {
          bgMap[bg.section_name] = bg;
        });

        setBackgrounds(bgMap);
        applySectionBackgrounds(bgMap);
      } catch (error) {
        console.error('Error fetching section backgrounds:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBackgrounds();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`section_backgrounds_${page}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'section_backgrounds',
          filter: `page=eq.${page}`,
        },
        () => {
          // Refetch on any change
          fetchBackgrounds();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [page]);

  const applySectionBackgrounds = (bgMap: Record<string, SectionBackground>) => {
    const root = document.documentElement;

    Object.entries(bgMap).forEach(([sectionName, bg]) => {
      if (bg.background_type === 'color') {
        root.style.setProperty(`--section-${sectionName}-bg`, bg.background_value);
        root.style.setProperty(`--section-${sectionName}-image`, 'none');
        root.style.setProperty(`--section-${sectionName}-opacity`, '1');
      } else if (bg.background_type === 'image') {
        root.style.setProperty(`--section-${sectionName}-bg`, 'transparent');
        root.style.setProperty(`--section-${sectionName}-image`, `url(${bg.background_value})`);
        root.style.setProperty(`--section-${sectionName}-opacity`, bg.opacity.toString());
      }
    });
  };

  const getSectionStyle = (sectionName: string) => {
    const bg = backgrounds[sectionName];
    if (!bg) return {};

    if (bg.background_type === 'color') {
      return {
        backgroundColor: bg.background_value,
      };
    } else {
      return {
        backgroundImage: `url(${bg.background_value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative' as const,
      };
    }
  };

  const getSectionOverlayStyle = (sectionName: string) => {
    const bg = backgrounds[sectionName];
    if (!bg || bg.background_type !== 'image') return null;

    return {
      position: 'absolute' as const,
      inset: 0,
      backgroundColor: 'white',
      opacity: 1 - bg.opacity,
      pointerEvents: 'none' as const,
    };
  };

  return { backgrounds, loading, getSectionStyle, getSectionOverlayStyle };
}
