import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Wrench, CheckCircle, ShoppingCart, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

// Reusable ServiceCard component
interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    price?: number;
    priceInRupees?: number;
    description: string;
    duration?: string;
    category?: string;
    icon?: string;
    isNew?: boolean;
    image?: string;
  };
  onAddToCart?: (serviceId: string) => void;
  addingToCart?: string | null;
  isInCart?: (serviceId: string) => boolean;
  showPrice?: boolean;
  showAddToCart?: boolean;
  onClick?: () => void;
}

const ServiceCard = ({ 
  service, 
  onAddToCart, 
  addingToCart, 
  isInCart, 
  showPrice = false, 
  showAddToCart = false,
  onClick 
}: ServiceCardProps) => {
  const formatPrice = (priceInPaise: number) => {
    return `₹${(priceInPaise / 100).toLocaleString('en-IN')}`;
  };

  return (
    <Card 
      className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-6 text-center">
        {/* Service Image/Icon - Standardized for both sections */}
        <div className="mb-4">
          {service.image ? (
            <img 
              src={service.image} 
              alt={service.name}
              className="w-16 h-16 mx-auto object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
              {service.icon || '🔧'}
            </div>
          )}
        </div>

        {/* Service Name - Identical styling for both sections */}
        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
          {service.name}
        </h3>

        {/* Service Description - Identical styling for both sections */}
        <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors mb-4">
          {service.description}
        </p>

        {/* Price and Duration (Four Wheeler only) */}
        {showPrice && service.price && (
          <div className="mb-4">
            <div className="text-2xl font-bold text-primary mb-2">
              {formatPrice(service.price)}
            </div>
            {service.duration && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Duration: {service.duration}</span>
              </div>
            )}
          </div>
        )}

        {/* Features (Four Wheeler only) */}
        {!showPrice && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-center gap-2 text-sm">
              <Wrench className="h-4 w-4 text-primary" />
              <span>Professional Service</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Quality Guaranteed</span>
            </div>
          </div>
        )}

        {/* Add to Cart Button removed as requested */}

        {/* Click to Book indicator removed as requested */}
      </CardContent>
    </Card>
  );
};

interface Service {
  id: string;
  name: string;
  price: number;
  priceInRupees: number;
  description: string;
  duration: string;
  category: string;
  icon: string;
  isNew?: boolean;
}

interface CartItem {
  _id: string;
  serviceId: string;
  serviceName: string;
  price: number;
  quantity: number;
}

// Two Wheeler Services will be fetched from backend API

