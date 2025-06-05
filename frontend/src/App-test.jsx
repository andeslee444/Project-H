import React from 'react';

function App() {
  console.log('App-test.jsx rendering');
  
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333' }}>🧠 MindfulMatch Test</h1>
      <p>If you can see this, React is working correctly!</p>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>Debug Information:</h2>
        <ul>
          <li>✅ React is rendering</li>
          <li>✅ CSS styles are working</li>
          <li>✅ App component loaded successfully</li>
          <li>Current time: {new Date().toLocaleString()}</li>
        </ul>
      </div>
    </div>
  );
}

export default App;