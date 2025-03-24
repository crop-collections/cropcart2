import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Star,
  Plus,
  Minus,
  Truck,
  ShoppingCart,
  ArrowLeft,
  Leaf
} from 'lucide-react';
import ProductCard from '@/components/products/product-card';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  // Fetch product details
  const { 
    data: product, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: [`/api/products/${id}`],
  });

  // Fetch related products (same category)
  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['/api/products', product?.categoryId],
    enabled: !!product?.categoryId,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/cart', {
        productId: parseInt(id),
        quantity: quantity,
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

  // Handle quantity change
  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  
  // Handle add to cart
  const handleAddToCart = async () => {
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

    await addToCartMutation.mutateAsync();
  };

  // Filter out the current product from related products
  const filteredRelatedProducts = relatedProducts
    .filter(relatedProduct => relatedProduct.id !== parseInt(id))
    .slice(0, 4);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 animate-pulse">
            <div className="h-96 bg-neutral-200 rounded-lg"></div>
          </div>
          <div className="w-full md:w-1/2 space-y-4 animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-3/4"></div>
            <div className="h-6 bg-neutral-200 rounded w-1/2"></div>
            <div className="h-4 bg-neutral-200 rounded w-full"></div>
            <div className="h-4 bg-neutral-200 rounded w-full"></div>
            <div className="h-10 bg-neutral-200 rounded w-32 mt-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The product you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/browse">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Browse
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/browse">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Browse
          </Button>
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product images */}
        <div className="w-full md:w-1/2">
          {product.imageUrls && product.imageUrls.length > 0 ? (
            <Carousel className="w-full">
              <CarouselContent>
                {product.imageUrls.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="h-72 md:h-96 rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`${product.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          ) : (
            <div className="h-72 md:h-96 bg-neutral-200 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">No image available</p>
            </div>
          )}
        </div>
        
        {/* Product details */}
        <div className="w-full md:w-1/2">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {product.organic && (
              <Badge variant="secondary" className="bg-secondary/20 text-secondary">
                <Leaf className="h-3 w-3 mr-1" />
                Organic
              </Badge>
            )}
            <div className="flex items-center text-sm text-muted-foreground">
              <span>Farmer ID: {product.farmerId}</span>
              <span className="mx-2">•</span>
              <div className="flex items-center">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                <span>4.8</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          
          <div className="text-2xl font-bold text-primary mb-4">
            ${Number(product.price).toFixed(2)}
            <span className="text-sm text-muted-foreground ml-1">/ {product.unit}</span>
          </div>
          
          <p className="text-muted-foreground mb-6">{product.description}</p>
          
          <div className="p-4 bg-muted rounded-lg mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="h-5 w-5 text-primary" />
              <span className="font-medium">Delivery Information</span>
            </div>
            <p className="text-sm text-muted-foreground pl-7">
              Delivered within 24-48 hours of ordering.
              Free delivery on orders over $35.
            </p>
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="mx-4 font-medium w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              className="flex-1"
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>
              In Stock: {product.stock} {product.unit}s available
            </p>
          </div>
        </div>
      </div>
      
      {/* Related products section */}
      {filteredRelatedProducts.length > 0 && (
        <div className="mt-12">
          <Separator className="mb-8" />
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredRelatedProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
