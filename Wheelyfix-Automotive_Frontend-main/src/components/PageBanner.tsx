import { ReactNode } from "react";

type PageBannerProps = {
  title: string;
  subtitle?: string;
  imageUrl: string;
  children?: ReactNode;
};

const PageBanner = ({ title, subtitle, imageUrl, children }: PageBannerProps) => {
  return (
    <section className="relative w-full min-h-[40vh] flex items-center overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105 animate-subtle-zoom"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/70 to-gray-900/80" />
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="py-24 md:py-32 text-center max-w-4xl mx-auto stagger-children">
          {/* Title with Animation */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight animate-slide-up">
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          
          {/* Subtitle with Animation */}
          {subtitle && (
            <p 
              className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              {subtitle}
            </p>
          )}
          
          {/* Call to Action with Animation */}
          {children && (
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up"
              style={{ animationDelay: '0.4s' }}
            >
              {children}
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/10 to-transparent" />
    </section>
  );
};

export default PageBanner;


