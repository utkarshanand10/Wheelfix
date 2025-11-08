import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Car, Bike, Phone, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

// Types
interface VehicleService {
  name: string;
  price: string;
  desc: string;
  image: string;
  category: string;
  estimatedTime: number;
  originalPrice: number;
}

interface VehicleServicesResponse {
  success: boolean;
  data: {
      brand: string;
      model: string;
    services: VehicleService[];
  };
  message?: string;
}


interface BrandResponse {
  success: boolean;
  data: {
    brands: string[];
    count: number;
  };
  message: string;
}

interface ModelResponse {
  success: boolean;
  data: {
    brand: string;
    models: string[];
    count: number;
  };
  message: string;
}

interface FuelTypeResponse {
  success: boolean;
  data: {
    brand: string;
    model: string;
    fuelTypes: string[];
    count: number;
  };
  message: string;
}

const ServiceQuoteForm: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    vehicleType: '',
    brand: '',
    model: '',
    fuel: '',
    mobile: ''
  });

  // API data state
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [fuelTypes, setFuelTypes] = useState<string[]>([]);
  const [vehicleServices, setVehicleServices] = useState<VehicleService[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingFuelTypes, setLoadingFuelTypes] = useState(false);

  // Fetch brands when component mounts or vehicle type changes
  useEffect(() => {
    fetchBrands();
    // Reset dependent fields when vehicle type changes
    setFormData(prev => ({ ...prev, brand: '', model: '', fuel: '' }));
    setModels([]);
    setFuelTypes([]);
    setVehicleServices([]); // Clear services immediately when vehicle type changes
    console.log(`🔄 Vehicle type changed to: ${formData.vehicleType}, clearing all services`);
  }, [formData.vehicleType]);

  // Fetch models when brand changes
  useEffect(() => {
    if (formData.brand) {
      fetchModels(formData.brand);
      // Reset dependent fields
      setFormData(prev => ({ ...prev, model: '', fuel: '' }));
      setModels([]);
      setFuelTypes([]);
      setVehicleServices([]); // Clear services when brand changes
      console.log(`🔄 Brand changed to: ${formData.brand}, clearing services`);
    }
  }, [formData.brand]);

  // Fetch fuel types when model changes
  useEffect(() => {
    if (formData.brand && formData.model) {
      fetchFuelTypes(formData.brand, formData.model);
      // Reset fuel field
      setFormData(prev => ({ ...prev, fuel: '' }));
      setFuelTypes([]);
      setVehicleServices([]); // Clear services when model changes
      console.log(`🔄 Model changed to: ${formData.model}, clearing services`);
    }
  }, [formData.model]);

  // Fetch vehicle services when brand, model, or fuel changes
  useEffect(() => {
    if (formData.brand && formData.vehicleType) {
      fetchVehicleServices();
    } else {
      setVehicleServices([]);
    }
  }, [formData.brand, formData.model, formData.fuel, formData.vehicleType]);


  const fetchBrands = async () => {
    if (!formData.vehicleType) {
      setBrands([]);
      return;
    }

    setLoadingBrands(true);
    try {
      const endpoint = formData.vehicleType === 'Car' ? '/cars/brands' : '/getBikeServices/brands';
      const response = await api.get<BrandResponse>(endpoint);
      if (response.data?.success) {
        setBrands(response.data.data.brands);
        console.log(`✅ Loaded ${response.data.data.count} ${formData.vehicleType.toLowerCase()} brands`);
      } else {
        toast({
          title: 'Error',
          description: response.data?.message || 'Failed to fetch vehicle brands',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error fetching brands:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch vehicle brands. Please check your connection.',
        variant: 'destructive',
      });
    } finally {
      setLoadingBrands(false);
    }
  };

  const fetchModels = async (brand: string) => {
    if (!formData.vehicleType) {
      setModels([]);
      return;
    }

    setLoadingModels(true);
    try {
      const endpoint = formData.vehicleType === 'Car' 
        ? `/cars/models/${encodeURIComponent(brand)}` 
        : `/getBikeServices/models/${encodeURIComponent(brand)}`;
      const response = await api.get<ModelResponse>(endpoint);
      if (response.data?.success) {
        setModels(response.data.data.models);
        console.log(`✅ Loaded ${response.data.data.count} models for ${brand}`);
      } else {
        toast({
          title: 'Error',
          description: response.data?.message || 'Failed to fetch vehicle models',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error fetching models:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch vehicle models. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingModels(false);
    }
  };

  const fetchFuelTypes = async (brand: string, model: string) => {
    setLoadingFuelTypes(true);
    try {
      const response = await api.get<FuelTypeResponse>(`/cars/fuel-types/${encodeURIComponent(brand)}/${encodeURIComponent(model)}`);
      if (response.data?.success) {
        setFuelTypes(response.data.data.fuelTypes);
        console.log(`✅ Loaded ${response.data.data.count} fuel types for ${brand} ${model}`);
      } else {
        toast({
          title: 'Error',
          description: response.data?.message || 'Failed to fetch fuel types',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error fetching fuel types:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch fuel types. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingFuelTypes(false);
    }
  };


  const fetchVehicleServices = async () => {
    if (!formData.brand || !formData.vehicleType) {
      console.log('🚫 Frontend: Cannot fetch services - missing brand or vehicle type');
      return;
    }

    // For cars, we need brand, model, and fuel. For bikes, we need brand and model.
    if (formData.vehicleType === 'Car' && (!formData.model || !formData.fuel)) {
      console.log('🚫 Frontend: Cannot fetch car services - missing model or fuel');
      return;
    }

    if (formData.vehicleType === 'Bike' && !formData.model) {
      console.log('🚫 Frontend: Cannot fetch bike services - missing model');
      return;
    }

    console.log(`🔍 Frontend: Fetching ${formData.vehicleType.toLowerCase()} services ONLY for brand: ${formData.brand}, model: ${formData.model}, fuel: ${formData.fuel || 'N/A'}`);
    setLoading(true);
    
    // Clear any existing services before fetching new ones
    setVehicleServices([]);
    
    try {
      const params = new URLSearchParams({
        brand: formData.brand,
        model: formData.model
      });

      // Add fuel parameter for cars
      if (formData.vehicleType === 'Car' && formData.fuel) {
        params.append('fuel', formData.fuel);
      }

      const endpoint = formData.vehicleType === 'Car' 
        ? `/getCarServices?${params}` 
        : `/getBikeServices?${params}`;

      console.log(`🌐 Frontend: Making API call to: ${endpoint} (${formData.vehicleType} services only)`);
      const response = await api.get<VehicleServicesResponse>(endpoint);

      if (response.data?.success) {
        if (response.data.data.services && response.data.data.services.length > 0) {
          console.log(`✅ Loaded ${response.data.data.services.length} ${formData.vehicleType.toLowerCase()} services for ${formData.brand}${formData.model ? ` ${formData.model}` : ''}`);
          setVehicleServices(response.data.data.services);
          toast({
            title: 'Services Loaded',
            description: `Found ${response.data.data.services.length} services for ${formData.brand}${formData.model ? ` ${formData.model}` : ''}`,
            variant: 'default',
          });
        } else {
          setVehicleServices([]);
          toast({
            title: 'No Services Available',
            description: `No services found for ${formData.brand}${formData.model ? ` ${formData.model}` : ''}. Please try a different vehicle or contact us for custom services.`,
            variant: 'destructive',
          });
        }
      } else {
        setVehicleServices([]);
        toast({
          title: 'Error',
          description: response.data?.message || 'Failed to fetch services',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error fetching vehicle services:', error);
      setVehicleServices([]);
      toast({
        title: 'Error',
        description: 'Failed to fetch services. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGetQuote = () => {
    if (!formData.brand) {
      toast({
        title: 'Missing Information',
        description: 'Please select your vehicle brand',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.mobile) {
      toast({
        title: 'Missing Information',
        description: 'Please enter your mobile number',
        variant: 'destructive',
      });
      return;
    }

    // Basic mobile number validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(formData.mobile)) {
      toast({
        title: 'Invalid Mobile Number',
        description: 'Please enter a valid 10-digit mobile number',
        variant: 'destructive',
      });
      return;
    }

    fetchVehicleServices();
  };


  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Get Your Free Service Quote</h1>
        <p className="text-xl text-gray-600">
          Select your vehicle details and get instant pricing for professional automotive services
        </p>
      </div>

      {/* Quote Form */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Car className="h-6 w-6" />
            Vehicle Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vehicle Type */}
          <div>
            <Label htmlFor="vehicleType" className="text-base font-medium">
              Vehicle Type
            </Label>
            <Select 
              value={formData.vehicleType} 
              onValueChange={(value) => handleInputChange("vehicleType", value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select your vehicle type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Car">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Car
                  </div>
                </SelectItem>
                <SelectItem value="Bike">
                  <div className="flex items-center gap-2">
                    <Bike className="h-4 w-4" />
                    Bike
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Brand and Model Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand" className="text-base font-medium">
                Brand
              </Label>
              <Select 
                value={formData.brand} 
                onValueChange={(value) => handleInputChange("brand", value)}
                disabled={loadingBrands}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={
                    loadingBrands ? "Loading brands..." : "Select brand"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="model" className="text-base font-medium">
                Model
              </Label>
              <Select 
                value={formData.model} 
                onValueChange={(value) => handleInputChange("model", value)}
                disabled={!formData.brand || loadingModels}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={
                    !formData.brand 
                      ? "Select brand first" 
                      : loadingModels 
                        ? "Loading models..." 
                        : "Select model"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fuel Type and Mobile Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fuel" className="text-base font-medium">
                Fuel Type
              </Label>
              <Select 
                value={formData.fuel} 
                onValueChange={(value) => handleInputChange("fuel", value)}
                disabled={!formData.model || loadingFuelTypes}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={
                    !formData.model 
                      ? "Select model first" 
                      : loadingFuelTypes 
                        ? "Loading fuel types..." 
                        : "Select fuel type"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {fuelTypes.map((fuel) => (
                    <SelectItem key={fuel} value={fuel}>
                      {fuel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="mobile" className="text-base font-medium">
                Mobile Number
              </Label>
              <div className="relative mt-2">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange("mobile", e.target.value)}
                  className="pl-10"
                  maxLength={10}
                />
              </div>
            </div>
          </div>

          {/* Get Quote Button */}
          <div className="pt-4">
            <Button 
              onClick={handleGetQuote}
              disabled={loading || !formData.brand || !formData.mobile}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Getting Quote...
                </>
              ) : (
                'Book Now'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Services Display */}
      {vehicleServices.length > 0 && (
        <div className="mt-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Available Services for {formData.brand}{formData.model ? ` ${formData.model}` : ''}
            </h2>
            <p className="text-gray-600">
              Choose from our professional automotive services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicleServices.map((service, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Service Image */}
                    <div className="w-full h-40 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center overflow-hidden">
                      <img 
                        src={service.image} 
                        alt={service.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to icon if image fails to load
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'flex';
                          }
                        }}
                      />
                      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center" style={{display: 'none'}}>
                        {formData.vehicleType === 'Car' ? (
                          <Car className="h-12 w-12 text-blue-600" />
                        ) : (
                          <Bike className="h-12 w-12 text-blue-600" />
                        )}
                      </div>
                    </div>

                    {/* Service Details */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {service.name}
                        </h3>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {service.category}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {service.desc}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {service.estimatedTime}h
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-xl text-orange-600">
                            {service.price}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Book Now Button */}
                    <Button 
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2"
                      onClick={() => {
                        // Navigate to booking page with service and vehicle data
                        navigate('/booking', {
                          state: {
                            service: {
                              id: `${formData.brand.toLowerCase()}-${formData.model.toLowerCase()}-${service.name.toLowerCase().replace(/\s+/g, '-')}`,
                              name: service.name,
                              description: service.desc,
                              category: service.category,
                              duration: `${service.estimatedTime} hour${service.estimatedTime !== 1 ? 's' : ''}`,
                              icon: formData.vehicleType === 'Car' ? '🚗' : '🏍️',
                              price: service.originalPrice
                            },
                            vehicleInfo: {
                              brand: formData.brand,
                              model: formData.model,
                              fuel: formData.fuel
                            },
                            formData: formData
                          }
                        });
                      }}
                    >
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Reset Form Option */}
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              onClick={() => {
                setVehicleServices([]);
                setFormData({
                  vehicleType: '',
                  brand: '',
                  model: '',
                  fuel: '',
                  mobile: ''
                });
                setModels([]);
                setFuelTypes([]);
                console.log('🔄 Form reset');
              }}
              className="text-gray-600 hover:text-gray-800"
            >
              Change Vehicle Details
            </Button>
          </div>
        </div>
      )}

      {/* No Services Message */}
      {formData.brand && vehicleServices.length === 0 && !loading && (
        <div className="mt-8 text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            {formData.vehicleType === 'Car' ? (
              <Car className="h-12 w-12 text-gray-400" />
            ) : (
              <Bike className="h-12 w-12 text-gray-400" />
            )}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Services Available</h3>
          <p className="text-gray-600 mb-6">
            No services found for {formData.brand}{formData.model ? ` ${formData.model}` : ''} yet. Please try a different vehicle or contact us for custom services.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setFormData(prev => ({ ...prev, brand: '', model: '', fuel: '' }));
              setVehicleServices([]);
            }}
          >
            Try Different Vehicle
          </Button>
        </div>
      )}

    </div>
  );
};

export default ServiceQuoteForm;
