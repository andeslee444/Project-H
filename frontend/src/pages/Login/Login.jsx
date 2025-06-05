import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
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
    
    // Simulate API call delay for better UX
    setTimeout(() => {
      const success = auth.login(email, password, role);
      
      if (success) {
        // Navigation based on role
        if (role === 'Patient') {
          navigate('/patient/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('Invalid email or password. Please try again.');
      }
      setIsLoading(false);
    }, 800);
  };

  const handleDemoLogin = (demoRole, demoEmail) => {
    setEmail(demoEmail);
    setPassword('password');
    setRole(demoRole);
    setShowDemo(false);
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