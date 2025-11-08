import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { analyticsApi } from "@/api/admin";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface UserItem {
  _id: string;
}
interface BookingItem {
  _id: string;
  serviceType: string;
  createdAt: string;
}
interface PaymentItem {
  _id: string;
  status: "created" | "paid" | "failed";
  amount: number;
  currency: string;
  createdAt: string;
}
interface ServiceItem {
  _id: string;
  isActive: boolean;
}

const AdminAnalytics = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  // local state to hold raw dashboard data
  const [dashboardData, setDashboardData] = useState<any>(null);

  const fetchAll = async () => {
    try {
      // Use the admin analytics dashboard endpoint which aggregates data server-side
      const res = await analyticsApi.getDashboardStats();
      if (!res.data || !res.data.success)
        throw new Error("Failed to load analytics");
      const data = res.data.data;

      // Map server response into local shapes
      setUsers(new Array(data.overview.totalUsers).fill({ _id: "" }));
      setServices(
        new Array(data.overview.activeServices || 0).fill({
          _id: "",
          isActive: true,
        } as ServiceItem)
      );

      // payments: we don't get raw payments list from analytics; synthesize a payments array
      const paymentsList: PaymentItem[] = [];
      (data.monthlyRevenue || []).forEach((m: any) => {
        // approximate by creating a payment entry per month datapoint
        paymentsList.push({
          _id: `${m._id?.year}-${m._id?.month}`,
          status: "paid",
          amount: m.revenue || 0,
          currency: "INR",
          createdAt: new Date(
            m._id?.year,
            (m._id?.month || 1) - 1,
            1
          ).toISOString(),
        });
      });
      setPayments(paymentsList);

      // bookings: use serviceStats totals as bookings proxy
      const bookingsList: BookingItem[] = [];
      (data.serviceStats || []).forEach((sItem: any) => {
        bookingsList.push({
          _id: sItem._id,
          serviceType: sItem.title || "Service",
          createdAt: new Date().toISOString(),
        });
      });
      setBookings(bookingsList);

      // store the raw dashboard data in local state for charts
      setDashboardData(data);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to load analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = useMemo(() => {
    // Prefer aggregated dashboard data when available
    const totalUsers = dashboardData?.overview?.totalUsers ?? users.length;
    const totalBookings =
      dashboardData?.overview?.totalOrders ?? bookings.length;
    const totalPayments =
      dashboardData?.overview?.paidOrders ?? payments.length;
    const totalPaidAmount =
      dashboardData?.revenue?.totalRevenue ??
      payments
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + (p.amount || 0), 0);
    return { totalUsers, totalBookings, totalPayments, totalPaidAmount };
  }, [users, bookings, payments, dashboardData]);

  const activeServices = useMemo(
    () => services.filter((s) => (s as any).isActive !== false).length,
    [services]
  );

  // Build revenue series from server monthlyRevenue if available, otherwise fallback
  const revenueSeries = useMemo(() => {
    if (
      dashboardData &&
      dashboardData.monthlyRevenue &&
      dashboardData.monthlyRevenue.length > 0
    ) {
      // dashboardData.monthlyRevenue contains items with _id: { year, month }, revenue
      // Map into the chart format
      return dashboardData.monthlyRevenue.map((m: any) => ({
        date: `${String(m._id.month).padStart(2, "0")}/${m._id.year}`,
        revenue: m.revenue,
      }));
    }
    // fallback: empty series
    return [];
  }, [dashboardData]);

  const topServices = useMemo(() => {
    if (dashboardData && dashboardData.serviceStats) {
      return (dashboardData.serviceStats || [])
        .slice(0, 5)
        .map((s: any) => ({
          service: s.title || s._id,
          count: s.totalSold || 0,
        }));
    }
    const counts: Record<string, number> = {};
    bookings.forEach((b) => {
      counts[b.serviceType] = (counts[b.serviceType] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([service, count]) => ({ service, count }));
  }, [bookings, dashboardData]);

  // recent orders/activity from dashboard
  const recentActivity = dashboardData?.recentActivity || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.totalBookings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.totalPayments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Revenue (INR)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
              }).format(totals.totalPaidAmount / 100)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeServices}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Revenue last 14 days</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchAll}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={revenueSeries}
              margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top services by bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {topServices.length === 0 ? (
            <div className="text-muted-foreground">No data yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {topServices.map((t) => (
                <div
                  key={t.service}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="font-medium">{t.service}</div>
                  <Badge variant="secondary">{t.count}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
