import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronDown, 
  ChevronUp, 
  Package, 
  Truck, 
  Clock, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';
import { Order, OrderItem, Product } from '@shared/schema';

interface OrderCardProps {
  order: Order;
  items?: (OrderItem & { product?: Product })[];
}

export default function OrderCard({ order, items = [] }: OrderCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      return apiRequest('PATCH', `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: 'Order updated',
        description: 'The order status has been updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update order',
        variant: 'destructive',
      });
    },
  });

  // Assign delivery person mutation (for delivery users)
  const assignDeliveryMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return apiRequest('PATCH', `/api/orders/${orderId}/delivery`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/deliveries'] });
      toast({
        title: 'Delivery assigned',
        description: 'You have been assigned to this delivery',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to assign delivery',
        variant: 'destructive',
      });
    },
  });

  // Handle order status change
  const handleStatusChange = (status: string) => {
    updateOrderStatusMutation.mutate({ orderId: order.id, status });
  };

  // Handle delivery assignment
  const handleAssignDelivery = () => {
    assignDeliveryMutation.mutate(order.id);
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Confirmed</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Processing</Badge>;
      case 'out_for_delivery':
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800">Out for Delivery</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'confirmed':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-purple-500" />;
      case 'out_for_delivery':
        return <Truck className="h-5 w-5 text-indigo-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <CardTitle className="text-lg">Order #{order.id}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {order.createdAt && formatDate(order.createdAt.toString())}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(order.status)}
            {getStatusBadge(order.status)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex justify-between items-center mb-2">
          <div>
            <p className="font-medium">Total Amount</p>
            <p className="text-lg font-bold">${Number(order.totalAmount).toFixed(2)}</p>
          </div>
          
          <div className="text-right">
            <p className="font-medium">Delivery Address</p>
            <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
          </div>
        </div>
        
        {order.deliveryNotes && (
          <div className="mt-2 p-2 bg-muted rounded-md">
            <p className="text-sm font-medium">Delivery Notes:</p>
            <p className="text-sm">{order.deliveryNotes}</p>
          </div>
        )}
        
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full justify-between p-0 h-8">
              <span className="font-medium">Order Items</span>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-2">
            {items.length > 0 ? (
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                    <div className="flex items-center gap-2">
                      {item.product?.imageUrls && item.product.imageUrls.length > 0 && (
                        <div className="h-10 w-10 rounded overflow-hidden">
                          <img 
                            src={item.product.imageUrls[0]} 
                            alt={item.product.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{item.product?.name || `Product #${item.productId}`}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} x ${Number(item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No items to display</p>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="pt-4">
        {/* Status update buttons based on user role */}
        {user?.role === 'customer' && order.status !== 'cancelled' && order.status !== 'delivered' && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => handleStatusChange('cancelled')}
            disabled={updateOrderStatusMutation.isPending}
          >
            Cancel Order
          </Button>
        )}
        
        {user?.role === 'delivery' && (
          <div className="flex gap-2 w-full">
            {!order.deliveryPersonId && order.status === 'confirmed' && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleAssignDelivery}
                disabled={assignDeliveryMutation.isPending}
                className="flex-1"
              >
                Take Delivery
              </Button>
            )}
            
            {order.deliveryPersonId === user.id && (
              <>
                {order.status === 'confirmed' && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => handleStatusChange('processing')}
                    disabled={updateOrderStatusMutation.isPending}
                    className="flex-1"
                  >
                    Start Processing
                  </Button>
                )}
                
                {order.status === 'processing' && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => handleStatusChange('out_for_delivery')}
                    disabled={updateOrderStatusMutation.isPending}
                    className="flex-1"
                  >
                    Out for Delivery
                  </Button>
                )}
                
                {order.status === 'out_for_delivery' && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => handleStatusChange('delivered')}
                    disabled={updateOrderStatusMutation.isPending}
                    className="flex-1"
                  >
                    Mark as Delivered
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
