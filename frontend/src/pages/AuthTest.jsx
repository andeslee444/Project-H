import React from 'react';
import { useAuth } from '../hooks/useAuthFixed';

const AuthTest = () => {
  const auth = useAuth();
  
  return (
    <div style={{ padding: '20px' }}>
      <h2>Auth State Test</h2>
      <pre>{JSON.stringify({
        isAuthenticated: auth.isAuthenticated,
        loading: auth.loading,
        user: auth.user,
        error: auth.error
      }, null, 2)}</pre>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Local Storage:</h3>
        <pre>{JSON.stringify({
          isDemoMode: localStorage.getItem('isDemoMode'),
          demoUser: localStorage.getItem('demoUser') ? JSON.parse(localStorage.getItem('demoUser')) : null
        }, null, 2)}</pre>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>URL Parameters:</h3>
        <pre>{window.location.search}</pre>
      </div>
    </div>
  );
};

export default AuthTest;