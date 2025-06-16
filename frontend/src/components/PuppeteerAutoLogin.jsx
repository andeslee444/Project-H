import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PuppeteerAutoLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Get role from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role') || 'admin';
    const target = urlParams.get('target') || '/dashboard';
    
    // Set up demo auth
    const demoUsers = {
      admin: {
        id: 'demo-admin-001',
        email: 'admin@example.com',
        role: 'admin',
        first_name: 'Admin',
        last_name: '',
        user_metadata: { role: 'admin' }
      },
      provider: {
        id: 'demo-provider-001',
        email: 'provider@example.com',
        role: 'provider',
        first_name: 'Sarah',
        last_name: 'Johnson',
        title: 'Dr.',
        provider_id: '1',
        user_metadata: { role: 'provider', provider_id: '1' }
      },
      patient: {
        id: 'demo-patient-001',
        email: 'patient@example.com',
        role: 'patient',
        first_name: 'Demo',
        last_name: 'Patient',
        user_metadata: { role: 'patient' }
      }
    };
    
    const user = demoUsers[role] || demoUsers.admin;
    
    // Set auth in localStorage
    localStorage.setItem('isDemoMode', 'true');
    localStorage.setItem('demoUser', JSON.stringify(user));
    localStorage.setItem('demoUserEmail', user.email);
    localStorage.setItem('isAuthenticated', 'true');
    
    // Navigate to target
    setTimeout(() => {
      navigate(target);
    }, 100);
  }, [navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h2>Auto-logging in for Puppeteer session...</h2>
      </div>
    </div>
  );
};

export default PuppeteerAutoLogin;