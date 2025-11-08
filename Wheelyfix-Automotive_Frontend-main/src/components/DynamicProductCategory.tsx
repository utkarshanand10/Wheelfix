// import { useState, useEffect } from 'react';
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Calendar, Thermometer, Battery, Circle, SprayCan, Car, Sparkles, ClipboardList, Shield, Wrench, Droplets, Sun, CheckCircle, Star, Link as LinkIcon, Cog, Zap, Lightbulb, Settings, Microchip, Square, Gauge, Cpu, Package } from "lucide-react";
// import { supabase } from '@/integrations/supabase/client';
// import { Link } from 'react-router-dom';

// interface ProductCategory {
//   id: string;
//   name: string;
//   icon: string;
//   description: string;
//   is_active: boolean;
//   sort_order: number;
//   count?: number;
//   color?: string;
//   link?: string;
//   subtitle?: string;
// }

// const DynamicProductCategory = () => {
//   const [categories, setCategories] = useState<ProductCategory[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const { data, error } = await supabase
//           .from('product_categories')
//           .select('*')
//           .eq('is_active', true)
//           .order('sort_order', { ascending: true });

//         if (error) throw error;
//         setCategories(data || []);
//       } catch (error) {
//         console.error('Error fetching categories:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCategories();
//   }, []);

//   // Default categories with diverse colors and links
//   const defaultCategories: ProductCategory[] = [
//     {
//       id: '1',
//       name: 'Service Parts',
//       subtitle: 'Essential maintenance and repair parts',
//       icon: 'wrench',
//       description: 'Essential maintenance services and components for optimal vehicle performance',
//       is_active: true,
//       sort_order: 1,
//       count: 25,
//       color: 'bright-blue',
//       link: '/services?category=maintenance'
//     },
//     {
//       id: '2',
//       name: 'Belt & Chain Sprocket',
//       subtitle: 'Drive system components',
//       icon: 'link',
//       description: 'High-quality belts, chains, and sprocket systems for smooth operation',
//       is_active: true,
//       sort_order: 2,
//       count: 18,
//       color: 'deep-red',
//       link: '/services?category=belts-chains'
//     },
//     {
//       id: '3',
//       name: 'Cables',
//       subtitle: 'Control and electrical cables',
//       icon: 'zap',
//       description: 'Durable control and electrical cables for various vehicle systems',
//       is_active: true,
//       sort_order: 3,
//       count: 22,
//       color: 'orange',
//       link: '/services?category=cables'
//     },
//     {
//       id: '4',
//       name: 'Brake Systems',
//       subtitle: 'Complete brake system components',
//       icon: 'shield',
//       description: 'Complete braking system components for safety and performance',
//       is_active: true,
//       sort_order: 4,
//       count: 15,
//       color: 'crimson',
//       link: '/services?category=braking'
//     },
//     {
//       id: '5',
//       name: 'Plastic & Body Parts',
//       subtitle: 'Exterior and interior components',
//       icon: 'car',
//       description: 'Body panels and exterior components for perfect fit and finish',
//       is_active: true,
//       sort_order: 5,
//       count: 30,
//       color: 'steel-gray',
//       link: '/services?category=body'
//     },
//     {
//       id: '6',
//       name: 'Lighting Parts',
//       subtitle: 'Headlights, taillights, and indicators',
//       icon: 'lightbulb',
//       description: 'Advanced lighting solutions for enhanced visibility and safety',
//       is_active: true,
//       sort_order: 6,
//       count: 12,
//       color: 'amber',
//       link: '/services?category=lighting'
//     },
//     {
//       id: '7',
//       name: 'Engine Parts',
//       subtitle: 'Engine components and accessories',
//       icon: 'gauge',
//       description: 'Complete engine and powertrain components for maximum performance',
//       is_active: true,
//       sort_order: 7,
//       count: 18,
//       color: 'teal',
//       link: '/services?category=engine'
//     },
//     {
//       id: '8',
//       name: 'Clutch Systems',
//       subtitle: 'Transmission and clutch parts',
//       icon: 'cog',
//       description: 'Clutch assemblies and transmission components for smooth operation',
//       is_active: true,
//       sort_order: 8,
//       count: 16,
//       color: 'forest-green',
//       link: '/services?category=clutch'
//     },
//     {
//       id: '9',
//       name: 'Electronics Parts',
//       subtitle: 'Electronic control modules',
//       icon: 'microchip',
//       description: 'Electronic control units and advanced sensor systems',
//       is_active: true,
//       sort_order: 9,
//       count: 12,
//       color: 'purple',
//       link: '/services?category=electronics'
//     }
//   ];

