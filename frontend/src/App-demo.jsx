import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PatientDashboard from './components/patient/PatientDashboard';
import './App.css';
import './styles/index.css';

function App() {
  return (
    <Router basename="/Project-H">
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/patient" replace />} />
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="*" element={<Navigate to="/patient" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;