import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

export function DebugSupabaseBrowser() {
  const [logs, setLogs] = useState([]);
  
  const addLog = (message) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };
  
  useEffect(() => {
    const runTests = async () => {
      addLog('Starting Supabase debug tests...');
      
      // Test 1: Direct query with Promise tracking
      addLog('Test 1: Direct query with Promise tracking...');
      const test1StartTime = Date.now();
      let test1Resolved = false;
      
      const test1Promise = supabase
        .from('waitlist_entries')
        .select('*')
        .limit(1);
      
      // Add promise resolution tracking
      test1Promise.then((result) => {
        test1Resolved = true;
        const duration = Date.now() - test1StartTime;
        addLog(`Test 1 resolved after ${duration}ms: ${JSON.stringify(result)}`);
      }).catch((error) => {
        test1Resolved = true;
        const duration = Date.now() - test1StartTime;
        addLog(`Test 1 error after ${duration}ms: ${error.message}`);
      });
      
      // Check if promise is hanging
      setTimeout(() => {
        if (!test1Resolved) {
          addLog('Test 1 WARNING: Promise still pending after 5 seconds!');
          
          // Check if the promise object has any internal state we can inspect
          addLog(`Test 1 Promise object: ${Object.keys(test1Promise).join(', ')}`);
          addLog(`Test 1 Promise string: ${test1Promise.toString()}`);
        }
      }, 5000);
      
      // Test 2: Check fetch interception
      addLog('\nTest 2: Checking fetch interception...');
      const originalFetch = window.fetch;
      addLog(`window.fetch is original: ${window.fetch === originalFetch}`);
      addLog(`window.fetch.toString(): ${window.fetch.toString()}`);
      
      // Test 3: Direct fetch call
      addLog('\nTest 3: Direct fetch to Supabase...');
      try {
        const test3StartTime = Date.now();
        const response = await fetch('https://qjsktpjgfwtgpnmsonrq.supabase.co/rest/v1/waitlist_entries?limit=1', {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYyODIsImV4cCI6MjA2NDY0MjI4Mn0.xROzs_OrgHhy97DbND7VcZzGcd9V_QS2G_Cu9DPDf3g',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqc2t0cGpnZnd0Z3BubXNvbnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjYyODIsImV4cCI6MjA2NDY0MjI4Mn0.xROzs_OrgHhy97DbND7VcZzGcd9V_QS2G_Cu9DPDf3g'
          }
        });
        const duration = Date.now() - test3StartTime;
        const data = await response.json();
        addLog(`Test 3 success after ${duration}ms: ${response.status}, data length: ${data.length}`);
      } catch (error) {
        addLog(`Test 3 error: ${error.message}`);
      }
      
      // Test 4: Check Supabase client internals
      addLog('\nTest 4: Checking Supabase client internals...');
      addLog(`Supabase client keys: ${Object.keys(supabase).join(', ')}`);
      addLog(`Supabase auth: ${supabase.auth ? 'exists' : 'missing'}`);
      addLog(`Supabase from: ${supabase.from ? 'exists' : 'missing'}`);
      
      // Test 5: Check for Promise polyfills or modifications
      addLog('\nTest 5: Checking Promise implementation...');
      addLog(`Promise.toString(): ${Promise.toString()}`);
      addLog(`Promise is native: ${Promise.toString().includes('[native code]')}`);
      
      // Test 6: Check for global error handlers
      addLog('\nTest 6: Checking global error handlers...');
      addLog(`window.onerror: ${window.onerror ? 'set' : 'not set'}`);
      addLog(`window.onunhandledrejection: ${window.onunhandledrejection ? 'set' : 'not set'}`);
      
      // Test 7: Check browser extensions or dev tools
      addLog('\nTest 7: Checking for potential interference...');
      addLog(`Browser: ${navigator.userAgent}`);
      addLog(`Dev tools open: ${window.outerHeight - window.innerHeight > 100 ? 'possibly' : 'probably not'}`);
    };
    
    runTests();
  }, []);
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: 'white', 
      padding: '20px',
      overflow: 'auto',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <h2>Supabase Debug Browser Test</h2>
      <pre style={{ whiteSpace: 'pre-wrap' }}>
        {logs.join('\n')}
      </pre>
    </div>
  );
}