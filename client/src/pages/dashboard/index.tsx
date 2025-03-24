import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingBag, 
  Truck, 
  Box, 
  Tractor, 
  User,
  BarChart3,
  Calendar
} from 'lucide-react';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Redirect based on user role
  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'farmer':
          setLocation('/dashboard/products');
          break;
        case 'delivery':
          setLocation('/dashboard/deliveries');
          break;
        // For customers, stay on the dashboard page
      }
    } else if (!isAuthenticated) {
      // If not authenticated, redirect to home
      setLocation('/');
    }
  }, [isAuthenticated, user, setLocation]);

  // Get initials for avatar
  const getInitials = (name: string = 'User') => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // If not a customer, this page won't be shown (redirect happens in useEffect)
  if (user?.role !== 'customer') {
    return <div className="container mx-auto px-4 py-8">Redirecting...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Customer Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || 'Customer'}! Manage your orders and account details.
          </p>
        </div>
        
        <Card className="w-full md:w-auto">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.profileImage} alt={user?.name} />
                <AvatarFallback className="text-lg">{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
              
              <div>
                <h2 className="font-bold text-xl">{user?.name}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <ShoppingBag className="h-5 w-5 mr-2 text-primary" />
              Active Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">2</p>
            <p className="text-muted-foreground text-sm">Orders in progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Calendar className="h-5 w-5 mr-2 text-secondary" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">12</p>
            <p className="text-muted-foreground text-sm">Orders placed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Box className="h-5 w-5 mr-2 text-accent" />
              Favorite Farms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">3</p>
            <p className="text-muted-foreground text-sm">Farms you ordered from</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <ShoppingBag className="h-5 w-5 mr-2 text-primary" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">Order #1234</h3>
                    <p className="text-sm text-muted-foreground">Placed on May 15, 2023</p>
                  </div>
                  <div className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
                    Processing
                  </div>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex items-center justify-between">
                  <p className="text-sm">3 items</p>
                  <p className="font-medium">$32.95</p>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">Order #1233</h3>
                    <p className="text-sm text-muted-foreground">Placed on May 10, 2023</p>
                  </div>
                  <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                    Delivered
                  </div>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex items-center justify-between">
                  <p className="text-sm">2 items</p>
                  <p className="font-medium">$18.50</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                asChild
                className="mt-2"
              >
                <a href="/dashboard/orders">View All Orders</a>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Tractor className="h-5 w-5 mr-2 text-secondary" />
              Featured Farmers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 border rounded-md p-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>GF</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">Green Fields Farm</h3>
                  <p className="text-sm text-muted-foreground">Organic vegetables and herbs</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 border rounded-md p-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>SH</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">Sunny Hills Dairy</h3>
                  <p className="text-sm text-muted-foreground">Fresh milk, cheese, and eggs</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 border rounded-md p-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>OF</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">Orchard Fresh</h3>
                  <p className="text-sm text-muted-foreground">Seasonal fruits and berries</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                asChild
                className="mt-2"
              >
                <a href="/browse">Browse All Farmers</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
