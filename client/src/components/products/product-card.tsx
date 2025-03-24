import { useState } from 'react';
import { Link } from 'wouter';
import { 
  Card, 
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StarIcon, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@shared/schema';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/cart', {
        productId: product.id,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: 'Added to cart',
        description: `${product.name} has been added to your cart.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add to cart',
        variant: 'destructive',
      });
    },
  });

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: 'Login required',
        description: 'Please login to add items to your cart',
        variant: 'default',
      });
      return;
    }

    if (user?.role !== 'customer') {
      toast({
        title: 'Customer accounts only',
        description: 'Only customers can add items to cart',
        variant: 'default',
      });
      return;
    }

    setIsAddingToCart(true);
    await addToCartMutation.mutateAsync();
    setIsAddingToCart(false);
  };

  // Get first image or placeholder
  const productImage = product.imageUrls && product.imageUrls.length > 0
    ? product.imageUrls[0]
    : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80';

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="overflow-hidden h-full transition-shadow hover:shadow-md">
        <div className="relative h-48">
          <img 
            src={productImage} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          {product.organic && (
            <Badge className="absolute top-2 left-2 bg-secondary text-white">
              ORGANIC
            </Badge>
          )}
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <span>Green Farms</span>
            <span className="mx-2 text-muted-foreground/30">|</span>
            <div className="flex items-center">
              <StarIcon className="h-3 w-3 text-yellow-400 mr-1" />
              <span>4.8</span>
            </div>
          </div>
          
          <h3 className="font-medium text-lg mb-1">{product.name}</h3>
          
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex justify-between items-center">
            <div>
              <span className="font-bold text-lg">${product.price}</span>
              <span className="text-sm text-muted-foreground">/{product.unit}</span>
            </div>
            
            <Button 
              size="icon" 
              className="h-8 w-8 rounded-full bg-primary"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
