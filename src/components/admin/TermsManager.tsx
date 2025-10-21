import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { TermsSection } from '@/types/supabase';
import { Trash2, Edit, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function TermsManager() {
  const [sections, setSections] = useState<TermsSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingSection, setEditingSection] = useState<TermsSection | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    title_color: '',
    content_color: '',
    title_weight: '',
    content_weight: '',
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('terms_sections')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      title_color: '',
      content_color: '',
      title_weight: '',
      content_weight: '',
    });
    setEditingSection(null);
  };

  const handleEdit = (section: TermsSection) => {
    setEditingSection(section);
    setFormData({
      title: section.title,
      content: section.content,
      title_color: section.title_color || '',
      content_color: section.content_color || '',
      title_weight: section.title_weight || '',
      content_weight: section.content_weight || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast({ title: 'Veuillez remplir les champs requis', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      if (editingSection) {
        const { error } = await supabase
          .from('terms_sections')
          .update(formData)
          .eq('id', editingSection.id);

        if (error) throw error;
        toast({ title: 'Section mise à jour' });
      } else {
        const { error } = await supabase
          .from('terms_sections')
          .insert({
            ...formData,
            visible: true,
            display_order: sections.length,
          });

        if (error) throw error;
        toast({ title: 'Section ajoutée' });
      }

      resetForm();
      setDialogOpen(false);
      fetchSections();
    } catch (error) {
      console.error('Error saving section:', error);
      toast({ title: 'Erreur lors de la sauvegarde', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette section ?')) return;

    try {
      const { error } = await supabase
        .from('terms_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Section supprimée' });
      fetchSections();
    } catch (error) {
      console.error('Error deleting section:', error);
      toast({ title: 'Erreur lors de la suppression', variant: 'destructive' });
    }
  };

  const toggleVisibility = async (id: string, visible: boolean) => {
    try {
      const { error } = await supabase
        .from('terms_sections')
        .update({ visible })
        .eq('id', id);

      if (error) throw error;
      fetchSections();
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
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une section
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSection ? 'Modifier la section' : 'Nouvelle section'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Contenu (HTML accepté)</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Couleur du titre (optionnel)</Label>
                <Input
                  type="color"
                  value={formData.title_color}
                  onChange={(e) => setFormData({ ...formData, title_color: e.target.value })}
                />
              </div>
              <div>
                <Label>Couleur du contenu (optionnel)</Label>
                <Input
                  type="color"
                  value={formData.content_color}
                  onChange={(e) => setFormData({ ...formData, content_color: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleSave} disabled={loading} className="w-full">
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 
                  className="font-semibold text-lg mb-2"
                  style={{ color: section.title_color || undefined }}
                >
                  {section.title}
                </h3>
                <div 
                  className="text-sm text-muted-foreground line-clamp-3"
                  style={{ color: section.content_color || undefined }}
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(section)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(section.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Switch
                checked={section.visible}
                onCheckedChange={(checked) => toggleVisibility(section.id, checked)}
              />
              <span className="text-sm">Visible</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
