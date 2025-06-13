import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, Users, BarChart3, Settings, Home, Activity, UserPlus, Shield
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  color?: string;
}

interface PublicNavWrapperProps {
  children: React.ReactNode;
}

const PublicNavWrapper: React.FC<PublicNavWrapperProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

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
      badge: 23,
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

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b fixed top-0 left-0 right-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-2">
              <Activity className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold">MindCare</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                    isActive(item.path)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                      item.color === 'green' ? 'bg-green-100 text-green-700' :
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

            {/* Demo Mode Indicator */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Demo Mode</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-16">
        <div className="min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </main>
    </div>
  );
};

export default PublicNavWrapper;