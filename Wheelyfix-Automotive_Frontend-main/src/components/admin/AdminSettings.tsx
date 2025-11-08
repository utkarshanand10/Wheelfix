import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface TestConnectionResponse {
  success: boolean;
  message: string;
  dbState: number;
  stats?: { users?: number; bookings?: number; payments?: number };
  timestamp: string;
}

interface PaymentsConfigResponse {
  enabled: boolean;
  keyId: string | null;
}

const AdminSettings = () => {
  const [conn, setConn] = useState<TestConnectionResponse | null>(null);
  const [payCfg, setPayCfg] = useState<PaymentsConfigResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const [c, p] = await Promise.all([
      api.get<TestConnectionResponse>('/users/test-connection'),
      api.get<PaymentsConfigResponse>('/payments/config'),
    ]);
    setConn(c.data || null);
    setPayCfg(p.data || null);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const dbStateText = (s?: number) => {
    switch (s) {
      case 1: return 'connected';
      case 2: return 'connecting';
      case 3: return 'disconnecting';
      default: return 'disconnected';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Settings & System Status</h2>
        <Button onClick={refresh} variant="outline" size="sm" disabled={loading}>Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Backend & Database</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span>Status:</span>
              <Badge variant={conn?.success ? 'default' : 'destructive'} className="capitalize">
                {conn?.success ? 'Online' : 'Offline'}
              </Badge>
              <span className="text-sm text-muted-foreground">{conn?.message}</span>
            </div>
            <div className="text-sm text-muted-foreground">DB: {dbStateText(conn?.dbState)}</div>
            {conn?.stats && (
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-xl font-semibold">{conn.stats.users ?? '—'}</div>
                  <div className="text-xs text-muted-foreground">Users</div>
                </div>
                <div>
                  <div className="text-xl font-semibold">{conn.stats.bookings ?? '—'}</div>
                  <div className="text-xs text-muted-foreground">Bookings</div>
                </div>
                <div>
                  <div className="text-xl font-semibold">{conn.stats.payments ?? '—'}</div>
                  <div className="text-xs text-muted-foreground">Payments</div>
                </div>
              </div>
            )}
            <div className="text-xs text-muted-foreground">Last checked: {conn?.timestamp ? new Date(conn.timestamp).toLocaleString() : '—'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payments Gateway (Razorpay)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span>Configured:</span>
              <Badge variant={payCfg?.enabled ? 'default' : 'secondary'}>
                {payCfg?.enabled ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Key ID: {payCfg?.keyId ? `${payCfg.keyId.slice(0, 6)}••••` : '—'}
            </div>
            <div className="text-xs text-muted-foreground">Use /api/payments/config to manage visibility of Pay Now buttons.</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div>API Base: /api (proxied to backend on dev)</div>
          <div>Frontend: React + Vite + Tailwind + shadcn/ui</div>
          <div>Backend: Node.js + Express + MongoDB</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;


