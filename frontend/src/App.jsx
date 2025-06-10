import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import ResyLayout from './components/layouts/ResyLayout/ResyLayout';
import AuthTest from './pages/AuthTest';

// Enhanced UI Components  
// import ProviderDashboard from './components/provider/EnhancedDashboard';
import ProviderDashboard from './pages/Dashboard/Dashboard';
import ProviderScheduler from './components/provider/AdvancedScheduler';
import PatientDashboard from './components/patient/PatientDashboard';
import PatientAppointments from './components/patient/PatientAppointments';
import PatientMessages from './components/patient/PatientMessages';
import PatientProfile from './components/patient/PatientProfile';
// import ComponentShowcase from './components/showcase/ComponentShowcase';
// import { HealthcareToastContainer } from './components/ui/Toast';

// Resy-inspired components
import ResyHomePage from './components/resy/HomePage';
import ResyProviderDashboard from './components/resy/ResyProviderDashboard'; // Updated to use the new comprehensive dashboard
import OldProviderDashboard from './components/resy/ProviderDashboard'; // Keep old one for reference
import ResyPatientBooking from './components/resy/PatientBooking';
import ResyProviderProfile from './components/resy/ProviderProfile';
import ResyWaitlist from './components/resy/ResyWaitlist';
import ResyAvailabilityGrid from './components/resy/ResyAvailabilityGrid';
import ResyPatientManagement from './components/resy/ResyGuestManagement'; // Will show "Patient Management" header
import ResyTeamDashboard from './components/resy/ResyTeamDashboard';
import ResyInsightsDashboard from './components/resy/ResyInsightsDashboard';
import ResyQuickControls from './components/resy/ResyQuickControls';
import ResyMainDashboard from './pages/ResyDashboard/ResyDashboard';

import './App.css';

// Import the authentication system with fixed timeout handling
import { AuthProvider, useAuth } from './hooks/useAuthFixed';
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


function App() {
  console.log('App.jsx rendering');
  
  return (
    <AuthProvider>
      <Router>
        <DebugInfo />
        {/* <RoleBasedRedirect /> */}
        {/* <HealthcareToastContainer /> */}
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* <Route path="/showcase" element={<ComponentShowcase />} /> */}
          <Route path="/unauthorized" element={
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h1>Unauthorized</h1>
              <p>You don&apos;t have permission to access this page.</p>
              <a href="/login">Go to Login</a>
            </div>
          } />
          
          {/* Test page */}
          <Route path="/auth-test" element={<AuthTest />} />
          
          {/* Resy-inspired public routes */}
          <Route path="/" element={<ResyHomePage />} />
          <Route path="/search" element={<ResyPatientBooking />} />
          <Route path="/provider/:id" element={<ResyProviderProfile />} />
          
          {/* Demo routes for Resy UI (temporary for showcase) */}
          <Route path="/demo/provider-dashboard" element={<ResyProviderDashboard />} />
          <Route path="/demo/patient-booking" element={<ResyPatientBooking />} />
          
          {/* Protected routes for practice staff - Resy UI */}
          <Route path="/" element={
            <ProtectedRoute allowedRoles={['provider', 'admin']}>
              <ResyLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<ResyMainDashboard />} />
            <Route path="dashboard-provider" element={<ResyProviderDashboard />} />
            <Route path="dashboard-old" element={<Dashboard />} />
            <Route path="dashboard-legacy" element={<ProviderDashboard />} />
            <Route path="waitlist" element={<ResyWaitlist />} />
            <Route path="waitlist-old" element={<Waitlist />} />
            <Route path="schedule" element={<ResyAvailabilityGrid />} />
            <Route path="schedule-advanced" element={<ProviderScheduler />} />
            <Route path="schedule-old" element={<Schedule />} />
            <Route path="patients" element={<ResyPatientManagement />} />
            <Route path="patients-old" element={<Patients />} />
            <Route path="providers" element={<ResyTeamDashboard />} />
            <Route path="providers-old" element={<Providers />} />
            <Route path="analytics" element={<ResyInsightsDashboard />} />
            <Route path="analytics-old" element={<Analytics />} />
            <Route path="settings" element={<ResyQuickControls />} />
            <Route path="settings-old" element={<Settings />} />
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
