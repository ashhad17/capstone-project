
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * Custom hook to protect routes that require authentication.
 * It will redirect to login if user is not authenticated.
 * 
 * @param redirectTo - Path to redirect unauthenticated users to
 * @param requiredRole - Optional role requirement
 */
export const useRequireAuth = (
  redirectTo: string = '/login',
  requiredRole?: 'user' | 'admin' | 'service_provider'
) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate(redirectTo, { 
        state: { from: location.pathname },
        replace: true
      });
      return;
    }

    // If role requirement specified and user doesn't have it, redirect
    if (requiredRole && user?.role !== requiredRole) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, navigate, redirectTo, requiredRole, location.pathname]);

  return { isAuthenticated, user };
};
