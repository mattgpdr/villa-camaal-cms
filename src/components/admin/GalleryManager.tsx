import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { GalleryImage } from '@/types/supabase';
import { Upload, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [newImage, setNewImage] = useState({ title: '', category: '' });
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    
    setLoading(true);
    try {
      const fileName = `${Date.now()}-${uploadFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(fileName, uploadFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('gallery_images')
        .insert({
          image_url: data.publicUrl,
          title: newImage.title,
          category: newImage.category,
          visible: true,
          display_order: images.length,
        });

      if (insertError) throw insertError;

      toast({ title: 'Image ajoutée avec succès' });
      setNewImage({ title: '', category: '' });
      setUploadFile(null);
      fetchImages();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ title: "Erreur lors de l'upload", variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return;

    try {
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await supabase.storage.from('gallery-images').remove([fileName]);
      }

      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Image supprimée' });
      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({ title: 'Erreur lors de la suppression', variant: 'destructive' });
    }
  };

  const toggleVisibility = async (id: string, visible: boolean) => {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .update({ visible })
        .eq('id', id);

      if (error) throw error;
      fetchImages();
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Ajouter une image
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
            </div>
            <div>
              <Label>Titre (optionnel)</Label>
              <Input
                value={newImage.title}
                onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Catégorie (optionnel)</Label>
              <Input
                value={newImage.category}
                onChange={(e) => setNewImage({ ...newImage, category: e.target.value })}
              />
            </div>
            <Button onClick={handleUpload} disabled={!uploadFile || loading}>
              {loading ? 'Upload...' : 'Ajouter'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <Card key={image.id} className="p-4">
            <img
              src={image.image_url}
              alt={image.title || 'Gallery image'}
              className="w-full h-48 object-cover rounded mb-4"
            />
            {image.title && (
              <p className="font-semibold mb-2">{image.title}</p>
            )}
            {image.category && (
              <p className="text-sm text-muted-foreground mb-2">{image.category}</p>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={image.visible}
                  onCheckedChange={(checked) => toggleVisibility(image.id, checked)}
                />
                <span className="text-sm">Visible</span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(image.id, image.image_url)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
