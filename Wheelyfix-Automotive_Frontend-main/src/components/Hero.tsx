import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card } from "./ui/card";
import { Star } from "lucide-react";
import heroBanner from "../assets/hero-banner.jpg";

const Hero = () => {
  return (
    <section
      className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${heroBanner})`,
      }}
    >
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="text-gray-300">BEST</span>
                <br />
                <span className="text-gray-300">SERVICE</span>
                <span className="text-accent ml-4">FOR YOU</span>
                <br />
                <span className="text-gray-400 text-3xl lg:text-4xl">YOU WILL GET</span>
              </h1>
            </div>

            {/* Stats */}
            <div className="flex space-x-8 text-center">
              <div>
                <div className="flex items-center space-x-1 mb-1">
                  <Star className="h-5 w-5 text-accent fill-current" />
                  <span className="text-2xl font-bold">4/5</span>
                </div>
                <p className="text-sm text-gray-300">
                  Based on 10000+
                  <br />
                  Reviews
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent mb-1">2,50,000+</div>
                <p className="text-sm text-gray-300">
                  Happy
                  <br />
                  Customers
                </p>
              </div>
            </div>
          </div>

          {/* Right - Service Form */}
          <div className="flex justify-end">
            <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur-sm shadow-2xl">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Get Best Car / Bike Services Near You
                  </h2>
                  <p className="text-gray-600">Get instant quotes for your vehicle service</p>
                </div>

                <div className="space-y-4">
                  <Select>
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Select Your Vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="bike">Bike</SelectItem>
                      <SelectItem value="scooter">Scooter</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Enter Mobile Number"
                    className="h-12"
                    type="tel"
                  />

                  <Button
                    variant="hero"
                    className="w-full h-12 text-white bg-accent hover:bg-accent/90"
                  >
                    CHECK PRICES FOR FREE
                  </Button>
                </div>

                <div className="flex justify-between text-center pt-4 border-t">
                  <div>
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Star className="h-4 w-4 text-accent fill-current" />
                      <span className="font-bold">4/5</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Based on 10000+
                      <br />
                      Reviews
                    </p>
                  </div>
                  <div>
                    <div className="font-bold text-accent">2,50,000+</div>
                    <p className="text-xs text-gray-500">
                      Happy
                      <br />
                      Customers
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;