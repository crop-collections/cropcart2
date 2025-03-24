import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link, useLocation } from 'wouter';
import { UserRound, Tractor, Truck } from 'lucide-react';

// Role options
const ROLE_OPTIONS = [
  { value: 'customer', label: 'Customer', icon: UserRound },
  { value: 'farmer', label: 'Farmer', icon: Tractor },
  { value: 'delivery', label: 'Delivery Person', icon: Truck },
];

// Registration schema
const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .email('Invalid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['customer', 'farmer', 'delivery']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  defaultRole?: 'customer' | 'farmer' | 'delivery';
}

export default function RegisterForm({ defaultRole = 'customer' }: RegisterFormProps) {
  const { register, isLoading, error, clearError } = useAuth();
  const [, setLocation] = useLocation();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      address: '',
      role: defaultRole,
    },
  });

  useEffect(() => {
    if (defaultRole) {
      form.setValue('role', defaultRole);
    }
  }, [defaultRole, form]);

  const onSubmit = async (data: RegisterFormValues) => {
    const { confirmPassword, ...userData } = data;
    
    try {
      await register(userData);
      
      // Redirect based on role
      switch (userData.role) {
        case 'farmer':
          setLocation('/dashboard/products');
          break;
        case 'delivery':
          setLocation('/dashboard/deliveries');
          break;
        default:
          setLocation('/');
      }
    } catch (err) {
      // Error is handled by the useAuth hook
    }
  };

  // Get role details
  const roleDetails = ROLE_OPTIONS.find(option => option.value === form.watch('role')) || ROLE_OPTIONS[0];
  const RoleIcon = roleDetails.icon;

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <RoleIcon className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl">Create a {roleDetails.label} Account</CardTitle>
        </div>
        <CardDescription>
          Join FarmFresh and get connected with fresh local produce
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Create a password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter your address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {ROLE_OPTIONS.map(option => {
                      const Icon = option.icon;
                      return (
                        <Button
                          key={option.value}
                          type="button"
                          variant={field.value === option.value ? 'default' : 'outline'}
                          className={`flex flex-col items-center py-4 ${
                            field.value === option.value 
                              ? 'border-primary' 
                              : 'border-input'
                          }`}
                          onClick={() => field.onChange(option.value)}
                        >
                          <Icon className="h-5 w-5 mb-1" />
                          <span>{option.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full mt-6" 
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login">
            <Button variant="link" className="p-0">
              Log in
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
