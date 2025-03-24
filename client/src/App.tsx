import { useEffect } from 'react';
import { Switch, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { initializeAuth } from '@/hooks/use-auth';

// Layout components
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

// Pages
import Home from '@/pages/home';
import Browse from '@/pages/browse';
import ProductDetail from '@/pages/product/[id]';
import Dashboard from '@/pages/dashboard';
import DashboardProducts from '@/pages/dashboard/products';
import DashboardOrders from '@/pages/dashboard/orders';
import DashboardDeliveries from '@/pages/dashboard/deliveries';
import FarmerProducts from '@/pages/dashboard/farmer-products';
import Checkout from '@/pages/checkout';
import Register from '@/pages/register';
import NotFound from '@/pages/not-found';

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/browse" component={Browse} />
          <Route path="/product/:id" component={ProductDetail} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/dashboard/products" component={DashboardProducts} />
          <Route path="/dashboard/orders" component={DashboardOrders} />
          <Route path="/dashboard/deliveries" component={DashboardDeliveries} />
          <Route path="/dashboard/farmer-products" component={FarmerProducts} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/register" component={Register} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
