import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Users, TrendingUp, Settings, Bell, Activity,
  Clock, DollarSign, Star, AlertCircle, CheckCircle, 
  ChevronRight, MessageSquare, Zap, HandMetal, Timer,
  BarChart3, UserCheck, CalendarCheck, Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickStat {
  label: string;
  value: string;
  change: string;
  icon: React.ElementType;
  color: string;
  trend: 'up' | 'down' | 'neutral';
}

interface Alert {
  id: string;
  type: 'warning' | 'success' | 'info';
  title: string;
  description: string;
  action?: {
    label: string;
    path: string;
  };
}

interface UpcomingAppointment {
  id: string;
  time: string;
  patient: {
    name: string;
    photo?: string;
  };
  type: string;
  status: 'confirmed' | 'pending';
}

const ResyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showNotificationPreview, setShowNotificationPreview] = useState(false);

  const quickStats: QuickStat[] = [
    { 
      label: "Today's Revenue", 
      value: '$2,450', 
      change: '+18%', 
      icon: DollarSign, 
      color: 'green',
      trend: 'up'
    },
    { 
      label: 'Utilization Rate', 
      value: '87%', 
      change: '+5%', 
      icon: Activity, 
      color: 'blue',
      trend: 'up'
    },
    { 
      label: 'Patient Satisfaction', 
      value: '4.9', 
      change: '+0.2', 
      icon: Star, 
      color: 'yellow',
      trend: 'up'
    },
    { 
      label: 'Waitlist Count', 
      value: '23', 
      change: '+8', 
      icon: Users, 
      color: 'purple',
      trend: 'neutral'
    }
  ];

  const alerts: Alert[] = [
    {
      id: '1',
      type: 'warning',
      title: '3 patients likely to no-show',
      description: 'Based on historical patterns, consider sending reminders',
      action: {
        label: 'Send Reminders',
        path: '/patients'
      }
    },
    {
      id: '2',
      type: 'success',
      title: '5 available slots filled today',
      description: 'Your quick-fill notifications had an 83% response rate',
    },
    {
      id: '3',
      type: 'info',
      title: 'Thursday 3-5pm underutilized',
      description: 'Consider offering special rates or targeting waitlist',
      action: {
        label: 'View Analytics',
        path: '/analytics'
      }
    }
  ];

  const upcomingAppointments: UpcomingAppointment[] = [
    {
      id: '1',
      time: '9:00 AM',
      patient: { name: 'Sarah Johnson', photo: 'https://i.pravatar.cc/150?img=1' },
      type: 'Follow-up',
      status: 'confirmed'
    },
    {
      id: '2',
      time: '10:00 AM',
      patient: { name: 'Michael Chen', photo: 'https://i.pravatar.cc/150?img=2' },
      type: 'Initial Consultation',
      status: 'pending'
    },
    {
      id: '3',
      time: '11:30 AM',
      patient: { name: 'Emma Davis', photo: 'https://i.pravatar.cc/150?img=3' },
      type: 'Follow-up',
      status: 'confirmed'
    }
  ];

  const quickActions = [
    {
      label: 'View Schedule',
      icon: Calendar,
      path: '/schedule',
      color: 'blue',
      description: 'Manage your availability'
    },
    {
      label: 'Waitlist',
      icon: Users,
      path: '/waitlist',
      color: 'green',
      description: '23 patients waiting',
      badge: '3 🤚'
    },
    {
      label: 'Quick Fill',
      icon: Zap,
      action: () => setShowNotificationPreview(true),
      color: 'yellow',
      description: 'Fill empty slots'
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      path: '/analytics',
      color: 'purple',
      description: 'View insights'
    }
  ];

  const navigationCards = [
    {
      title: 'Patient Management',
      description: 'View and manage all patients with smart filters',
      icon: UserCheck,
      path: '/patients',
      stats: { active: 156, new: 12 }
    },
    {
      title: 'Team Dashboard',
      description: 'Monitor provider performance and availability',
      icon: Users,
      path: '/providers',
      stats: { providers: 8, avgUtilization: '85%' }
    },
    {
      title: 'Quick Controls',
      description: 'Instant settings and notification preferences',
      icon: Settings,
      path: '/settings',
      stats: { rules: 12, integrations: 4 }
    }
  ];

  const handleQuickAction = (action: any) => {
    if (action.path) {
      navigate(action.path);
    } else if (action.action) {
      action.action();
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertCircle;
      case 'success': return CheckCircle;
      case 'info': return Bell;
      default: return Bell;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'yellow';
      case 'success': return 'green';
      case 'info': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, Dr. Chen</h1>
              <p className="text-gray-600">Tuesday, January 30, 2024</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Next patient in</p>
                <p className="text-lg font-semibold text-blue-600">45 minutes</p>
              </div>
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
                <span className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 
                  stat.trend === 'down' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleQuickAction(action)}
              className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-all hover:scale-105 text-left"
            >
              <div className="flex items-start justify-between mb-2">
                <action.icon className={`w-6 h-6 text-${action.color}-600`} />
                {action.badge && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                    {action.badge}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900">{action.label}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Today's Schedule</h2>
              <button 
                onClick={() => navigate('/schedule')}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View Full Schedule
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {upcomingAppointments.map((appointment) => (
                <motion.div
                  key={appointment.id}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate('/schedule')}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={appointment.patient.photo || `https://ui-avatars.com/api/?name=${appointment.patient.name}`}
                      alt={appointment.patient.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{appointment.patient.name}</p>
                      <p className="text-sm text-gray-600">{appointment.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{appointment.time}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      appointment.status === 'confirmed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </motion.div>
              ))}
              
              {/* Available Slots Preview */}
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-900">4 open slots today</p>
                    <p className="text-sm text-green-700">Click to fill from waitlist</p>
                  </div>
                  <button 
                    onClick={() => navigate('/waitlist')}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Quick Fill
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts & Insights */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Insights & Alerts</h2>
            </div>
            <div className="p-4 space-y-3">
              {alerts.map((alert) => {
                const Icon = getAlertIcon(alert.type);
                const color = getAlertColor(alert.type);
                
                return (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border bg-${color}-50 border-${color}-200`}
                  >
                    <div className="flex items-start gap-2">
                      <Icon className={`w-5 h-5 text-${color}-600 mt-0.5`} />
                      <div className="flex-1">
                        <h4 className={`font-medium text-${color}-900`}>
                          {alert.title}
                        </h4>
                        <p className={`text-sm text-${color}-700 mt-1`}>
                          {alert.description}
                        </p>
                        {alert.action && (
                          <button
                            onClick={() => navigate(alert.action!.path)}
                            className={`mt-2 text-sm font-medium text-${color}-700 hover:text-${color}-800`}
                          >
                            {alert.action.label} →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {navigationCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              onClick={() => navigate(card.path)}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <card.icon className="w-8 h-8 text-gray-600 group-hover:text-blue-600 transition-colors" />
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{card.description}</p>
              <div className="flex gap-4 text-sm">
                {Object.entries(card.stats).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-gray-500">{key}:</span>
                    <span className="font-medium ml-1">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature Callout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                🚀 New: Type "3pm" to instantly fill slots
              </h3>
              <p className="text-blue-100">
                Use our Quick Entry feature to type times like "3pm" or "tue 2:30" and instantly notify matched patients
              </p>
            </div>
            <button
              onClick={() => navigate('/schedule')}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Try it Now
            </button>
          </div>
        </motion.div>
      </div>

      {/* Quick Notification Preview Modal */}
      <AnimatePresence>
        {showNotificationPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNotificationPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Quick Fill Options</h3>
              
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    setShowNotificationPreview(false);
                    navigate('/schedule');
                  }}
                  className="w-full p-4 border rounded-lg hover:bg-gray-50 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Type Time Entry</p>
                      <p className="text-sm text-gray-600">Type "3pm" to jump to slot</p>
                    </div>
                    <Clock className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
                
                <button 
                  onClick={() => {
                    setShowNotificationPreview(false);
                    navigate('/waitlist');
                  }}
                  className="w-full p-4 border rounded-lg hover:bg-gray-50 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notify Waitlist</p>
                      <p className="text-sm text-gray-600">23 patients waiting</p>
                    </div>
                    <Users className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
                
                <button 
                  onClick={() => {
                    setShowNotificationPreview(false);
                    navigate('/analytics');
                  }}
                  className="w-full p-4 border rounded-lg hover:bg-gray-50 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">View Suggestions</p>
                      <p className="text-sm text-gray-600">AI-powered recommendations</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
              </div>
              
              <button
                onClick={() => setShowNotificationPreview(false)}
                className="mt-4 w-full px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResyDashboard;