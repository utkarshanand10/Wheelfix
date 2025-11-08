import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
// import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

interface HeroContent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  background_image_url: string;
  cta_text: string;
  is_active: boolean;
}

const AdminHeroContent = () => {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchHeroContent();
  }, []);

  const fetchHeroContent = async () => {
    try {
      const raw = localStorage.getItem('hero_content');
      const data: HeroContent | null = raw ? JSON.parse(raw) : null;
      setHeroContent(data);
    } catch (error) {
      console.error('Error fetching hero content:', error);
      toast({ title: 'Error', description: 'Failed to load hero content', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!heroContent) return;
    setSaving(true);

    try {
      localStorage.setItem('hero_content', JSON.stringify(heroContent));
      toast({ title: 'Success', description: 'Hero content updated successfully' });
    } catch (error) {
      console.error('Error saving hero content:', error);
      toast({ title: 'Error', description: 'Failed to save hero content', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof HeroContent, value: any) => {
    if (!heroContent) return;
    setHeroContent({ ...heroContent, [field]: value });
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hero Section Content</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={heroContent?.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter hero title"
            />
          </div>

          <div>
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              value={heroContent?.subtitle || ''}
              onChange={(e) => handleInputChange('subtitle', e.target.value)}
              placeholder="Enter hero subtitle"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={heroContent?.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter hero description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="cta_text">Call-to-Action Text</Label>
            <Input
              id="cta_text"
              value={heroContent?.cta_text || ''}
              onChange={(e) => handleInputChange('cta_text', e.target.value)}
              placeholder="Enter CTA button text"
            />
          </div>

          <div>
            <Label htmlFor="background_image_url">Background Image URL</Label>
            <Input
              id="background_image_url"
              value={heroContent?.background_image_url || ''}
              onChange={(e) => handleInputChange('background_image_url', e.target.value)}
              placeholder="Enter background image URL"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={heroContent?.is_active || false}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminHeroContent;