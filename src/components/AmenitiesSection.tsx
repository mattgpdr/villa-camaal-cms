import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Amenity } from '@/types/supabase';
import * as LucideIcons from 'lucide-react';

export function AmenitiesSection() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const { data, error } = await supabase
          .from('amenities')
          .select('*')
          .eq('visible', true)
          .order('display_order');

        if (error) throw error;
        setAmenities(data || []);
      } catch (error) {
        console.error('Error fetching amenities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAmenities();
  }, []);

  const getIconComponent = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="w-8 h-8" /> : null;
  };

  return (
    <section id="amenities" className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-primary font-bold text-foreground mb-6">
            Équipements
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Tout le confort pour un séjour inoubliable
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        ) : amenities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {amenities.map((amenity, index) => (
              <div
                key={amenity.id}
                className="card-luxury p-6 text-center hover-lift group animate-fade-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:scale-110">
                    {amenity.icon_name && getIconComponent(amenity.icon_name)}
                    {!amenity.icon_name && amenity.image_url && (
                      <img 
                        src={amenity.image_url} 
                        alt={amenity.title}
                        className="w-8 h-8 object-contain"
                      />
                    )}
                  </div>
                  <h3 className="font-secondary font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
                    {amenity.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun équipement disponible pour le moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
