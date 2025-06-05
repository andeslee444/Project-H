import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import the mock auth system
import { AuthProvider, useAuth } from './hooks/useAuth';

// Try importing the real components
import Login from './pages/Login/Login';
import PatientDashboard from './components/patient/PatientDashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Simple test dashboard for providers
const SimpleDashboard = () => {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>🏥 Provider Dashboard</h1>
      <p>Welcome to the provider dashboard!</p>
      <button onClick={() => window.location.href = '/login'}>Logout</button>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/patient/dashboard" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['provider']}>
              <SimpleDashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;