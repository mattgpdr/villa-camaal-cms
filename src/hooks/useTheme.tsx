import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SiteAppearance } from '@/types/supabase';

// Helper function to convert hex to HSL
function hexToHSL(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}

export function useTheme() {
  const [appearance, setAppearance] = useState<SiteAppearance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppearance = async () => {
      try {
        const { data, error } = await supabase
          .from('site_appearance')
          .select('*')
          .single();

        if (error) throw error;
        setAppearance(data);
        applyTheme(data);
      } catch (error) {
        console.error('Error fetching appearance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppearance();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('site_appearance_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_appearance',
        },
        (payload) => {
          console.log('Appearance updated:', payload);
          if (payload.new) {
            const newAppearance = payload.new as SiteAppearance;
            setAppearance(newAppearance);
            applyTheme(newAppearance);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const applyTheme = (data: SiteAppearance) => {
    const root = document.documentElement;

    // Apply colors
    if (data.primary_color) {
      root.style.setProperty('--primary', hexToHSL(data.primary_color));
    }
    if (data.secondary_color) {
      root.style.setProperty('--secondary', hexToHSL(data.secondary_color));
    }
    if (data.accent_color) {
      root.style.setProperty('--accent', hexToHSL(data.accent_color));
    }

    // Apply fonts
    if (data.primary_font) {
      // Load Google Font
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${data.primary_font.replace(' ', '+')}:wght@400;600;700&display=swap`;
      link.rel = 'stylesheet';
      
      // Remove existing primary font link
      const existingPrimaryLink = document.querySelector('link[href*="' + data.primary_font.replace(' ', '+') + '"]');
      if (!existingPrimaryLink) {
        document.head.appendChild(link);
      }
      
      root.style.setProperty('--font-primary', `'${data.primary_font}', serif`);
    }

    if (data.secondary_font) {
      // Load Google Font
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${data.secondary_font.replace(' ', '+')}:wght@300;400;500;600&display=swap`;
      link.rel = 'stylesheet';
      
      // Remove existing secondary font link
      const existingSecondaryLink = document.querySelector('link[href*="' + data.secondary_font.replace(' ', '+') + '"]');
      if (!existingSecondaryLink) {
        document.head.appendChild(link);
      }
      
      root.style.setProperty('--font-secondary', `'${data.secondary_font}', sans-serif`);
    }

    // Apply background
    if (data.background_type === 'color' && data.background_color) {
      root.style.setProperty('--site-background', data.background_color);
      root.style.setProperty('--site-background-image', 'none');
    } else if (data.background_type === 'image' && data.background_image_url) {
      root.style.setProperty('--site-background-image', `url(${data.background_image_url})`);
      root.style.setProperty('--site-background-opacity', data.background_opacity.toString());
      
      // Apply opacity overlay
      const body = document.body;
      body.style.position = 'relative';
      
      // Remove existing overlay
      const existingOverlay = document.querySelector('.site-background-overlay');
      if (existingOverlay) {
        existingOverlay.remove();
      }
      
      // Create new overlay
      const overlay = document.createElement('div');
      overlay.className = 'site-background-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        opacity: ${1 - data.background_opacity};
        pointer-events: none;
        z-index: -1;
      `;
      body.appendChild(overlay);
    }
  };

  return { appearance, loading };
}
