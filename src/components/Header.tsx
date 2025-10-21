import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data, error } = await supabase
          .from('site_appearance')
          .select('logo_url')
          .single();

        if (error) throw error;
        setLogoUrl(data?.logo_url || null);
      } catch (error) {
        console.error('Error fetching logo:', error);
      }
    };

    fetchLogo();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('logo_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'site_appearance',
        },
        (payload: any) => {
          if (payload.new?.logo_url) {
            setLogoUrl(payload.new.logo_url);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    } else {
      // If not on home page, navigate to home and then scroll
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const navItems = [
    { label: 'En savoir plus', action: () => navigate('/en-savoir-plus') },
    { label: 'Galerie', action: () => scrollToSection('gallery') },
    { label: 'Activités', action: () => navigate('/activites') },
    { label: 'Équipements', action: () => scrollToSection('amenities') },
    { label: 'Avis', action: () => scrollToSection('testimonials') },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 hover-scale">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Villa Camaal" 
              className="h-12 w-auto object-contain"
            />
          ) : (
            <div className="h-12 flex items-center">
              <span className="text-2xl font-primary font-bold text-primary">
                Villa Camaal
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="text-foreground hover:text-primary transition-colors font-secondary font-medium"
            >
              {item.label}
            </button>
          ))}
          <Button 
            onClick={() => scrollToSection('contact')}
            className="btn-hero"
          >
            Nous contacter
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6 text-foreground" />
          ) : (
            <Menu className="w-6 h-6 text-foreground" />
          )}
        </button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg md:hidden animate-fade-in">
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="text-left text-foreground hover:text-primary transition-colors font-secondary py-2"
                >
                  {item.label}
                </button>
              ))}
              <Button 
                onClick={() => {
                  scrollToSection('contact');
                  setIsMenuOpen(false);
                }}
                className="btn-hero w-full"
              >
                Nous contacter
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