const Services = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [twoWheelerSearchQuery, setTwoWheelerSearchQuery] = useState('');

  // Fetch available services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get<{services: Service[]}>('/cart/services');
        if (response.data && response.data.services) {
          setAllServices(response.data.services);
        } else if (response.data && Array.isArray(response.data)) {
          // Fallback: if response.data is directly an array
          setAllServices(response.data as Service[]);
        } else {
          console.error('Invalid response structure:', response);
          toast({
            title: 'Error',
            description: 'Invalid response from server.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        toast({
          title: 'Error',
          description: 'Failed to load services. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [toast]);

  // Fetch user's cart
  useEffect(() => {
    if (user) {
      const fetchCart = async () => {
        try {
          const response = await api.authGet<{success: boolean, bookings: any[]}>('/bookings/cart');
          if (response && response.bookings) {
            // Convert bookings to cart items format
            const cartItems = response.bookings.map(booking => ({
              _id: booking._id,
              serviceId: booking.serviceId,
              serviceName: booking.serviceName,
              price: booking.amount,
              quantity: 1
            }));
            setCartItems(cartItems);
          }
        } catch (error) {
          console.error('Error fetching cart bookings:', error);
        }
      };

      fetchCart();
    }
  }, [user]);

  const handleAddToCart = async (serviceId: string) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to book services.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    const service = allServices.find(s => s.id === serviceId);
    if (!service) {
      toast({
        title: 'Error',
        description: 'Service not found',
        variant: 'destructive',
      });
      return;
    }

    // Redirect to booking page with service data
    navigate('/booking', {
      state: {
        service: {
          id: service.id,
          name: service.name,
          description: service.description,
          category: service.category,
          duration: service.duration,
          icon: service.icon,
          price: service.price
        }
      }
    });
  };

  const isInCart = (serviceId: string) => {
    return cartItems.some(item => item.serviceId === serviceId);
  };

  // Separate Four Wheeler and Two Wheeler services
  const fourWheelerServices = useMemo(() => {
    return allServices.filter(service => 
      service.category !== 'Two Wheeler' && !service.id.startsWith('tw_')
    );
  }, [allServices]);

  const twoWheelerServices = useMemo(() => {
    return allServices.filter(service => 
      service.category === 'Two Wheeler' || service.id.startsWith('tw_')
    );
  }, [allServices]);

  // Filter Four Wheeler services based on search query
  const filteredFourWheelerServices = useMemo(() => {
    if (!searchQuery.trim()) return fourWheelerServices;
    
    return fourWheelerServices.filter(service =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [fourWheelerServices, searchQuery]);

  // Filter Two Wheeler services based on search query
  const filteredTwoWheelerServices = useMemo(() => {
    if (!twoWheelerSearchQuery.trim()) return twoWheelerServices;
    
    return twoWheelerServices.filter(service =>
      service.name.toLowerCase().includes(twoWheelerSearchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(twoWheelerSearchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(twoWheelerSearchQuery.toLowerCase())
    );
  }, [twoWheelerServices, twoWheelerSearchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Our <span className="text-primary">Services</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Professional automotive services with guaranteed quality and customer satisfaction.
            </p>
          </div>
          
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Loading Services</h3>
              <p className="text-muted-foreground">Please wait while we fetch our latest services...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Clean Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our <span className="text-primary">Services</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Choose your vehicle type below.
          </p>
        </div>

        {/* Four Wheeler Services Section */}
        <div className="mb-20 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Four Wheeler <span className="text-primary">Services</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Professional car services with guaranteed quality and customer satisfaction.
            </p>
          </div>

          {/* Search and Filter Section */}
          {fourWheelerServices.length > 0 && (
            <div className="mb-8">
              {/* Search Input */}
              <div className="max-w-md mx-auto mb-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search Four Wheeler services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full"
                  />
                </div>
              </div>

              {/* Results Counter */}
              <div className="text-center mb-8">
                <p className="text-muted-foreground">
                  {searchQuery ? (
                    <>Showing {filteredFourWheelerServices.length} of {fourWheelerServices.length} services</>
                  ) : (
                    <>Found {fourWheelerServices.length} services</>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span>Loading services...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {!loading && fourWheelerServices.length === 0 && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wrench className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No Services Available</h3>
                <p className="text-muted-foreground mb-6">
                  We're currently updating our service offerings. Please check back later.
                </p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Refresh Page
                </Button>
              </div>
            </div>
          )}

          {/* Services Grid - Identical layout to Two Wheeler section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {fourWheelerServices.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wrench className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Services Available</h3>
                  <p className="text-muted-foreground mb-6">
                    We're currently updating our service offerings. Please check back later.
                  </p>
                  <Button onClick={() => window.location.reload()} variant="outline">
                    Refresh Page
                  </Button>
                </div>
              </div>
            ) : filteredFourWheelerServices.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Services Found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search terms or browse all services.
                  </p>
                  <Button 
                    onClick={() => setSearchQuery('')} 
                    variant="outline"
                  >
                    Clear Search
                  </Button>
                </div>
              </div>
            ) : (
              filteredFourWheelerServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onAddToCart={handleAddToCart}
                  addingToCart={addingToCart}
                  isInCart={isInCart}
                  showPrice={true}
                  showAddToCart={false}
                />
              ))
            )}
          </div>
        </div>

        {/* Two Wheeler Services Section */}
        <div className="mb-20 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Two Wheeler <span className="text-primary">Services</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Professional motorcycle and scooter services with guaranteed quality and expert care.
            </p>
          </div>

          {/* Search and Filter Section - Identical to Four Wheeler */}
          <div className="mb-8">
            {/* Search Input */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search Two Wheeler services..."
                  value={twoWheelerSearchQuery}
                  onChange={(e) => setTwoWheelerSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>
            </div>

            {/* Results Counter */}
            <div className="text-center mb-8">
              <p className="text-muted-foreground">
                {twoWheelerSearchQuery ? (
                  <>Showing {filteredTwoWheelerServices.length} of {twoWheelerServices.length} services</>
                ) : (
                  <>Found {twoWheelerServices.length} services</>
                )}
              </p>
            </div>
          </div>

          {/* Two Wheeler Services Grid - Identical layout to Four Wheeler section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTwoWheelerServices.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Services Found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search terms or browse all services.
                  </p>
                  <Button 
                    onClick={() => setTwoWheelerSearchQuery('')} 
                    variant="outline"
                  >
                    Clear Search
                  </Button>
                </div>
              </div>
            ) : (
              filteredTwoWheelerServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onAddToCart={handleAddToCart}
                  addingToCart={addingToCart}
                  isInCart={isInCart}
                  showPrice={true}
                  showAddToCart={false}
                />
              ))
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Add your preferred services to cart and proceed with secure payment. 
            Our team will contact you to schedule the service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/cart')} 
              size="lg"
              disabled={!user || cartItems.length === 0}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              View Cart ({cartItems.length})
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/booking')}
              size="lg"
            >
              Book Direct Service
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Services;