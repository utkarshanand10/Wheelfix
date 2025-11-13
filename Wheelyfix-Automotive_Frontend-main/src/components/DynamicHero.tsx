// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Card } from "@/components/ui/card";
// import {
//   Star,
//   Shield,
//   Clock,
//   MapPin,
//   CheckCircle,
//   Car,
//   Bike,
// } from "lucide-react";
// interface HeroContent {
//   title: string;
//   subtitle: string;
//   description: string;
//   background_image_url: string;
//   cta_text: string;
// }

// const DynamicHero = () => {
//   const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [selectedVehicle, setSelectedVehicle] = useState<string>("");
//   const [mobileNumber, setMobileNumber] = useState<string>("");

//   useEffect(() => {
//     const fetchHeroContent = async () => {
//       try {
//         const { data, error } = await supabase
//           .from("hero_content")
//           .select("*")
//           .eq("is_active", true)
//           .single();

//         if (data) {
//           setHeroContent(data);
//         } else if (error) {
//           console.error("Error fetching hero content:", error);
//         }
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching hero content:", error);
//         setLoading(false);
//       }
//     };

//     fetchHeroContent();
//   }, []);

//   // Use image from Supabase or fallback to image in public folder
//   const backgroundImage =
//     heroContent?.background_image_url || "/hero-banner.jpg";

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Handle form submission
//     console.log("Form submitted:", { selectedVehicle, mobileNumber });
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-orange-600 via-red-600 to-orange-700 flex items-center justify-center">
//         <div className="text-white text-xl">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <section
//       className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center"
//       style={{ backgroundImage: `url(${backgroundImage})` }}
//     >
//       {/* Light overlay for text readability */}
//       <div className="absolute inset-0 bg-black/30"></div>

//       <div className="container mx-auto px-4 py-20 relative z-10">
//         <div className="grid lg:grid-cols-2 gap-12 items-center">
//           {/* Left Content */}
//           <div className="text-white space-y-8">
//             <div className="space-y-6">
//               <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
//                 <Shield className="h-5 w-5 text-orange-300" />
//                 <span className="text-sm font-medium">
//                   Trusted by 2,50,000+ Customers
//                 </span>
//               </div>

//               <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
//                 {heroContent ? (
//                   <>
//                     <span className="text-white">{heroContent.title}</span>
//                     <br />
//                     <span className="text-orange-300">
//                       {heroContent.subtitle}
//                     </span>
//                   </>
//                 ) : (
//                   <>
//                     <span className="text-white">India's Leading</span>
//                     <br />
//                     <span className="text-orange-300">Auto Service</span>
//                     <span className="text-white ml-4">Network</span>
//                     <br />
//                     <span className="text-orange-200 text-2xl lg:text-3xl font-normal">
//                       Professional Car & Bike Services
//                     </span>
//                   </>
//                 )}
//               </h1>

//               {heroContent?.description && (
//                 <p className="text-xl text-orange-100 max-w-lg leading-relaxed">
//                   {heroContent.description}
//                 </p>
//               )}
//             </div>

//             {/* Features */}
//             <div className="grid grid-cols-2 gap-6">
//               <div className="flex items-center space-x-3">
//                 <div className="bg-orange-500/20 p-2 rounded-lg">
//                   <CheckCircle className="h-5 w-5 text-orange-300" />
//                 </div>
//                 <div>
//                   <div className="font-semibold text-white">
//                     Free Pickup & Drop
//                   </div>
//                   <div className="text-sm text-orange-200">
//                     At your doorstep
//                   </div>
//                 </div>
//               </div>
//               <div className="flex items-center space-x-3">
//                 <div className="bg-green-500/20 p-2 rounded-lg">
//                   <Clock className="h-5 w-5 text-green-300" />
//                 </div>
//                 <div>
//                   <div className="font-semibold text-white">
//                     Same Day Service
//                   </div>
//                   <div className="text-sm text-green-200">Quick turnaround</div>
//                 </div>
//               </div>
//               <div className="flex items-center space-x-3">
//                 <div className="bg-purple-500/20 p-2 rounded-lg">
//                   <Shield className="h-5 w-5 text-purple-300" />
//                 </div>
//                 <div>
//                   <div className="font-semibold text-white">Genuine Parts</div>
//                   <div className="text-sm text-purple-200">100% authentic</div>
//                 </div>
//               </div>
//               <div className="flex items-center space-x-3">
//                 <div className="bg-blue-500/20 p-2 rounded-lg">
//                   <MapPin className="h-5 w-5 text-blue-300" />
//                 </div>
//                 <div>
//                   <div className="font-semibold text-white">500+ Centers</div>
//                   <div className="text-sm text-blue-200">Across India</div>
//                 </div>
//               </div>
//             </div>

