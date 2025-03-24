import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  Truck, 
  Clock, 
  CheckCircle, 
  MapPin,
  User,
  Calendar,
  Phone
} from 'lucide-react';
import { Delivery, Order } from '@shared/schema';

interface DeliveryCardProps {
  delivery: Delivery;
  order?: Order;
  onViewRoute?: () => void;
}

export default function DeliveryCard({ delivery, order, onViewRoute }: DeliveryCardProps) {
  const { toast } = useToast();
  
  // Format date
  const formatDate = (dateString?: string | Date | null) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Update delivery status mutation
  const updateDeliveryStatusMutation = useMutation({
    mutationFn: async ({ deliveryId, status }: { deliveryId: number; status: string }) => {
      return apiRequest('PATCH', `/api/deliveries/${deliveryId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deliveries'] });
      toast({
        title: 'Delivery updated',
        description: 'The delivery status has been updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update delivery status',
        variant: 'destructive',
      });
    },
  });

  // Handle status change
  const handleStatusChange = (status: string) => {
    updateDeliveryStatusMutation.mutate({ deliveryId: delivery.id, status });
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
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
      case 'confirmed':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-purple-500" />;
      case 'out_for_delivery':
        return <Truck className="h-5 w-5 text-indigo-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <CardTitle className="text-lg">Delivery #{delivery.id}</CardTitle>
            <p className="text-sm text-muted-foreground">Order #{delivery.orderId}</p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(delivery.status)}
            {getStatusBadge(delivery.status)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        {order && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Scheduled:</span>
                  <span>{delivery.scheduledTime ? formatDate(delivery.scheduledTime) : 'Not scheduled'}</span>
                </div>
                
                {delivery.startTime && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Started:</span>
                    <span>{formatDate(delivery.startTime)}</span>
                  </div>
                )}
                
                {delivery.completedTime && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Completed:</span>
                    <span>{formatDate(delivery.completedTime)}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Delivery to:</span>
                </div>
                <p className="text-sm pl-6">{order.deliveryAddress}</p>
                
                {order.deliveryNotes && (
                  <p className="text-xs text-muted-foreground pl-6 italic">
                    Note: {order.deliveryNotes}
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-muted/50 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Customer Details</span>
              </div>
              <div className="pl-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Customer ID:</span>
                  <span className="text-sm font-medium">#{order.customerId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Order Total:</span>
                  <span className="text-sm font-medium">${Number(order.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      <Separator />
      
      <CardFooter className="pt-4">
        <div className="flex gap-2 w-full">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={onViewRoute}
          >
            <MapPin className="h-4 w-4 mr-2" />
            View Route
          </Button>
          
          {delivery.status === 'confirmed' && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => handleStatusChange('processing')}
              disabled={updateDeliveryStatusMutation.isPending}
              className="flex-1"
            >
              <Package className="h-4 w-4 mr-2" />
              Start Processing
            </Button>
          )}
          
          {delivery.status === 'processing' && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => handleStatusChange('out_for_delivery')}
              disabled={updateDeliveryStatusMutation.isPending}
              className="flex-1"
            >
              <Truck className="h-4 w-4 mr-2" />
              Out for Delivery
            </Button>
          )}
          
          {delivery.status === 'out_for_delivery' && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => handleStatusChange('delivered')}
              disabled={updateDeliveryStatusMutation.isPending}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Delivered
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
