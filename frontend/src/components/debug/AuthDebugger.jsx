import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const AuthDebugger = () => {
  const [authState, setAuthState] = useState({
    user: null,
    session: null,
    error: null,
    loading: true,
    isDemo: import.meta.env.VITE_DEMO_MODE === 'true',
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
  });
  
  const [loginForm, setLoginForm] = useState({
    email: 'provider@example.com',
    password: ''
  });
  
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        addTestResult('Get Session Error', sessionError.message, 'error');
      } else {
        addTestResult('Session Check', session ? 'Active session found' : 'No active session', session ? 'success' : 'warning');
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        addTestResult('Get User Error', userError.message, 'error');
      } else {
        addTestResult('User Check', user ? `Logged in as ${user.email}` : 'No user logged in', user ? 'success' : 'warning');
      }

      setAuthState(prev => ({
        ...prev,
        user,
        session,
        loading: false
      }));

      // Test a simple query
      await testSupabaseQuery();
      
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthState(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
    }
  };

  const testSupabaseQuery = async () => {
    try {
      // Test providers query
      const { data: providers, error: providersError } = await supabase
        .from('providers')
        .select('provider_id, first_name, last_name')
        .limit(1);
      
      if (providersError) {
        addTestResult('Providers Query', `Error: ${providersError.message} (Code: ${providersError.code})`, 'error');
      } else {
        addTestResult('Providers Query', `Success: Found ${providers?.length || 0} providers`, 'success');
      }

      // Test waitlist_entries query
      const { data: waitlist, error: waitlistError } = await supabase
        .from('waitlist_entries')
        .select('entry_id')
        .limit(1);
      
      if (waitlistError) {
        addTestResult('Waitlist Query', `Error: ${waitlistError.message} (Code: ${waitlistError.code})`, 'error');
      } else {
        addTestResult('Waitlist Query', `Success: Found ${waitlist?.length || 0} entries`, 'success');
      }

    } catch (error) {
      addTestResult('Query Test', `Exception: ${error.message}`, 'error');
    }
  };

  const addTestResult = (test, result, status) => {
    setTestResults(prev => [...prev, { test, result, status, timestamp: new Date().toISOString() }]);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setTestResults([]);
    
    try {
      addTestResult('Login Attempt', `Attempting login with ${loginForm.email}`, 'info');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password
      });

      if (error) {
        addTestResult('Login Error', error.message, 'error');
        console.error('Login error details:', error);
      } else {
        addTestResult('Login Success', `Logged in as ${data.user.email}`, 'success');
        
        // Wait a moment then check auth again
        setTimeout(() => {
          checkAuth();
        }, 1000);
      }
    } catch (error) {
      addTestResult('Login Exception', error.message, 'error');
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        addTestResult('Logout Error', error.message, 'error');
      } else {
        addTestResult('Logout Success', 'Successfully logged out', 'success');
        checkAuth();
      }
    } catch (error) {
      addTestResult('Logout Exception', error.message, 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Authentication Debugger</h2>
        
        {/* Current State */}
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Current State:</h3>
          <div className="space-y-1 text-sm">
            <div>Demo Mode: <span className={authState.isDemo ? 'text-yellow-600' : 'text-green-600'}>{authState.isDemo ? 'Enabled' : 'Disabled'}</span></div>
            <div>Supabase URL: <span className="text-gray-600">{authState.supabaseUrl || 'Not configured'}</span></div>
            <div>Anon Key: <span className={authState.hasAnonKey ? 'text-green-600' : 'text-red-600'}>{authState.hasAnonKey ? 'Configured' : 'Missing'}</span></div>
            <div>User: <span className={authState.user ? 'text-green-600' : 'text-gray-600'}>{authState.user?.email || 'Not logged in'}</span></div>
            <div>Session: <span className={authState.session ? 'text-green-600' : 'text-gray-600'}>{authState.session ? 'Active' : 'None'}</span></div>
          </div>
        </div>

        {/* Login Form */}
        {!authState.user && (
          <form onSubmit={handleLogin} className="mb-6 p-4 border rounded">
            <h3 className="font-semibold mb-3">Test Login:</h3>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border rounded"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Test Login
              </button>
            </div>
          </form>
        )}

        {/* Logout Button */}
        {authState.user && (
          <button
            onClick={handleLogout}
            className="mb-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        )}

        {/* Test Results */}
        <div className="space-y-2">
          <h3 className="font-semibold">Test Results:</h3>
          {testResults.map((result, index) => (
            <div key={index} className={`p-3 rounded text-sm ${getStatusColor(result.status)}`}>
              <div className="font-medium">{result.test}</div>
              <div>{result.result}</div>
              <div className="text-xs opacity-60">{new Date(result.timestamp).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>

        {/* Raw Response Headers */}
        <details className="mt-6">
          <summary className="cursor-pointer font-semibold">Raw Auth State</summary>
          <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(authState, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default AuthDebugger;