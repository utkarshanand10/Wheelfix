import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Clock, 
  CreditCard, 
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

interface CartItem {
  _id: string;
  serviceId: string;
  serviceName: string;
  serviceType: string;
  price: number;
  quantity: number;
  description: string;
  duration: string;
  addedAt: string;
}

interface CartSummary {
  totalItems: number;
  subtotal: number;
  subtotalInRupees: number;
}

// Declare Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary>({ totalItems: 0, subtotal: 0, subtotalInRupees: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

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

  // Fetch cart data
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchCart = async () => {
    try {
      const response = await api.authGet<{success: boolean, bookings: any[]}>('/bookings/cart');
      if (response && response.bookings) {
        // Convert bookings to cart items format
        const cartItems = response.bookings.map(booking => ({
          _id: booking._id,
          serviceId: booking.serviceId,
          serviceName: booking.serviceName,
          serviceType: booking.serviceCategory || 'Service',
          price: booking.amount,
          quantity: 1,
          description: booking.serviceDescription || '',
          duration: booking.serviceDuration || '1-2 hours',
          addedAt: booking.createdAt
        }));
        
        setCartItems(cartItems);
        
        // Calculate summary
        const totalItems = cartItems.length;
        const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        setCartSummary({
          totalItems,
          subtotal,
          subtotalInRupees: subtotal / 100
        });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to load cart. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdating(itemId);
    try {
      // For booking system, we'll just update local state since quantity is always 1
      setCartItems(prev => 
        prev.map(item => 
          item._id === itemId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

      // Recalculate summary
      const updatedItems = cartItems.map(item => 
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      );
      const newSubtotal = updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      setCartSummary(prev => ({
        ...prev,
        subtotal: newSubtotal,
        subtotalInRupees: newSubtotal / 100
      }));

      toast({
        title: 'Updated',
        description: 'Quantity updated successfully.',
      });
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update quantity.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setRemoving(itemId);
    try {
      // Delete the booking from the backend
      await api.authDelete(`/bookings/${itemId}`);
      
      setCartItems(prev => prev.filter(item => item._id !== itemId));
      
      // Recalculate summary
      const updatedItems = cartItems.filter(item => item._id !== itemId);
      const newSubtotal = updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      const newTotalItems = updatedItems.reduce((total, item) => total + item.quantity, 0);
      
      setCartSummary({
        totalItems: newTotalItems,
        subtotal: newSubtotal,
        subtotalInRupees: newSubtotal / 100
      });

      toast({
        title: 'Removed',
        description: 'Service removed from bookings.',
      });
    } catch (error: any) {
      console.error('Error removing item:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to remove service.',
        variant: 'destructive',
      });
    } finally {
      setRemoving(null);
    }
  };

  const clearCart = async () => {
    try {
      // Clear all pending bookings
      const response = await api.authGet<{success: boolean, bookings: any[]}>('/bookings/cart');
      if (response && response.bookings) {
        for (const booking of response.bookings) {
          await api.authDelete(`/bookings/${booking._id}`);
        }
      }
      
      setCartItems([]);
      setCartSummary({ totalItems: 0, subtotal: 0, subtotalInRupees: 0 });
      toast({
        title: 'Bookings Cleared',
        description: 'All pending services have been removed.',
      });
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to clear bookings.',
        variant: 'destructive',
      });
    }
  };

  const handlePayment = async () => {
    // Check if Razorpay is properly configured
    if (!razorpayLoaded || !window.Razorpay) {
      toast({
        title: 'Payment Error',
        description: 'Payment gateway is not loaded. Please refresh the page.',
        variant: 'destructive',
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Please add items to cart before proceeding to payment.',
        variant: 'destructive',
      });
      return;
    }

    setProcessingPayment(true);

    try {
      // Create payment order
      const response = await api.authPost('/payments/create-cart-order');
      const { orderId, keyId, amount } = response;

      // Check if Razorpay keys are configured
      if (!keyId || keyId.includes('your_key_id_here')) {
        toast({
          title: 'Payment Configuration Error',
          description: 'Payment gateway is not configured. Please contact support.',
          variant: 'destructive',
        });
        return;
      }

      // Configure Razorpay options
      const options = {
        key: keyId,
        amount: amount,
        currency: 'INR',
        name: 'Wheelyfix Automotive',
        description: `Payment for ${cartSummary.totalItems} service(s)`,
        order_id: orderId,
        handler: async (paymentResponse: any) => {
          try {
            // Verify payment
            const verifyResponse = await api.authPost('/payments/verify-cart-payment', {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });

            if (verifyResponse.success) {
              // Clear cart and show success
              setCartItems([]);
              setCartSummary({ totalItems: 0, subtotal: 0, subtotalInRupees: 0 });
              
              toast({
                title: 'Payment Successful!',
                description: `Payment of ₹${(amount / 100).toFixed(2)} completed successfully.`,
              });

              // Redirect to dashboard or success page
              navigate('/dashboard');
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: 'Payment Verification Failed',
              description: 'There was an issue verifying your payment. Please contact support.',
              variant: 'destructive',
            });
          }
        },
        prefill: {
          name: user?.name || 'Customer',
          email: user?.email || 'customer@example.com',
        },
        theme: {
          color: '#3b82f6',
        },
        modal: {
          ondismiss: () => {
            setProcessingPayment(false);
          },
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: error?.message || 'Failed to process payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatPrice = (priceInPaise: number) => {
    return `₹${(priceInPaise / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading cart...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <ShoppingCart className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-foreground mb-4">Your Cart is Empty</h1>
              <p className="text-muted-foreground mb-8">
                Add some services to get started with your vehicle maintenance.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/services')} size="lg">
                Browse Services
              </Button>
              <Button variant="outline" onClick={() => navigate('/booking')} size="lg">
                Book Direct Service
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/services')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Services
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
                <p className="text-muted-foreground">
                  {cartSummary.totalItems} item(s) in your cart
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={clearCart} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item._id} className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {item.serviceName}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{item.duration}</span>
                          </div>
                          <Badge variant="secondary">{item.serviceType}</Badge>
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-primary mb-4">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mb-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            disabled={updating === item._id || item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            disabled={updating === item._id}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeItem(item._id)}
                          disabled={removing === item._id}
                        >
                          {removing === item._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Items ({cartSummary.totalItems})</span>
                      <span>{formatPrice(cartSummary.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Service Fee</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(cartSummary.subtotal)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handlePayment}
                      disabled={processingPayment || !razorpayLoaded}
                      className="w-full"
                      size="lg"
                    >
                      {processingPayment ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Proceed to Payment
                        </>
                      )}
                    </Button>

                    {!razorpayLoaded && (
                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>Loading payment gateway...</span>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Secure payment by Razorpay</span>
                      </div>
                      <p>Your payment information is secure and encrypted</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;