//   const displayCategories = categories.length > 0 ? categories : defaultCategories;

//   if (loading) {
//     return (
//       <section className="py-20 bg-gradient-to-b from-white to-gray-50">
//         <div className="container mx-auto px-4 text-center">
//           <div className="animate-pulse text-lg">Loading categories...</div>
//         </div>
//       </section>
//     );
//   }

//   const getCategoryIcon = (iconName: string) => {
//     const iconMap: { [key: string]: React.ReactNode } = {
//       'wrench': <Wrench className="h-16 w-16" />,
//       'link': <LinkIcon className="h-16 w-16" />,
//       'zap': <Zap className="h-16 w-16" />,
//       'shield': <Shield className="h-16 w-16" />,
//       'car': <Car className="h-16 w-16" />,
//       'lightbulb': <Lightbulb className="h-16 w-16" />,
//       'settings': <Settings className="h-16 w-16" />,
//       'microchip': <Microchip className="h-16 w-16" />,
//       'droplets': <Droplets className="h-16 w-16" />,
//       'gauge': <Gauge className="h-16 w-16" />,
//       'cog': <Cog className="h-16 w-16" />,
//       'circle': <Circle className="h-16 w-16" />,
//       'star': <Star className="h-16 w-16" />,
//       'package': <Package className="h-16 w-16" />,
//       'sparkles': <Sparkles className="h-16 w-16" />,
//       'calendar': <Calendar className="h-16 w-16" />,
//       'thermometer': <Thermometer className="h-16 w-16" />,
//       'battery': <Battery className="h-16 w-16" />,
//       'spraycan': <SprayCan className="h-16 w-16" />,
//       'clipboardlist': <ClipboardList className="h-16 w-16" />,
//       'checkcircle': <CheckCircle className="h-16 w-16" />,
//       'sun': <Sun className="h-16 w-16" />,
//     };
//     return iconMap[iconName.toLowerCase()] || <Wrench className="h-16 w-16" />;
//   };

//   const getColorClasses = (color: string) => {
//     const colorMap: { [key: string]: { bg: string; text: string; hover: string; lightBg: string } } = {
//       'bright-blue': { bg: 'bg-blue-500', text: 'text-blue-500', hover: 'hover:bg-blue-600', lightBg: 'bg-blue-50' },
//       'deep-red': { bg: 'bg-red-600', text: 'text-red-600', hover: 'hover:bg-red-700', lightBg: 'bg-red-50' },
//       'orange': { bg: 'bg-orange-500', text: 'text-orange-500', hover: 'hover:bg-orange-600', lightBg: 'bg-orange-50' },
//       'crimson': { bg: 'bg-red-700', text: 'text-red-700', hover: 'hover:bg-red-800', lightBg: 'bg-red-50' },
//       'amber': { bg: 'bg-amber-500', text: 'text-amber-500', hover: 'hover:bg-amber-600', lightBg: 'bg-amber-50' },
//       'steel-gray': { bg: 'bg-gray-500', text: 'text-gray-500', hover: 'hover:bg-gray-600', lightBg: 'bg-gray-50' },
//       'teal': { bg: 'bg-teal-500', text: 'text-teal-500', hover: 'hover:bg-teal-600', lightBg: 'bg-teal-50' },
//       'forest-green': { bg: 'bg-green-600', text: 'text-green-600', hover: 'hover:bg-green-700', lightBg: 'bg-green-50' },
//       'navy-blue': { bg: 'bg-blue-700', text: 'text-blue-700', hover: 'hover:bg-blue-800', lightBg: 'bg-blue-50' },
//       'purple': { bg: 'bg-purple-600', text: 'text-purple-600', hover: 'hover:bg-purple-700', lightBg: 'bg-purple-50' },
//       'magenta': { bg: 'bg-pink-500', text: 'text-pink-500', hover: 'hover:bg-pink-600', lightBg: 'bg-pink-50' },
//     };
//     return colorMap[color] || colorMap['bright-blue'];
//   };

