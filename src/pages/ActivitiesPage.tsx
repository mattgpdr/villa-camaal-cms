import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MiniHero } from '@/components/MiniHero';
import { Activities } from '@/components/Activities';
import { useSectionBackgrounds } from '@/hooks/useSectionBackgrounds';

export default function ActivitiesPage() {
  const { getSectionStyle, getSectionOverlayStyle } = useSectionBackgrounds('activities');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <MiniHero 
          title="Activités"
          subtitle="Au cœur du Golfe de Saint-Tropez, de nombreuses possibilités s'offrent à vous pour la détente et les loisirs"
        />
        
        <section 
          className="py-16 md:py-24 relative"
          style={getSectionStyle('content')}
        >
          {getSectionOverlayStyle('content') && (
            <div style={getSectionOverlayStyle('content')!} />
          )}
          <div className="relative z-10">
            <Activities showTitle={false} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
