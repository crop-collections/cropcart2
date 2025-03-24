import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface SubscriptionButtonProps {
  tier: 'basic' | 'premium' | 'pro';
  price: number;
  buttonText?: string;
  description?: string;
}

export function SubscriptionButton({ 
  tier, 
  price, 
  buttonText = 'Subscribe',
  description
}: SubscriptionButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to subscribe",
        variant: "destructive"
      });
      return;
    }

    if (user.role !== 'farmer') {
      toast({
        title: "Unauthorized",
        description: "Only farmers can subscribe to this service",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest<{ success: boolean; checkoutUrl?: string; error?: string }>(
        '/api/payments/subscription',
        {
          method: 'POST',
          body: JSON.stringify({
            farmerId: user.id,
            email: user.email,
            tier,
            price,
            // Currency is automatically set to CAD on the server side
          })
        }
      );
      
      if (response.success && response.checkoutUrl) {
        // Redirect to Stripe checkout for subscription
        window.location.href = response.checkoutUrl;
      } else {
        toast({
          title: "Subscription Failed",
          description: response.error || "An error occurred during subscription",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during subscription",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSubscribe} 
      disabled={isLoading}
      className="w-full"
      variant="default"
    >
      {isLoading ? "Processing..." : buttonText}
    </Button>
  );
}