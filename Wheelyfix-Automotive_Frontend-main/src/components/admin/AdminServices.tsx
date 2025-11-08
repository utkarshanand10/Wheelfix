import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { api } from '@/lib/api';

interface Service {
  _id?: string;
  id?: string; // backward compat for local items
  name: string;
  description: string;
  icon: string;
  price: number;
  durationMinutes: number; // backend field name
  isActive: boolean; // backend field name
  category: string;
}

const AdminServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get<Service[]>('/services');
      if (res.data) setServices(res.data);
      if (res.error) throw new Error(res.error);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({ title: 'Error', description: 'Failed to load services', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingService) return;

    try {
      const svcId = editingService._id || editingService.id;
      if (!svcId || String(svcId).startsWith('new-')) {
        await api.authPost<Service>('/services', {
          name: editingService.name,
          description: editingService.description,
          icon: editingService.icon,
          price: editingService.price,
          durationMinutes: (editingService as any).duration_minutes ?? editingService.durationMinutes,
          isActive: (editingService as any).is_active ?? editingService.isActive,
          category: editingService.category,
        });
      } else {
        await api.put<Service>(`/services/${svcId}`, {
          name: editingService.name,
          description: editingService.description,
          icon: editingService.icon,
          price: editingService.price,
          durationMinutes: (editingService as any).duration_minutes ?? editingService.durationMinutes,
          isActive: (editingService as any).is_active ?? editingService.isActive,
          category: editingService.category,
        });
      }
      toast({ title: 'Success', description: 'Service saved successfully' });
      setIsDialogOpen(false);
      setEditingService(null);
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({ title: 'Error', description: 'Failed to save service', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/services/${id}`);
      toast({ title: 'Success', description: 'Service deleted successfully' });
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({ title: 'Error', description: 'Failed to delete service', variant: 'destructive' });
    }
  };

  const openCreateDialog = () => {
    setEditingService({
      id: 'new-' + Date.now(),
      name: '',
      description: '',
      icon: '🔧',
      price: 0,
      durationMinutes: 60,
      isActive: true,
      category: 'General',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Services Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingService?.id?.startsWith('new-') ? 'Create Service' : 'Edit Service'}
              </DialogTitle>
            </DialogHeader>
            {editingService && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editingService.name}
                    onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editingService.description}
                    onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="icon">Icon</Label>
                  <Input
                    id="icon"
                    value={editingService.icon}
                    onChange={(e) => setEditingService({ ...editingService, icon: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={editingService.category}
                    onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={editingService.price}
                      onChange={(e) => setEditingService({ ...editingService, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (min)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={(editingService as any).duration_minutes ?? editingService.durationMinutes}
                      onChange={(e) => setEditingService({ ...editingService, durationMinutes: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={(editingService as any).is_active ?? editingService.isActive}
                    onCheckedChange={(checked) => setEditingService({ ...editingService, isActive: checked })}
                  />
                  <Label>Active</Label>
                </div>
                <Button onClick={handleSave} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Service
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {services.map((service) => (
          <Card key={(service as any)._id || service.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{service.icon}</div>
                  <div>
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline">{service.category}</Badge>
                      {service.price > 0 && (
                        <Badge variant="secondary">${service.price}</Badge>
                      )}
                      <Badge variant={(service as any).is_active ?? service.isActive ? "default" : "destructive"}>
                        {((service as any).is_active ?? service.isActive) ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(service)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(((service as any)._id || service.id!) as string)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminServices;