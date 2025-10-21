import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Activity } from '@/types/supabase';
import { Upload, Trash2, Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ActivityManager() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    button_text: '',
    button_url: '',
    map_url: '',
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const categories = ['Plage', 'Nature', 'Culture', 'Sports', 'Gastronomie', 'Détente'];

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      button_text: '',
      button_url: '',
      map_url: '',
    });
    setUploadFile(null);
    setEditingActivity(null);
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setFormData({
      title: activity.title,
      description: activity.description,
      category: activity.category || '',
      button_text: activity.button_text || '',
      button_url: activity.button_url || '',
      map_url: activity.map_url || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      toast({ title: 'Veuillez remplir les champs requis', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      let imageUrl = editingActivity?.image_url || null;

      if (uploadFile) {
        const fileName = `${Date.now()}-${uploadFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('activity-images')
          .upload(fileName, uploadFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('activity-images')
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

      if (editingActivity) {
        const { error } = await supabase
          .from('activities')
          .update({ ...formData, image_url: imageUrl })
          .eq('id', editingActivity.id);

        if (error) throw error;
        toast({ title: 'Activité mise à jour' });
      } else {
        const { error } = await supabase
          .from('activities')
          .insert({
            ...formData,
            image_url: imageUrl,
            visible: true,
            display_order: activities.length,
          });

        if (error) throw error;
        toast({ title: 'Activité ajoutée' });
      }

      resetForm();
      setDialogOpen(false);
      fetchActivities();
    } catch (error) {
      console.error('Error saving activity:', error);
      toast({ title: 'Erreur lors de la sauvegarde', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, imageUrl: string | null) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) return;

    try {
      if (imageUrl) {
        const fileName = imageUrl.split('/').pop();
        if (fileName) {
          await supabase.storage.from('activity-images').remove([fileName]);
        }
      }

      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Activité supprimée' });
      fetchActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({ title: 'Erreur lors de la suppression', variant: 'destructive' });
    }
  };

  const toggleVisibility = async (id: string, visible: boolean) => {
    try {
      const { error } = await supabase
        .from('activities')
        .update({ visible })
        .eq('id', id);

      if (error) throw error;
      fetchActivities();
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogTrigger asChild>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Ajouter une activité
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingActivity ? 'Modifier l\'activité' : 'Nouvelle activité'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label>Catégorie</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
              {editingActivity?.image_url && !uploadFile && (
                <img src={editingActivity.image_url} alt="Current" className="mt-2 h-32 rounded" />
              )}
            </div>
            <div>
              <Label>Texte du bouton</Label>
              <Input
                value={formData.button_text}
                onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                placeholder="En savoir plus"
              />
            </div>
            <div>
              <Label>URL du bouton</Label>
              <Input
                value={formData.button_url}
                onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>URL de la carte</Label>
              <Input
                value={formData.map_url}
                onChange={(e) => setFormData({ ...formData, map_url: e.target.value })}
                placeholder="https://maps.google.com/..."
              />
            </div>
            <Button onClick={handleSave} disabled={loading} className="w-full">
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activities.map((activity) => (
          <Card key={activity.id} className="p-4">
            {activity.image_url && (
              <img
                src={activity.image_url}
                alt={activity.title}
                className="w-full h-48 object-cover rounded mb-4"
              />
            )}
            <h3 className="font-semibold text-lg mb-2">{activity.title}</h3>
            {activity.category && (
              <p className="text-sm text-primary mb-2">{activity.category}</p>
            )}
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {activity.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={activity.visible}
                  onCheckedChange={(checked) => toggleVisibility(activity.id, checked)}
                />
                <span className="text-sm">Visible</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(activity)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(activity.id, activity.image_url)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
