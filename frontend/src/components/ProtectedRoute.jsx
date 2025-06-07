import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuthFixed';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Demo mode: check if we have a demo user
  const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
  const demoUser = isDemoMode ? JSON.parse(localStorage.getItem('demoUser') || '{}') : null;

  if (loading) {
    return <div>Loading...</div>;
  }

  // Check authentication (real or demo)
  const currentUser = isDemoMode ? demoUser : user;
  const isAuthed = isDemoMode ? !!demoUser : isAuthenticated;

  if (!isAuthed) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && (!currentUser?.role || !allowedRoles.includes(currentUser.role))) {
    console.log('Access denied. User role:', currentUser?.role, 'Allowed roles:', allowedRoles);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('Access granted. User role:', currentUser?.role, 'Allowed roles:', allowedRoles);
  return children;
};

export default ProtectedRoute;