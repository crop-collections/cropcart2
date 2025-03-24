import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, ShoppingCart, CreditCard, Check } from 'lucide-react';
import { CartItem, Product } from '@shared/schema';

// Checkout form schema
const checkoutSchema = z.object({
  deliveryAddress: z.string().min(5, 'Address must be at least 5 characters'),
  deliveryNotes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Redirect if not authenticated or not a customer
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/');
    } else if (user && user.role !== 'customer') {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, user, setLocation]);

  // Fetch cart items
  const { 
    data: cartItems = [], 
    isLoading: cartLoading, 
    error: cartError 
  } = useQuery({
    queryKey: ['/api/cart'],
    enabled: !!isAuthenticated && !!user && user.role === 'customer',
  });

  // Update cart item quantity mutation
  const updateCartItemMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      return apiRequest('PUT', `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update quantity',
        variant: 'destructive',
      });
    },
  });

  // Remove cart item mutation
  const removeCartItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/cart/${id}`, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: 'Item removed',
        description: 'Item has been removed from your cart',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove item',
        variant: 'destructive',
      });
    },
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormValues) => {
      return apiRequest('POST', '/api/orders', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setOrderSuccess(true);
      
      // Redirect to orders page after a delay
      setTimeout(() => {
        setLocation('/dashboard/orders');
      }, 3000);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to place order',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    },
  });

  // Form setup
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryAddress: user?.address || '',
      deliveryNotes: '',
    },
  });

  // Update form with user address when available
  useEffect(() => {
    if (user?.address) {
      form.setValue('deliveryAddress', user.address);
    }
  }, [user, form]);

  // Calculate cart totals
  const subtotal = cartItems.reduce((sum, item: CartItem & { product?: Product }) => {
    return sum + (Number(item.product?.price || 0) * item.quantity);
  }, 0);
  
  const deliveryFee = subtotal > 35 ? 0 : 5.99;
  const total = subtotal + deliveryFee;

  // Handle quantity change
  const handleQuantityChange = (id: number, currentQuantity: number, change: number) => {
    const newQuantity = Math.max(1, currentQuantity + change);
    updateCartItemMutation.mutate({ id, quantity: newQuantity });
  };

  // Handle remove item
  const handleRemoveItem = (id: number) => {
    removeCartItemMutation.mutate(id);
  };

  // Handle form submission
  const onSubmit = (data: CheckoutFormValues) => {
    if (cartItems.length === 0) {
      toast({
        title: 'Empty cart',
        description: 'Your cart is empty. Add some items before checkout.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    createOrderMutation.mutate(data);
  };

  // Guard for customers only
  if (!isAuthenticated || (user && user.role !== 'customer')) {
    return null; // The useEffect hook will handle redirection
  }

  // Show success state
  if (orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Order Successful!</h1>
            <p className="text-muted-foreground mb-6">
              Your order has been placed successfully. You will be redirected to your orders page shortly.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/dashboard/orders')}
            >
              View Your Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Checkout</h1>
      <p className="text-muted-foreground mb-8">Complete your order</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Your Cart
              </CardTitle>
              <CardDescription>
                {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {cartLoading ? (
                <div className="py-8 text-center animate-pulse">
                  <p className="text-muted-foreground">Loading your cart...</p>
                </div>
              ) : cartError ? (
                <div className="py-8 text-center">
                  <p className="text-destructive">Error loading your cart. Please try again later.</p>
                </div>
              ) : cartItems.length > 0 ? (
                <div className="space-y-4">
                  {cartItems.map((item: CartItem & { product?: Product }) => (
                    <div key={item.id} className="flex border-b pb-4 last:border-0 last:pb-0">
                      <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                        {item.product?.imageUrls && item.product.imageUrls.length > 0 ? (
                          <img 
                            src={item.product.imageUrls[0]} 
                            alt={item.product?.name} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center">
                            <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4 flex-grow">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{item.product?.name}</h3>
                          <p className="font-medium">${Number(item.product?.price || 0).toFixed(2)}</p>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {item.product?.unit}
                        </p>
                        
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                              disabled={item.quantity <= 1 || updateCartItemMutation.isPending}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="mx-3 font-medium text-sm">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                              disabled={updateCartItemMutation.isPending}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={removeCartItemMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">Your cart is empty.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setLocation('/browse')}
                  >
                    Continue Shopping
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Order Summary and Checkout Form */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `$${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                
                {subtotal < 35 && subtotal > 0 && (
                  <div className="text-xs text-muted-foreground mt-2">
                    Add ${(35 - subtotal).toFixed(2)} more to qualify for free delivery
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
              <CardDescription>Enter your delivery details</CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="deliveryAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Address</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter your full address"
                            className="resize-none min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="deliveryNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any special instructions for delivery"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          E.g., "Leave at the door", "Call upon arrival"
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting || cartItems.length === 0}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Processing...' : 'Place Order'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
