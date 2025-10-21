import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function Footer() {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    const fetchFooterContent = async () => {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('content_value')
          .eq('page', 'home')
          .eq('section', 'footer')
          .single();

        if (error) throw error;
        setContent(data?.content_value || '');
      } catch (error) {
        console.error('Error fetching footer content:', error);
      }
    };

    fetchFooterContent();
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6">
          {/* Logo/Title */}
          <h3 className="text-2xl font-primary font-bold">Villa Camaal</h3>
          
          {/* Dynamic Content */}
          {content && (
            <div 
              className="text-sm font-secondary max-w-2xl mx-auto"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}

          {/* Links */}
          <div className="flex justify-center space-x-6 text-sm">
            <Link 
              to="/conditions-utilisation" 
              className="hover:text-primary-foreground transition-colors"
            >
              Conditions d'utilisation
            </Link>
          </div>

          {/* Copyright */}
          <div className="pt-6 border-t border-secondary-foreground/20">
            <p className="text-xs">
              © {currentYear} Villa Camaal. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
