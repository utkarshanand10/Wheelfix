import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

// Declare Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayPaymentProps {
  bookingId: string;
  amount: number; // in paise
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentFailure: (error: any) => void;
  disabled?: boolean;
}

const RazorpayPayment = ({ 
  bookingId, 
  amount, 
  onPaymentSuccess, 
  onPaymentFailure, 
  disabled = false 
}: RazorpayPaymentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const { toast } = useToast();

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpay().then((loaded) => {
      setRazorpayLoaded(!!loaded);
    });
  }, []);

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      toast({
        title: 'Payment Error',
        description: 'Razorpay is not loaded. Please refresh the page.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create payment order
      const response = await api.authPost('/payments/create-order', {
        amount: amount,
        currency: 'INR',
        receipt: `booking_${bookingId}`,
      });

      const { orderId, keyId } = response;

      // Configure Razorpay options
      const options = {
        key: keyId,
        amount: amount,
        currency: 'INR',
        name: 'Wheelyfix Automotive',
        description: 'Vehicle Service Payment',
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            const verifyResponse = await api.authPost('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResponse.success) {
              // Update booking payment status
              await api.authPut(`/bookings/${bookingId}/payment`, {
                paymentId: response.razorpay_payment_id,
                paymentStatus: 'paid',
                razorpayOrderId: response.razorpay_order_id,
              });

              onPaymentSuccess(response);
              toast({
                title: 'Payment Successful!',
                description: 'Your payment has been processed successfully.',
              });
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            onPaymentFailure(error);
            toast({
              title: 'Payment Verification Failed',
              description: 'There was an issue verifying your payment. Please contact support.',
              variant: 'destructive',
            });
          }
        },
        prefill: {
          name: 'Customer',
          email: 'customer@example.com',
        },
        theme: {
          color: '#3b82f6',
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          },
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      onPaymentFailure(error);
      toast({
        title: 'Payment Failed',
        description: error?.message || 'Failed to process payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amountInPaise: number) => {
    return `₹${(amountInPaise / 100).toFixed(2)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium">Total Amount:</span>
          <span className="text-2xl font-bold text-primary">
            {formatAmount(amount)}
          </span>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Secure payment powered by Razorpay
        </div>

        <Button
          onClick={handlePayment}
          disabled={disabled || isLoading || !razorpayLoaded}
          className="w-full"
          size="lg"
        >
          {isLoading ? 'Processing...' : `Pay ${formatAmount(amount)}`}
        </Button>

        {!razorpayLoaded && (
          <div className="text-sm text-amber-600">
            Loading payment gateway...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RazorpayPayment;
