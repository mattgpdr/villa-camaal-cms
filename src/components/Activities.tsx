import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Activity } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, MapPin } from 'lucide-react';

interface ActivitiesProps {
  showTitle?: boolean;
  limit?: number;
}

const categories = ['Tous', 'Plage', 'Nature', 'Culture', 'Sports', 'Gastronomie', 'Détente'];

export function Activities({ showTitle = true, limit }: ActivitiesProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('visible', true)
          .order('display_order');

        if (error) throw error;
        const fetchedActivities = data || [];
        setActivities(fetchedActivities);
        setFilteredActivities(limit ? fetchedActivities.slice(0, limit) : fetchedActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [limit]);

  useEffect(() => {
    if (selectedCategory === 'Tous') {
      setFilteredActivities(limit ? activities.slice(0, limit) : activities);
    } else {
      const filtered = activities.filter(
        (activity) => activity.category === selectedCategory
      );
      setFilteredActivities(limit ? filtered.slice(0, limit) : filtered);
    }
  }, [selectedCategory, activities, limit]);

  return (
    <div className="container mx-auto px-4">
      {showTitle && (
        <div className="text-center mb-12 animate-fade-up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-primary font-bold text-foreground mb-4">
            Activités
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez les nombreuses activités disponibles dans la région
          </p>
        </div>
      )}

      {!limit && (
        <div className="flex flex-wrap gap-3 justify-center mb-12 animate-fade-in">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? 'btn-hero' : ''}
            >
              {category}
            </Button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement des activités...</p>
        </div>
      ) : filteredActivities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredActivities.map((activity, index) => (
            <div
              key={activity.id}
              className="card-luxury hover-lift group animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {activity.image_url && (
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={activity.image_url}
                    alt={activity.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {activity.category && (
                    <Badge className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm">
                      {activity.category}
                    </Badge>
                  )}
                </div>
              )}
              <div className="p-6 space-y-4">
                <h3 className="text-2xl font-primary font-bold text-foreground">
                  {activity.title}
                </h3>
                <p className="text-muted-foreground line-clamp-3">
                  {activity.description}
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  {activity.button_url && activity.button_text && (
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => window.open(activity.button_url!, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                      {activity.button_text}
                    </Button>
                  )}
                  {activity.map_url && (
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => window.open(activity.map_url!, '_blank')}
                    >
                      <MapPin className="w-4 h-4" />
                      Carte
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Aucune activité disponible dans cette catégorie.
          </p>
        </div>
      )}
    </div>
  );
}