//   return (
//     <section className="py-20 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
//       <div className="container mx-auto px-4">
//         {/* Section Header */}
//         <div className="text-center mb-16">
//           <div className="inline-flex items-center space-x-2 bg-orange-500/20 px-4 py-2 rounded-full mb-4">
//             <Star className="h-4 w-4 text-orange-400" />
//             <span className="text-sm font-medium text-orange-400">Our Categories</span>
//           </div>
//           <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
//             Vehicle Services & Parts
//           </h2>
//           <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
//             Choose from our comprehensive range of automotive services and genuine parts. 
//             We serve all types of vehicles with professional expertise.
//           </p>
//         </div>

//         {/* Categories Grid - Perfect Square Tiles */}
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-16">
//           {displayCategories.map((category) => {
//             const colorClasses = getColorClasses(category.color || 'bright-blue');
//             const CategoryCard = (
//               <Card 
//                 className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 overflow-hidden aspect-square"
//               >
//                 <div className="p-6 text-center h-full flex flex-col justify-between">
//                   {/* Icon Section */}
//                   <div className="flex-1 flex flex-col items-center justify-center">
//                     <div className={`inline-flex items-center justify-center w-20 h-20 ${colorClasses.bg} rounded-2xl mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
//                       <div className="text-white">
//                         {getCategoryIcon(category.icon)}
//                       </div>
//                     </div>
                    
//                     {/* Title and Subtitle */}
//                     <h3 className="font-bold text-base text-gray-900 mb-2 group-hover:text-orange-600 transition-colors leading-tight">
//                       {category.name}
//                     </h3>
                    
//                     <p className="text-xs font-medium text-gray-600 mb-3 leading-tight">
//                       {category.subtitle}
//                     </p>
//                   </div>

//                   {/* Description and Count */}
//                   <div className="flex-shrink-0">
//                     {category.description && (
//                       <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">
//                         {category.description}
//                       </p>
//                     )}

//                     {category.count && (
//                       <div className="inline-flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full">
//                         <span className="text-sm font-medium text-gray-700">{category.count}</span>
//                         <span className="text-xs text-gray-500">Parts</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </Card>
//             );

//             return category.link ? (
//               <Link key={category.id} to={category.link}>
//                 {CategoryCard}
//               </Link>
//             ) : (
//               <div key={category.id}>
//                 {CategoryCard}
//               </div>
//             );
//           })}
//         </div>

//         {/* Browse More Button */}
//         <div className="text-center">
//           <Button 
//             className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
//             size="lg"
//           >
//             Browse More
//           </Button>
//         </div>

//         {/* Stats */}
//         <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
//           <div className="text-center">
//             <div className="text-3xl font-bold text-orange-500 mb-2">500+</div>
//             <div className="text-gray-300">Service Centers</div>
//           </div>
//           <div className="text-center">
//             <div className="text-3xl font-bold text-orange-500 mb-2">50+</div>
//             <div className="text-gray-300">Service Types</div>
//           </div>
//           <div className="text-center">
//             <div className="text-3xl font-bold text-orange-500 mb-2">1000+</div>
//             <div className="text-gray-300">Parts Available</div>
//           </div>
//           <div className="text-center">
//             <div className="text-3xl font-bold text-orange-500 mb-2">24/7</div>
//             <div className="text-gray-300">Support Available</div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default DynamicProductCategory;


import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Thermometer, Battery, Circle, SprayCan, Car, Sparkles, ClipboardList, Shield, Wrench, Droplets, Sun, CheckCircle, Star, Link as LinkIcon, Cog, Zap, Lightbulb, Settings, Microchip, Square, Gauge, Cpu, Package } from "lucide-react";
import { Link } from 'react-router-dom';

interface ProductCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  is_active: boolean;
  sort_order: number;
  count?: number;
  color?: string;
  link?: string;
  subtitle?: string;
}