//             {/* Stats */}
//             <div className="flex space-x-8 text-center pt-6 border-t border-white/20">
//               <div>
//                 <div className="flex items-center justify-center space-x-1 mb-2">
//                   <Star className="h-5 w-5 text-yellow-400 fill-current" />
//                   <span className="text-2xl font-bold">4.8/5</span>
//                 </div>
//                 <p className="text-sm text-orange-200">
//                   Based on 10,000+
//                   <br />
//                   Reviews
//                 </p>
//               </div>
//               <div>
//                 <div className="text-2xl font-bold text-orange-300 mb-2">
//                   2,50,000+
//                 </div>
//                 <p className="text-sm text-orange-200">
//                   Happy
//                   <br />
//                   Customers
//                 </p>
//               </div>
//               <div>
//                 <div className="text-2xl font-bold text-orange-300 mb-2">
//                   500+
//                 </div>
//                 <p className="text-sm text-orange-200">
//                   Service
//                   <br />
//                   Centers
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Right - Service Form */}
//           <div className="flex justify-end">
//             <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur-sm shadow-2xl border-0">
//               <div className="space-y-6">
//                 <div className="text-center">
//                   <h2 className="text-2xl font-bold text-gray-900 mb-2">
//                     Get Free Service Quote
//                   </h2>
//                   <p className="text-gray-600">
//                     Book your car or bike service now
//                   </p>
//                 </div>

//                 <form onSubmit={handleSubmit} className="space-y-4">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="flex items-center space-x-2 p-3 border-2 border-gray-200 rounded-lg hover:border-accent cursor-pointer">
//                       <Car className="h-5 w-5 text-gray-600" />
//                       <span className="font-medium">Car Service</span>
//                     </div>
//                     <div className="flex items-center space-x-2 p-3 border-2 border-gray-200 rounded-lg hover:border-accent cursor-pointer">
//                       <Bike className="h-5 w-5 text-gray-600" />
//                       <span className="font-medium">Bike Service</span>
//                     </div>
//                   </div>

//                   <Select
//                     value={selectedVehicle}
//                     onValueChange={setSelectedVehicle}
//                   >
//                     <SelectTrigger className="w-full h-12 border-2 border-gray-200 focus:border-accent">
//                       <SelectValue placeholder="Select Your Vehicle Brand" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="maruti">Maruti Suzuki</SelectItem>
//                       <SelectItem value="hyundai">Hyundai</SelectItem>
//                       <SelectItem value="honda">Honda</SelectItem>
//                       <SelectItem value="tata">Tata</SelectItem>
//                       <SelectItem value="mahindra">Mahindra</SelectItem>
//                       <SelectItem value="other">Other</SelectItem>
//                     </SelectContent>
//                   </Select>

//                   <Input
//                     placeholder="Enter Mobile Number"
//                     className="h-12 border-2 border-gray-200 focus:border-accent"
//                     type="tel"
//                     value={mobileNumber}
//                     onChange={(e) => setMobileNumber(e.target.value)}
//                     required
//                   />

//                   <Button
//                     type="submit"
//                     className="w-full h-12 text-white bg-accent hover:bg-accent/90 font-semibold text-lg shadow-lg"
//                   >
//                     {heroContent?.cta_text || "GET FREE QUOTE"}
//                   </Button>
//                 </form>

//                 <div className="flex justify-between text-center pt-4 border-t border-gray-200">
//                   <div>
//                     <div className="flex items-center justify-center space-x-1 mb-1">
//                       <Star className="h-4 w-4 text-yellow-400 fill-current" />
//                       <span className="font-bold text-sm">4.8/5</span>
//                     </div>
//                     <p className="text-xs text-gray-500">
//                       Based on 10,000+
//                       <br />
//                       Reviews
//                     </p>
//                   </div>
//                   <div>
//                     <div className="font-bold text-accent text-sm">
//                       2,50,000+
//                     </div>
//                     <p className="text-xs text-gray-500">
//                       Happy
//                       <br />
//                       Customers
//                     </p>
//                   </div>
//                   <div>
//                     <div className="font-bold text-accent text-sm">500+</div>
//                     <p className="text-xs text-gray-500">
//                       Service
//                       <br />
//                       Centers
//                     </p>
//                   </div>
//                 </div>

