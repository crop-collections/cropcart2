import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CheckoutButtonProps {
  orderId: number;
  amount: number;
  email: string;
  name: string;
  description?: string;
  tipAmount?: number;
}

export function CheckoutButton({ 
  orderId, 
  amount, 
  email, 
  name, 
  description,
  tipAmount
}: CheckoutButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to complete your purchase",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest<{ success: boolean; checkoutUrl?: string; error?: string }>(
        '/api/payments/checkout',
        {
          method: 'POST',
          body: JSON.stringify({
            orderId,
            customerId: user.id,
            amount,
            tipAmount,
            email,
            name,
            currency: 'cad', // Ensure this is set to 'cad'
            description: description || `Payment for order #${orderId}`
          })
        }
      );
      
      if (response.success && response.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = response.checkoutUrl;
      } else {
        toast({
          title: "Checkout Failed",
          description: response.error || "An error occurred during checkout",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during checkout",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCheckout} 
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? "Processing..." : "Proceed to Checkout"}
    </Button>
  );
}