import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Users, 
  FileText, 
  Grid, 
  Car, 
  BookOpen,
  Shield,
  BarChart
} from 'lucide-react';
import { api } from '@/lib/api';
import AdminHeroContent from '@/components/admin/AdminHeroContent';
import AdminServices from '@/components/admin/AdminServices';
import AdminCategories from '@/components/admin/AdminCategories';
import AdminBlogPosts from '@/components/admin/AdminBlogPosts';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminBookings from '@/components/admin/AdminBookings';
import AdminPayments from '@/components/admin/AdminPayments';

const Admin = () => {
  const { isAdmin, loading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your Wheelyfix Automotive website</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Admin Access
          </Badge>
        </div>

        {/* Quick Stats (live) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Users" icon={<Users className="h-4 w-4 text-muted-foreground" />} endpoint="/users" />
          <StatsCard title="Active Services" icon={<Car className="h-4 w-4 text-muted-foreground" />} endpoint="/services" />
          <StatsCard title="Payments" icon={<BookOpen className="h-4 w-4 text-muted-foreground" />} endpoint="/payments" />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Grid className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">—</div>
              <p className="text-xs text-muted-foreground">Product categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="hero" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Hero Content
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="blogs" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Blog Posts
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hero">
            <AdminHeroContent />
          </TabsContent>

          <TabsContent value="services">
            <AdminServices />
          </TabsContent>

          <TabsContent value="categories">
            <AdminCategories />
          </TabsContent>

          <TabsContent value="blogs">
            <AdminBlogPosts />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="bookings">
            <AdminBookings />
          </TabsContent>

          <TabsContent value="payments">
            <AdminPayments />
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;

function StatsCard({ title, icon, endpoint }: { title: string; icon: React.ReactNode; endpoint: string }) {
  const [count, setCount] = useState<string>('—');
  useEffect(() => {
    let mounted = true;
    api.get<any>(endpoint).then((res) => {
      if (!mounted) return;
      const len = Array.isArray(res.data) ? res.data.length : undefined;
      setCount(len !== undefined ? String(len) : '—');
    }).catch(() => setCount('—'));
    return () => { mounted = false; };
  }, [endpoint]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
        <p className="text-xs text-muted-foreground">Live</p>
      </CardContent>
    </Card>
  );
}