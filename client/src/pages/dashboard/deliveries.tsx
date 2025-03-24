import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import DeliveryCard from '@/components/delivery/delivery-card';
import DeliveryMap from '@/components/delivery/delivery-map';
import { Search, Package, Truck, CheckCircle, XCircle, MapPin } from 'lucide-react';
import { Delivery, Order } from '@shared/schema';

export default function DashboardDeliveries() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Protect this page for delivery personnel only
  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'delivery') {
      setLocation('/dashboard');
    } else if (!isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, user, setLocation]);

  // Fetch deliveries
  const { 
    data: deliveries = [], 
    isLoading: deliveriesLoading, 
    error: deliveriesError 
  } = useQuery({
    queryKey: ['/api/deliveries'],
    enabled: !!isAuthenticated && !!user && user.role === 'delivery',
  });

  // Fetch available orders that need delivery personnel
  const { 
    data: availableOrders = [], 
    isLoading: ordersLoading, 
    error: ordersError 
  } = useQuery({
    queryKey: ['/api/orders'],
    enabled: !!isAuthenticated && !!user && user.role === 'delivery',
  });

  // Filter deliveries based on tab and search
  const filteredDeliveries = deliveries
    .filter((delivery: Delivery) => {
      // Tab filter
      if (activeTab === 'all') return true;
      
      if (activeTab === 'processing') {
        return ['confirmed', 'processing'].includes(delivery.status);
      }
      
      if (activeTab === 'out_for_delivery') {
        return delivery.status === 'out_for_delivery';
      }
      
      if (activeTab === 'completed') {
        return delivery.status === 'delivered';
      }
      
      if (activeTab === 'cancelled') {
        return delivery.status === 'cancelled';
      }
      
      return delivery.status === activeTab;
    })
    .filter((delivery: Delivery) => {
      // Search filter (by delivery or order ID)
      if (!searchTerm) return true;
      return delivery.id.toString().includes(searchTerm) || 
             delivery.orderId.toString().includes(searchTerm);
    })
    .sort((a: Delivery, b: Delivery) => {
      // Sort by scheduled time
      if (a.scheduledTime && b.scheduledTime) {
        return new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime();
      }
      return b.id - a.id;
    });

  // Filter available orders (orders without a delivery person assigned)
  const filteredAvailableOrders = availableOrders
    .filter((order: Order) => {
      return order.status === 'confirmed' && !order.deliveryPersonId;
    })
    .sort((a: Order, b: Order) => {
      // Sort by newest first
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

  // Open map for a delivery
  const handleViewRoute = (delivery: Delivery, order: Order) => {
    setSelectedDelivery(delivery);
    setSelectedOrder(order);
    setIsMapOpen(true);
  };

  // Guard for delivery personnel only
  if (!isAuthenticated || (user && user.role !== 'delivery')) {
    return null; // The useEffect hook will handle redirection
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Delivery Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Manage your deliveries and track your routes
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Package className="h-5 w-5 mr-2 text-primary" />
              Total Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{deliveries.length}</p>
            <p className="text-muted-foreground text-sm">Assigned to you</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Truck className="h-5 w-5 mr-2 text-accent" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {deliveries.filter(d => ['confirmed', 'processing', 'out_for_delivery'].includes(d.status)).length}
            </p>
            <p className="text-muted-foreground text-sm">Active deliveries</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <CheckCircle className="h-5 w-5 mr-2 text-secondary" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {deliveries.filter(d => d.status === 'delivered').length}
            </p>
            <p className="text-muted-foreground text-sm">Successfully delivered</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>My Deliveries</CardTitle>
              <CardDescription>
                Track and manage your assigned deliveries
              </CardDescription>
              
              <div className="mt-4 flex flex-col sm:flex-row justify-between gap-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                  <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full sm:w-auto">
                    <TabsTrigger value="all" className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span className="hidden sm:inline">All</span>
                    </TabsTrigger>
                    <TabsTrigger value="processing" className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span className="hidden sm:inline">Processing</span>
                    </TabsTrigger>
                    <TabsTrigger value="out_for_delivery" className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      <span className="hidden sm:inline">Out for Delivery</span>
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Completed</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Search deliveries..." 
                    className="pl-9 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {deliveriesLoading ? (
                <div className="py-8 text-center animate-pulse">
                  <p className="text-muted-foreground">Loading deliveries...</p>
                </div>
              ) : deliveriesError ? (
                <div className="py-8 text-center">
                  <p className="text-destructive">Error loading deliveries. Please try again later.</p>
                </div>
              ) : filteredDeliveries.length > 0 ? (
                <div className="space-y-4">
                  {filteredDeliveries.map((delivery: Delivery) => {
                    // Find associated order
                    const order = availableOrders.find((o: Order) => o.id === delivery.orderId);
                    
                    return (
                      <DeliveryCard 
                        key={delivery.id} 
                        delivery={delivery}
                        order={order}
                        onViewRoute={() => handleViewRoute(delivery, order as Order)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">
                    {searchTerm 
                      ? 'No deliveries found matching your search criteria' 
                      : activeTab !== 'all' 
                        ? `No ${activeTab} deliveries found` 
                        : 'No deliveries assigned to you yet'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Available Orders</CardTitle>
              <CardDescription>
                Orders that need a delivery person
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {ordersLoading ? (
                <div className="py-4 text-center animate-pulse">
                  <p className="text-muted-foreground">Loading available orders...</p>
                </div>
              ) : ordersError ? (
                <div className="py-4 text-center">
                  <p className="text-destructive">Error loading orders. Please try again later.</p>
                </div>
              ) : filteredAvailableOrders.length > 0 ? (
                <div className="space-y-3">
                  {filteredAvailableOrders.map((order: Order) => (
                    <div key={order.id} className="border rounded-md p-3 hover:bg-muted/40 transition cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">Order #{order.id}</h3>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                          Confirmed
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2 text-sm mt-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <p className="text-muted-foreground line-clamp-2">{order.deliveryAddress}</p>
                      </div>
                      
                      <div className="mt-3 flex justify-between items-center">
                        <div className="text-sm font-medium">${Number(order.totalAmount).toFixed(2)}</div>
                        <Button size="sm" variant="outline">Take Delivery</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-muted-foreground">No orders available for delivery at the moment.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Delivery Route Map Dialog */}
      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Delivery Route</DialogTitle>
            <DialogDescription>
              Route for Delivery #{selectedDelivery?.id} - Order #{selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          
          <DeliveryMap delivery={selectedDelivery as Delivery} order={selectedOrder as Order} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
