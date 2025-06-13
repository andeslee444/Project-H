import React, { useEffect, useState } from 'react';
import { supabaseService } from '../../services/supabaseService';

const WaitlistDebugger = () => {
  const [debugInfo, setDebugInfo] = useState({
    loading: true,
    error: null,
    data: null,
    steps: []
  });

  useEffect(() => {
    const debug = async () => {
      const steps = [];
      
      try {
        // Step 1: Test basic connection
        steps.push('1. Testing Supabase connection...');
        const { data: testData, error: testError } = await supabaseService.getWaitlistEntries();
        
        if (testError) {
          steps.push(`❌ Connection error: ${testError}`);
          setDebugInfo({ loading: false, error: testError, data: null, steps });
          return;
        }
        
        steps.push(`✅ Connected! Found ${testData?.length || 0} entries`);
        
        // Step 2: Check data structure
        if (testData && testData.length > 0) {
          steps.push('2. Checking data structure...');
          const firstEntry = testData[0];
          steps.push(`First entry ID: ${firstEntry.entry_id}`);
          steps.push(`Has patient data: ${firstEntry.patient ? 'Yes' : 'No'}`);
          steps.push(`Has waitlist data: ${firstEntry.waitlist ? 'Yes' : 'No'}`);
          steps.push(`Has provider data: ${firstEntry.provider ? 'Yes' : 'No'}`);
          
          if (firstEntry.patient) {
            steps.push(`Patient name: ${firstEntry.patient.first_name} ${firstEntry.patient.last_name}`);
          }
        }
        
        setDebugInfo({ loading: false, error: null, data: testData, steps });
        
      } catch (err) {
        steps.push(`❌ Unexpected error: ${err.message}`);
        setDebugInfo({ loading: false, error: err.message, data: null, steps });
      }
    };
    
    debug();
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: '#1a1a1a',
      color: '#00ff00',
      padding: '20px',
      borderRadius: '8px',
      maxWidth: '500px',
      maxHeight: '400px',
      overflow: 'auto',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 9999,
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#00ff00' }}>🔍 Waitlist Debugger</h3>
      
      {debugInfo.loading && <div>Loading debug info...</div>}
      
      {debugInfo.steps.map((step, index) => (
        <div key={index} style={{ marginBottom: '5px' }}>{step}</div>
      ))}
      
      {debugInfo.error && (
        <div style={{ color: '#ff0000', marginTop: '10px' }}>
          Error: {debugInfo.error}
        </div>
      )}
      
      {debugInfo.data && (
        <details style={{ marginTop: '10px' }}>
          <summary style={{ cursor: 'pointer' }}>Raw Data ({debugInfo.data.length} entries)</summary>
          <pre style={{ fontSize: '10px', overflow: 'auto' }}>
            {JSON.stringify(debugInfo.data.slice(0, 2), null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default WaitlistDebugger;