//                 <div className="text-center">
//                   <p className="text-xs text-gray-500">
//                     By continuing, you agree to our Terms of Service & Privacy
//                     Policy
//                   </p>
//                 </div>
//               </div>
//             </Card>
//           </div>
//         </div>

import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Removed unused Select imports
import { Card, CardContent } from "@/components/ui/card";
import {
  Star,
  Shield,
  Clock,
  MapPin,
  CheckCircle,
  Car,
  Bike,
  ArrowLeft,
  Search,
  Fuel,
  Zap,
  X,
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { api } from "@/lib/api";

// SelectionStep internalized in state type
type VehicleType = 'car' | 'bike';
type FuelType = 'petrol' | 'diesel' | 'cng' | 'electric';

// API Response Types
interface Service {
  serviceName: string;
  price: number;
  description: string;
  estimatedTime: number;
  category: string;
}

interface VehicleServicesResponse {
  success: boolean;
  data: {
    vehicleInfo: {
      brand: string;
      model: string;
      fuel: string;
    };
    services: Service[];
    statistics: {
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
    };
  };
  message?: string;
}



// type VehicleMap = { [key in VehicleType]: VehicleTypeData };
 
// import { supabase } from "@/integrations/supabase/client";

interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  background_image_url: string;
  cta_text: string;
}

// Use vehicleData imported from '@/data/vehicle-data'

