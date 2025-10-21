import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { SiteContent } from '@/types/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ContentManager() {
  const [content, setContent] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*');

      if (error) throw error;

      const contentMap: Record<string, Record<string, string>> = {};
      data?.forEach((item) => {
        const key = `${item.page}-${item.section}`;
        if (!contentMap[key]) contentMap[key] = {};
        contentMap[key][item.content_key] = item.content_value;
      });

      setContent(contentMap);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const handleUpdate = async (page: string, section: string, contentKey: string, value: string) => {
    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({
          page,
          section,
          content_key: contentKey,
          content_value: value,
        }, {
          onConflict: 'page,section,content_key'
        });

      if (error) throw error;

      const key = `${page}-${section}`;
      setContent({
        ...content,
        [key]: { ...content[key], [contentKey]: value }
      });
    } catch (error) {
      console.error('Error updating content:', error);
    }
  };

  const handleSaveAll = async () => {
    setLoading(true);
    try {
      toast({ title: 'Contenu sauvegardé' });
    } catch (error) {
      console.error('Error saving:', error);
      toast({ title: 'Erreur lors de la sauvegarde', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const ContentField = ({ 
    page, 
    section, 
    contentKey, 
    label, 
    multiline = false 
  }: { 
    page: string; 
    section: string; 
    contentKey: string; 
    label: string; 
    multiline?: boolean;
  }) => {
    const key = `${page}-${section}`;
    const value = content[key]?.[contentKey] || '';

    return (
      <div>
        <Label>{label}</Label>
        {multiline ? (
          <Textarea
            value={value}
            onChange={(e) => handleUpdate(page, section, contentKey, e.target.value)}
            rows={4}
          />
        ) : (
          <Input
            value={value}
            onChange={(e) => handleUpdate(page, section, contentKey, e.target.value)}
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="hero">
        <TabsList>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="about">À propos</TabsTrigger>
          <TabsTrigger value="location">Localisation</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="mini-hero">Mini Hero</TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Section Hero</h3>
            <div className="space-y-4">
              <ContentField page="home" section="hero" contentKey="title" label="Titre principal" />
              <ContentField page="home" section="hero" contentKey="subtitle" label="Sous-titre" />
              <ContentField page="home" section="hero" contentKey="tagline" label="Tagline" />
              <ContentField page="home" section="hero" contentKey="capacity" label="Capacité" />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Section À propos</h3>
            <div className="space-y-4">
              <ContentField page="home" section="about" contentKey="heading" label="Titre" />
              <ContentField 
                page="home" 
                section="about" 
                contentKey="description" 
                label="Description" 
                multiline 
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="location">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Section Localisation</h3>
            <div className="space-y-4">
              <ContentField page="home" section="location" contentKey="title" label="Titre" />
              <ContentField 
                page="home" 
                section="location" 
                contentKey="description" 
                label="Description" 
                multiline 
              />
              <ContentField page="home" section="location" contentKey="map_url" label="URL Google Maps" />
              <ContentField page="home" section="location" contentKey="address" label="Adresse" />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="footer">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Footer</h3>
            <div className="space-y-4">
              <ContentField 
                page="home" 
                section="footer" 
                contentKey="description" 
                label="Description" 
                multiline 
              />
              <ContentField page="home" section="footer" contentKey="email" label="Email" />
              <ContentField page="home" section="footer" contentKey="phone" label="Téléphone" />
              <ContentField page="home" section="footer" contentKey="address" label="Adresse" multiline />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="mini-hero">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Mini Hero (pages secondaires)</h3>
            <div className="space-y-4">
              <ContentField page="learn_more" section="mini_hero" contentKey="title" label="Titre" />
              <ContentField page="learn_more" section="mini_hero" contentKey="subtitle" label="Sous-titre" />
              <ContentField page="learn_more" section="mini_hero" contentKey="text_color" label="Couleur du texte (hex)" />
              <ContentField page="learn_more" section="mini_hero" contentKey="background_image_url" label="URL image de fond" />
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Button onClick={handleSaveAll} disabled={loading} size="lg" className="w-full">
        {loading ? 'Sauvegarde...' : 'Les modifications sont sauvegardées automatiquement'}
      </Button>
    </div>
  );
}
