import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuthFixed';
import './Layout.css';

const Layout = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };
  
  // Get display name based on user role
  const getDisplayName = () => {
    // Check for demo mode first
    const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
    const storedDemoUser = localStorage.getItem('demoUser');
    
    if (isDemoMode && storedDemoUser) {
      try {
        const demoUser = JSON.parse(storedDemoUser);
        if (demoUser.role === 'admin') {
          return 'Admin';
        } else if (demoUser.role === 'provider') {
          const title = demoUser.title || 'Dr.';
          const lastName = demoUser.last_name || demoUser.lastName || 'Provider';
          return `${title} ${lastName}`;
        } else if (demoUser.role === 'patient') {
          const firstName = demoUser.first_name || demoUser.firstName || '';
          const lastName = demoUser.last_name || demoUser.lastName || '';
          return `${firstName} ${lastName}`.trim() || 'Patient';
        }
      } catch (e) {
        console.error('Error parsing demo user:', e);
      }
    }
    
    if (!auth.user) return 'User';
    
    if (auth.user.role === 'admin' || auth.user.role === 'super_admin') {
      return 'Admin';
    } else if (auth.user.role === 'provider') {
      // For providers, show their name with title
      const firstName = auth.user.first_name || auth.user.firstName || '';
      const lastName = auth.user.last_name || auth.user.lastName || '';
      const title = auth.user.title || 'Dr.';
      
      if (firstName || lastName) {
        return `${title} ${lastName || firstName}`;
      }
      return 'Provider';
    } else if (auth.user.role === 'patient') {
      const firstName = auth.user.first_name || auth.user.firstName || '';
      const lastName = auth.user.last_name || auth.user.lastName || '';
      
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
      return 'Patient';
    }
    
    return 'User';
  };
  
  // Get avatar emoji based on role
  const getAvatarEmoji = () => {
    // Check for demo mode first
    const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
    const storedDemoUser = localStorage.getItem('demoUser');
    
    if (isDemoMode && storedDemoUser) {
      try {
        const demoUser = JSON.parse(storedDemoUser);
        switch (demoUser.role) {
          case 'admin':
          case 'super_admin':
            return '👨‍💼';
          case 'provider':
            return '👨‍⚕️';
          case 'patient':
            return '🧑';
          default:
            return '👤';
        }
      } catch (e) {
        console.error('Error parsing demo user:', e);
      }
    }
    
    if (!auth.user) return '👤';
    
    switch (auth.user.role) {
      case 'admin':
      case 'super_admin':
        return '👨‍💼';
      case 'provider':
        return '👨‍⚕️';
      case 'patient':
        return '🧑';
      default:
        return '👤';
    }
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
            <span className="user-avatar">{getAvatarEmoji()}</span>
            <div className="user-dropdown">
              <span className="user-name">{getDisplayName()}</span>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="main-container">
        <aside className="sidebar">
          <nav className="nav-menu">
            <ul>
              <li className="nav-section-header">
                <span className="nav-text">New Experience</span>
              </li>
              <li>
                <Link to="/dashboard" className="nav-link">
                  <span className="nav-icon">✨</span>
                  <span className="nav-text">Dashboard (New)</span>
                </Link>
              </li>
              <li>
                <Link to="/" className="nav-link" target="_blank">
                  <span className="nav-icon">🏠</span>
                  <span className="nav-text">Patient Portal</span>
                </Link>
              </li>
              <li className="nav-section-header">
                <span className="nav-text">Classic Features</span>
              </li>
              <li>
                <Link to="/dashboard-old" className="nav-link">
                  <span className="nav-icon">📊</span>
                  <span className="nav-text">Dashboard (Classic)</span>
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
