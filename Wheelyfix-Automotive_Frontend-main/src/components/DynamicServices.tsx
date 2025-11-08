import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, Star, MapPin, Clock } from "lucide-react";

// Service interface retained for reference if backend data is re-enabled

const DynamicServices = () => {
  const [vehicleTab, setVehicleTab] = useState<'Two Wheeler' | 'Four Wheeler'>('Two Wheeler');
  const navigate = useNavigate();
  const location = useLocation();

  const toSlug = (value: string) =>
    value
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const trackServiceClick = (service: { name: string; id?: string }) => {
    const payload = { service_id: service.id ?? toSlug(service.name), service_name: service.name };
    try {
      // Push to dataLayer if present (e.g., GTM), otherwise fallback to console
      // @ts-ignore
      if (typeof window !== 'undefined' && window.dataLayer && Array.isArray(window.dataLayer)) {
        // @ts-ignore
        window.dataLayer.push({ event: 'service_click', ...payload });
      } else {
        // eslint-disable-next-line no-console
        console.debug('analytics:event service_click', payload);
      }
    } catch {
      // eslint-disable-next-line no-console
      console.debug('analytics:event service_click failed');
    }
  };

  const handleOpenService = (service: { name: string; id?: string }) => {
    const slug = toSlug(service.name || service.id || 'service');
    const target = `/services/${slug}${location.search || ''}`;
    trackServiceClick(service);
    navigate(target, { replace: false });
    // Ensure we land at top of the page
    setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior }), 0);
  };

  // Updated service data with better HD automotive images - each service has a unique image
  const twoWheelerServices = [
    { 
      name: 'Suspension', 
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center&q=80', 
      color: 'emerald' 
    },
    { 
      name: 'Clutch', 
      image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=400&h=400&fit=crop&crop=center&q=80', 
      color: 'green' 
    },
    { 
      name: 'Tyre Service', 
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center&q=80', 
      color: 'orange' 
    },
    { 
      name: 'Electricals Services', 
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=400&fit=crop&crop=center&q=80', 
      color: 'yellow' 
    },
    { 
      name: 'Body Parts', 
      image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=400&h=400&fit=crop&crop=center&q=80', 
      color: 'purple' 
    },
    { 
      name: 'Engines & Carburetor', 
      image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400&h=400&fit=crop&crop=center&q=80', 
      color: 'red' 
    },
    { 
      name: 'Service & Repair', 
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=400&fit=crop&crop=center&q=80', 
      color: 'indigo' 
    },
    { 
      name: 'Transmission', 
      image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=400&fit=crop&crop=center&q=80', 
      color: 'teal' 
    },
    { 
      name: 'Fitments', 
      image: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=400&h=400&fit=crop&crop=center&q=80', 
      color: 'pink' 
    },
  ];
  
  const fourWheelerServices = [
    { 
      name: 'Car Services', 
      image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=400&h=400&fit=crop&crop=center&q=80', 
      color: 'emerald' 
    },
    { 
      name: 'AC Service & Repair', 
      image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=400&h=400&fit=crop&crop=center&q=80', 
      color: 'cyan' 
    },
    { 
      name: 'Batteries', 
      image: 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=400&h=400&fit=crop&crop=center&q=80', 
      color: 'yellow' 
    },
    { 
      name: 'Tyres & Wheel Care', 
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center&q=80', 
      color: 'orange' 
    },
    { 
      name: 'Denting & Painting', 
      image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=400&h=400&fit=crop&crop=center&q=80', 
      color: 'red' 
    },
    { 
      name: 'Detailing Services', 
      image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop&crop=center&q=80', 
      color: 'purple' 
    },
    { 
      name: 'Car Spa & Cleaning', 
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=400&fit=crop&crop=center&q=80', 
      color: 'green' 
    },
    { 
      name: 'Car Inspections', 
      image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=400&fit=crop&crop=center&q=80', 
      color: 'indigo' 
    },
    { 
      name: 'Windshields & Lights', 
      image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=400&fit=crop&crop=center&q=80', 
      color: 'amber' 
    },
    { 
      name: 'Suspension & Fitments', 
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop&crop=center&q=80', 
      color: 'teal' 
    },
    { 
      name: 'Insurance Claims', 
      image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=400&fit=crop&crop=center&q=80', 
      color: 'emerald' 
    },
  ];

  // Static content rendering; no async loading required

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; border: string; hover: string } } = {
      'emerald': { bg: 'bg-emerald-50', border: 'border-emerald-200', hover: 'hover:bg-emerald-100' },
      'green': { bg: 'bg-green-50', border: 'border-green-200', hover: 'hover:bg-green-100' },
      'orange': { bg: 'bg-orange-50', border: 'border-orange-200', hover: 'hover:bg-orange-100' },
      'yellow': { bg: 'bg-yellow-50', border: 'border-yellow-200', hover: 'hover:bg-yellow-100' },
      'purple': { bg: 'bg-purple-50', border: 'border-purple-200', hover: 'hover:bg-purple-100' },
      'red': { bg: 'bg-red-50', border: 'border-red-200', hover: 'hover:bg-red-100' },
      'indigo': { bg: 'bg-indigo-50', border: 'border-indigo-200', hover: 'hover:bg-indigo-100' },
      'teal': { bg: 'bg-teal-50', border: 'border-teal-200', hover: 'hover:bg-teal-100' },
      'cyan': { bg: 'bg-cyan-50', border: 'border-cyan-200', hover: 'hover:bg-cyan-100' },
      'pink': { bg: 'bg-pink-50', border: 'border-pink-200', hover: 'hover:bg-pink-100' },
      'amber': { bg: 'bg-amber-50', border: 'border-amber-200', hover: 'hover:bg-amber-100' },
    };
    return colorMap[color] || colorMap['emerald'];
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
            OUR SERVICES
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Delivering superior detailing and repairing solutions
          </p>
          <div className="flex justify-center mb-8">
            <button
              className={`px-8 py-3 rounded-full font-semibold mr-2 transition-all duration-200 ${vehicleTab === 'Two Wheeler' ? 'bg-orange-500 text-white shadow' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setVehicleTab('Two Wheeler')}
            >
              Two Wheeler
            </button>
            <button
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-200 ${vehicleTab === 'Four Wheeler' ? 'bg-orange-500 text-white shadow' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setVehicleTab('Four Wheeler')}
            >
              Four Wheeler
            </button>
          </div>
        </div>
        {/* Horizontal Scrollable Service Cards */}
        <div className="overflow-x-auto pb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 min-w-max">
            {(vehicleTab === 'Two Wheeler' ? twoWheelerServices : fourWheelerServices).map((service, idx) => {
              const colorClasses = getColorClasses(service.color);
              return (
                <div
                  key={idx}
                  role="link"
                  tabIndex={0}
                  aria-label={`View ${service.name}`}
                  onClick={() => handleOpenService(service)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenService(service);
                    }
                  }}
                  className={`cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 flex flex-col items-center bg-white rounded-xl border-2 ${colorClasses.border} p-6 min-w-[180px] max-w-[200px] mx-2 shadow-lg hover:shadow-xl transition-all duration-300 ${colorClasses.hover} hover:-translate-y-1`}
                >
                  <div className={`w-20 h-20 flex items-center justify-center mb-4 ${colorClasses.bg} rounded-xl overflow-hidden`}>
                    <img 
                      src={service.image} 
                      alt={service.name}
                      className="w-full h-full object-cover rounded-xl"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 text-center leading-tight">
                    {service.name}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>

        {/* Service Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
              <Shield className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Genuine Parts</h3>
            <p className="text-gray-600 text-sm">100% authentic parts with warranty</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Same Day Service</h3>
            <p className="text-gray-600 text-sm">Quick turnaround time</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
              <MapPin className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Free Pickup & Drop</h3>
            <p className="text-gray-600 text-sm">At your doorstep</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Expert Technicians</h3>
            <p className="text-gray-600 text-sm">Certified professionals</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DynamicServices;