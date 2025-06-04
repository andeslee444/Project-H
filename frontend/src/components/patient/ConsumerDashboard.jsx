import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../ui/HealthcareIcons';
import { cn } from '../../utils/cn';

const ConsumerDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  
  // Mock user data
  const user = {
    firstName: 'Sarah',
    avatar: null,
    nextAppointment: {
      provider: 'Dr. Johnson',
      date: 'Tomorrow',
      time: '2:00 PM',
      type: 'Virtual Session',
      id: 1
    },
    progress: {
      week: 4,
      total: 12,
      percentage: 67,
      streak: 3
    }
  };

  const quickActions = [
    {
      id: 'book',
      title: 'Book Session',
      subtitle: 'Schedule appointment',
      icon: <Icons.Calendar className="w-6 h-6" />,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'chat',
      title: 'Message',
      subtitle: 'Chat with provider',
      icon: <Icons.Mail className="w-6 h-6" />,
      color: 'green',
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'track',
      title: 'Track Progress',
      subtitle: 'View insights',
      icon: <Icons.TrendUp className="w-6 h-6" />,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'resources',
      title: 'Resources',
      subtitle: 'Self-help tools',
      icon: <Icons.Heart className="w-6 h-6" />,
      color: 'pink',
      gradient: 'from-pink-500 to-pink-600'
    }
  ];

  const upcomingAppointments = [
    {
      id: 1,
      provider: 'Dr. Johnson',
      type: 'Therapy Session',
      date: 'Tomorrow',
      time: '2:00 PM',
      isVirtual: true,
      status: 'confirmed'
    },
    {
      id: 2,
      provider: 'Dr. Williams',
      type: 'Medication Review',
      date: 'Next Week',
      time: '10:00 AM',
      isVirtual: false,
      status: 'pending'
    }
  ];

  const wellnessInsights = [
    {
      id: 1,
      title: 'Mood Tracking',
      value: '7.2/10',
      trend: 'up',
      description: 'Average this week',
      color: 'green'
    },
    {
      id: 2,
      title: 'Sleep Quality',
      value: '6.8hrs',
      trend: 'stable',
      description: 'Average per night',
      color: 'blue'
    },
    {
      id: 3,
      title: 'Anxiety Level',
      value: 'Low',
      trend: 'down',
      description: 'Improving',
      color: 'green'
    }
  ];

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <Icons.TrendUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <Icons.TrendDown className="w-4 h-4 text-red-500" />;
    return <Icons.ArrowRight className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">{user.firstName[0]}</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Good morning, {user.firstName} ☀️
                </h1>
                <p className="text-sm text-gray-600">How are you feeling today?</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <Icons.Bell className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <Icons.Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Next Appointment Card */}
        {user.nextAppointment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-blue-100 text-sm font-medium mb-1">Your next appointment</p>
                <h3 className="text-xl font-bold mb-2">{user.nextAppointment.provider}</h3>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Icons.Calendar className="w-4 h-4" />
                    <span>{user.nextAppointment.date}, {user.nextAppointment.time}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icons.Stethoscope className="w-4 h-4" />
                    <span>{user.nextAppointment.type}</span>
                  </div>
                </div>
              </div>
              <Icons.ArrowRight className="w-6 h-6 opacity-80" />
            </div>
            
            <div className="flex space-x-3 mt-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl py-3 px-4 text-center font-medium hover:bg-white/30 transition-colors"
              >
                Join Call
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl py-3 px-4 text-center font-medium hover:bg-white/20 transition-colors"
              >
                Reschedule
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "bg-gradient-to-br text-white rounded-2xl p-6 text-left shadow-sm hover:shadow-md transition-all",
                  action.gradient
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  {action.icon}
                  <Icons.ArrowRight className="w-4 h-4 opacity-80" />
                </div>
                <h3 className="font-semibold text-base mb-1">{action.title}</h3>
                <p className="text-sm opacity-90">{action.subtitle}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Progress Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Progress</h2>
            <span className="text-sm text-gray-600">Week {user.progress.week} of {user.progress.total}</span>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Treatment Progress</span>
              <span className="text-sm font-medium text-blue-600">{user.progress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${user.progress.percentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{user.progress.streak}</div>
              <div className="text-xs text-gray-600">Day Streak</div>
            </div>
            <div className="flex-1 text-center">
              <p className="text-sm text-gray-600">
                "You're doing great! Keep up the excellent work." 🌟
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
              View Details
            </button>
          </div>
        </motion.div>

        {/* Wellness Insights */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Wellness Insights</h2>
          <div className="grid grid-cols-1 gap-3">
            {wellnessInsights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    insight.color === 'green' && "bg-green-500",
                    insight.color === 'blue' && "bg-blue-500",
                    insight.color === 'yellow' && "bg-yellow-500"
                  )} />
                  <div>
                    <h3 className="font-medium text-gray-900">{insight.title}</h3>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">{insight.value}</span>
                  {getTrendIcon(insight.trend)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming</h2>
            <button className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors">
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {upcomingAppointments.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Icons.Stethoscope className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{appointment.provider}</h3>
                      <p className="text-sm text-gray-600">{appointment.type}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                        <span>{appointment.date} at {appointment.time}</span>
                        {appointment.isVirtual && (
                          <>
                            <span>•</span>
                            <span className="text-blue-600">Virtual</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {appointment.status === 'confirmed' && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                    <Icons.ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 border border-purple-200"
        >
          <div className="flex items-center space-x-3 mb-3">
            <Icons.Heart className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-purple-900">Need Support?</h3>
          </div>
          <p className="text-purple-700 text-sm mb-4">
            Access 24/7 crisis support, self-help resources, and emergency contacts.
          </p>
          <div className="flex space-x-3">
            <button className="flex-1 bg-white/50 backdrop-blur-sm rounded-xl py-3 px-4 text-center font-medium text-purple-700 hover:bg-white/70 transition-colors">
              Crisis Support
            </button>
            <button className="flex-1 bg-purple-600 rounded-xl py-3 px-4 text-center font-medium text-white hover:bg-purple-700 transition-colors">
              Self-Help Tools
            </button>
          </div>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 px-4 py-2 safe-area-padding-bottom">
        <div className="flex items-center justify-around">
          {[
            { id: 'home', icon: Icons.Home, label: 'Home' },
            { id: 'appointments', icon: Icons.Calendar, label: 'Appointments' },
            { id: 'messages', icon: Icons.Mail, label: 'Messages' },
            { id: 'profile', icon: Icons.User, label: 'Profile' }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors",
                activeTab === tab.id 
                  ? "text-blue-600 bg-blue-50" 
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConsumerDashboard;