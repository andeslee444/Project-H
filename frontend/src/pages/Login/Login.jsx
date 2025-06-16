import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuthFixed';
import { usePuppeteerAuth } from '../../hooks/usePuppeteerAuth';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Practice Administrator');
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();
  const isPuppeteerSession = usePuppeteerAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simple validation
    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }
    
    // Check if this is a demo account
    const demoEmails = [
      'patient@example.com', 'provider@example.com', 'admin@example.com',
      'sjohnson@example.com', 'mchen@example.com', 'erodriguez@example.com',
      'dthompson@example.com', 'lmartinez@example.com', 'jwilson@example.com'
    ];
    const isDemoAccount = demoEmails.includes(email) && 
                         (password === 'demopassword123' || password === 'provider123');
    
    if (isDemoAccount) {
      // For demo accounts, navigate directly with demo mode
      console.log('Demo account detected, using demo mode navigation');
      
      // Determine role and user data from email
      let demoRole = 'user';
      let firstName = 'Demo';
      let lastName = 'User';
      let title = undefined;
      let providerId = undefined;
      
      // Provider email mapping
      const providerData = {
        'sjohnson@example.com': { firstName: 'Sarah', lastName: 'Johnson', title: 'Dr.', id: '1' },
        'provider@example.com': { firstName: 'Sarah', lastName: 'Johnson', title: 'Dr.', id: '1' },
        'mchen@example.com': { firstName: 'Michael', lastName: 'Chen', title: 'Dr.', id: '2' },
        'erodriguez@example.com': { firstName: 'Emily', lastName: 'Rodriguez', title: 'LCSW', id: '3' },
        'dthompson@example.com': { firstName: 'David', lastName: 'Thompson', title: 'PhD', id: '4' },
        'lmartinez@example.com': { firstName: 'Lisa', lastName: 'Martinez', title: 'LMFT', id: '5' },
        'jwilson@example.com': { firstName: 'James', lastName: 'Wilson', title: 'PsyD', id: '6' }
      };
      
      if (email === 'admin@example.com') {
        demoRole = 'admin';
        firstName = 'Admin';
        lastName = '';
      } else if (providerData[email]) {
        demoRole = 'provider';
        firstName = providerData[email].firstName;
        lastName = providerData[email].lastName;
        title = providerData[email].title;
        providerId = providerData[email].id;
      } else if (email === 'patient@example.com') {
        demoRole = 'patient';
        firstName = 'Demo';
        lastName = 'Patient';
      }
      
      // Store demo user data
      const demoUserData = {
        id: `demo-${demoRole}-${providerId || '001'}`,
        email: email,
        role: demoRole,
        first_name: firstName,
        last_name: lastName,
        title: title,
        provider_id: providerId,
        user_metadata: { 
          role: demoRole,
          provider_id: providerId
        }
      };
      
      localStorage.setItem('isDemoMode', 'true');
      localStorage.setItem('demoUser', JSON.stringify(demoUserData));
      
      setTimeout(() => {
        if (role === 'Patient') {
          navigate(`/patient/dashboard?demo=true&demoUser=${encodeURIComponent(email)}`);
        } else {
          navigate(`/dashboard?demo=true&demoUser=${encodeURIComponent(email)}`);
        }
        setIsLoading(false);
      }, 500);
      return;
    }
    
    try {
      const { data, error: authError } = await auth.signIn(email, password);
      
      if (authError) {
        setError(authError.message || 'Invalid email or password. Please try again.');
      } else if (data?.user) {
        // Navigation based on role stored in user profile
        // For now, navigate based on selected role since we don't have user profiles set up yet
        if (role === 'Patient') {
          navigate('/patient/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    }
    
    setIsLoading(false);
  };

  const handleDemoLogin = async (demoRole, demoEmail) => {
    setEmail(demoEmail);
    setPassword('demopassword123');
    setRole(demoRole);
    setShowDemo(false);
    
    // For demo purposes, navigate directly since localhost allows demo mode
    setIsLoading(true);
    setError('');
    
    console.log('Demo login for:', demoRole, demoEmail);
    
    // Store demo user info in localStorage for persistence
    const demoUserData = {
      id: `demo-${demoRole.toLowerCase()}-001`,
      email: demoEmail,
      role: demoRole === 'Practice Administrator' ? 'admin' : demoRole.toLowerCase(),
      first_name: demoRole === 'Provider' ? 'Sarah' : (demoRole === 'Practice Administrator' ? 'Admin' : 'Demo'),
      last_name: demoRole === 'Provider' ? 'Johnson' : (demoRole === 'Patient' ? 'Patient' : ''),
      title: demoRole === 'Provider' ? 'Dr.' : undefined,
      user_metadata: { 
        role: demoRole === 'Practice Administrator' ? 'admin' : demoRole.toLowerCase() 
      }
    };
    
    localStorage.setItem('isDemoMode', 'true');
    localStorage.setItem('demoUser', JSON.stringify(demoUserData));
    
    // Direct navigation for demo mode with demo user email
    setTimeout(() => {
      console.log('Demo login navigating...');
      if (demoRole === 'Patient') {
        console.log('Navigating to patient dashboard');
        navigate(`/patient/dashboard?demo=true&demoUser=${encodeURIComponent(demoEmail)}`);
      } else if (demoRole === 'Provider') {
        console.log('Navigating to provider dashboard');
        navigate(`/dashboard?demo=true&demoUser=${encodeURIComponent(demoEmail)}`);
      } else {
        console.log('Navigating to admin dashboard');
        navigate(`/dashboard?demo=true&demoUser=${encodeURIComponent(demoEmail)}`);
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Background decoration */}
        <div className="login-background">
          <div className="bg-circle bg-circle-1"></div>
          <div className="bg-circle bg-circle-2"></div>
          <div className="bg-circle bg-circle-3"></div>
        </div>

        {/* Main login card */}
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="logo">
              <div className="logo-icon">🧠</div>
              <h1>MindfulMatch</h1>
            </div>
            <p className="subtitle">Mental Health Practice Scheduling System</p>
          </div>

          {/* Login form */}
          <div className="login-form">
            <h2>Welcome back</h2>
            <p className="form-subtitle">Please sign in to your account</p>
            
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={error ? 'error' : ''}
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={error ? 'error' : ''}
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="role">Sign in as</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="Practice Administrator">Practice Administrator</option>
                  <option value="Provider">Healthcare Provider</option>
                  <option value="Patient">Patient</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                className={`login-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
            
            <div className="login-footer">
              <a href="#" className="forgot-password">Forgot your password?</a>
            </div>
          </div>

          {/* Demo credentials section */}
          <div className="demo-section">
            <button 
              className="demo-toggle"
              onClick={() => setShowDemo(!showDemo)}
              type="button"
            >
              <span>🔧</span>
              Demo Credentials
              <span className={`chevron ${showDemo ? 'open' : ''}`}>›</span>
            </button>
            
            {showDemo && (
              <div className="demo-content">
                <p>Click any demo account to auto-fill the form:</p>
                <div className="demo-buttons">
                  <button 
                    className="demo-button admin"
                    onClick={() => handleDemoLogin('Practice Administrator', 'admin@example.com')}
                    type="button"
                  >
                    <span className="demo-icon">👨‍💼</span>
                    <div>
                      <strong>Administrator</strong>
                      <small>admin@example.com</small>
                    </div>
                  </button>
                  
                  <button 
                    className="demo-button provider"
                    onClick={() => handleDemoLogin('Provider', 'provider@example.com')}
                    type="button"
                  >
                    <span className="demo-icon">👩‍⚕️</span>
                    <div>
                      <strong>Healthcare Provider</strong>
                      <small>provider@example.com</small>
                    </div>
                  </button>
                  
                  <button 
                    className="demo-button patient"
                    onClick={() => handleDemoLogin('Patient', 'patient@example.com')}
                    type="button"
                  >
                    <span className="demo-icon">👤</span>
                    <div>
                      <strong>Patient</strong>
                      <small>patient@example.com</small>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="login-page-footer">
          <p>&copy; 2024 MindfulMatch. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;