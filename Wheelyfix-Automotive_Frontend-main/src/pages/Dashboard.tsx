import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PaymentStatus from '@/components/PaymentStatus';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Car, Clock, FileText, Settings, User, CheckCircle2, Download } from 'lucide-react';
import { api } from '@/lib/api';

interface Appointment {
  id: string;
  service: string;
  date: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  amount?: number;
  invoice?: {
    url: string;
    fileName: string;
    generatedAt: string;
  };
}

interface Vehicle {
  type: string;
  model: string;
  year: number;
  registrationNumber: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);
  
  // Pricing map for services (INR)
  const SERVICE_PRICE_MAP: Record<string, number> = {
    basic: 799,
    comprehensive: 1999,
    ac: 1499,
    battery: 1299,
    brake: 999,
    suspension: 1999,
    'oil-change': 899,
    'wheel-alignment': 699,
    'car-wash': 399,
  };
  const normalizeServiceKey = (s: string) => (s || '').toLowerCase().trim().replace(/\s+/g, '-').replace(/-service$/, '');
  const inr = useMemo(() => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }), []);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.authGet<Array<any>>('/bookings/my');
        const items = response || [];
        const mapped: Appointment[] = items
          .map((booking) => {
            return {
              id: booking._id, 
              service: booking.serviceName,
              date: booking.createdAt, 
              status: booking.status === 'confirmed' ? 'upcoming' : booking.status,
              paymentStatus: booking.paymentStatus,
              paymentId: booking.paymentId,
              amount: booking.amount,
              invoice: booking.invoice
            };
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setAppointments(mapped);
      } catch (e) {
        console.error('Error loading bookings:', e);
        // leave empty state on error
      }

      if (user?.vehicles) {
        const sanitized: Vehicle[] = (user.vehicles as Array<Partial<Vehicle>>)
          .map((v) => ({
            type: String(v.type ?? ''),
            model: String(v.model ?? ''),
            year: Number(v.year ?? 0),
            registrationNumber: String(v.registrationNumber ?? ''),
          }))
          .filter((v) => Boolean(v.type && v.model && v.registrationNumber && v.year > 0));
        setVehicles(sanitized);
      }
    };
    load();
  }, [user]);

  const appointmentsWithPrice = useMemo(() => appointments.map(a => ({ ...a, price: SERVICE_PRICE_MAP[normalizeServiceKey(a.service)] ?? 0 })), [appointments]);
  const nextAppointment = useMemo(() => appointmentsWithPrice.find(a => new Date(a.date).getTime() >= Date.now()), [appointmentsWithPrice]);
  const upcomingCount = useMemo(() => appointments.filter(a => a.status === 'upcoming').length, [appointments]);
  const completedCount = useMemo(() => appointments.filter(a => a.status === 'completed').length, [appointments]);
  const totalAmount = useMemo(() => appointmentsWithPrice.reduce((sum, a: any) => sum + (a.price || 0), 0), [appointmentsWithPrice]);

  const handleDownloadInvoice = async (orderId: string) => {
    setDownloadingInvoice(orderId);
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/invoice`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download invoice');
      }

      // Get filename from response headers or use default
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `invoice_${orderId}.pdf`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Show success message
      alert('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#94a3b81a_1px,transparent_1px),linear-gradient(to_bottom,#94a3b81a_1px,transparent_1px)] bg-[size:16px_24px]" />
        <div className="absolute -top-20 -right-20 w-[360px] h-[360px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-[360px] h-[360px] bg-accent/10 rounded-full blur-3xl" />
      </div>
      <Header />
      <div className="container mx-auto px-4 py-12 relative">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/')}>Home</Button>
              <Button variant="outline" onClick={handleLogout}>Sign Out</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-md bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Welcome back
                </CardTitle>
                <CardDescription className="text-muted-foreground font-medium">{user?.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground">{user?.email}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-amber-100/60 to-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Next Appointment
                </CardTitle>
                <CardDescription>{nextAppointment ? 'Upcoming service' : 'No upcoming service'}</CardDescription>
              </CardHeader>
              <CardContent>
                {nextAppointment ? (
                  <div>
                    <div className="flex items-center mb-1">
                      <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                      <span className="text-sm text-foreground font-medium">
                        {new Date(nextAppointment.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                      <span className="text-sm text-foreground font-medium">
                        {new Date(nextAppointment.date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-teal-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Service Summary</CardTitle>
                <CardDescription>Quick glance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{upcomingCount}</span> upcoming
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{completedCount}</span> completed
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{vehicles.length}</span> vehicles
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="appointments" className="w-full">
            <TabsList className="mb-6 bg-muted/50 p-1 rounded-lg">
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
              <TabsTrigger value="history">Service History</TabsTrigger>
              <TabsTrigger value="settings">Account Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="appointments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Appointments</CardTitle>
                  <CardDescription>Manage your scheduled services</CardDescription>
                </CardHeader>
                <CardContent>
                  {appointmentsWithPrice.length > 0 ? (
                    <div className="space-y-4">
                      {appointmentsWithPrice.map((appointment: any) => (
                        <div
                          key={appointment.id}
                          className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div>
                            <h3 className="font-semibold capitalize text-foreground">{appointment.service}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(appointment.date).toLocaleDateString()} at{' '}
                              {new Date(appointment.date).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            <p className="text-sm text-foreground mt-1">
                              Charge: <span className="font-semibold">{inr.format(appointment.price)}</span>
                            </p>
                            {appointment.paymentStatus && (
                              <div className="mt-2">
                                <PaymentStatus 
                                  status={appointment.paymentStatus}
                                  paymentId={appointment.paymentId}
                                  amount={appointment.amount}
                                />
                              </div>
                            )}
                          </div>
                          <div className="sm:text-right space-y-2">
                            <div className="flex flex-col sm:flex-row gap-2 items-end">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  appointment.status === 'upcoming'
                                    ? 'bg-blue-100 text-blue-800'
                                    : appointment.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </span>
                              
                              {/* Download Invoice Button */}
                              {appointment.paymentStatus === 'paid' && appointment.invoice && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDownloadInvoice(appointment.id)}
                                  disabled={downloadingInvoice === appointment.id}
                                  className="text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300"
                                >
                                  {downloadingInvoice === appointment.id ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600 mr-1"></div>
                                      Downloading...
                                    </>
                                  ) : (
                                    <>
                                      <Download className="h-3 w-3 mr-1" />
                                      Download Invoice
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">
                      You don't have any appointments yet.
                    </p>
                  )}
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-accent/10 rounded-md p-3 border">
                      <span className="text-sm text-muted-foreground">Total amount</span>
                      <span className="text-base font-semibold">{inr.format(totalAmount)}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button onClick={() => navigate('/booking')} variant="secondary" className="w-full sm:flex-1">
                        Book New Appointment
                      </Button>
                      <Button onClick={() => navigate('/cart')} className="w-full sm:flex-1 bg-orange-500 hover:bg-orange-600 text-white">
                        Proceed to Payment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vehicles" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Vehicles</CardTitle>
                  <CardDescription>Manage your registered vehicles</CardDescription>
                </CardHeader>
                <CardContent>
                  {vehicles.length > 0 ? (
                    <div className="space-y-4">
                      {vehicles.map((vehicle, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 border rounded-lg bg-card hover:border-primary/40 hover:shadow-sm transition"
                        >
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {vehicle.year} {vehicle.model}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {vehicle.type} • {vehicle.registrationNumber}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" className="w-full sm:w-auto hover:bg-primary/10">
                            <Settings className="h-4 w-4 mr-2" />
                            Manage
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">
                      You don't have any vehicles registered yet.
                    </p>
                  )}
                  <div className="mt-6">
                    <Button className="w-full">Add New Vehicle</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Service History</CardTitle>
                  <CardDescription>View your past services</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-8 text-muted-foreground">
                    Your service history will appear here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Notification Preferences
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;