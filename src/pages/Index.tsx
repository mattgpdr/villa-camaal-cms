import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { AboutSection } from '@/components/AboutSection';
import { GallerySection } from '@/components/GallerySection';
import { Activities } from '@/components/Activities';
import { AmenitiesSection } from '@/components/AmenitiesSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { LocationSection } from '@/components/LocationSection';
import { ContactSection } from '@/components/ContactSection';
import { useSectionBackgrounds } from '@/hooks/useSectionBackgrounds';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const navigate = useNavigate();
  useSectionBackgrounds('home');

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <GallerySection />
        
        {/* Activities Preview */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-muted/10 to-background">
          <div className="container mx-auto px-4">
            <Activities limit={3} />
            <div className="text-center mt-12 animate-fade-up">
              <Button 
                onClick={() => navigate('/activites')}
                size="lg"
                className="btn-hero"
              >
                Voir toutes les activités
              </Button>
            </div>
          </div>
        </section>

        <AmenitiesSection />
        <TestimonialsSection />
        <LocationSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
