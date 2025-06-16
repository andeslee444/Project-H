import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  LogOut, Bell, ChevronDown, Activity, UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuthFixed';

const WaitlistLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simplified Top Navigation Bar */}
      <header className="bg-white border-b fixed top-0 left-0 right-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <Activity className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold">MindCare</span>
              </div>
            </div>

            {/* Center Title */}
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-gray-600" />
              <h1 className="text-lg font-semibold text-gray-900">Waitlist Management</h1>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Quick Stats */}
              <div className="hidden md:flex items-center gap-4 mr-4">
                <div className="text-sm">
                  <span className="text-gray-500">Waiting:</span>
                  <span className="ml-1 font-semibold">15 patients</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Priority:</span>
                  <span className="ml-1 font-semibold text-red-600">3 urgent</span>
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
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded text-red-600 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
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
      </header>

      {/* Main Content Area */}
      <main className="pt-16">
        <div className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default WaitlistLayout;