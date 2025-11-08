// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";

// const Services = () => {
//   const services = [
//     { name: "Suspension", icon: "🔧" },
//     { name: "Body Finish", icon: "🎨" },
//     { name: "Light Parts", icon: "💡" },
//     { name: "Tyre Service", icon: "🛞" },
//     { name: "Electrical Services", icon: "⚡" },
//     { name: "Body Parts", icon: "🔧" },
//     { name: "Engines & Carburetor", icon: "⚙️" },
//     { name: "Service & Repair", icon: "🔧" },
//     { name: "Transmission", icon: "⚙️" },
//     { name: "EV Battery", icon: "🔋" },
//     { name: "Brake & Wheel", icon: "🛞" },
//     { name: "Chassis", icon: "🔧" },
//     { name: "Handle Bar", icon: "🚲" },
//     { name: "Motor", icon: "⚙️" }
//   ];

//   return (
//     <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
//       {/* Decorative Background */}
//       <div className="absolute inset-0 pointer-events-none">
//         <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e510_1px,transparent_1pxS,linear-gradient(to_bottom,#4f46e510_1px,transparent_1px)] bg-[size:14px_24px]"></div>
//       </div>

//       <div className="container mx-auto px-4 relative">
//         {/* Section Header */}
//         <div className="text-center mb-20 max-w-3xl mx-auto">
//          <div className="inline-block px-6 py-2 bg-primary-100 text-primary-600 font-semibold rounded-full mb-6 
//                         animate-fade-in transform hover:scale-105 transition-transform duration-300">
//             Our Professional Services
//           </div>
//           <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-slide-up">
//             Expert Auto Care Services
//           </h2>
//           <p className="text-xl text-gray-600 leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
//             Experience premium automotive care with our comprehensive range of professional services
//           </p>
//         </div>

//         {/* Vehicle Type Tabs */}
//         <div className="flex justify-center mb-16">
//           <div className="inline-flex bg-white rounded-full p-1.5 shadow-lg">
//             <Button 
//               variant="default" 
//               className="px-8 py-3 bg-primary-600 text-white rounded-full transition-all duration-300 hover:bg-primary-700"
//             >
//               Two Wheeler
//             </Button>
//             <Button 
//               variant="ghost" 
//               className="px-8 py-3 text-gray-700 hover:bg-gray-50 rounded-full transition-all duration-300"
//             >
//               Four Wheeler
//             </Button>
//           </div>
//         </div>

//         {/* Services Grid */}
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 stagger-children">
//           {services.map((service, index) => (
//             <Card
//               key={index}
//               className="group relative overflow-hidden p-6 hover:shadow-xl transition-all duration-300 
//                        border border-gray-100 hover:border-primary-100 rounded-2xl
//                        bg-white hover:bg-gradient-to-br hover:from-primary-50 hover:to-white"
//             >
//               <div className="relative z-10">
//                 <div className="mb-4 w-12 h-12 flex items-center justify-center text-2xl
//                              bg-primary-100 rounded-xl text-primary-600
//                              group-hover:scale-110 group-hover:bg-primary-200 transition-all duration-300">
//                   {service.icon}
//                 </div>
//                 <h3 className="font-semibold text-gray-900 mb-2 text-lg group-hover:text-primary-600 
//                              transition-colors duration-300">
//                   {service.name}
//                 </h3>
//                 <p className="text-gray-600 text-sm leading-relaxed">
//                   Professional {service.name.toLowerCase()} services for your vehicle
//                 </p>
//               </div>
              
//               {/* Hover Effects */}
//               <div className="absolute inset-0 bg-gradient-to-r from-primary-100/20 to-transparent 
//                             opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//               <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 transform scale-x-0 
//                             group-hover:scale-x-100 transition-transform duration-300 origin-left" />
//             </Card>
//           ))}
//         </div>

//         {/* View All Services Button */}
//         <div className="text-center mt-16">
//           <Button 
//             variant="outline" 
//             className="px-8 py-6 text-lg font-medium border-2 border-primary-200 text-primary-600
//                      hover:bg-primary-50 hover:border-primary-300 transition-all duration-300
//                      rounded-xl shadow-sm hover:shadow-md"
//           >
//             View All Services
//           </Button>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Services;

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Services = () => {
  const services = [
    { 
      name: "Suspension", 
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format&q=80",
      alt: "Car suspension system repair"
    },
    { 
      name: "Body Finish", 
      image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=400&h=300&fit=crop&auto=format&q=80",
      alt: "Professional car body painting and finishing"
    },
    { 
      name: "Light Parts", 
      image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop&auto=format&q=80",
      alt: "Car headlight and lighting repair"
    },
    { 
      name: "Tyre Service", 
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&auto=format&q=80",
      alt: "Professional tire installation and service"
    },
    { 
      name: "Electrical Services", 
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop&auto=format&q=80",
      alt: "Vehicle electrical system diagnosis and repair"
    },
    { 
      name: "Body Parts", 
      image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=400&h=300&fit=crop&auto=format&q=80",
      alt: "Car body parts replacement and repair"
    },
    { 
      name: "Engines & Carburetor", 
      image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400&h=300&fit=crop&auto=format&q=80",
      alt: "Engine and carburetor repair services"
    },
    { 
      name: "Service & Repair", 
      image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop&auto=format&q=80",
      alt: "Comprehensive vehicle service and repair"
    },
    { 
      name: "Transmission", 
      image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=300&fit=crop&auto=format&q=80",
      alt: "Transmission repair and maintenance"
    },
    { 
      name: "EV Battery", 
      image: "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=400&h=300&fit=crop&auto=format&q=80",
      alt: "Electric vehicle battery service and replacement"
    },
    { 
      name: "Brake & Wheel", 
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&auto=format&q=80",
      alt: "Brake system and wheel service"
    },
    { 
      name: "Chassis", 
      image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400&h=300&fit=crop&auto=format&q=80",
      alt: "Vehicle chassis inspection and repair"
    },
    { 
      name: "Handle Bar", 
      image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop&auto=format&q=80",
      alt: "Motorcycle handlebar adjustment and repair"
    },
    { 
      name: "Motor", 
      image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop&auto=format&q=80",
      alt: "Motor repair and maintenance services"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-accent/10 text-accent font-semibold rounded-full mb-4">
            SERVICES
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Delivering superior detailing and repairing solutions
          </p>
        </div>

        {/* Vehicle Type Tabs */}
        <div className="flex justify-center mb-12">
          <div className="flex bg-white rounded-lg p-2 shadow-md">
            <Button variant="ghost" className="px-8 py-3 bg-accent text-white rounded-md">
              Two Wheeler
            </Button>
            <Button variant="ghost" className="px-8 py-3 text-gray-600 hover:bg-gray-100 rounded-md">
              Four Wheeler
            </Button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
          {services.map((service, index) => (
            <Card
              key={index}
              className="p-4 text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group overflow-hidden"
            >
              <div className="mb-4 overflow-hidden rounded-lg">
                <img
                  src={service.image}
                  alt={service.alt}
                  className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                {service.name}
              </h3>
            </Card>
          ))}
        </div>

        {/* Browse More Button */}
        <div className="text-center mt-12">
          <Link to="/vehicle-services-parts">
            <Button 
              variant="outline" 
              className="px-8 py-4 text-lg font-medium border-2 border-accent text-accent
                       hover:bg-accent hover:text-white transition-all duration-300
                       rounded-xl shadow-sm hover:shadow-md"
            >
              Browse More
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default Services;