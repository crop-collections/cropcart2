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
import OrderCard from '@/components/orders/order-card';
import { Search, ShoppingBag, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { Order, OrderItem, Product } from '@shared/schema';

export default function DashboardOrders() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Protect this page for customers and farmers
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'delivery') {
      setLocation('/dashboard/deliveries');
    } else if (!isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, user, setLocation]);

  // Fetch orders
  const { 
    data: orders = [], 
    isLoading: ordersLoading, 
    error: ordersError 
  } = useQuery({
    queryKey: ['/api/orders'],
    enabled: !!isAuthenticated && !!user,
  });

  // Helper function to get order status tabs
  const getStatusTabs = () => {
    if (user?.role === 'customer') {
      return [
        { value: 'all', label: 'All Orders', icon: ShoppingBag },
        { value: 'pending', label: 'Pending', icon: Package },
        { value: 'in_delivery', label: 'In Delivery', icon: Truck },
        { value: 'completed', label: 'Completed', icon: CheckCircle },
        { value: 'cancelled', label: 'Cancelled', icon: XCircle },
      ];
    } else if (user?.role === 'farmer') {
      return [
        { value: 'all', label: 'All Orders', icon: ShoppingBag },
        { value: 'new', label: 'New', icon: Package },
        { value: 'processing', label: 'Processing', icon: Package },
        { value: 'completed', label: 'Completed', icon: CheckCircle },
      ];
    }
    
    return [
      { value: 'all', label: 'All Orders', icon: ShoppingBag },
    ];
  };

  // Filter orders based on tab and search
  const filteredOrders = orders
    .filter((order: Order) => {
      // Tab filter
      if (activeTab === 'all') return true;
      
      if (activeTab === 'pending') {
        return ['pending', 'confirmed'].includes(order.status);
      }
      
      if (activeTab === 'in_delivery') {
        return ['processing', 'out_for_delivery'].includes(order.status);
      }
      
      if (activeTab === 'completed') {
        return order.status === 'delivered';
      }
      
      if (activeTab === 'cancelled') {
        return order.status === 'cancelled';
      }
      
      if (activeTab === 'new') {
        return ['pending', 'confirmed'].includes(order.status);
      }
      
      if (activeTab === 'processing') {
        return ['processing', 'out_for_delivery'].includes(order.status);
      }
      
      return order.status === activeTab;
    })
    .filter((order: Order) => {
      // Search filter (by order ID)
      if (!searchTerm) return true;
      return order.id.toString().includes(searchTerm);
    })
    .sort((a: Order, b: Order) => {
      // Sort by newest first
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

  // Guard for customer and farmers only
  if (!isAuthenticated || (user && user.role === 'delivery')) {
    return null; // The useEffect hook will handle redirection
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">
        {user?.role === 'customer' ? 'My Orders' : 'Manage Orders'}
      </h1>
      <p className="text-muted-foreground mb-8">
        {user?.role === 'customer' 
          ? 'View and track your orders' 
          : 'Manage and process customer orders for your products'}
      </p>
      
      <Card>
        <CardHeader>
          <CardTitle>{user?.role === 'customer' ? 'My Orders' : 'Customer Orders'}</CardTitle>
          <CardDescription>
            {user?.role === 'customer' 
              ? 'Track the status of your orders and delivery progress' 
              : 'View and manage orders for your products'}
          </CardDescription>
          
          <div className="mt-4 flex flex-col sm:flex-row justify-between gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full sm:w-auto">
                {getStatusTabs().map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search by order #" 
                className="pl-9 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {ordersLoading ? (
            <div className="py-8 text-center animate-pulse">
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          ) : ordersError ? (
            <div className="py-8 text-center">
              <p className="text-destructive">Error loading orders. Please try again later.</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredOrders.map((order: Order) => (
                <OrderCard 
                  key={order.id} 
                  order={order}
                  items={[]} // In a real app, we would fetch or include order items
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'No orders found matching your search criteria' 
                  : activeTab !== 'all' 
                    ? `No ${activeTab} orders found` 
                    : 'No orders found'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
