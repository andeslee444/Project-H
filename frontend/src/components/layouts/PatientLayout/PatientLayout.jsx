import React from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth-mock.jsx';
import { motion } from 'framer-motion';

const PatientLayout = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  // Bottom navigation items
  const bottomNavItems = [
    {
      path: '/patient/dashboard',
      label: 'Home',
      icon: '🏠',
      activeIcon: '🏠'
    },
    {
      path: '/patient/appointments',
      label: 'Appointments',
      icon: '📅',
      activeIcon: '📅'
    },
    {
      path: '/patient/messages',
      label: 'Messages',
      icon: '💬',
      activeIcon: '💬'
    },
    {
      path: '/patient/profile',
      label: 'Profile',
      icon: '👤',
      activeIcon: '👤'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Simple Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">MindfulMatch</h1>
                <p className="text-xs text-gray-500">Mental Health Care</p>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5-5 5h5zM15 17h5l-5-5-5 5h5zM12 15v-3a3 3 0 0 0-6 0v3c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2z" />
                  </svg>
                </button>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  2
                </div>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{auth.user?.firstName || 'Patient'}</p>
                  <p className="text-xs text-gray-500">Patient Portal</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {(auth.user?.firstName || 'P')[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700 text-sm px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-screen">
        <Outlet />
      </main>

      {/* Bottom Navigation Bar - Always visible */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-around">
            {bottomNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center space-y-1 px-6 py-3 rounded-lg transition-all duration-200 relative ${
                    isActive 
                      ? 'text-blue-600' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  
                  {/* Icon with animation */}
                  <motion.span 
                    className="text-2xl"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isActive ? item.activeIcon : item.icon}
                  </motion.span>
                  
                  {/* Label */}
                  <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientLayout;