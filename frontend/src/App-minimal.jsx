import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Import the mock authentication system (no backend required)
import { AuthProvider, useAuth } from './hooks/useAuth-mock.jsx';

// Import patient components
import PatientDashboard from './components/patient/PatientDashboard.jsx';

// Simple login component  
const SimpleLogin = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  
  const handlePatientLogin = async () => {
    console.log('Button clicked!'); // Debug log
    try {
      // Simulate patient login
      const success = await login({
        id: '1',
        firstName: 'Demo',
        lastName: 'Patient', 
        role: 'patient',
        email: 'patient@demo.com'
      });
      
      console.log('Login success:', success); // Debug log
      
      if (success) {
        console.log('Navigating to dashboard...'); // Debug log
        navigate('/patient/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1>🏥 MindfulMatch</h1>
      <h2>Mental Health Scheduling System</h2>
      <div style={{ 
        background: '#f8fafc', 
        padding: '30px', 
        borderRadius: '10px', 
        marginTop: '20px',
        border: '1px solid #e2e8f0'
      }}>
        <h3>Welcome to the Patient Portal</h3>
        <p>Mental health practice scheduling and waitlist management system</p>
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={handlePatientLogin}
            disabled={loading}
            style={{
              background: loading ? '#94a3b8' : '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {loading ? 'Logging in...' : 'Login as Patient'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Protected route component
const ProtectedPatientRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'patient') return <Navigate to="/login" replace />;
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<SimpleLogin />} />
          <Route path="/patient/dashboard" element={
            <ProtectedPatientRoute>
              <PatientDashboard />
            </ProtectedPatientRoute>
          } />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;