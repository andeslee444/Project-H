import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import PatientDashboardPage from './pages/PatientDashboard/PatientDashboard';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Waitlist from './pages/Waitlist/Waitlist';
import Schedule from './pages/Schedule/Schedule';
import Patients from './pages/Patients/Patients';
import Providers from './pages/Providers/Providers';
import Analytics from './pages/Analytics/Analytics';
import Settings from './pages/Settings/Settings';
import Layout from './components/layouts/Layout/Layout';
import PatientLayout from './components/layouts/PatientLayout/PatientLayout';

// Enhanced UI Components  
import ProviderDashboard from './pages/Dashboard/Dashboard';
import ProviderScheduler from './pages/Schedule/Schedule';
import PatientDashboard from './components/patient/PatientDashboard';
import PatientAppointments from './components/patient/PatientAppointments';
import PatientMessages from './components/patient/PatientMessages';
import PatientProfile from './components/patient/PatientProfile';
import PatientBookingFlow from './components/patient/PatientBookingFlow';
import ComponentShowcase from './components/showcase/ComponentShowcase';
import { HealthcareToastContainer } from './components/ui/Toast';
import CSSTest from './components/CSSTest';

import './App.css';

// Import the real authentication system
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import ProtectedRoute from './components/ProtectedRoute';

// Debug component
const DebugInfo = () => {
  const auth = useAuth();
  
  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '10px', fontSize: '12px', zIndex: 9999 }}>
      <div>isAuthenticated: {auth.isAuthenticated ? 'true' : 'false'}</div>
      <div>userRole: {auth.user?.role || 'none'}</div>
      <div>loading: {auth.loading ? 'true' : 'false'}</div>
    </div>
  );
};

// Redirect component based on role
const RoleBasedRedirect = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (!auth.loading && auth.isAuthenticated && auth.user) {
      console.log('RoleBasedRedirect - Current role:', auth.user.role);
      console.log('Current pathname:', location.pathname);
      
      // Only redirect if we're at the root or login page
      if (location.pathname === '/' || location.pathname === '/login') {
        if (auth.user.role === 'patient') {
          console.log('Redirecting to patient dashboard');
          navigate('/patient/dashboard', { replace: true });
        } else if (auth.user.role === 'provider') {
          console.log('Redirecting to provider dashboard');
          navigate('/dashboard', { replace: true });
        } else {
          console.log('Redirecting to admin dashboard');
          navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [auth.loading, auth.isAuthenticated, auth.user, navigate, location]);
  
  return null;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <DebugInfo />
        {/* <RoleBasedRedirect /> */}
        <HealthcareToastContainer />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/showcase" element={<ComponentShowcase />} />
          <Route path="/css-test" element={<CSSTest />} />
          <Route path="/unauthorized" element={
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h1>Unauthorized</h1>
              <p>You don't have permission to access this page.</p>
              <a href="/login">Go to Login</a>
            </div>
          } />
          
          {/* Root redirect - for GitHub Pages, go directly to patient dashboard */}
          <Route path="/" element={<Navigate to="/patient/dashboard" replace />} />
          
          {/* Protected routes for practice staff */}
          <Route path="/" element={
            <ProtectedRoute allowedRoles={['provider', 'admin']}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<ProviderDashboard />} />
            <Route path="dashboard-old" element={<Dashboard />} />
            <Route path="waitlist" element={<Waitlist />} />
            <Route path="schedule" element={<ProviderScheduler />} />
            <Route path="schedule-old" element={<Schedule />} />
            <Route path="patients" element={<Patients />} />
            <Route path="providers" element={<Providers />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* Protected routes for patients */}
          <Route path="/patient" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="dashboard-old" element={<PatientDashboardPage />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="messages" element={<PatientMessages />} />
            <Route path="profile" element={<PatientProfile />} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
