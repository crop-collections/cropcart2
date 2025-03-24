import { useAuth } from '@/hooks/use-auth';

// Helper function to get the Authorization header
export const getAuthHeader = () => {
  const token = useAuth.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Custom fetch function that includes auth header
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const headers = {
    ...options.headers,
    ...getAuthHeader(),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Handle unauthorized response
  if (response.status === 401) {
    // If the token is invalid, log the user out
    useAuth.getState().logout();
    throw new Error('Your session has expired. Please log in again.');
  }

  return response;
};

// Hook to check if user has required role
export const checkUserRole = (requiredRole: string | string[]): boolean => {
  const { user } = useAuth.getState();
  
  if (!user) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }
  
  return user.role === requiredRole;
};
