import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Save } from 'lucide-react';

interface ProductCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const raw = localStorage.getItem('product_categories');
      const data = raw ? (JSON.parse(raw) as ProductCategory[]) : [];
      setCategories(data.sort((a,b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({ title: 'Error', description: 'Failed to load categories', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingCategory) return;

    try {
      const raw = localStorage.getItem('product_categories');
      const list: ProductCategory[] = raw ? JSON.parse(raw) : [];
      if (editingCategory.id.startsWith('new-')) {
        list.push({ ...editingCategory, id: crypto.randomUUID() });
      } else {
        const idx = list.findIndex(c => c.id === editingCategory.id);
        if (idx !== -1) list[idx] = { ...editingCategory };
      }
      localStorage.setItem('product_categories', JSON.stringify(list));
      toast({ title: 'Success', description: 'Category saved successfully' });
      setIsDialogOpen(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({ title: 'Error', description: 'Failed to save category', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const raw = localStorage.getItem('product_categories');
      const list: ProductCategory[] = raw ? JSON.parse(raw) : [];
      const next = list.filter(c => c.id !== id);
      localStorage.setItem('product_categories', JSON.stringify(next));
      toast({ title: 'Success', description: 'Category deleted successfully' });
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({ title: 'Error', description: 'Failed to delete category', variant: 'destructive' });
    }
  };

  const openCreateDialog = () => {
    const maxSortOrder = Math.max(...categories.map(c => c.sort_order), 0);
    setEditingCategory({
      id: 'new-' + Date.now(),
      name: '',
      icon: '🔧',
      description: '',
      image_url: '',
      is_active: true,
      sort_order: maxSortOrder + 1,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: ProductCategory) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Product Categories</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory?.id.startsWith('new-') ? 'Create Category' : 'Edit Category'}
              </DialogTitle>
            </DialogHeader>
            {editingCategory && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="icon">Icon</Label>
                  <Input
                    id="icon"
                    value={editingCategory.icon}
                    onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editingCategory.description}
                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={editingCategory.sort_order}
                    onChange={(e) => setEditingCategory({ ...editingCategory, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingCategory.is_active}
                    onCheckedChange={(checked) => setEditingCategory({ ...editingCategory, is_active: checked })}
                  />
                  <Label>Active</Label>
                </div>
                <Button onClick={handleSave} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Category
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="relative group">
            <CardContent className="p-4 text-center">
              <div className="text-4xl mb-2">{category.icon}</div>
              <h3 className="font-semibold text-sm mb-2">{category.name}</h3>
              <div className="flex flex-col space-y-1 mb-3">
                <Badge variant={category.is_active ? "default" : "destructive"} className="text-xs">
                  {category.is_active ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Order: {category.sort_order}
                </Badge>
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(category)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(category.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminCategories;