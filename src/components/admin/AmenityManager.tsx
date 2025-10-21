import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Amenity } from '@/types/supabase';
import { Trash2, Edit, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function AmenityManager() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [formData, setFormData] = useState({ title: '', icon_name: '' });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = async () => {
    try {
      const { data, error } = await supabase
        .from('amenities')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setAmenities(data || []);
    } catch (error) {
      console.error('Error fetching amenities:', error);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', icon_name: '' });
    setEditingAmenity(null);
  };

  const handleEdit = (amenity: Amenity) => {
    setEditingAmenity(amenity);
    setFormData({ 
      title: amenity.title, 
      icon_name: amenity.icon_name || '' 
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.icon_name) {
      toast({ title: 'Veuillez remplir tous les champs', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      if (editingAmenity) {
        const { error } = await supabase
          .from('amenities')
          .update(formData)
          .eq('id', editingAmenity.id);

        if (error) throw error;
        toast({ title: 'Équipement mis à jour' });
      } else {
        const { error } = await supabase
          .from('amenities')
          .insert({
            ...formData,
            visible: true,
            display_order: amenities.length,
          });

        if (error) throw error;
        toast({ title: 'Équipement ajouté' });
      }

      resetForm();
      setDialogOpen(false);
      fetchAmenities();
    } catch (error) {
      console.error('Error saving amenity:', error);
      toast({ title: 'Erreur lors de la sauvegarde', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) return;

    try {
      const { error } = await supabase
        .from('amenities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Équipement supprimé' });
      fetchAmenities();
    } catch (error) {
      console.error('Error deleting amenity:', error);
      toast({ title: 'Erreur lors de la suppression', variant: 'destructive' });
    }
  };

  const toggleVisibility = async (id: string, visible: boolean) => {
    try {
      const { error } = await supabase
        .from('amenities')
        .update({ visible })
        .eq('id', id);

      if (error) throw error;
      fetchAmenities();
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
  };

  const popularIcons = [
    'Wifi', 'Car', 'Coffee', 'Waves', 'Sun', 'Wind', 'Umbrella', 
    'Utensils', 'Bed', 'Bath', 'Tv', 'Music', 'Dumbbell', 'TreePine',
    'Home', 'Key', 'Lock', 'Fan', 'Flame', 'Snowflake', 'AirVent'
  ];

  return (
    <div className="space-y-6">
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un équipement
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAmenity ? 'Modifier l\'équipement' : 'Nouvel équipement'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="WiFi Gratuit"
              />
            </div>
            <div>
              <Label>Nom de l'icône Lucide</Label>
              <Input
                value={formData.icon_name}
                onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                placeholder="Wifi"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Exemples: {popularIcons.slice(0, 5).join(', ')}, etc.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {popularIcons.map((icon) => (
                  <Button
                    key={icon}
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, icon_name: icon })}
                  >
                    {icon}
                  </Button>
                ))}
              </div>
            </div>
            <Button onClick={handleSave} disabled={loading} className="w-full">
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {amenities.map((amenity) => (
          <Card key={amenity.id} className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold">{amenity.title}</h3>
                {amenity.icon_name && (
                  <p className="text-sm text-muted-foreground">Icône: {amenity.icon_name}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(amenity)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(amenity.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={amenity.visible}
                onCheckedChange={(checked) => toggleVisibility(amenity.id, checked)}
              />
              <span className="text-sm">Visible</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
