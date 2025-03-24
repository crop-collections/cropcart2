import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import RegisterForm from '@/components/auth/register-form';

export default function Register() {
  const [location, params] = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Get role from URL query parameter
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const roleParam = searchParams.get('role');
  
  // Validate role
  const validRoles = ['customer', 'farmer', 'delivery'];
  const defaultRole = validRoles.includes(roleParam as string) 
    ? roleParam as 'customer' | 'farmer' | 'delivery'
    : 'customer';

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated]);

  return (
    <div className="container mx-auto px-4 py-12">
      <RegisterForm defaultRole={defaultRole} />
    </div>
  );
}
