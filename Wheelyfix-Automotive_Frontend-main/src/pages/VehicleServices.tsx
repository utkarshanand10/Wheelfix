import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CheckCircle, Clock, Wrench, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Types
interface Service {
  serviceName: string;
  price: number;
  description: string;
  estimatedTime: number;
  category: string;
}

interface VehicleInfo {
  brand: string;
  model: string;
  fuel: string;
}

interface ServiceStatistics {
  totalServices: number;
  totalPrice: number;
  totalTime: number;
  categories: string[];
  priceRange: {
    min: number;
    max: number;
  };
  timeRange: {
    min: number;
    max: number;
  };
}

interface LocationState {
  services?: Service[];
  vehicleInfo?: VehicleInfo;
  formData: {
    vehicleType: string;
    brand: string;
    model: string;
    fuel: string;
    mobile: string;
  };
  statistics?: ServiceStatistics;
}

const VehicleServices: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get data from navigation state
  const state = location.state as LocationState;

  // If no state data, redirect back to home
  if (!state) {
    React.useEffect(() => {
      toast({
        title: 'No Data Available',
        description: 'Please select your vehicle details first.',
        variant: 'destructive',
      });
      navigate('/');
    }, [navigate, toast]);
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
          <p className="text-gray-600">Redirecting you back...</p>
        </div>
      </div>
    );
  }

  const { services, vehicleInfo, formData } = state;

  // Ensure services are properly isolated by vehicle type
  React.useEffect(() => {
    console.log(`🔄 VehicleServices: Vehicle type is ${formData?.vehicleType}, ensuring service isolation`);
    if (formData?.vehicleType) {
      console.log(`✅ VehicleServices: Displaying ${formData.vehicleType.toLowerCase()} services only`);
    }
  }, [formData?.vehicleType]);

  // Default fallback services based on vehicle type - COMPLETELY SEPARATED
  const getDefaultServices = (vehicleType: string): Service[] => {
    console.log(`🔄 Getting default services for vehicle type: ${vehicleType}`);
    
    if (vehicleType && vehicleType.toLowerCase() === 'bike') {
      console.log(`🏍️ Returning BIKE services only`);
      return [
        {
          serviceName: "Basic Service",
          price: 499,
          description: "Engine oil change (semi-synthetic), air filter cleaning, chain cleaning & lubrication, brake inspection & adjustment, battery & electrical check-up, general wash & polish, free pickup & drop (within 5 km)",
          estimatedTime: 1,
          category: "Basic"
        },
        {
          serviceName: "Standard Service",
          price: 999,
          description: "Everything in Basic Service plus engine oil (synthetic), oil filter replacement, spark plug check/cleaning, carburetor/FI tuning, brake shoe/pad cleaning, full bike health inspection report",
          estimatedTime: 1.5,
          category: "Standard"
        },
        {
          serviceName: "Premium Service",
          price: 1499,
          description: "Everything in Standard Service plus premium synthetic oil (Motul/Castrol Power1), coolant top-up, complete chain set cleaning & lubrication, throttle body cleaning (for FI bikes), suspension check & lubrication, detailed bike wash & polishing, free pick-up & drop (up to 10 km)",
          estimatedTime: 2,
          category: "Premium"
        },
        {
          serviceName: "Annual Maintenance Package (AMC)",
          price: 1999,
          description: "3 Free Services (any time in a year), 1 Free General Check-up, discounts on parts (10–15%), priority booking, lifetime free washing (4 times/year)",
          estimatedTime: 0,
          category: "AMC"
        },
        {
          serviceName: "Bike Wash & Polish",
          price: 149,
          description: "Complete bike washing, polishing, and detailing",
          estimatedTime: 0.5,
          category: "Add-on"
        },
        {
          serviceName: "Brake Pad Replacement",
          price: 249,
          description: "Brake pad replacement with genuine parts",
          estimatedTime: 0.5,
          category: "Add-on"
        }
      ];
    } else {
      console.log(`🚗 Returning CAR services only`);
      // Default car services
      return [
        {
          serviceName: "Basic Service",
          price: 2500,
          description: "Engine oil replacement, air filter cleaning, basic inspection, car washing",
          estimatedTime: 1,
          category: "Basic"
        },
        {
          serviceName: "Standard Service",
          price: 3500,
          description: "Basic service + brake check, coolant top-up, spark plug check, battery inspection",
          estimatedTime: 2,
          category: "Standard"
        },
        {
          serviceName: "Comprehensive Service",
          price: 5000,
          description: "Standard service + AC filter replacement, wheel alignment, detailed inspection",
          estimatedTime: 3,
          category: "Comprehensive"
        },
        {
          serviceName: "AC Service",
          price: 1800,
          description: "AC gas refill, filter cleaning, cooling system check",
          estimatedTime: 1,
          category: "AC"
        },
        {
          serviceName: "Tyre Care",
          price: 1200,
          description: "Tyre rotation, balancing, pressure check, tread inspection",
          estimatedTime: 1,
          category: "Tyre"
        },
        {
          serviceName: "Battery Service",
          price: 1500,
          description: "Battery health check, terminal cleaning, charging test",
          estimatedTime: 1,
          category: "Battery"
        }
      ];
    }
  };

  const defaultServices = getDefaultServices(formData?.vehicleType || 'Car');

  // Use provided services or fallback to default services
  const displayServices = services && services.length > 0 ? services : defaultServices;
  
  // Create default vehicle info if not provided
  const displayVehicleInfo: VehicleInfo = vehicleInfo || {
    brand: formData?.brand || 'General',
    model: formData?.model || 'General',
    fuel: formData?.fuel || 'Petrol'
  };

  // Categorize services into tiers
  const categorizeServices = (services: Service[]) => {
    const basicServices: Service[] = [];
    const standardServices: Service[] = [];
    const comprehensiveServices: Service[] = [];

    services.forEach(service => {
      const price = service.price;
      const category = service.category?.toLowerCase() || '';
      
      // Categorize based on price and category
      if (price <= 2000 || category.includes('basic') || category.includes('oil') || category.includes('wash')) {
        basicServices.push(service);
      } else if (price <= 5000 || category.includes('standard') || category.includes('brake') || category.includes('battery')) {
        standardServices.push(service);
      } else {
        comprehensiveServices.push(service);
      }
    });

    return { basicServices, standardServices, comprehensiveServices };
  };

  const { basicServices, standardServices, comprehensiveServices } = categorizeServices(displayServices);

  // Get unique categories for filter
  const availableCategories = useMemo(() => {
    const categories = [...new Set(displayServices.map(service => service.category))];
    return categories.sort();
  }, [displayServices]);

  // Filter services based on search term and category
  const filteredBasicServices = useMemo(() => {
    return basicServices.filter(service => {
      const matchesSearch = service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [basicServices, searchTerm, selectedCategory]);

  const filteredStandardServices = useMemo(() => {
    return standardServices.filter(service => {
      const matchesSearch = service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [standardServices, searchTerm, selectedCategory]);

  const filteredComprehensiveServices = useMemo(() => {
    return comprehensiveServices.filter(service => {
      const matchesSearch = service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [comprehensiveServices, searchTerm, selectedCategory]);

  const handleBookService = (service: Service) => {
    // Navigate to booking page with service and vehicle data
    navigate('/booking', {
      state: {
        service: {
          id: `${displayVehicleInfo.brand.toLowerCase()}-${displayVehicleInfo.model.toLowerCase()}-${service.serviceName.toLowerCase().replace(/\s+/g, '-')}`,
          name: service.serviceName,
          description: service.description,
          category: service.category,
          duration: `${service.estimatedTime} hour${service.estimatedTime !== 1 ? 's' : ''}`,
          icon: (formData?.vehicleType && formData.vehicleType.toLowerCase() === 'bike') ? '🏍️' : '🚗',
          price: service.price
        },
        vehicleInfo: displayVehicleInfo,
        formData: formData
      }
    });
  };


  const handleBackToQuote = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={handleBackToQuote}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Vehicle Selection
          </Button>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <CheckCircle className="h-4 w-4" />
            Services Available
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Available Services for{' '}
            <span className="text-blue-600">
              {displayVehicleInfo.brand} {displayVehicleInfo.model}
            </span>
          </h1>
          
          <div className="flex items-center justify-center gap-4 text-lg text-gray-600 mb-6">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              {displayVehicleInfo.fuel} Engine
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {displayServices.length} Service{displayServices.length !== 1 ? 's' : ''} Available
            </span>
          </div>

          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Choose from our professional service packages designed specifically for your vehicle.
            All services include genuine parts, expert technicians, and quality guarantee.
          </p>
        </div>

        {/* Service Statistics */}
        <div className="max-w-4xl mx-auto mb-12">
          {/* Statistics row removed as requested */}
        </div>

        {/* Search and Filter Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {availableCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Filter Results Summary */}
            {(searchTerm || selectedCategory !== 'all') && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Showing {filteredBasicServices.length + filteredStandardServices.length + filteredComprehensiveServices.length} of {displayServices.length} services
                  {searchTerm && ` matching "${searchTerm}"`}
                  {selectedCategory !== 'all' && ` in ${selectedCategory} category`}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="mt-2"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Service Tiers */}
        <div className="space-y-16 max-w-7xl mx-auto">
          
          {/* No Results Message */}
          {(filteredBasicServices.length === 0 && filteredStandardServices.length === 0 && filteredComprehensiveServices.length === 0) && (searchTerm || selectedCategory !== 'all') && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Services Found</h3>
              <p className="text-gray-600 mb-6">
                No services match your current search criteria. Try adjusting your filters.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                variant="outline"
              >
                Clear All Filters
              </Button>
            </div>
          )}
          
          {/* Basic Services */}
          {filteredBasicServices.length > 0 && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-6 py-3 rounded-full text-lg font-semibold mb-4">
                  <CheckCircle className="h-5 w-5" />
                  Basic Services
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Essential Maintenance</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Keep your vehicle running smoothly with our essential maintenance services
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBasicServices.map((service, index) => (
                  <Card 
                    key={`basic-${index}`} 
                    className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-green-300 bg-white relative overflow-hidden"
                  >
                    <div className="absolute top-4 right-4 z-10">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Basic
                      </Badge>
                    </div>

                    <CardHeader className="pb-4">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                          <Wrench className="h-8 w-8 text-green-600" />
                        </div>
                        
                        <CardTitle className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                          {service.serviceName}
                        </CardTitle>
                        
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          ₹{service.price.toLocaleString('en-IN')}
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{service.estimatedTime} hour{service.estimatedTime !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <div className="text-center">
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {service.description}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>Genuine parts included</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>Expert technician</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>Quality guarantee</span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => handleBookService(service)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 text-lg group-hover:shadow-lg transition-all duration-300"
                        size="lg"
                      >
                        Book Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Standard Services */}
          {filteredStandardServices.length > 0 && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-6 py-3 rounded-full text-lg font-semibold mb-4">
                  <CheckCircle className="h-5 w-5" />
                  Standard Services
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Care</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Advanced services for better performance and longer vehicle life
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredStandardServices.map((service, index) => (
                  <Card 
                    key={`standard-${index}`} 
                    className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-300 bg-white relative overflow-hidden"
                  >
                    <div className="absolute top-4 right-4 z-10">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Standard
                      </Badge>
                    </div>

                    <CardHeader className="pb-4">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                          <Wrench className="h-8 w-8 text-blue-600" />
                        </div>
                        
                        <CardTitle className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {service.serviceName}
                        </CardTitle>
                        
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          ₹{service.price.toLocaleString('en-IN')}
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{service.estimatedTime} hour{service.estimatedTime !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <div className="text-center">
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {service.description}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <span>Genuine parts included</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <span>Expert technician</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <span>Quality guarantee</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <span>Free pickup & delivery</span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => handleBookService(service)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg group-hover:shadow-lg transition-all duration-300"
                        size="lg"
                      >
                        Book Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Comprehensive Services */}
          {filteredComprehensiveServices.length > 0 && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-6 py-3 rounded-full text-lg font-semibold mb-4">
                  <CheckCircle className="h-5 w-5" />
                  Comprehensive Services
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Premium Solutions</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Complete vehicle overhaul and premium maintenance for optimal performance
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredComprehensiveServices.map((service, index) => (
                  <Card 
                    key={`comprehensive-${index}`} 
                    className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-300 bg-white relative overflow-hidden"
                  >
                    <div className="absolute top-4 right-4 z-10">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    </div>

                    <CardHeader className="pb-4">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                          <Wrench className="h-8 w-8 text-purple-600" />
                        </div>
                        
                        <CardTitle className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                          {service.serviceName}
                        </CardTitle>
                        
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                          ₹{service.price.toLocaleString('en-IN')}
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{service.estimatedTime} hour{service.estimatedTime !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <div className="text-center">
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {service.description}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-purple-500 flex-shrink-0" />
                          <span>Premium parts included</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-purple-500 flex-shrink-0" />
                          <span>Senior technician</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-purple-500 flex-shrink-0" />
                          <span>Extended warranty</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-purple-500 flex-shrink-0" />
                          <span>Free pickup & delivery</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-purple-500 flex-shrink-0" />
                          <span>Priority service</span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => handleBookService(service)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 text-lg group-hover:shadow-lg transition-all duration-300"
                        size="lg"
                      >
                        Book Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Why Choose Our Services?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Quality Guarantee</h3>
                <p className="text-sm text-gray-600">
                  All services come with our quality guarantee and warranty on parts.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Quick Service</h3>
                <p className="text-sm text-gray-600">
                  Professional service completed within 2-4 hours at your convenience.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wrench className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Expert Technicians</h3>
                <p className="text-sm text-gray-600">
                  Certified technicians with years of experience in automotive service.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Need help choosing the right service?
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/contact')}
            className="mr-4"
          >
            Contact Support
          </Button>
          <Button 
            variant="outline" 
            onClick={handleBackToQuote}
          >
            Try Different Vehicle
          </Button>
        </div>
      </div>


      <Footer />
    </div>
  );
};

export default VehicleServices;
