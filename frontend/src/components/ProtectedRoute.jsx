import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Demo mode: allow access if URL contains demo params or if we're in development/GitHub Pages
  const isDemoMode = window.location.search.includes('demo=true') || 
                     window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.includes('github.io');

  if (loading && !isDemoMode) {
    return <div>Loading...</div>;
  }

  // In demo mode, allow access to dashboards
  if (isDemoMode) {
    console.log('Demo mode active, allowing access to:', allowedRoles);
    return children;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && (!user?.role || !allowedRoles.includes(user.role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;