const DynamicHero = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Basic form states
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  
  // Form states - simplified and properly managed
  const [vehicleType, setVehicleType] = useState("Car");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedFuel, setSelectedFuel] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  // Vehicle selection states
  const [showVehicleSelection, setShowVehicleSelection] = useState(false);
  const [selectionStep, setSelectionStep] = useState<'vehicle-type' | 'fuel-type' | 'brand' | 'model'>("vehicle-type");
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType | ''>('');
  const [selectedFuelType, setSelectedFuelType] = useState<FuelType | ''>('');
  const [selectedBrandSlug, setSelectedBrandSlug] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  // const navigate = useNavigate(); // Removed for now since we're just testing form submission

  // Admin-controlled data from backend
  interface BrandModel { name: string; fuels?: FuelType[] }
  interface BrandApi { _id: string; type: VehicleType; name: string; slug: string; logo?: string; models: BrandModel[] }
  const [brandsCar, setBrandsCar] = useState<BrandApi[]>([]);
  const [brandsBike, setBrandsBike] = useState<BrandApi[]>([]);
  const [brandModels, setBrandModels] = useState<{[key: string]: string[]}>({});

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch hero CMS (keys optional; fallback to defaults)
        const [t, st, d, bg, cta] = await Promise.all([
          api.get<any>("/cms/hero.title"),
          api.get<any>("/cms/hero.subtitle"),
          api.get<any>("/cms/hero.description"),
          api.get<any>("/cms/hero.background_image_url"),
          api.get<any>("/cms/hero.cta_text"),
        ]).then((arr) => arr.map((r) => {
          // Handle null responses and extract data properly
          if (r === null || r === undefined) return null;
          return (r as any)?.data !== undefined ? (r as any).data : r;
        }));

        const content: HeroContent = {
          title: (t && typeof t === 'string') ? t : "India's Leading",
          subtitle: (st && typeof st === 'string') ? st : "Auto Service Network",
          description: (d && typeof d === 'string') ? d : "Professional Car & Bike Services at your doorstep",
          background_image_url: (bg && typeof bg === 'string') ? bg : "/hero-banner.jpg",
          cta_text: (cta && typeof cta === 'string') ? cta : "GET FREE QUOTE",
        };
        setHeroContent(content);

        // Fetch car brands from backend
        const carBrandsRes = await api.get<{success: boolean, data: {brands: string[]}}>("/cars/brands");
        
        if (carBrandsRes.data?.success && carBrandsRes.data.data.brands) {
          const carBrands = carBrandsRes.data.data.brands.map(brand => ({
            _id: brand,
            type: 'car' as VehicleType,
            name: brand,
            slug: brand, // Use the actual brand name as slug for API calls
            models: [] // Will be fetched when brand is selected
          }));
          setBrandsCar(carBrands);
        }
        
        // Fetch bike brands from backend
        const bikeBrandsRes = await api.get<{success: boolean, data: {brands: string[]}}>("/bikes/brands");
        
        if (bikeBrandsRes.data?.success && bikeBrandsRes.data.data.brands) {
          const bikeBrands = bikeBrandsRes.data.data.brands.map(brand => ({
            _id: brand,
            type: 'bike' as VehicleType,
            name: brand,
            slug: brand, // Use the actual brand name as slug for API calls
            models: [] // Will be fetched when brand is selected
          }));
          setBrandsBike(bikeBrands);
        }
      } catch (e) {
        console.error('Error loading data:', e);
        // Fallback to defaults from local vehicleData; heroContent already has defaults
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const backgroundImage =
    heroContent?.background_image_url || "/hero-banner.jpg";

  // Debug validation state changes
  useEffect(() => {
    console.log("Form states:", { 
      vehicleType, 
      selectedBrand, 
      selectedModel, 
      selectedFuel, 
      mobileNumber,
      isFormComplete: isFormComplete()
    });
  }, [vehicleType, selectedBrand, selectedModel, selectedFuel, mobileNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only check for required fields (brand and mobile)
    if (!selectedBrand) {
      toast({
        title: 'Missing Information',
        description: 'Please select your vehicle brand',
        variant: 'destructive',
      });
      return;
    }

    if (!mobileNumber || mobileNumber.length !== 10) {
      toast({
        title: 'Invalid Mobile Number',
        description: 'Please enter a valid 10-digit mobile number',
        variant: 'destructive',
      });
      return;
    }

    // Basic mobile number validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobileNumber)) {
      toast({
        title: 'Invalid Mobile Number',
        description: 'Please enter a valid 10-digit mobile number',
        variant: 'destructive',
      });
      return;
    }

    // Prepare form data with all fields (including optional ones)
    const formData = {
      vehicleType: vehicleType,
      brand: selectedBrand,
      model: selectedModel || 'Swift',
      fuel: selectedFuel || 'Petrol',
      mobile: mobileNumber,
    };

    console.log("✅ Form Submitted:", formData);

    // Try to fetch services from backend, but fallback to direct navigation if API fails
    try {
      const vehicleType = selectedVehicleType || 'Car';
      const brand = selectedBrand;
      const model = selectedModel || 'Swift';
      const fuel = selectedFuel || 'Petrol';
      
      console.log('🚀 Making API request with data:', {
        brand,
        model,
        fuel,
        vehicleType,
      });
      
      // Use the enhanced APIs based on vehicle type
      let endpoint;
      
      if (vehicleType.toLowerCase() === 'bike') {
        endpoint = `/getBikeServices?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`;
      } else {
        endpoint = `/getCarServices?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}&fuel=${encodeURIComponent(fuel)}`;
      }
      
      const response = await api.get<VehicleServicesResponse>(endpoint);

      console.log('📡 API Response received:', response);

      // Check if there's an error in the response
      if (response.error) {
        console.log('❌ API returned error:', response.error);
        // Fallback: navigate to vehicle-services page with form data
        navigate('/vehicle-services', {
          state: {
            formData: formData,
            fallback: true,
            message: 'API temporarily unavailable, showing general services'
          }
        });
        return;
      }

      // Check if the response data has success
      if (response.data?.success) {
        if (response.data.data.services && response.data.data.services.length > 0) {
          console.log(`✅ Loaded ${response.data.data.services.length} services for ${brand} ${model} ${fuel}`);
          
          // Transform services to match the expected format
          // Use service.price (which includes overrides) instead of originalPrice
          const transformedServices = response.data.data.services.map((service: any) => ({
            serviceName: service.name,
            price: service.price || service.originalPrice, // Use override price if available, else original
            description: service.desc,
            estimatedTime: service.estimatedTime,
            category: service.category
          }));
          
          // Navigate to services page with data
          navigate('/vehicle-services', {
            state: {
              services: transformedServices,
              vehicleInfo: {
                brand: brand,
                model: model,
                fuel: fuel
              },
              formData: formData,
              statistics: {
                totalServices: transformedServices.length,
                totalPrice: transformedServices.reduce((sum: number, service: any) => sum + service.price, 0),
                totalTime: transformedServices.reduce((sum: number, service: any) => sum + service.estimatedTime, 0),
                categories: [...new Set(transformedServices.map((service: any) => service.category))],
                priceRange: {
                  min: Math.min(...transformedServices.map((service: any) => service.price)),
                  max: Math.max(...transformedServices.map((service: any) => service.price))
                },
                timeRange: {
                  min: Math.min(...transformedServices.map((service: any) => service.estimatedTime)),
                  max: Math.max(...transformedServices.map((service: any) => service.estimatedTime))
                }
              }
            }
          });
        } else {
          // Fallback: navigate to vehicle-services page even if no specific services found
          navigate('/vehicle-services', {
            state: {
              formData: formData,
              fallback: true,
              message: 'No specific services found, showing general services'
            }
          });
        }
      } else {
        console.log('❌ API returned success: false, response:', response);
        // Fallback: navigate to vehicle-services page
        navigate('/vehicle-services', {
          state: {
            formData: formData,
            fallback: true,
            message: 'API returned error, showing general services'
          }
        });
      }
    } catch (error: any) {
      console.error('❌ Error fetching services:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      
      // Fallback: navigate to vehicle-services page when API fails
      console.log('🔄 API failed, redirecting to vehicle-services page as fallback');
      navigate('/vehicle-services', {
        state: {
          formData: formData,
          fallback: true,
          message: 'API temporarily unavailable, showing general services'
        }
      });
    }
  };


  // Vehicle selection functions
  const resetVehicleSelection = () => {
    setSelectionStep('vehicle-type' as SelectionStep);
    setSelectedVehicleType('');
    setSelectedFuelType('');
    setSelectedBrandSlug('');
    setSearchTerm('');
    // Don't reset the main form states here - they should persist
  };

  const closeVehicleSelection = () => {
    setShowVehicleSelection(false);
    resetVehicleSelection();
  };

  type SelectionStep = 'vehicle-type' | 'fuel-type' | 'brand' | 'model';

  // Vehicle selection functions
  const goBack = () => {
    switch (selectionStep) {
      case 'fuel-type':
        setSelectionStep('vehicle-type' as SelectionStep);
        setSelectedVehicleType('');
        break;
      case 'brand':
        setSelectionStep('fuel-type' as SelectionStep);
        setSelectedFuelType('');
        setSelectedBrandSlug('');
        setSelectedBrand('');
        break;
      case 'model':
        setSelectionStep('brand' as SelectionStep);
        setSelectedBrand('');
        break;
      default:
        break;
    }
  };

  const handleVehicleTypeSelect = (type: VehicleType) => {
    setSelectedVehicleType(type);
    setSelectionStep('fuel-type');
  };

  const handleFuelTypeSelect = (fuelType: FuelType) => {
    setSelectedFuelType(fuelType);
    setSelectionStep('brand');
  };

  const handleModelSelect = async (model: string) => {
    setSelectedModel(model);
    
    if (selectedVehicleType && selectedBrandSlug) {
      try {
        // Fetch fuel types for the selected brand and model based on vehicle type
        const apiEndpoint = selectedVehicleType === 'car' ? `/cars/fuel-types/${selectedBrandSlug}/${model}` : `/bikes/fuel-types/${selectedBrandSlug}/${model}`;
        const fuelRes = await api.get<{success: boolean, data: {fuelTypes: string[]}}>(apiEndpoint);
        
        if (fuelRes.data?.success && fuelRes.data.data.fuelTypes) {
          const fuelTypes = fuelRes.data.data.fuelTypes;
          
          // Update the brand with fuel types for this model
          if (selectedVehicleType === 'car') {
            setBrandsCar(prev => prev.map(brand => 
              brand.slug === selectedBrandSlug 
                ? { 
                    ...brand, 
                    models: brand.models?.map(m => 
                      m.name === model 
                        ? { ...m, fuels: fuelTypes as FuelType[] }
                        : m
                    ) || []
                  }
                : brand
            ));
          } else {
            setBrandsBike(prev => prev.map(brand => 
              brand.slug === selectedBrandSlug 
                ? { 
                    ...brand, 
                    models: brand.models?.map(m => 
                      m.name === model 
                        ? { ...m, fuels: fuelTypes as FuelType[] }
                        : m
                    ) || []
                  }
                : brand
            ));
          }
        }
      } catch (error) {
        console.error('Error fetching fuel types:', error);
      }
      
      const brandData = (selectedVehicleType === 'car' ? brandsCar : brandsBike).find(b => b.slug === selectedBrandSlug);
      if (brandData) {
        setSelectedVehicle(`${brandData.name} ${model}`);
        // Update the main form states - brand should already be set correctly from handleBrandSelect
        setSelectedModel(model);
        setSelectedFuel(selectedFuelType || 'Petrol');
        setShowVehicleSelection(false);
        resetVehicleSelection();
      }
    }
  };



  const fetchBrandModels = async (brandSlug: string) => {
    if (brandModels[brandSlug]) return; // Already fetched
    
    try {
      const apiEndpoint = selectedVehicleType === 'car' ? `/cars/models/${brandSlug}` : `/bikes/models/${brandSlug}`;
      const modelsRes = await api.get<{success: boolean, data: {models: string[]}}>(apiEndpoint);
      
      if (modelsRes.data?.success && modelsRes.data.data.models) {
        const models = modelsRes.data.data.models;
        setBrandModels(prev => ({
          ...prev,
          [brandSlug]: models
        }));
      }
    } catch (error) {
      console.error('Error fetching models for brand:', brandSlug, error);
    }
  };

  const handleBrandSelect = async (brandSlug: string) => {
    // Find the brand data to get the actual name
    const brandData = (selectedVehicleType === 'car' ? brandsCar : brandsBike).find(b => b.slug === brandSlug);
    if (brandData) {
      setSelectedBrand(brandData.name);
      setSelectedBrandSlug(brandSlug);
    }
    await fetchBrandModels(brandSlug);
    setSelectionStep('model');
  };




  const getAvailableModels = () => {
    if (!selectedBrandSlug) return [] as string[];
    return brandModels[selectedBrandSlug] || [];
  };

  const getAvailableBrands = () => {
    if (!selectedVehicleType) return [] as any[];
    if (selectedVehicleType === 'bike') {
      if (brandsBike.length) return brandsBike.map(b => [b.slug, { name: b.name, logo: b.logo || '🏍️' }]);
    } else {
      if (brandsCar.length) return brandsCar.map(b => [b.slug, { name: b.name, logo: b.logo || '🚗' }]);
    }
    return [] as any[];
  };


  const filteredBrands = getAvailableBrands().filter(([, brandData]) => {
    const brand = brandData as { name: string };
    return brand.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredModels = getAvailableModels().filter((model: string) =>
    model.toLowerCase().includes(searchTerm.toLowerCase())
  );



  // Check if form is complete - only brand and 10-digit mobile required
  const isFormComplete = () => {
    const isValid = selectedBrand && mobileNumber && mobileNumber.length === 10;
    console.log("Validation check:", { selectedBrand, mobileNumber, isValid });
    return isValid;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-600 via-red-600 to-orange-700 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <section
        className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {/* Light overlay for text readability */}
        <div className="absolute inset-0 bg-black/30"></div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Shield className="h-5 w-5 text-orange-300" />
                  <span className="text-sm font-medium">
                    Trusted by 2,50,000+ Customers
                  </span>
                </div>

                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  {heroContent ? (
                    <>
                      <span className="text-white">{heroContent.title}</span>
                      <br />
                      <span className="text-orange-300">
                        {heroContent.subtitle}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-white">India's Leading</span>
                      <br />
                      <span className="text-orange-300">Auto Service</span>
                      <span className="text-white ml-4">Network</span>
                      <br />
                      <span className="text-orange-200 text-2xl lg:text-3xl font-normal">
                        Professional Car & Bike Services
                      </span>
                    </>
                  )}
                </h1>

                {heroContent?.description && (
                  <p className="text-xl text-orange-100 max-w-lg leading-relaxed">
                    {heroContent.description}
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-500/20 p-2 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-orange-300" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      Free Pickup & Drop
                    </div>
                    <div className="text-sm text-orange-200">
                      At your doorstep
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500/20 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-green-300" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      Same Day Service
                    </div>
                    <div className="text-sm text-green-200">
                      Quick turnaround
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-500/20 p-2 rounded-lg">
                    <Shield className="h-5 w-5 text-purple-300" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      Genuine Parts
                    </div>
                    <div className="text-sm text-purple-200">
                      100% authentic
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-500/20 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-emerald-300" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">500+ Centers</div>
                    <div className="text-sm text-emerald-200">Across India</div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex space-x-8 text-center pt-6 border-t border-white/20">
                <div>
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-2xl font-bold">4.8/5</span>
                  </div>
                  <p className="text-sm text-orange-200">
                    Based on 10,000+
                    <br />
                    Reviews
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-300 mb-2">
                    2,50,000+
                  </div>
                  <p className="text-sm text-orange-200">
                    Happy
                    <br />
                    Customers
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-300 mb-2">
                    500+
                  </div>
                  <p className="text-sm text-orange-200">
                    Service
                    <br />
                    Centers
                  </p>
                </div>
              </div>
            </div>

            {/* Right - Service Form */}
            <div className="flex justify-end">
              <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur-sm shadow-2xl border-0">
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Get Your Service Done
                    </h2>
                    <p className="text-gray-600">
                      Book your car or bike service now
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`flex items-center space-x-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                          vehicleType === 'Car' 
                            ? 'border-orange-500 bg-orange-50' 
                            : 'border-gray-200 hover:border-orange-500'
                        }`}
                        onClick={() => {
                          setVehicleType('Car');
                          setSelectedVehicleType('car');
                          setShowVehicleSelection(true);
                        }}
                      >
                        <Car className={`h-5 w-5 ${vehicleType === 'Car' ? 'text-orange-600' : 'text-gray-600'}`} />
                        <span className={`font-medium ${vehicleType === 'Car' ? 'text-orange-600' : 'text-gray-900'}`}>Car Service</span>
                      </div>
                      <div
                        className={`flex items-center space-x-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                          vehicleType === 'Bike' 
                            ? 'border-orange-500 bg-orange-50' 
                            : 'border-gray-200 hover:border-orange-500'
                        }`}
                        onClick={() => {
                          setVehicleType('Bike');
                          setSelectedVehicleType('bike');
                          setShowVehicleSelection(true);
                        }}
                      >
                        <Bike className={`h-5 w-5 ${vehicleType === 'Bike' ? 'text-orange-600' : 'text-gray-600'}`} />
                        <span className={`font-medium ${vehicleType === 'Bike' ? 'text-orange-600' : 'text-gray-900'}`}>Bike Service</span>
                      </div>
                    </div>

                    <div
                      className="w-full h-12 border-2 border-gray-200 rounded-md flex items-center px-3 bg-gray-50 cursor-pointer hover:border-orange-500 transition-colors"
                      onClick={() => setShowVehicleSelection(true)}
                    >
                      <span
                        className={
                          selectedVehicle ? "text-gray-900" : "text-gray-500"
                        }
                      >
                        {selectedVehicle || (selectedVehicleType ? `Select Your ${selectedVehicleType === 'car' ? 'Car' : 'Bike'} Brand` : "Select Your Vehicle Brand")}
                      </span>
                    </div>

                    <Input
                      placeholder="Enter Mobile Number"
                      className="h-12 border-2 border-gray-200 focus:border-orange-500"
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      maxLength={10}
                      required
                    />

                    <Button
                      type="submit"
                      className={`w-full h-12 font-semibold text-lg shadow-lg transition-all duration-200 ${
                        isFormComplete()
                          ? 'bg-orange-600 hover:bg-orange-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!isFormComplete()}
                    >
                      {isFormComplete()
                        ? "BOOK NOW"
                        : (heroContent?.cta_text || "BOOK NOW")}
                    </Button>


                    {!isFormComplete() && (
                      <div className="text-xs text-gray-500 mt-2 text-center">
                        {!selectedBrand && <div>• Select vehicle brand</div>}
                        {(!mobileNumber || mobileNumber.length !== 10) && <div>• Enter 10-digit mobile number</div>}
                      </div>
                    )}
                  </form>

                  <div className="flex justify-between text-center pt-4 border-t border-gray-200">
                    <div>
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-bold text-sm">4.8/5</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Based on 10,000+
                        <br />
                        Reviews
                      </p>
                    </div>
                    <div>
                      <div className="font-bold text-orange-600 text-sm">
                        2,50,000+
                      </div>
                      <p className="text-xs text-gray-500">
                        Happy
                        <br />
                        Customers
                      </p>
                    </div>
                    <div>
                      <div className="font-bold text-orange-600 text-sm">
                        500+
                      </div>
                      <p className="text-xs text-gray-500">
                        Service
                        <br />
                        Centers
                      </p>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      By continuing, you agree to our Terms of Service & Privacy
                      Policy
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Selection Overlay */}
      {showVehicleSelection && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              {selectionStep !== "vehicle-type" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBack}
                  className="mr-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <h2 className="text-lg font-semibold flex-1">
                {selectionStep === "vehicle-type" && "Select Vehicle Type"}
                {selectionStep === "fuel-type" && "Select Fuel Type"}
                {selectionStep === "brand" && "Select Brand"}
                {selectionStep === "model" && "Select Model"}
              </h2>
              <Button variant="ghost" size="sm" onClick={closeVehicleSelection}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 max-h-[70vh] overflow-y-auto">
              {/* Step 1: Vehicle Type Selection */}
              {selectionStep === "vehicle-type" && (
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-medium">Choose Your Vehicle</h3>
                    <p className="text-gray-600 text-sm">
                      Select the type of vehicle you want to service
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Card
                      className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-emerald-500"
                      onClick={() => handleVehicleTypeSelect("bike")}
                    >
                      <CardContent className="p-4 text-center space-y-3">
                        <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                          <Bike className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Bike</h4>
                          <p className="text-xs text-gray-500">Two Wheeler</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-orange-500"
                      onClick={() => handleVehicleTypeSelect("car")}
                    >
                      <CardContent className="p-4 text-center space-y-3">
                        <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                          <Car className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Car</h4>
                          <p className="text-xs text-gray-500">Four Wheeler</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Step 2: Fuel Type Selection */}
              {selectionStep === "fuel-type" && (
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      {selectedVehicleType === "bike" ? (
                        <Bike className="h-5 w-5" />
                      ) : (
                        <Car className="h-5 w-5" />
                      )}
                      <span className="font-medium capitalize">
                        {selectedVehicleType}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedVehicleType === "bike" ? (
                      <>
                        <Card
                          className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-orange-500"
                          onClick={() => handleFuelTypeSelect("petrol")}
                        >
                          <CardContent className="p-4 text-center space-y-3">
                            <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                              <Fuel className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">Petrol</h4>
                              <p className="text-xs text-gray-500">
                                Gasoline Engine
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card
                          className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
                          onClick={() => handleFuelTypeSelect("electric")}
                        >
                          <CardContent className="p-4 text-center space-y-3">
                            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                              <Zap className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">Electric</h4>
                              <p className="text-xs text-gray-500">
                                Electric Motor
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    ) : (
                      <>
                        <Card
                          className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-orange-500"
                          onClick={() => handleFuelTypeSelect("petrol")}
                        >
                          <CardContent className="p-4 text-center space-y-3">
                            <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                              <Fuel className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">Petrol</h4>
                              <p className="text-xs text-gray-500">
                                Gasoline Engine
                              </p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card
                          className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-gray-700"
                          onClick={() => handleFuelTypeSelect("diesel")}
                        >
                          <CardContent className="p-4 text-center space-y-3">
                            <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                              <Fuel className="h-6 w-6 text-gray-700" />
                            </div>
                            <div>
                              <h4 className="font-medium">Diesel</h4>
                              <p className="text-xs text-gray-500">
                                Diesel Engine
                              </p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-green-500"
                          onClick={() => handleFuelTypeSelect("cng")}
                        >
                          <CardContent className="p-4 text-center space-y-3">
                            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                              <Zap className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">CNG</h4>
                              <p className="text-xs text-gray-500">
                                Compressed Natural Gas
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Brand Selection */}
              {selectionStep === "brand" && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search Brand"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {filteredBrands.map(([key, brand]) => (
                      <Card
                        key={key}
                        className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
                        onClick={() => handleBrandSelect(key)}
                      >
                        <CardContent className="p-3 text-center space-y-2">
                          <div className="text-2xl">{brand.logo}</div>
                          <div className="text-xs font-medium">
                            {brand.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {brandModels[key] 
                              ? `${brandModels[key].length} models`
                              : 'Click to load'
                            }
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Model Selection */}
              {selectionStep === "model" && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search Model"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {filteredModels.map((model: string) => (
                      <Card
                        key={model}
                        className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
                        onClick={() => handleModelSelect(model)}
                      >
                        <CardContent className="p-3 text-center space-y-2">
                          <div className="text-2xl">
                            {selectedVehicleType === 'bike' ? '🏍️' : '🚗'}
                          </div>
                          <div className="text-xs font-medium">{model}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DynamicHero;
