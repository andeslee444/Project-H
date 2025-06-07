/**
 * App Component with Lazy Loading
 * 
 * Implements code splitting for optimal bundle sizes
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@/lib/error-handling/ErrorBoundary';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Eagerly load authentication and layout components
import AuthProvider from '@/components/AuthProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';

// Lazy load route components
const Index = lazy(() => import('@/pages/Index'));
const Patients = lazy(() => import('@/pages/Patients'));
const Providers = lazy(() => import('@/pages/Providers'));
const Appointments = lazy(() => import('@/pages/Appointments'));
const Waitlist = lazy(() => import('@/pages/Waitlist'));
const Profile = lazy(() => import('@/pages/Profile'));
const Auth = lazy(() => import('@/pages/Auth'));

// Lazy load feature components
const MoodTracker = lazy(() => import('@/features/MoodTracker'));
const Analytics = lazy(() => import('@/features/Analytics'));
const Reports = lazy(() => import('@/features/Reports'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="large" />
  </div>
);

// Route configuration with lazy loading
const routeConfig = [
  {
    path: '/',
    element: <Index />,
    protected: true,
  },
  {
    path: '/patients',
    element: <Patients />,
    protected: true,
  },
  {
    path: '/providers',
    element: <Providers />,
    protected: true,
  },
  {
    path: '/appointments',
    element: <Appointments />,
    protected: true,
  },
  {
    path: '/waitlist',
    element: <Waitlist />,
    protected: true,
  },
  {
    path: '/mood-tracker',
    element: <MoodTracker />,
    protected: true,
  },
  {
    path: '/analytics',
    element: <Analytics />,
    protected: true,
    roles: ['provider', 'admin'],
  },
  {
    path: '/reports',
    element: <Reports />,
    protected: true,
    roles: ['provider', 'admin'],
  },
  {
    path: '/profile',
    element: <Profile />,
    protected: true,
  },
  {
    path: '/auth',
    element: <Auth />,
    protected: false,
  },
];

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={
              <Suspense fallback={<PageLoader />}>
                <Auth />
              </Suspense>
            } />

            {/* Protected routes with layout */}
            <Route element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              {routeConfig
                .filter(route => route.protected)
                .map(route => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      <Suspense fallback={<PageLoader />}>
                        {route.element}
                      </Suspense>
                    }
                  />
                ))}
            </Route>

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;