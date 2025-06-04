import { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/api';

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

// Auth provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Only run in browser environment
      if (typeof window === 'undefined') {
        dispatch({ type: 'SET_USER', payload: null });
        return;
      }
      
      const token = localStorage.getItem('authToken');
      
      if (token) {
        try {
          const response = await apiService.getProfile();
          if (response.success) {
            dispatch({ type: 'SET_USER', payload: response.profile });
          } else {
            // Invalid token
            localStorage.removeItem('authToken');
            dispatch({ type: 'SET_USER', payload: null });
          }
        } catch (error) {
          // Token expired or invalid
          localStorage.removeItem('authToken');
          dispatch({ type: 'SET_USER', payload: null });
        }
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const response = await apiService.login(credentials);
      
      if (response.success) {
        console.log('Login successful, setting user:', response.user);
        dispatch({ type: 'SET_USER', payload: response.user });
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error });
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error.data?.error || error.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const response = await apiService.register(userData);
      
      if (response.success) {
        dispatch({ type: 'SET_USER', payload: response.user });
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error });
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error.data?.error || error.message || 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    await apiService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const updatePassword = async (passwordData) => {
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const response = await apiService.updatePassword(passwordData);
      return { success: response.success };
    } catch (error) {
      const errorMessage = error.data?.error || error.message || 'Password update failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const forgotPassword = async (email) => {
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const response = await apiService.forgotPassword(email);
      return { success: response.success, message: response.message };
    } catch (error) {
      const errorMessage = error.data?.error || error.message || 'Request failed';
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (resetData) => {
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const response = await apiService.resetPassword(resetData);
      return { success: response.success, message: response.message };
    } catch (error) {
      const errorMessage = error.data?.error || error.message || 'Password reset failed';
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
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