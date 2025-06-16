import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Waitlist from './pages/Waitlist/Waitlist';
import WaitlistLayout from './components/layouts/WaitlistLayout/WaitlistLayout';
import ResyWaitlist from './components/resy/ResyWaitlist';
import AuthDebugger from './components/debug/AuthDebugger';
import PuppeteerAutoLogin from './components/PuppeteerAutoLogin';
import { ConnectionStatus } from './components/ConnectionStatus';

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
  console.log('App.jsx rendering - Waitlist Focus Mode');
  
  return (
    <AuthProvider>
      <ConnectionStatus />
      <Router>
        <DebugInfo />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h1>Unauthorized</h1>
              <p>You don&apos;t have permission to access this page.</p>
              <a href="/login">Go to Login</a>
            </div>
          } />
          
          {/* Test pages */}
          <Route path="/auth-debug" element={<AuthDebugger />} />
          <Route path="/puppeteer-login" element={<PuppeteerAutoLogin />} />
          
          {/* Main waitlist route */}
          <Route path="/" element={
            <ProtectedRoute allowedRoles={['provider', 'admin']}>
              <WaitlistLayout />
            </ProtectedRoute>
          }>
            <Route index element={<ResyWaitlist />} />
            <Route path="waitlist" element={<ResyWaitlist />} />
            <Route path="waitlist-old" element={<Waitlist />} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;