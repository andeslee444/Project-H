import { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Auth context
const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
      };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    
    default:
      return state;
  }
};

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Demo users configuration
const DEMO_USERS = {
  'admin@example.com': {
    id: 'demo-admin-001',
    email: 'admin@example.com',
    role: 'admin',
    first_name: 'Admin',
    last_name: '',
    user_metadata: { role: 'admin' }
  },
  'provider@example.com': {
    id: 'demo-provider-001',
    email: 'provider@example.com',
    role: 'provider',
    first_name: 'Sarah',
    last_name: 'Johnson',
    title: 'Dr.',
    provider_id: '1',
    user_metadata: { role: 'provider', provider_id: '1' }
  },
  'sjohnson@example.com': {
    id: 'demo-provider-001',
    email: 'sjohnson@example.com',
    role: 'provider',
    first_name: 'Sarah',
    last_name: 'Johnson',
    title: 'Dr.',
    provider_id: '1',
    user_metadata: { role: 'provider', provider_id: '1' }
  },
  'mchen@example.com': {
    id: 'demo-provider-002',
    email: 'mchen@example.com',
    role: 'provider',
    first_name: 'Michael',
    last_name: 'Chen',
    title: 'Dr.',
    provider_id: '2',
    user_metadata: { role: 'provider', provider_id: '2' }
  },
  'erodriguez@example.com': {
    id: 'demo-provider-003',
    email: 'erodriguez@example.com',
    role: 'provider',
    first_name: 'Emily',
    last_name: 'Rodriguez',
    title: 'LCSW',
    provider_id: '3',
    user_metadata: { role: 'provider', provider_id: '3' }
  },
  'dthompson@example.com': {
    id: 'demo-provider-004',
    email: 'dthompson@example.com',
    role: 'provider',
    first_name: 'David',
    last_name: 'Thompson',
    title: 'PhD',
    provider_id: '4',
    user_metadata: { role: 'provider', provider_id: '4' }
  },
  'lmartinez@example.com': {
    id: 'demo-provider-005',
    email: 'lmartinez@example.com',
    role: 'provider',
    first_name: 'Lisa',
    last_name: 'Martinez',
    title: 'LMFT',
    provider_id: '5',
    user_metadata: { role: 'provider', provider_id: '5' }
  },
  'jwilson@example.com': {
    id: 'demo-provider-006',
    email: 'jwilson@example.com',
    role: 'provider',
    first_name: 'James',
    last_name: 'Wilson',
    title: 'PsyD',
    provider_id: '6',
    user_metadata: { role: 'provider', provider_id: '6' }
  },
  'patient@example.com': {
    id: 'demo-patient-001',
    email: 'patient@example.com',
    role: 'patient',
    first_name: 'Demo',
    last_name: 'Patient',
    user_metadata: { role: 'patient' }
  }
};

// Auth provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Temporarily enable demo mode for testing
        const isDemoMode = true; // Force demo mode
        if (isDemoMode) {
          const demoUser = DEMO_USERS['admin@example.com'];
          console.log('Demo mode active, setting demo user:', demoUser);
          dispatch({ type: 'SET_USER', payload: demoUser });
          return; // Exit early for demo mode
        }
        
        // For non-demo mode, check if we're on localhost or a demo environment
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
        
        // Set a timeout for Supabase operations
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Supabase timeout')), 5000)
        );
        
        try {
          // Race between Supabase call and timeout
          const { data: { session }, error } = await Promise.race([
            supabase.auth.getSession(),
            timeoutPromise
          ]);
          
          if (error) {
            console.error('Error getting session:', error);
            dispatch({ type: 'SET_USER', payload: null });
            return;
          }

          if (session?.user) {
            // Try to get user profile with timeout
            try {
              const { data: profile, error: profileError } = await Promise.race([
                supabase
                  .from('users')
                  .select('*')
                  .eq('id', session.user.id)
                  .single(),
                timeoutPromise
              ]);

              if (profileError) {
                console.error('Error fetching user profile:', profileError);
                const metaRole = session.user.user_metadata?.role || 'user';
                dispatch({ type: 'SET_USER', payload: { ...session.user, role: metaRole } });
              } else {
                console.log('Initial user profile loaded:', profile);
                dispatch({ type: 'SET_USER', payload: { ...session.user, ...profile } });
              }
            } catch (profileError) {
              // Timeout or error getting profile, use metadata
              const metaRole = session.user.user_metadata?.role || 'user';
              dispatch({ type: 'SET_USER', payload: { ...session.user, role: metaRole } });
            }
          } else {
            dispatch({ type: 'SET_USER', payload: null });
          }
        } catch (error) {
          // Timeout or connection error
          console.error('Supabase connection error:', error);
          
          // If we're on localhost and Supabase fails, just mark as not authenticated
          if (isLocalhost) {
            console.log('Localhost detected, proceeding without Supabase');
            dispatch({ type: 'SET_USER', payload: null });
          } else {
            dispatch({ type: 'SET_ERROR', payload: 'Unable to connect to authentication service' });
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        dispatch({ type: 'SET_USER', payload: null });
      }
    };

    checkAuth();

    // Listen for auth changes (with error handling)
    let subscription;
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            try {
              const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (profileError) {
                console.error('Error fetching user profile:', profileError);
                const metaRole = session.user.user_metadata?.role || 'user';
                dispatch({ type: 'SET_USER', payload: { ...session.user, role: metaRole } });
              } else {
                console.log('User profile loaded:', profile);
                dispatch({ type: 'SET_USER', payload: { ...session.user, ...profile } });
              }
            } catch (error) {
              console.error('Error in auth state change:', error);
              dispatch({ type: 'SET_USER', payload: session.user });
            }
          } else {
            dispatch({ type: 'SET_USER', payload: null });
          }
        }
      );
      subscription = data.subscription;
    } catch (error) {
      console.error('Error setting up auth listener:', error);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('Login successful, setting user:', data.user);
        // User state will be updated by the onAuthStateChange listener
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Add signIn method that Login.jsx expects
  const signIn = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        return { data: null, error };
      }

      if (data.user) {
        console.log('Sign in successful:', data.user);
        // User state will be updated by the onAuthStateChange listener
        return { data, error: null };
      }
    } catch (error) {
      const errorMessage = error.message || 'Sign in failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { data: null, error: { message: errorMessage } };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role || 'patient'
          }
        }
      });

      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('Registration successful:', data.user);
        // User state will be updated by the onAuthStateChange listener
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    // Clear demo mode if active
    localStorage.removeItem('demoUser');
    localStorage.removeItem('isDemoMode');
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    dispatch({ type: 'LOGOUT' });
  };

  const updatePassword = async (passwordData) => {
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.password
      });

      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Password update failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const forgotPassword = async (email) => {
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      const errorMessage = error.message || 'Request failed';
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (resetData) => {
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const { error } = await supabase.auth.updateUser({
        password: resetData.password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      const errorMessage = error.message || 'Password reset failed';
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    signIn,
    register,
    logout,
    updatePassword,
    forgotPassword,
    resetPassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Hook for protected routes
export function useRequireAuth() {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      // Redirect to login or handle unauthorized access
      window.location.href = '/login';
    }
  }, [auth.loading, auth.isAuthenticated]);

  return auth;
}