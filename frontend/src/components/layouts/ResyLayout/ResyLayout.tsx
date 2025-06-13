import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, Users, BarChart3, Settings, LogOut, 
  Clock, Home, Bell, Menu, X, ChevronDown,
  Activity, UserPlus, Shield, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuthFixed';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  color?: string;
}

const ResyLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);

  const navigation: NavItem[] = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: Home,
      color: 'blue'
    },
    { 
      path: '/waitlist', 
      label: 'Waitlist', 
      icon: UserPlus,
      badge: 15,
      color: 'yellow'
    },
    { 
      path: '/schedule', 
      label: 'Schedule', 
      icon: Calendar,
      color: 'green'
    },
    { 
      path: '/patients', 
      label: 'Patients', 
      icon: Users,
      badge: 3,
      color: 'purple'
    },
    { 
      path: '/providers', 
      label: 'Team', 
      icon: Shield,
      color: 'indigo'
    },
    { 
      path: '/analytics', 
      label: 'Insights', 
      icon: BarChart3,
      color: 'pink'
    },
    { 
      path: '/settings', 
      label: 'Controls', 
      icon: Settings,
      color: 'gray'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b fixed top-0 left-0 right-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="ml-4 lg:ml-0 flex items-center gap-2">
                <Activity className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold">MindCare</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`relative px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className={`absolute -top-1 -right-1 px-2 py-0.5 text-xs rounded-full ${
                      item.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                      item.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Quick Stats */}
              <div className="hidden md:flex items-center gap-4 mr-4">
                <div className="text-sm">
                  <span className="text-gray-500">Today:</span>
                  <span className="ml-1 font-semibold">23 patients</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Available:</span>
                  <span className="ml-1 font-semibold text-green-600">Now</span>
                </div>
              </div>

              {/* Notifications */}
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.email?.[0].toUpperCase() || 'U'}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                <AnimatePresence>
                  {profileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b">
                        <p className="text-sm font-medium">{user?.email}</p>
                        <p className="text-xs text-gray-500">{user?.role}</p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => navigate('/settings')}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                        >
                          Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded text-red-600"
                        >
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="lg:hidden border-t overflow-hidden"
            >
              <nav className="px-4 py-2">
                {navigation.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full px-4 py-3 rounded-lg mb-1 flex items-center gap-3 ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className={`ml-auto px-2 py-0.5 text-xs rounded-full ${
                        item.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                        item.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area */}
      <main className="pt-16">
        <div className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </div>
      </main>

      {/* Quick Action Button (Mobile) */}
      <button className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
        <Zap className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ResyLayout;