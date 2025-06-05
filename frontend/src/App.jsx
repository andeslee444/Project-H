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

import './App.css';

// Import the mock authentication system (no backend required)
import { AuthProvider, useAuth } from './hooks/useAuth.js';
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
          
          {/* Root redirect - for GitHub Pages, go to login first */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
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