const DynamicProductCategory = () => {
  // Categories data array - modify this to change the UI
  const categories: ProductCategory[] = [
    {
      id: '1',
      name: 'Service Parts',
      subtitle: 'Essential maintenance and repair parts',
      icon: 'wrench',
      description: 'Essential maintenance services and components for optimal vehicle performance',
      is_active: true,
      sort_order: 1,
      count: 25,
      color: 'emerald',
      link: '/services?category=maintenance'
    },
    {
      id: '2',
      name: 'Belt & Chain Sprocket',
      subtitle: 'Drive system components',
      icon: 'link',
      description: 'High-quality belts, chains, and sprocket systems for smooth operation',
      is_active: true,
      sort_order: 2,
      count: 18,
      color: 'deep-red',
      link: '/services?category=belts-chains'
    },
    {
      id: '3',
      name: 'Cables',
      subtitle: 'Control and electrical cables',
      icon: 'zap',
      description: 'Durable control and electrical cables for various vehicle systems',
      is_active: true,
      sort_order: 3,
      count: 22,
      color: 'orange',
      link: '/services?category=cables'
    },
    {
      id: '4',
      name: 'Brake Systems',
      subtitle: 'Complete brake system components',
      icon: 'shield',
      description: 'Complete braking system components for safety and performance',
      is_active: true,
      sort_order: 4,
      count: 15,
      color: 'crimson',
      link: '/services?category=braking'
    },
    {
      id: '5',
      name: 'Plastic & Body Parts',
      subtitle: 'Exterior and interior components',
      icon: 'car',
      description: 'Body panels and exterior components for perfect fit and finish',
      is_active: true,
      sort_order: 5,
      count: 30,
      color: 'steel-gray',
      link: '/services?category=body'
    },
    {
      id: '6',
      name: 'Lighting Parts',
      subtitle: 'Headlights, taillights, and indicators',
      icon: 'lightbulb',
      description: 'Advanced lighting solutions for enhanced visibility and safety',
      is_active: true,
      sort_order: 6,
      count: 12,
      color: 'amber',
      link: '/services?category=lighting'
    },
    {
      id: '7',
      name: 'Engine Parts',
      subtitle: 'Engine components and accessories',
      icon: 'gauge',
      description: 'Complete engine and powertrain components for maximum performance',
      is_active: true,
      sort_order: 7,
      count: 18,
      color: 'teal',
      link: '/services?category=engine'
    },
    {
      id: '8',
      name: 'Clutch Systems',
      subtitle: 'Transmission and clutch parts',
      icon: 'cog',
      description: 'Clutch assemblies and transmission components for smooth operation',
      is_active: true,
      sort_order: 8,
      count: 16,
      color: 'forest-green',
      link: '/services?category=clutch'
    },
    {
      id: '9',
      name: 'Electronics Parts',
      subtitle: 'Electronic control modules',
      icon: 'microchip',
      description: 'Electronic control units and advanced sensor systems',
      is_active: true,
      sort_order: 9,
      count: 12,
      color: 'purple',
      link: '/services?category=electronics'
    }
  ];

  const getCategoryIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'wrench': <Wrench className="h-16 w-16" />,
      'link': <LinkIcon className="h-16 w-16" />,
      'zap': <Zap className="h-16 w-16" />,
      'shield': <Shield className="h-16 w-16" />,
      'car': <Car className="h-16 w-16" />,
      'lightbulb': <Lightbulb className="h-16 w-16" />,
      'settings': <Settings className="h-16 w-16" />,
      'microchip': <Microchip className="h-16 w-16" />,
      'droplets': <Droplets className="h-16 w-16" />,
      'gauge': <Gauge className="h-16 w-16" />,
      'cog': <Cog className="h-16 w-16" />,
      'circle': <Circle className="h-16 w-16" />,
      'star': <Star className="h-16 w-16" />,
      'package': <Package className="h-16 w-16" />,
      'sparkles': <Sparkles className="h-16 w-16" />,
      'calendar': <Calendar className="h-16 w-16" />,
      'thermometer': <Thermometer className="h-16 w-16" />,
      'battery': <Battery className="h-16 w-16" />,
      'spraycan': <SprayCan className="h-16 w-16" />,
      'clipboardlist': <ClipboardList className="h-16 w-16" />,
      'checkcircle': <CheckCircle className="h-16 w-16" />,
      'sun': <Sun className="h-16 w-16" />,
    };
    return iconMap[iconName.toLowerCase()] || <Wrench className="h-16 w-16" />;
  };

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; text: string; hover: string; lightBg: string } } = {
      'emerald': { bg: 'bg-green-500', text: 'text-green-500', hover: 'hover:bg-green-600', lightBg: 'bg-green-50' },
      'deep-red': { bg: 'bg-red-600', text: 'text-red-600', hover: 'hover:bg-red-700', lightBg: 'bg-red-50' },
      'orange': { bg: 'bg-orange-500', text: 'text-orange-500', hover: 'hover:bg-orange-600', lightBg: 'bg-orange-50' },
      'crimson': { bg: 'bg-red-700', text: 'text-red-700', hover: 'hover:bg-red-800', lightBg: 'bg-red-50' },
      'amber': { bg: 'bg-amber-500', text: 'text-amber-500', hover: 'hover:bg-amber-600', lightBg: 'bg-amber-50' },
      'steel-gray': { bg: 'bg-gray-500', text: 'text-gray-500', hover: 'hover:bg-gray-600', lightBg: 'bg-gray-50' },
      'teal': { bg: 'bg-teal-500', text: 'text-teal-500', hover: 'hover:bg-teal-600', lightBg: 'bg-teal-50' },
      'forest-green': { bg: 'bg-green-600', text: 'text-green-600', hover: 'hover:bg-green-700', lightBg: 'bg-green-50' },
      'purple': { bg: 'bg-purple-600', text: 'text-purple-600', hover: 'hover:bg-purple-700', lightBg: 'bg-purple-50' },
      'magenta': { bg: 'bg-pink-500', text: 'text-pink-500', hover: 'hover:bg-pink-600', lightBg: 'bg-pink-50' },
    };
    return colorMap[color] || colorMap['emerald'];
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-orange-500/20 px-4 py-2 rounded-full mb-4">
            <Star className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-400">Our Categories</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Vehicle Services & Parts
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Choose from our comprehensive range of automotive services and genuine parts. 
            We serve all types of vehicles with professional expertise.
          </p>
        </div>

        {/* Categories Grid - Perfect Square Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-16">
          {categories.map((category) => {
            const colorClasses = getColorClasses(category.color || 'emerald');
            const CategoryCard = (
              <Card 
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 overflow-hidden aspect-square"
              >
                <div className="p-8 text-center h-full flex flex-col justify-between">
                  {/* Icon Section */}
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className={`inline-flex items-center justify-center w-20 h-20 ${colorClasses.bg} rounded-2xl mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                      <div className="text-white">
                      {getCategoryIcon(category.icon)}
                    </div>
                  </div>
                  
                    {/* Title and Subtitle */}
                    <h3 className="font-bold text-base text-gray-900 mb-3 group-hover:text-orange-600 transition-colors leading-tight">
                    {category.name}
                  </h3>
                  
                    <p className="text-xs font-medium text-gray-600 mb-4 leading-tight">
                      {category.subtitle}
                    </p>
                  </div>

                  {/* Description and Count */}
                  <div className="flex-shrink-0">
                    {category.description && (
                      <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">
                        {category.description}
                    </p>
                  )}

                  {category.count && (
                    <div className="inline-flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-gray-700">{category.count}</span>
                        <span className="text-xs text-gray-500">Parts</span>
                    </div>
                  )}
                  </div>
                </div>
              </Card>
            );

            return category.link ? (
              <Link key={category.id} to={category.link}>
                {CategoryCard}
              </Link>
            ) : (
              <div key={category.id}>
                {CategoryCard}
              </div>
            );
          })}
        </div>

        {/* Browse More Button */}
        <div className="text-center">
          <Link to="/vehicle-services-parts">
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              Browse More
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">500+</div>
            <div className="text-gray-300">Service Centers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">50+</div>
            <div className="text-gray-300">Service Types</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">1000+</div>
            <div className="text-gray-300">Parts Available</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">24/7</div>
            <div className="text-gray-300">Support Available</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DynamicProductCategory;