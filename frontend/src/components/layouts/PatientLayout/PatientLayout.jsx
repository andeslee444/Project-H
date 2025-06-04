import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import './PatientLayout.css';

import { useAuth } from '../../../App';

const PatientLayout = ({ children }) => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };
  return (
    <div className="patient-layout">
      <header className="patient-header">
        <div className="logo">
          <Link to="/patient/dashboard">
            <h1>MindfulMatch</h1>
            <p>Mental Health Scheduling System</p>
          </Link>
        </div>
        <div className="user-info">
          <div className="notifications">
            <span className="notification-icon">🔔</span>
            <span className="notification-badge">2</span>
          </div>
          <div className="user">
            <span className="user-avatar">👤</span>
            <span className="user-name">Patient</span>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>
      
      <div className="patient-content">
        <nav className="patient-sidebar">
          <ul>
            <li>
              <Link to="/patient/dashboard">
                <span className="icon">📊</span>
                <span>My Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/patient/appointments">
                <span className="icon">📅</span>
                <span>My Appointments</span>
              </Link>
            </li>
            <li>
              <Link to="/patient/messages">
                <span className="icon">✉️</span>
                <span>Messages</span>
              </Link>
            </li>
            <li>
              <Link to="/patient/profile">
                <span className="icon">👤</span>
                <span>My Profile</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        <main className="patient-main">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default PatientLayout;
