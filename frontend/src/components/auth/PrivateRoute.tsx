
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface PrivateRouteProps {
  children?: React.ReactNode;
  requiresAuth?: boolean;
  requiredRole?: "user" | "admin" | "service_provider";
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  requiresAuth = true,
  requiredRole 
}) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  
  // Check if user is authenticated
  if (requiresAuth && !isAuthenticated) {
    // Redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check if user has the required role
  if (requiredRole && user?.role !== requiredRole) {
    // User doesn't have required role - redirect to home or unauthorized page
    return <Navigate to="/" replace />;
  }
  
  // If there are children, render them, otherwise render the outlet
  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute;
