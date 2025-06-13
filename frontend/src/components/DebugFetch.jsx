import React, { useEffect, useState } from 'react';

export function DebugFetch() {
  const [debugInfo, setDebugInfo] = useState({});
  
  useEffect(() => {
    // Check if fetch has been modified
    const fetchString = window.fetch.toString();
    const isNativeFetch = fetchString.includes('[native code]');
    
    // Store original fetch reference safely
    // Use the global fetch if available, or create a backup
    const originalFetch = window.originalFetch || window.fetch;
    
    const info = {
      fetchIsNative: isNativeFetch,
      fetchString: fetchString.substring(0, 200) + '...',
      fetchEquals: window.fetch === originalFetch,
      hasFetchInterceptor: !isNativeFetch,
      timestamp: new Date().toISOString()
    };
    
    console.log('DEBUG: Fetch inspection:', info);
    setDebugInfo(info);
    
    // Test direct fetch to Supabase
    const testSupabase = async () => {
      try {
        console.log('Testing direct fetch with original fetch...');
        const response = await originalFetch('https://qjsktpjgfwtgpnmsonrq.supabase.co/rest/v1/waitlist_entries?limit=1', {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYyODIsImV4cCI6MjA2NDY0MjI4Mn0.xROzs_OrgHhy97DbND7VcZzGcd9V_QS2G_Cu9DPDf3g',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYyODIsImV4cCI6MjA2NDY0MjI4Mn0.xROzs_OrgHhy97DbND7VcZzGcd9V_QS2G_Cu9DPDf3g'
          }
        });
        const data = await response.json();
        console.log('Original fetch success:', data);
        setDebugInfo(prev => ({ ...prev, originalFetchWorks: true, supabaseData: data }));
      } catch (error) {
        console.error('Original fetch error:', error);
        setDebugInfo(prev => ({ ...prev, originalFetchWorks: false, originalFetchError: error.message }));
      }
    };
    
    testSupabase();
  }, []);
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 20, 
      right: 20, 
      background: 'white', 
      border: '2px solid red',
      padding: '10px',
      maxWidth: '400px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>Fetch Debug Info</h4>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
}