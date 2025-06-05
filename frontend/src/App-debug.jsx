import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Try basic imports first
import { AuthProvider, useAuth } from './hooks/useAuth';

// Debug components
const TestLogin = () => {
  console.log('TestLogin component rendering');
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🧠 MindfulMatch - Debug Mode</h1>
      <p>Testing login component...</p>
      <div style={{ 
        backgroundColor: '#f0f0f0', 
        padding: '20px', 
        margin: '20px 0',
        borderRadius: '8px'
      }}>
        <h2>Authentication Status</h2>
        <p>This is a test login page to verify routing works.</p>
        <a href="/test" style={{ color: 'blue' }}>Test internal link</a>
      </div>
    </div>
  );
};

const TestDashboard = () => {
  console.log('TestDashboard component rendering');
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Test Dashboard</h1>
      <p>If you can see this, routing is working!</p>
    </div>
  );
};

// Debug component
const DebugInfo = () => {
  const auth = useAuth();
  
  console.log('DebugInfo rendering, auth:', auth);
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 0, 
      right: 0, 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      fontSize: '12px', 
      zIndex: 9999,
      borderRadius: '4px 0 0 0'
    }}>
      <div>isAuthenticated: {auth?.isAuthenticated ? 'true' : 'false'}</div>
      <div>userRole: {auth?.user?.role || 'none'}</div>
      <div>loading: {auth?.loading ? 'true' : 'false'}</div>
      <div>URL: {window.location.pathname}</div>
    </div>
  );
};

function App() {
  console.log('App component rendering');
  
  return (
    <AuthProvider>
      <Router>
        <DebugInfo />
        <Routes>
          <Route path="/login" element={<TestLogin />} />
          <Route path="/test" element={<TestDashboard />} />
          <Route path="/unauthorized" element={
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h1>Unauthorized</h1>
              <p>You don't have permission to access this page.</p>
              <a href="/login">Go to Login</a>
            </div>
          } />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;