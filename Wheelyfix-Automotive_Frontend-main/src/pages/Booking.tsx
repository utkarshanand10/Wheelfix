import { useEffect, useMemo, useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import RazorpayPayment from "@/components/RazorpayPayment"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { api } from "@/lib/api"

interface Service {
  id: string;
  name: string;
  price: number;
  priceInRupees: number;
  description: string;
  duration: string;
  category: string;
  icon: string;
  isNew?: boolean;
}

const Booking = () => {
  const location = useLocation() as { state?: any }
  const navigate = useNavigate()
  const { user } = useAuth()
  const [date, setDate] = useState<Date>()
  const [showPayment, setShowPayment] = useState(false)
  const [bookingData, setBookingData] = useState<any>(null)
  const [allServices, setAllServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    vehicleType: "",
    vehicleModel: "",
    serviceType: "",
    timeSlot: "",
    address: "",
    notes: ""
  })

  // Service pricing (in paise) - fallback for hardcoded services
  const servicePricing = {
    basic: 200000, // ₹2000
    comprehensive: 500000, // ₹5000
    ac: 150000, // ₹1500
    battery: 100000, // ₹1000
    brake: 300000, // ₹3000
    suspension: 400000, // ₹4000
    tyre: 120000, // ₹1200
    oil: 80000, // ₹800
    general: 250000, // ₹2500
  }
  
  const { toast } = useToast()

  // Fetch services from backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get<{services: Service[]}>('/cart/services');
        if (response.data && response.data.services) {
          setAllServices(response.data.services);
        } else if (response.data && Array.isArray(response.data)) {
          setAllServices(response.data as Service[]);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        // Set fallback services when backend fails
        const fallbackServices: Service[] = [
          { id: 'basic', name: 'Basic Service', price: 200000, priceInRupees: 2000, description: 'Basic maintenance service', category: 'Maintenance', icon: '🔧', isNew: false, duration: '2-3 hours' },
          { id: 'ac', name: 'AC Service', price: 150000, priceInRupees: 1500, description: 'AC maintenance service', category: 'Maintenance', icon: '❄️', isNew: false, duration: '2-3 hours' },
          { id: 'battery', name: 'Battery Service', price: 100000, priceInRupees: 1000, description: 'Battery maintenance service', category: 'Maintenance', icon: '🔋', isNew: false, duration: '1-2 hours' },
          { id: 'brake', name: 'Brake Service', price: 300000, priceInRupees: 3000, description: 'Brake maintenance service', category: 'Maintenance', icon: '🛑', isNew: false, duration: '2-4 hours' },
          { id: 'comprehensive', name: 'Comprehensive Service', price: 500000, priceInRupees: 5000, description: 'Comprehensive maintenance service', category: 'Maintenance', icon: '🔧', isNew: false, duration: '4-6 hours' },
          { id: 'suspension', name: 'Suspension Service', price: 400000, priceInRupees: 4000, description: 'Suspension maintenance service', category: 'Maintenance', icon: '🚗', isNew: false, duration: '3-5 hours' },
          { id: 'tyre', name: 'Tyre Care', price: 120000, priceInRupees: 1200, description: 'Tyre rotation, balancing, pressure check', category: 'Maintenance', icon: '🛞', isNew: false, duration: '1-2 hours' },
          { id: 'oil', name: 'Oil Change Service', price: 80000, priceInRupees: 800, description: 'Engine oil and filter replacement', category: 'Maintenance', icon: '🛢️', isNew: false, duration: '1 hour' },
          { id: 'general', name: 'General Service', price: 250000, priceInRupees: 2500, description: 'General vehicle maintenance', category: 'Maintenance', icon: '🔧', isNew: false, duration: '2-3 hours' }
        ];
        setAllServices(fallbackServices);
        toast({
          title: 'Warning',
          description: 'Using fallback services. Some features may be limited.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [toast]);

  // Prefill from auth and navigation state
  useEffect(() => {
    const service = location.state?.service;
    const vehicleInfo = location.state?.vehicleInfo;
    const formDataFromState = location.state?.formData;
    
    // Debug logging to see what data we're receiving
    console.log('Booking form - Navigation state:', location.state);
    console.log('Booking form - Service:', service);
    console.log('Booking form - VehicleInfo:', vehicleInfo);
    console.log('Booking form - FormData:', formDataFromState);
    
    setFormData(prev => {
      // Determine vehicle type from service category if not provided
      let vehicleType = formDataFromState?.vehicleType ? formDataFromState.vehicleType.toLowerCase() : prev.vehicleType;
      if (!vehicleType && service?.category) {
        // Map service category to vehicle type
        if (service.category === 'Two Wheeler') {
          vehicleType = 'bike'; // Default to bike for two wheeler services
        } else {
          vehicleType = 'car'; // Default to car for all other services
        }
      }
      
      // Try to set service type immediately if we have service data
      let serviceType = prev.serviceType;
      if (service?.name) {
        const serviceNameLower = service.name.toLowerCase();
        console.log('Immediate service matching for:', serviceNameLower);
        
        if (serviceNameLower.includes('basic')) {
          serviceType = 'basic';
        } else if (serviceNameLower.includes('ac') || serviceNameLower.includes('air conditioning')) {
          serviceType = 'ac';
        } else if (serviceNameLower.includes('battery')) {
          serviceType = 'battery';
        } else if (serviceNameLower.includes('brake')) {
          serviceType = 'brake';
        } else if (serviceNameLower.includes('comprehensive')) {
          serviceType = 'comprehensive';
        } else if (serviceNameLower.includes('suspension')) {
          serviceType = 'suspension';
        } else if (serviceNameLower.includes('tyre') || serviceNameLower.includes('tire')) {
          serviceType = 'tyre';
        } else if (serviceNameLower.includes('oil')) {
          serviceType = 'oil';
        } else if (serviceNameLower.includes('general')) {
          serviceType = 'general';
        }
        
        if (serviceType) {
          console.log('Immediate service type set to:', serviceType);
        }
      }
      
      return {
        ...prev,
        name: prev.name || user?.name || "",
        email: prev.email || user?.email || "",
        // Vehicle information from navigation state
        vehicleType: vehicleType || (vehicleInfo?.brand ? 'car' : prev.vehicleType),
        vehicleModel: formDataFromState?.model || (vehicleInfo ? `${vehicleInfo.brand} ${vehicleInfo.model}` : '') || prev.vehicleModel,
        serviceType: serviceType || prev.serviceType,
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Separate useEffect for service matching that runs when services are loaded
  useEffect(() => {
    const service = location.state?.service;
    if (service?.name && allServices.length > 0) {
      console.log('Looking for service:', service.name);
      console.log('Available services:', allServices.map(s => ({ id: s.id, name: s.name })));
      
      // Find matching service by name
      let matchingServiceId = null;
      const matchingService = allServices.find(s => 
        s.name.toLowerCase() === service.name.toLowerCase()
      );
      
      if (matchingService) {
        matchingServiceId = matchingService.id;
        console.log('Found matching service in backend:', matchingService);
      } else {
        // If no match found in backend services, try fallback service mapping
        const serviceNameLower = service.name.toLowerCase();
        console.log('Trying fallback mapping for:', serviceNameLower);
        if (serviceNameLower.includes('basic')) {
          matchingServiceId = 'basic';
        } else if (serviceNameLower.includes('ac') || serviceNameLower.includes('air conditioning')) {
          matchingServiceId = 'ac';
        } else if (serviceNameLower.includes('battery')) {
          matchingServiceId = 'battery';
        } else if (serviceNameLower.includes('brake')) {
          matchingServiceId = 'brake';
        } else if (serviceNameLower.includes('comprehensive')) {
          matchingServiceId = 'comprehensive';
        } else if (serviceNameLower.includes('suspension')) {
          matchingServiceId = 'suspension';
        } else if (serviceNameLower.includes('tyre') || serviceNameLower.includes('tire')) {
          matchingServiceId = 'tyre';
        } else if (serviceNameLower.includes('oil')) {
          matchingServiceId = 'oil';
        } else if (serviceNameLower.includes('general')) {
          matchingServiceId = 'general';
        }
        console.log('Fallback matching result:', matchingServiceId);
      }
      
      // Update service type if we found a match
      if (matchingServiceId) {
        console.log('Setting service type to:', matchingServiceId);
        setFormData(prev => ({
          ...prev,
          serviceType: matchingServiceId
        }));
      } else {
        console.log('No matching service found for:', service.name);
        console.log('Available service IDs:', allServices.map(s => s.id));
      }
    }
  }, [allServices, location.state?.service])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !formData.timeSlot) {
      toast({ title: "Missing details", description: "Please select a date and time slot.", variant: "destructive" })
      return
    }

    try {
      const service = location.state?.service;
      const selectedService = filteredServices.find(s => s.id === formData.serviceType);
      const amount = service?.price || selectedService?.price || servicePricing[formData.serviceType as keyof typeof servicePricing] || 0
      
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        vehicleType: formData.vehicleType,
        vehicleModel: formData.vehicleModel,
        serviceType: formData.serviceType,
        date: date.toISOString(),
        timeSlot: formData.timeSlot,
        address: formData.address,
        notes: formData.notes,
        amount: amount,
        createPaymentOrder: true, // Request payment order creation
        // Include service data if coming from Services page or from dropdown selection
        ...(service ? {
          serviceId: service.id,
          serviceName: service.name,
          serviceDescription: service.description,
          serviceCategory: service.category,
          serviceDuration: service.duration,
          serviceIcon: service.icon,
        } : selectedService ? {
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          serviceDescription: selectedService.description,
          serviceCategory: selectedService.category,
          serviceDuration: selectedService.duration,
          serviceIcon: selectedService.icon,
        } : {})
      }
      
      const response = await api.authPost<any>('/bookings', payload)
      
      if (response.paymentOrder) {
        // Show payment section
        setBookingData(response.booking)
        setShowPayment(true)
        toast({
          title: "Booking Created!",
          description: "Please complete payment to confirm your booking.",
        })
      } else {
        // No payment required or payment order creation failed
        toast({
          title: "Booking Confirmed!",
          description: `Reference: ${String(response.booking._id).slice(-8).toUpperCase()}`,
        })
        navigate('/dashboard')
      }
    } catch (err: any) {
      toast({ title: 'Booking failed', description: err?.message || 'Please try again', variant: 'destructive' })
    }
  }

  const handlePaymentSuccess = (_paymentData: any) => {
    toast({
      title: "Payment Successful!",
      description: "Your booking has been confirmed.",
    })
    navigate('/dashboard')
  }

  const handlePaymentFailure = (error: any) => {
    console.error('Payment failed:', error)
    // Keep the booking but mark payment as failed
    setShowPayment(false)
  }

  // Filter services based on selected vehicle type
  const filteredServices = useMemo(() => {
    if (!formData.vehicleType) return [];
    
    // Map vehicle types to service categories
    const vehicleTypeMapping: { [key: string]: string[] } = {
      'car': ['Four Wheeler', 'Maintenance', 'Electrical', 'Suspension', 'Wheels', 'Bodywork', 'Cleaning', 'Inspection', 'Mechanical', 'Administrative'],
      'bike': ['Two Wheeler'],
      'scooter': ['Two Wheeler']
    };
    
    const allowedCategories = vehicleTypeMapping[formData.vehicleType] || [];
    
    return allServices.filter(service => 
      allowedCategories.includes(service.category) || 
      service.id.startsWith(formData.vehicleType === 'car' ? '' : 'tw_')
    );
  }, [formData.vehicleType, allServices]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Reset service type when vehicle type changes
      if (field === 'vehicleType') {
        newData.serviceType = '';
      }
      
      return newData;
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Book Your Service</h1>
            <p className="text-xl text-muted-foreground">
              Schedule your vehicle maintenance with Wheelyfix Automotive
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Service Booking Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Vehicle Type</Label>
                    <Select value={formData.vehicleType} onValueChange={(value) => handleInputChange("vehicleType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="bike">Bike</SelectItem>
                        <SelectItem value="scooter">Scooter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="vehicleModel">Vehicle Model</Label>
                    <Input
                      id="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={(e) => handleInputChange("vehicleModel", e.target.value)}
                      placeholder="e.g., Honda City, Yamaha R15"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Service Type</Label>
                  <Select 
                    value={formData.serviceType} 
                    onValueChange={(value) => handleInputChange("serviceType", value)}
                    disabled={!formData.vehicleType || loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !formData.vehicleType 
                          ? "Select vehicle type first" 
                          : loading 
                            ? "Loading services..." 
                            : "Select service type"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredServices.length > 0 ? (
                        filteredServices.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - ₹{service.priceInRupees.toLocaleString('en-IN')}
                          </SelectItem>
                        ))
                      ) : (
                        formData.vehicleType && (
                          <SelectItem value="no-services" disabled>
                            No services available for {formData.vehicleType}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  {formData.serviceType && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {(() => {
                        const selectedService = filteredServices.find(s => s.id === formData.serviceType);
                        if (selectedService) {
                          return `Selected: ${selectedService.name} - ₹${selectedService.priceInRupees.toLocaleString('en-IN')} (${selectedService.duration})`;
                        }
                        // Fallback for hardcoded services
                        return `Selected: ${formData.serviceType.charAt(0).toUpperCase() + formData.serviceType.slice(1)} Service - ₹{(servicePricing[formData.serviceType as keyof typeof servicePricing] / 100).toFixed(0)}`;
                      })()}
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Preferred Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Time Slot</Label>
                    <Select value={formData.timeSlot} onValueChange={(value) => handleInputChange("timeSlot", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9-12">9:00 AM - 12:00 PM</SelectItem>
                        <SelectItem value="12-15">12:00 PM - 3:00 PM</SelectItem>
                        <SelectItem value="15-18">3:00 PM - 6:00 PM</SelectItem>
                        <SelectItem value="18-21">6:00 PM - 9:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Service Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Enter your address for pickup/drop service"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Any specific requirements or issues?"
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={showPayment}>
                  {showPayment ? 'Processing...' : 'Book Service'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Payment Section */}
          {showPayment && bookingData && (
            <div className="mt-8">
              <RazorpayPayment
                bookingId={bookingData._id}
                amount={bookingData.amount}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFailure={handlePaymentFailure}
              />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Booking