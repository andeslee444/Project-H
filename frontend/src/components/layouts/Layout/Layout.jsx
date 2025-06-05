import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import './Layout.css';

const Layout = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };
  return (
    <div className="layout">
      <header className="header">
        <div className="logo">
          <Link to="/dashboard">
            <h1>MindfulMatch</h1>
            <span>Mental Health Scheduling System</span>
          </Link>
        </div>
        <div className="header-right">
          <div className="notifications">
            <span className="notification-icon">🔔</span>
            <span className="notification-badge">3</span>
          </div>
          <div className="user-profile">
            <span className="user-avatar">👤</span>
            <div className="user-dropdown">
              <span className="user-name">Dr. Johnson</span>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="main-container">
        <aside className="sidebar">
          <nav className="nav-menu">
            <ul>
              <li>
                <Link to="/dashboard" className="nav-link">
                  <span className="nav-icon">📊</span>
                  <span className="nav-text">Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/waitlist" className="nav-link">
                  <span className="nav-icon">📋</span>
                  <span className="nav-text">Waitlist</span>
                </Link>
              </li>
              <li>
                <Link to="/schedule" className="nav-link">
                  <span className="nav-icon">📅</span>
                  <span className="nav-text">Schedule</span>
                </Link>
              </li>
              <li>
                <Link to="/patients" className="nav-link">
                  <span className="nav-icon">👥</span>
                  <span className="nav-text">Patients</span>
                </Link>
              </li>
              <li>
                <Link to="/providers" className="nav-link">
                  <span className="nav-icon">👨‍⚕️</span>
                  <span className="nav-text">Providers</span>
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="nav-link">
                  <span className="nav-icon">📈</span>
                  <span className="nav-text">Analytics</span>
                </Link>
              </li>
              <li>
                <Link to="/settings" className="nav-link">
                  <span className="nav-icon">⚙️</span>
                  <span className="nav-text">Settings</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
        
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
