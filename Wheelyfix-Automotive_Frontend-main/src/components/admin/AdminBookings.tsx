import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface BookingUser {
  name?: string;
  email?: string;
}

interface BookingItem {
  _id: string;
  user?: BookingUser;
  name: string;
  phoneNumber: string;
  email: string;
  vehicleType: string;
  vehicleModel: string;
  serviceType: string;
  date: string;
  timeSlot: string;
  address: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  createdAt: string;
}

const statusBadgeVariant = (status: BookingItem['status']) => {
  if (status === 'completed') return 'default' as const;
  if (status === 'cancelled') return 'destructive' as const;
  return 'secondary' as const;
};

const AdminBookings = () => {
  const [items, setItems] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchItems = async () => {
    try {
      const res = await api.get<BookingItem[]>('/bookings');
      if (res.data) setItems(res.data);
      if (res.error) throw new Error(res.error);
    } catch (err) {
      console.error('Failed to load bookings', err);
      toast({ title: 'Error', description: 'Failed to load bookings', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = async (id: string, status: BookingItem['status']) => {
    try {
      setUpdatingId(id);
      const res = await api.put<BookingItem>(`/bookings/${id}/status`, { status });
      if (res.error) throw new Error(res.error);
      toast({ title: 'Updated', description: 'Booking status updated' });
      fetchItems();
    } catch (err) {
      console.error('Failed to update status', err);
      toast({ title: 'Error', description: 'Failed to update booking status', variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8">Loading...</div>;
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">No bookings found.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">Total bookings: {items.length}</div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((b) => (
              <TableRow key={b._id}>
                <TableCell className="font-medium">#{b._id.slice(-6)}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{b.name || b.user?.name || '—'}</span>
                    <span className="text-xs text-muted-foreground">{b.email || b.user?.email || '—'} • {b.phoneNumber}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {b.vehicleType} {b.vehicleModel}
                </TableCell>
                <TableCell>{b.serviceType}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{new Date(b.date).toLocaleDateString()}</span>
                    <span className="text-xs text-muted-foreground">{b.timeSlot}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusBadgeVariant(b.status)} className="capitalize">{b.status}</Badge>
                    <Select
                      value={b.status}
                      onValueChange={(val: BookingItem['status']) => handleStatusChange(b._id, val)}
                      disabled={updatingId === b._id}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Change" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
                <TableCell>{new Date(b.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminBookings;


