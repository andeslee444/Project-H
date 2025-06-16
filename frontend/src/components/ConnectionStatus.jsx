import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getConfig } from '../config';

// Check if we're in demo mode
const isDemoMode = getConfig().auth.mode === 'demo';

export function ConnectionStatus() {
  const [status, setStatus] = useState('connecting');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isDemoMode) {
      setStatus('demo');
      return;
    }

    // Monitor all active channels
    const checkConnectionStatus = () => {
      const channels = supabase.getChannels();
      
      if (channels.length === 0) {
        setStatus('disconnected');
        return;
      }

      // Check if any channel is in error state
      const hasError = channels.some(channel => 
        channel.state === 'closed' || channel.state === 'errored'
      );
      
      if (hasError) {
        setStatus('error');
        return;
      }

      // Check if all channels are subscribed
      const allSubscribed = channels.every(channel => 
        channel.state === 'subscribed'
      );
      
      if (allSubscribed) {
        setStatus('connected');
      } else {
        setStatus('connecting');
      }
    };

    // Initial check
    checkConnectionStatus();

    // Set up interval to check status
    const interval = setInterval(checkConnectionStatus, 5000);

    // Listen for connection state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setStatus('disconnected');
      } else if (event === 'SIGNED_IN' && session) {
        setTimeout(checkConnectionStatus, 1000);
      }
    });

    return () => {
      clearInterval(interval);
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'disconnected':
        return 'bg-gray-500';
      case 'demo':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Live Updates Active';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Connection Error';
      case 'disconnected':
        return 'Disconnected';
      case 'demo':
        return 'Demo Mode';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'connecting':
        return (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'error':
      case 'disconnected':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'demo':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-full text-white text-sm font-medium shadow-lg transition-all duration-200 ${getStatusColor()} hover:shadow-xl`}
        >
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </div>
          {status === 'connected' && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          )}
        </button>

        {showDetails && (
          <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Connection Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  status === 'connected' ? 'text-green-600' : 
                  status === 'error' ? 'text-red-600' : 
                  status === 'demo' ? 'text-blue-600' : 
                  'text-gray-600'
                }`}>
                  {getStatusText()}
                </span>
              </div>
              {!isDemoMode && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mode:</span>
                    <span className="font-medium">Real-time Sync</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {status === 'connected' ? 
                      'All data changes are synchronized in real-time.' :
                      status === 'error' ?
                      'Check your internet connection and try refreshing.' :
                      'Attempting to establish connection...'
                    }
                  </div>
                </>
              )}
              {isDemoMode && (
                <div className="text-xs text-gray-500 mt-2">
                  Using local mock data. Real-time sync is disabled.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}