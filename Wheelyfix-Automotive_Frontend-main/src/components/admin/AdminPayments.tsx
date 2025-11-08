import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface PaymentUser {
  name?: string;
  email?: string;
}

interface PaymentItem {
  _id: string;
  user?: PaymentUser;
  orderId?: string;
  paymentId?: string;
  amount: number; // paise
  currency: string;
  receipt?: string;
  status: 'created' | 'paid' | 'failed';
  error?: string;
  createdAt: string;
}

const statusBadgeVariant = (status: PaymentItem['status']) => {
  if (status === 'paid') return 'default' as const;
  if (status === 'failed') return 'destructive' as const;
  return 'secondary' as const;
};

const formatAmount = (amountPaise: number, currency: string) => {
  const amount = amountPaise / 100;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
};

const AdminPayments = () => {
  const [items, setItems] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = async () => {
    try {
      const res = await api.get<PaymentItem[]>('/payments');
      if (res.data) setItems(res.data);
      if (res.error) throw new Error(res.error);
    } catch (err) {
      console.error('Failed to load payments', err);
      toast({ title: 'Error', description: 'Failed to load payments', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-8">Loading...</div>;
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">No payments found.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">Total payments: {items.length}</div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((p) => (
              <TableRow key={p._id}>
                <TableCell className="font-medium">{p.orderId || '—'}</TableCell>
                <TableCell>{p.paymentId || '—'}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{p.user?.name || '—'}</span>
                    <span className="text-xs text-muted-foreground">{p.user?.email || '—'}</span>
                  </div>
                </TableCell>
                <TableCell>{formatAmount(p.amount, p.currency)}</TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant(p.status)} className="capitalize">{p.status}</Badge>
                </TableCell>
                <TableCell>{new Date(p.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminPayments;


