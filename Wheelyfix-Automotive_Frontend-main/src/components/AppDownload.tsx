import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import appMockup from "@/assets/app-mockup.png";

const AppDownload = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <div className="inline-block px-4 py-2 bg-accent/20 text-accent font-semibold rounded-full mb-6">
                DOWNLOAD
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Wheelyfix Automotive APP
              </h2>
              
              <p className="text-xl text-gray-300 leading-relaxed">
                Download and book a seamless two wheeler and four wheeler Service 
                for your loved vehicle and get exciting discounts with Smart Garage service app.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-lg font-semibold">Get it On</p>
              <div className="flex space-x-4">
                <Button 
                  variant="ghost" 
                  className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm"
                >
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                    alt="Google Play Store" 
                    className="h-12"
                  />
                </Button>
              </div>
            </div>
          </div>

          {/* Right - App Mockup */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full"></div>
              <img 
                src={appMockup} 
                alt="Smart Garage App" 
                className="relative z-10 max-w-sm h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownload;