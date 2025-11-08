import React, { useRef, useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink, ChevronLeft, ChevronRight, Pause, Play, Search } from "lucide-react";
import { Link } from "react-router-dom";

type Brand = {
  name: string;
  logo: string;
  fallback?: string;
  color?: string;
  textColor?: string;
  logoUrls?: string[]; // Multiple logo URLs for fallback
};

const Brands: React.FC = () => {
  // Memoize the static brand list to provide a stable reference across renders.
  // This prevents effects that depend on it from re-running unnecessarily
  // and eliminates infinite update loops.
  const brands: Brand[] = useMemo(() => ([
    { 
      name: "Maruti Suzuki", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Maruti_Suzuki_logo.svg/2560px-Maruti_Suzuki_logo.svg.png", 
      logoUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Maruti_Suzuki_logo.svg/2560px-Maruti_Suzuki_logo.svg.png",
        "/logos/maruti-suzuki.svg"
      ],
      fallback: "🚗", 
      color: "bg-blue-50", 
      textColor: "text-blue-600" 
    },
    { 
      name: "Hyundai", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Hyundai_Motor_Company_logo.svg/2560px-Hyundai_Motor_Company_logo.svg.png", 
      logoUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Hyundai_Motor_Company_logo.svg/2560px-Hyundai_Motor_Company_logo.svg.png",
        "/logos/hyundai.svg"
      ],
      fallback: "🚗", 
      color: "bg-slate-50", 
      textColor: "text-slate-600" 
    },
    { 
      name: "Tata Motors", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Tata_logo.svg/2560px-Tata_logo.svg.png", 
      logoUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Tata_logo.svg/2560px-Tata_logo.svg.png",
        "/logos/tata.svg"
      ],
      fallback: "🚗", 
      color: "bg-indigo-50", 
      textColor: "text-indigo-600" 
    },
    { 
      name: "Mahindra", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Mahindra_Rising_Sun_logo.svg/2560px-Mahindra_Rising_Sun_logo.svg.png", 
      logoUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Mahindra_Rising_Sun_logo.svg/2560px-Mahindra_Rising_Sun_logo.svg.png",
        "/logos/mahindra.svg"
      ],
      fallback: "🚗", 
      color: "bg-red-50", 
      textColor: "text-red-600" 
    },
    { 
      name: "Honda", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Honda-logo.jpg/2560px-Honda-logo.jpg", 
      logoUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Honda-logo.jpg/2560px-Honda-logo.jpg",
        "/logos/honda.svg"
      ],
      fallback: "🏍️", 
      color: "bg-red-50", 
      textColor: "text-red-600" 
    },
    { 
      name: "Toyota", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_logo.svg/2560px-Toyota_logo.svg.png", 
      logoUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_logo.svg/2560px-Toyota_logo.svg.png",
        "/logos/toyota.svg"
      ],
      fallback: "🚗", 
      color: "bg-gray-50", 
      textColor: "text-gray-600" 
    },
    { 
      name: "Kia", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Kia_logo.svg/2560px-Kia_logo.svg.png", 
      logoUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Kia_logo.svg/2560px-Kia_logo.svg.png",
        "/logos/kia.svg"
      ],
      fallback: "🚗", 
      color: "bg-orange-50", 
      textColor: "text-orange-600" 
    },
    { 
      name: "Volkswagen", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Volkswagen_logo_2019.svg/2560px-Volkswagen_logo_2019.svg.png", 
      logoUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Volkswagen_logo_2019.svg/2560px-Volkswagen_logo_2019.svg.png",
        "/logos/volkswagen.svg"
      ],
      fallback: "🚗", 
      color: "bg-blue-50", 
      textColor: "text-blue-600" 
    },
    { 
      name: "Hero", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Hero_MotoCorp_logo.svg/2560px-Hero_MotoCorp_logo.svg.png", 
      logoUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Hero_MotoCorp_logo.svg/2560px-Hero_MotoCorp_logo.svg.png",
        "/logos/hero.svg"
      ],
      fallback: "🏍️", 
      color: "bg-green-50", 
      textColor: "text-green-600" 
    },
    { 
      name: "Bajaj", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Bajaj_logo.svg/2560px-Bajaj_logo.svg.png", 
      logoUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Bajaj_logo.svg/2560px-Bajaj_logo.svg.png",
        "/logos/bajaj.svg"
      ],
      fallback: "🏍️", 
      color: "bg-yellow-50", 
      textColor: "text-yellow-600" 
    },
    { 
      name: "TVS", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/TVS_Motor_Company_logo.svg/2560px-TVS_Motor_Company_logo.svg.png", 
      logoUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/TVS_Motor_Company_logo.svg/2560px-TVS_Motor_Company_logo.svg.png",
        "/logos/tvs.svg"
      ],
      fallback: "🏍️", 
      color: "bg-purple-50", 
      textColor: "text-purple-600" 
    },
    { 
      name: "Royal Enfield", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Royal_Enfield_logo.svg/2560px-Royal_Enfield_logo.svg.png", 
      logoUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Royal_Enfield_logo.svg/2560px-Royal_Enfield_logo.svg.png",
        "/logos/royal-enfield.svg"
      ],
      fallback: "🏍️", 
      color: "bg-gray-50", 
      textColor: "text-gray-600" 
    },
    { 
      name: "Yamaha", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Yamaha_logo.svg/2560px-Yamaha_logo.svg.png", 
      logoUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Yamaha_logo.svg/2560px-Yamaha_logo.svg.png",
        "/logos/yamaha.svg"
      ],
      fallback: "🏍️", 
      color: "bg-red-50", 
      textColor: "text-red-600" 
    },
    { 
      name: "KTM", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/KTM_logo.svg/2560px-KTM_logo.svg.png", 
      logoUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/KTM_logo.svg/2560px-KTM_logo.svg.png",
        "/logos/ktm.svg"
      ],
      fallback: "🏍️", 
      color: "bg-orange-50", 
      textColor: "text-orange-600" 
    },
    { 
      name: "Suzuki", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Suzuki_logo.svg/2560px-Suzuki_logo.svg.png", 
      logoUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Suzuki_logo.svg/2560px-Suzuki_logo.svg.png",
        "/logos/suzuki-real.png"
      ],
      fallback: "🏍️", 
      color: "bg-blue-50", 
      textColor: "text-blue-600" 
    },
    { 
      name: "Ather", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Ather_Energy_logo.svg/2560px-Ather_Energy_logo.svg.png", 
      logoUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Ather_Energy_logo.svg/2560px-Ather_Energy_logo.svg.png",
        "/logos/ather.svg"
      ],
      fallback: "⚡", 
      color: "bg-green-50", 
      textColor: "text-green-600" 
    },
    { 
      name: "Ola Electric", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Ola_Electric_logo.svg/2560px-Ola_Electric_logo.svg.png", 
      logoUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Ola_Electric_logo.svg/2560px-Ola_Electric_logo.svg.png",
        "/logos/ola-electric.svg"
      ],
      fallback: "⚡", 
      color: "bg-blue-50", 
      textColor: "text-blue-600" 
    },
    { 
      name: "Revolt", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Revolt_Motors_logo.svg/2560px-Revolt_Motors_logo.svg.png", 
      logoUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Revolt_Motors_logo.svg/2560px-Revolt_Motors_logo.svg.png",
        "/logos/revolt.svg"
      ],
      fallback: "⚡", 
      color: "bg-purple-50", 
      textColor: "text-purple-600" 
    },
    { 
      name: "Jawa", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Jawa_logo.svg/2560px-Jawa_logo.svg.png", 
      logoUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Jawa_logo.svg/2560px-Jawa_logo.svg.png",
        "/logos/jawa.svg"
      ],
      fallback: "🏍️", 
      color: "bg-red-50", 
      textColor: "text-red-600" 
    },
    { 
      name: "BMW", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/2560px-BMW.svg.png", 
      logoUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/2560px-BMW.svg.png",
        "https://www.bmw.com/images/bmw-logo.png"
      ],
      fallback: "🚗", 
      color: "bg-blue-50", 
      textColor: "text-blue-600" 
    },
    { 
      name: "Mercedes-Benz", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/2560px-Mercedes-Logo.svg.png", 
      logoUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/2560px-Mercedes-Logo.svg.png",
        "https://www.mercedes-benz.com/images/mercedes-logo.png"
      ],
      fallback: "🚗", 
      color: "bg-gray-50", 
      textColor: "text-gray-600" 
    },
    { 
      name: "Audi", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Audi_logo_type.svg/2560px-Audi_logo_type.svg.png", 
      logoUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Audi_logo_type.svg/2560px-Audi_logo_type.svg.png"
      ],
      fallback: "🚗", 
      color: "bg-slate-50", 
      textColor: "text-slate-600" 
    },
    { 
      name: "Nissan", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Nissan_logo.png/2560px-Nissan_logo.png", 
      logoUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Nissan_logo.png/2560px-Nissan_logo.png"
      ],
      fallback: "🚗", 
      color: "bg-red-50", 
      textColor: "text-red-600" 
    },
    { 
      name: "Ford", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ford_logo_flat.svg/2560px-Ford_logo_flat.svg.png", 
      logoUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ford_logo_flat.svg/2560px-Ford_logo_flat.svg.png",
        "https://www.ford.com/images/ford-logo.png"
      ],
      fallback: "🚗", 
      color: "bg-blue-50", 
      textColor: "text-blue-600" 
    }
  ]), []);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>(brands);

  const loop = [...brands, ...brands];

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
      setCurrentIndex(Math.min(filteredBrands.length - 1, currentIndex + 1));
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = 300; // Approximate card width + gap
      scrollContainerRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
      setCurrentIndex(index);
    }
  };

  const toggleAutoScroll = () => {
    setIsAutoScrolling(!isAutoScrolling);
    setIsPaused(!isPaused);
  };

  // Auto-scroll effect
  useEffect(() => {
    if (!isAutoScrolling) return;

    const interval = setInterval(() => {
      if (!isPaused && scrollContainerRef.current) {
        scrollRight();
        if (currentIndex >= filteredBrands.length - 1) {
          setCurrentIndex(0);
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoScrolling, isPaused, currentIndex, filteredBrands.length]);

  // Touch/swipe support and scroll tracking
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let startX = 0;
    let scrollLeft = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      setIsPaused(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!startX) return;
      const x = e.touches[0].pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    };

    const handleTouchEnd = () => {
      startX = 0;
      setTimeout(() => setIsPaused(false), 1000);
    };

    const handleScroll = () => {
      const scrollPosition = container.scrollLeft;
      const cardWidth = 300; // Approximate card width + gap
      const newIndex = Math.round(scrollPosition / cardWidth);
      setCurrentIndex(Math.max(0, Math.min(newIndex, filteredBrands.length - 1)));
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('scroll', handleScroll);
    };
  }, [brands.length]);

  // Search filter effect (depends on memoized brands)
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (term === '') {
      setFilteredBrands(brands);
      setCurrentIndex(0);
      return;
    }
    const filtered = brands.filter((brand) =>
      brand.name.toLowerCase().includes(term)
    );
    setFilteredBrands(filtered);
    setCurrentIndex(0);
  }, [searchTerm, brands]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollLeft();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollRight();
      } else if (e.key === ' ') {
        e.preventDefault();
        toggleAutoScroll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, filteredBrands.length]);

  const BrandCard: React.FC<Brand> = (brand) => {
    const [currentLogoIndex, setCurrentLogoIndex] = React.useState(0);
    const [logoError, setLogoError] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);

    const handleLogoError = () => {
      if (currentLogoIndex < (brand.logoUrls?.length || 1) - 1) {
        setCurrentLogoIndex(currentLogoIndex + 1);
      } else {
        setLogoError(true);
        setIsLoading(false);
      }
    };

    const handleLogoLoad = () => {
      setIsLoading(false);
    };

    const handleBrandClick = () => {
      // You can add navigation or modal functionality here
      console.log(`Clicked on ${brand.name}`);
      
      // Show a toast notification (you can integrate with your toast system)
      // toast.success(`Selected ${brand.name} for services`);
      
      // Example: navigate to brand-specific service page
      // navigate(`/services/${brand.name.toLowerCase().replace(/\s+/g, '-')}`);
      
      // For now, just show an alert
      alert(`You selected ${brand.name}. This will navigate to ${brand.name} specific services in the future.`);
    };

    const getCurrentLogo = () => {
      if (logoError) return "";
      if (brand.logoUrls && brand.logoUrls.length > currentLogoIndex) {
        return brand.logoUrls[currentLogoIndex];
      }
      return brand.logo;
    };

    return (
      <div className="shrink-0 group">
        <Card
          className={[
            "w-56 h-36 p-6 text-center bg-white relative overflow-hidden",
            "rounded-2xl border-2 transition-all duration-300 cursor-pointer",
            "hover:shadow-xl hover:border-accent/30 hover:scale-105",
            brand.color || "bg-gray-50",
          ].join(" ")}
          onClick={handleBrandClick}
          title={`Click to view ${brand.name} services`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleBrandClick();
            }
          }}
        >
          <div
            className={`absolute top-0 right-0 w-12 h-12 ${brand.color || "bg-gray-50"} rounded-full -translate-y-6 translate-x-6 opacity-50`}
          />
          <div className="relative z-10">
                         <div className="flex items-center justify-center h-16 mb-3">
               {isLoading && !logoError && (
                 <div className="animate-pulse bg-gray-200 rounded-lg w-12 h-12"></div>
               )}
               {!logoError ? (
                 <img
                   src={getCurrentLogo()}
                   alt={`${brand.name} logo`}
                   loading="lazy"
                   decoding="async"
                   referrerPolicy="no-referrer"
                   className={`h-12 w-auto object-contain group-hover:scale-110 transition-transform transition-opacity duration-300 ${
                     isLoading ? 'opacity-0' : 'opacity-100'
                   }`}
                   onError={handleLogoError}
                   onLoad={handleLogoLoad}
                 />
               ) : (
                 <div className="text-3xl">
                   {brand.fallback || "🚗"}
                 </div>
               )}
             </div>
            <h3 className={`font-semibold text-sm ${brand.textColor || "text-gray-700"} mb-1 group-hover:text-accent transition-colors`}>
              {brand.name}
            </h3>
            <div className="flex items-center justify-center gap-1 text-accent opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="h-3 w-3" />
              <span className="text-xs font-medium">View Guide</span>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-accent/10 px-4 py-2 rounded-full mb-4">
            <Star className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">Trusted Partners</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">The Brands We Serve</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We provide professional service for all major automotive brands in India. From cars to bikes, we ensure quality maintenance for every vehicle.
          </p>
        </div>

        {/* Enhanced Scrollable Brands Section */}
        <div className="relative w-full">
          {/* Search Bar */}
          <div className="flex justify-center mb-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          {/* Scroll Controls */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Button
              onClick={scrollLeft}
              variant="outline"
              size="sm"
              className="rounded-full w-10 h-10 p-0 hover:bg-accent hover:text-white transition-all duration-300"
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button
              onClick={toggleAutoScroll}
              variant="outline"
              size="sm"
              className="rounded-full w-10 h-10 p-0 hover:bg-accent hover:text-white transition-all duration-300"
            >
              {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
            </Button>
            
            <Button
              onClick={scrollRight}
              variant="outline"
              size="sm"
              className="rounded-full w-10 h-10 p-0 hover:bg-accent hover:text-white transition-all duration-300"
              disabled={currentIndex === brands.length - 1}
              title="Next brand (Right Arrow)"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Results Counter and Instructions */}
          <div className="text-center mb-4">
            <div className="text-sm text-gray-500 mb-2">
              {searchTerm ? (
                <span>Found {filteredBrands.length} brand{filteredBrands.length !== 1 ? 's' : ''} matching "{searchTerm}"</span>
              ) : (
                <span>Showing all {filteredBrands.length} brands</span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              <p>Use arrow keys, swipe on mobile, or click the controls above</p>
            </div>
          </div>

          {/* Scrollable Container */}
          <div className="relative w-full overflow-hidden">
            {/* Gradient Overlays */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />
            
            {/* Brands Container */}
            {filteredBrands.length > 0 ? (
                               <div 
                   ref={scrollContainerRef}
                   className="flex gap-6 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                   style={{ 
                     scrollbarWidth: 'none', 
                     msOverflowStyle: 'none'
                   }}
                   onMouseEnter={() => setIsPaused(true)}
                   onMouseLeave={() => setIsPaused(false)}
                 >
                {filteredBrands.map((brand, index) => (
                  <BrandCard key={`${brand.name}-${index}`} {...brand} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">🔍</div>
                <p className="text-gray-500 text-lg">No brands found matching "{searchTerm}"</p>
                <Button 
                  onClick={() => setSearchTerm('')}
                  variant="outline"
                  className="mt-4"
                >
                  Clear Search
                </Button>
              </div>
            )}
          </div>

          {/* Scroll Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-6 overflow-hidden">
            <div 
              className="bg-accent h-2 rounded-full transition-all duration-300 ease-out"
              style={{ 
                width: `${((currentIndex + 1) / Math.max(1, filteredBrands.length)) * 100}%` 
              }}
            />
          </div>

          {/* Scroll Indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {filteredBrands.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-accent scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to brand ${index + 1}`}
              />
            ))}
          </div>

          {/* View All Brands Button */}
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              className="px-8 py-3 border-2 border-accent text-accent hover:bg-accent hover:text-white transition-all duration-300 rounded-xl"
              onClick={() => scrollToIndex(0)}
            >
              View All Brands
            </Button>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Don't See Your Brand?</h3>
            <p className="text-gray-600 mb-6">
              We service all major automotive brands. Contact us to know more about our comprehensive service offerings.
            </p>
                         <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Link to="/contact">
                 <Button className="bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-3" size="lg">
                   Contact Us
                 </Button>
               </Link>
               <Link to="/vehicle-services-parts">
                 <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white font-semibold px-8 py-3" size="lg">
                   View All Services
                 </Button>
               </Link>
             </div>
          </div>
        </div>

        {/* Stats */}
                 <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
           <div className="text-center">
             <div className="text-3xl font-bold text-accent mb-2">30+</div>
             <div className="text-gray-600">Brands Supported</div>
           </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">1000+</div>
            <div className="text-gray-600">Service Guides</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">24/7</div>
            <div className="text-gray-600">Expert Support</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">100%</div>
            <div className="text-gray-600">Genuine Parts</div>
          </div>
        </div>
      </div>


    </section>
  );
};

export default Brands;
