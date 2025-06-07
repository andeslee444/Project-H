import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, usePermissions, useRoles } from '../hooks/useAuth'
import type { Permission, UserRole } from '@config/constants/roles'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: Permission[]
  requiredRoles?: UserRole[]
  requireAll?: boolean // If true, user must have ALL permissions/roles. If false, ANY will do.
  fallback?: React.ComponentType<{ reason?: string }>
  redirectTo?: string
}

/**
 * ProtectedRoute component that handles role-based access control
 * 
 * Features:
 * - Permission-based access control
 * - Role-based access control
 * - Flexible permission checking (ALL vs ANY)
 * - Custom fallback components
 * - Automatic redirect handling
 * - Loading state management
 * - Demo mode support
 */
export function ProtectedRoute({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  requireAll = true,
  fallback: Fallback = DefaultUnauthorizedFallback,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const { hasPermissions, checkPermission } = usePermissions(requiredPermissions)
  const { hasRequiredRole, checkRole } = useRoles(requiredRoles)
  const location = useLocation()

  // Show loading state while auth is initializing
  if (isLoading) {
    return <LoadingFallback />
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    )
  }

  // Check role-based access
  if (requiredRoles.length > 0) {
    const hasValidRole = requireAll 
      ? requiredRoles.every(role => checkRole(role))
      : hasRequiredRole

    if (!hasValidRole) {
      return <Fallback reason="insufficient_role" />
    }
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasValidPermissions = requireAll
      ? hasPermissions
      : requiredPermissions.some(permission => checkPermission(permission))

    if (!hasValidPermissions) {
      return <Fallback reason="insufficient_permissions" />
    }
  }

  // User is authenticated and authorized
  return <>{children}</>
}

/**
 * Default loading fallback component
 */
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

/**
 * Default unauthorized fallback component
 */
function DefaultUnauthorizedFallback({ reason }: { reason?: string }) {
  const getErrorMessage = () => {
    switch (reason) {
      case 'insufficient_role':
        return 'You do not have the required role to access this page.'
      case 'insufficient_permissions':
        return 'You do not have the required permissions to access this page.'
      default:
        return 'You are not authorized to access this page.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <svg 
              className="w-6 h-6 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Access Denied
          </h3>
          <p className="text-red-600 mb-4">
            {getErrorMessage()}
          </p>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Higher-order component version of ProtectedRoute
 * Useful for wrapping components directly
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'>
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

/**
 * Hook for programmatic access control checking
 * Useful for conditional rendering within components
 */
export function useAccessControl(
  requiredPermissions: Permission[] = [],
  requiredRoles: UserRole[] = [],
  requireAll = true
) {
  const { isAuthenticated, user } = useAuth()
  const { checkPermission } = usePermissions()
  const { checkRole } = useRoles()

  const hasAccess = React.useMemo(() => {
    if (!isAuthenticated || !user) {
      return false
    }

    // Check roles
    if (requiredRoles.length > 0) {
      const hasValidRole = requireAll
        ? requiredRoles.every(role => checkRole(role))
        : requiredRoles.some(role => checkRole(role))
      
      if (!hasValidRole) {
        return false
      }
    }

    // Check permissions
    if (requiredPermissions.length > 0) {
      const hasValidPermissions = requireAll
        ? requiredPermissions.every(permission => checkPermission(permission))
        : requiredPermissions.some(permission => checkPermission(permission))
      
      if (!hasValidPermissions) {
        return false
      }
    }

    return true
  }, [isAuthenticated, user, requiredPermissions, requiredRoles, requireAll, checkPermission, checkRole])

  return {
    hasAccess,
    user,
    isAuthenticated
  }
}