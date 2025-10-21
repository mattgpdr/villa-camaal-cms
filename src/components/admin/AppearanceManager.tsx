import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

export function AppearanceManager() {
  const [loading, setLoading] = useState(false);
  const [appearance, setAppearance] = useState({
    primary_color: '#D4AF37',
    secondary_color: '#8B7355',
    accent_color: '#2C5F7C',
    primary_font: 'Playfair Display',
    secondary_font: 'Inter',
    logo_url: '',
    hero_image_url: '',
    background_type: 'color' as 'color' | 'image',
    background_color: '#ffffff',
    background_image_url: '',
    background_opacity: 1,
  });

  useEffect(() => {
    fetchAppearance();
  }, []);

  const fetchAppearance = async () => {
    try {
      const { data, error } = await supabase
        .from('site_appearance')
        .select('*')
        .single();

      if (error) throw error;
      if (data) setAppearance(data);
    } catch (error) {
      console.error('Error fetching appearance:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('site_appearance')
        .upsert(appearance);

      if (error) throw error;
      toast({ title: 'Apparence mise à jour avec succès' });
    } catch (error) {
      console.error('Error saving appearance:', error);
      toast({ title: 'Erreur lors de la sauvegarde', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File, field: 'logo_url' | 'hero_image_url' | 'background_image_url') => {
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('site-assets')
        .getPublicUrl(fileName);

      setAppearance({ ...appearance, [field]: data.publicUrl });
      toast({ title: 'Image uploadée avec succès' });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ title: "Erreur lors de l'upload", variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-primary font-semibold mb-4">Couleurs</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="primary_color">Couleur primaire</Label>
            <div className="flex gap-2">
              <Input
                id="primary_color"
                type="color"
                value={appearance.primary_color}
                onChange={(e) => setAppearance({ ...appearance, primary_color: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={appearance.primary_color}
                onChange={(e) => setAppearance({ ...appearance, primary_color: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="secondary_color">Couleur secondaire</Label>
            <div className="flex gap-2">
              <Input
                id="secondary_color"
                type="color"
                value={appearance.secondary_color}
                onChange={(e) => setAppearance({ ...appearance, secondary_color: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={appearance.secondary_color}
                onChange={(e) => setAppearance({ ...appearance, secondary_color: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="accent_color">Couleur accent</Label>
            <div className="flex gap-2">
              <Input
                id="accent_color"
                type="color"
                value={appearance.accent_color}
                onChange={(e) => setAppearance({ ...appearance, accent_color: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={appearance.accent_color}
                onChange={(e) => setAppearance({ ...appearance, accent_color: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-primary font-semibold mb-4">Typographie</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="primary_font">Police principale (titres)</Label>
            <Input
              id="primary_font"
              value={appearance.primary_font}
              onChange={(e) => setAppearance({ ...appearance, primary_font: e.target.value })}
              placeholder="Playfair Display"
            />
          </div>
          <div>
            <Label htmlFor="secondary_font">Police secondaire (textes)</Label>
            <Input
              id="secondary_font"
              value={appearance.secondary_font}
              onChange={(e) => setAppearance({ ...appearance, secondary_font: e.target.value })}
              placeholder="Inter"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-primary font-semibold mb-4">Images</h3>
        <div className="space-y-4">
          <div>
            <Label>Logo</Label>
            <div className="flex items-center gap-4 mt-2">
              {appearance.logo_url && (
                <img src={appearance.logo_url} alt="Logo" className="h-16 object-contain" />
              )}
              <Button variant="outline" asChild>
                <label className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2 inline" />
                  Upload Logo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo_url')}
                  />
                </label>
              </Button>
            </div>
          </div>
          <div>
            <Label>Image Hero</Label>
            <div className="flex items-center gap-4 mt-2">
              {appearance.hero_image_url && (
                <img src={appearance.hero_image_url} alt="Hero" className="h-32 w-48 object-cover rounded" />
              )}
              <Button variant="outline" asChild>
                <label className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2 inline" />
                  Upload Hero
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'hero_image_url')}
                  />
                </label>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-primary font-semibold mb-4">Arrière-plan du site</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button
              variant={appearance.background_type === 'color' ? 'default' : 'outline'}
              onClick={() => setAppearance({ ...appearance, background_type: 'color' })}
            >
              Couleur
            </Button>
            <Button
              variant={appearance.background_type === 'image' ? 'default' : 'outline'}
              onClick={() => setAppearance({ ...appearance, background_type: 'image' })}
            >
              Image
            </Button>
          </div>
          {appearance.background_type === 'color' ? (
            <div className="flex gap-2">
              <Input
                type="color"
                value={appearance.background_color || '#ffffff'}
                onChange={(e) => setAppearance({ ...appearance, background_color: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={appearance.background_color || '#ffffff'}
                onChange={(e) => setAppearance({ ...appearance, background_color: e.target.value })}
              />
            </div>
          ) : (
            <div className="space-y-2">
              {appearance.background_image_url && (
                <img src={appearance.background_image_url} alt="Background" className="h-32 w-48 object-cover rounded" />
              )}
              <Button variant="outline" asChild>
                <label className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2 inline" />
                  Upload Background
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'background_image_url')}
                  />
                </label>
              </Button>
              <div>
                <Label>Opacité: {appearance.background_opacity}</Label>
                <Input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={appearance.background_opacity}
                  onChange={(e) => setAppearance({ ...appearance, background_opacity: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      <Button onClick={handleSave} disabled={loading} size="lg" className="w-full">
        {loading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
      </Button>
    </div>
  );
}
