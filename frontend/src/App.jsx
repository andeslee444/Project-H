import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import PatientDashboard from './pages/PatientDashboard/PatientDashboard';
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
import './App.css';

// AuthContext for global state management
export const AuthContext = React.createContext(null);

export const useAuth = () => React.useContext(AuthContext);

// AuthProvider component
const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedAuth = localStorage.getItem('isAuthenticated');
    return savedAuth ? JSON.parse(savedAuth) : false;
  });
  
  const [userRole, setUserRole] = useState(() => {
    const savedRole = localStorage.getItem('userRole');
    return savedRole || '';
  });

  // Update localStorage when auth state changes
  useEffect(() => {
    localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated));
    if (userRole) {
      localStorage.setItem('userRole', userRole);
    }
    
    // Debug logging
    console.log('Auth state updated:', isAuthenticated);
    console.log('User role updated:', userRole);
  }, [isAuthenticated, userRole]);

  // Login function
  const login = (email, password, role) => {
    console.log('Login attempt with role:', role);
    setIsAuthenticated(true);
    setUserRole(role);
    return true;
  };

  // Logout function
  const logout = () => {
    setIsAuthenticated(false);
    setUserRole('');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
  };

  const value = {
    isAuthenticated,
    userRole,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Debug component
const DebugInfo = () => {
  const auth = useAuth();
  
  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '10px', fontSize: '12px', zIndex: 9999 }}>
      <div>isAuthenticated: {auth.isAuthenticated ? 'true' : 'false'}</div>
      <div>userRole: {auth.userRole}</div>
    </div>
  );
};

// Redirect component based on role
const RoleBasedRedirect = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (auth.isAuthenticated) {
      console.log('RoleBasedRedirect - Current role:', auth.userRole);
      
      // Only redirect if we're at the root or login page
      if (location.pathname === '/' || location.pathname === '/login') {
        if (auth.userRole === 'Patient') {
          console.log('Redirecting to patient dashboard');
          navigate('/patient/dashboard', { replace: true });
        } else {
          console.log('Redirecting to admin dashboard');
          navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [auth.isAuthenticated, auth.userRole, navigate, location]);
  
  return null;
};

function App() {
  return (
    <AuthProvider>
      <Router basename="/Project-H">
        <DebugInfo />
        <RoleBasedRedirect />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Protected routes for practice staff */}
          <Route path="/" element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="waitlist" element={<Waitlist />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="patients" element={<Patients />} />
            <Route path="providers" element={<Providers />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* Protected routes for patients */}
          <Route path="/patient" element={<PatientLayout />}>
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="appointments" element={<div>My Appointments</div>} />
            <Route path="messages" element={<div>My Messages</div>} />
            <Route path="profile" element={<div>My Profile</div>} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
