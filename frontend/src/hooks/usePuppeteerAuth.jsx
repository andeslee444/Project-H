import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Detect if running in Puppeteer
export const isPuppeteer = () => {
  // Check for Puppeteer-specific properties
  return !!(
    window.navigator.webdriver ||
    window.__puppeteer_evaluation_script__ ||
    (window.navigator.userAgent && window.navigator.userAgent.includes('HeadlessChrome'))
  );
};

// Hook to auto-login in Puppeteer sessions
export const usePuppeteerAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isPuppeteer()) {
      console.log('Puppeteer detected - enabling auto-auth');
      
      // Check URL params for desired role
      const urlParams = new URLSearchParams(window.location.search);
      const role = urlParams.get('role') || 'admin';
      const autoLogin = urlParams.get('autologin') !== 'false';
      
      if (autoLogin && !localStorage.getItem('isAuthenticated')) {
        // Set demo mode
        localStorage.setItem('isDemoMode', 'true');
        
        // Auto-login based on role
        switch (role) {
          case 'provider':
            localStorage.setItem('demoUserEmail', 'provider@example.com');
            break;
          case 'patient':
            localStorage.setItem('demoUserEmail', 'patient@example.com');
            break;
          case 'admin':
          default:
            localStorage.setItem('demoUserEmail', 'admin@example.com');
            break;
        }
        
        // Force reload to trigger auth
        window.location.reload();
      }
    }
  }, [navigate]);

  return isPuppeteer();
};

// Utility to add Puppeteer params to URLs
export const getPuppeteerUrl = (path, role = 'admin') => {
  const baseUrl = 'http://localhost:3000';
  const params = new URLSearchParams({
    role,
    autologin: 'true'
  });
  return `${baseUrl}${path}?${params.toString()}`;
};