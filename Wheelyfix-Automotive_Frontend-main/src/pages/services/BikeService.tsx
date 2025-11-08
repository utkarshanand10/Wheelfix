import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bike, Clock, Shield, Star, CheckCircle, MapPin, Phone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const BikeService = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const handleBookNow = () => {
    const serviceName = 'Bike Service';
    if (!user) {
      localStorage.setItem('redirectAfterLoginPath', '/booking')
      navigate('/login', { state: { from: '/booking', serviceType: serviceName } });
      return;
    }
    navigate('/booking', { state: { serviceType: serviceName } });
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-purple-700">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
              <Bike className="h-8 w-8" />
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">Bike Service</h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Complete bike maintenance and repair service for optimal performance
            </p>
          </div>
        </div>
      </section>

      {/* Service Details */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="space-y-8">
                {/* What's Included */}
                <Card className="p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">What's Included</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-6 w-6 text-purple-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Engine Oil Change</h3>
                        <p className="text-gray-600 text-sm">High-quality engine oil</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-6 w-6 text-purple-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Chain Lubrication</h3>
                        <p className="text-gray-600 text-sm">Chain cleaning and lubrication</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-6 w-6 text-purple-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Brake Adjustment</h3>
                        <p className="text-gray-600 text-sm">Brake system check</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-6 w-6 text-purple-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Tire Pressure</h3>
                        <p className="text-gray-600 text-sm">Check and adjust tire pressure</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Service Process */}
                <Card className="p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Service Process</h2>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                        1
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Bike Inspection</h3>
                        <p className="text-gray-600">Comprehensive bike check</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                        2
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Service Execution</h3>
                        <p className="text-gray-600">Perform required maintenance</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                        3
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Quality Check</h3>
                        <p className="text-gray-600">Verify all systems working</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                        4
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Test Ride</h3>
                        <p className="text-gray-600">Ensure smooth operation</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Why Choose Us */}
                <Card className="p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose Wheelyfix</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-6 w-6 text-purple-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Genuine Parts</h3>
                        <p className="text-gray-600 text-sm">100% authentic parts</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Clock className="h-6 w-6 text-purple-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Quick Service</h3>
                        <p className="text-gray-600 text-sm">Completed in 1-2 hours</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-6 w-6 text-purple-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Free Pickup & Drop</h3>
                        <p className="text-gray-600 text-sm">At your doorstep</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Star className="h-6 w-6 text-purple-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Expert Technicians</h3>
                        <p className="text-gray-600 text-sm">Certified professionals</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing Card */}
              <Card className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Service Pricing</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Starting from</span>
                    <span className="text-3xl font-bold text-purple-600">₹499</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-semibold text-gray-900">1-2 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Warranty</span>
                    <span className="font-semibold text-gray-900">3 months</span>
                  </div>
                </div>
                {/* Book Now button removed - booking only available from homepage */}
              </Card>

              {/* Contact Card */}
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-purple-600" />
                    <span className="text-gray-600">+91 98765 43210</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Our experts are available 24/7 to help you with any questions
                  </p>
                  <Button variant="outline" className="w-full">
                    Contact Support
                  </Button>
                </div>
              </Card>

              {/* Related Services */}
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Related Services</h3>
                <div className="space-y-3">
                  <Link to="/services/general-service" className="block text-purple-600 hover:text-purple-700">
                    General Service
                  </Link>
                  <Link to="/services/oil-change" className="block text-purple-600 hover:text-purple-700">
                    Oil Change Service
                  </Link>
                  <Link to="/services/brake-service" className="block text-purple-600 hover:text-purple-700">
                    Brake Service
                  </Link>
                  <Link to="/services/battery-service" className="block text-purple-600 hover:text-purple-700">
                    Battery Service
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BikeService; 