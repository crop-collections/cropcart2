import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserRound, Tractor, Truck } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState('customer');
  const { login, isLoading, error, clearError } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    await login(data.username, data.password);
    if (!error) {
      onClose();
      form.reset();
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    clearError();
    form.clearErrors();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Choose Login Type</DialogTitle>
          <DialogDescription>
            Select your role to access the appropriate dashboard
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="customer" className="flex items-center gap-2">
              <UserRound className="h-4 w-4" />
              <span className="hidden sm:inline">Customer</span>
            </TabsTrigger>
            <TabsTrigger value="farmer" className="flex items-center gap-2">
              <Tractor className="h-4 w-4" />
              <span className="hidden sm:inline">Farmer</span>
            </TabsTrigger>
            <TabsTrigger value="delivery" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <span className="hidden sm:inline">Delivery</span>
            </TabsTrigger>
          </TabsList>

          {['customer', 'farmer', 'delivery'].map((role) => (
            <TabsContent key={role} value={role} className="mt-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                    variant={role === 'customer' ? 'default' : 
                            role === 'farmer' ? 'secondary' : 'outline'}
                  >
                    {isLoading ? 'Logging in...' : `Log in as ${role}`}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">New to FarmFresh?</p>
          <Link href={`/register?role=${activeTab}`}>
            <Button variant="link" className="p-0" onClick={onClose}>
              Create an account
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
