import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, CheckCircle, Loader2, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

// Types
interface Service {
  serviceName: string;
  price: number;
  description: string;
  estimatedTime: number;
  category: string;
}

interface VehicleInfo {
  brand: string;
  model: string;
  fuel: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  vehicleInfo: VehicleInfo;
  vehicleType: string;
}

interface BookingFormData {
  name: string;
  mobile: string;
  address: string;
  date: Date | undefined;
  timeSlot: string;
  notes: string;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  service,
  vehicleInfo,
  vehicleType
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    mobile: '',
    address: '',
    date: undefined,
    timeSlot: '',
    notes: ''
  });

  const handleInputChange = (field: keyof BookingFormData, value: string | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter your full name',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.mobile.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter your mobile number',
        variant: 'destructive',
      });
      return false;
    }

    // Mobile number validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(formData.mobile)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid 10-digit mobile number',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.address.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter your pickup address',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.date) {
      toast({
        title: 'Validation Error',
        description: 'Please select a preferred date',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.timeSlot) {
      toast({
        title: 'Validation Error',
        description: 'Please select a time slot',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare booking data
      const bookingPayload = {
        name: formData.name,
        phone: formData.mobile,
        email: '', // Optional field
        vehicleType: vehicleType.toLowerCase(),
        vehicleModel: `${vehicleInfo.brand} ${vehicleInfo.model}`,
        serviceType: service.serviceName,
        date: formData.date!.toISOString(),
        timeSlot: formData.timeSlot,
        address: formData.address,
        notes: formData.notes,
        amount: service.price * 100, // Convert to paise for consistency
        // Service details
        serviceId: `${vehicleInfo.brand.toLowerCase()}-${vehicleInfo.model.toLowerCase()}-${service.serviceName.toLowerCase().replace(/\s+/g, '-')}`,
        serviceName: service.serviceName,
        serviceDescription: service.description,
        serviceCategory: vehicleType === 'Car' ? 'Four Wheeler' : 'Two Wheeler',
        serviceDuration: `${service.estimatedTime} hour${service.estimatedTime !== 1 ? 's' : ''}`,
        serviceIcon: vehicleType === 'Car' ? '🚗' : '🏍️',
        // Vehicle details
        vehicleBrand: vehicleInfo.brand,
        vehicleFuel: vehicleInfo.fuel,
        createPaymentOrder: false // Don't create payment order for now
      };

      // Submit booking
      const response = await api.authPost<any>('/bookings', bookingPayload);
      
      if (response) {
        setBookingSuccess(true);
        toast({
          title: 'Booking Successful!',
          description: 'Our team will contact you soon to confirm your booking.',
        });
        
        // Reset form after successful booking
        setFormData({
          name: '',
          mobile: '',
          address: '',
          date: undefined,
          timeSlot: '',
          notes: ''
        });
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking Failed',
        description: error?.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setBookingSuccess(false);
    setFormData({
      name: '',
      mobile: '',
      address: '',
      date: undefined,
      timeSlot: '',
      notes: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
            Book Service
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute right-0 top-0 h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {bookingSuccess ? (
          // Success State
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Booking Successful!
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Thank you for choosing our service. Our team will contact you soon to confirm your booking and schedule.
            </p>
            <Button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700">
              Close
            </Button>
          </div>
        ) : (
          // Booking Form
          <div className="space-y-6">
            {/* Service Summary */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Service</p>
                  <p className="font-medium text-gray-900">{service.serviceName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vehicle</p>
                  <p className="font-medium text-gray-900">
                    {vehicleInfo.brand} {vehicleInfo.model} ({vehicleInfo.fuel})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-medium text-gray-900">₹{service.price.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium text-gray-900">2-4 hours</p>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-base font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mobile" className="text-base font-medium">
                    Mobile Number *
                  </Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="mt-2"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address" className="text-base font-medium">
                  Pickup Address *
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter your complete address for vehicle pickup"
                  className="mt-2 min-h-[100px]"
                  required
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-base font-medium">Preferred Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-2",
                          !formData.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => handleInputChange('date', date)}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label className="text-base font-medium">Time Slot *</Label>
                  <Select value={formData.timeSlot} onValueChange={(value) => handleInputChange('timeSlot', value)}>
                    <SelectTrigger className="mt-2">
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

              {/* Additional Notes */}
              <div>
                <Label htmlFor="notes" className="text-base font-medium">
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any specific requirements or additional information?"
                  className="mt-2 min-h-[80px]"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Booking Service...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
