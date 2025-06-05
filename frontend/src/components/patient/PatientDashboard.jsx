import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth-mock.jsx';
import MoodTracker from './MoodTracker.jsx';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const scrollToMoodTracker = () => {
    document.getElementById('mood-tracker')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    });
  };

  const quickActions = [
    {
      title: 'Book Session',
      subtitle: 'Schedule your next appointment',
      icon: '📅',
      color: 'from-blue-500 to-blue-600',
      action: () => console.log('Book session'),
    },
    {
      title: 'Message Provider',
      subtitle: 'Secure messaging with your care team',
      icon: '💬',
      color: 'from-green-500 to-green-600',
      action: () => console.log('Message provider'),
    },
    {
      title: 'Log Mood',
      subtitle: 'Track how you\'re feeling today',
      icon: '😊',
      color: 'from-purple-500 to-purple-600',
      action: scrollToMoodTracker,
    },
    {
      title: 'Resources',
      subtitle: 'Access self-care tools and guides',
      icon: '🌱',
      color: 'from-teal-500 to-teal-600',
      action: () => console.log('Resources'),
    },
  ];

  const upcomingAppointment = {
    provider: 'Dr. Sarah Johnson',
    specialty: 'Clinical Psychologist',
    date: 'Tomorrow',
    time: '2:00 PM',
    type: 'Video Session',
    duration: '50 minutes'
  };

  const wellnessStats = [
    { label: 'Mood Average', value: '7.2', unit: '/10', trend: '+0.3', color: 'text-green-600' },
    { label: 'Sleep Quality', value: '6.8', unit: 'hrs', trend: '+0.5', color: 'text-blue-600' },
    { label: 'Check-ins', value: '12', unit: '/14', trend: '86%', color: 'text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getGreeting()}, {user?.firstName || 'Patient'} ✨
              </h1>
              <p className="text-gray-600 mt-1">How are you feeling today? Let&apos;s check in on your wellness journey.</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-2xl text-white font-bold">
                {(user?.firstName || 'P')[0]}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Next Appointment Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-blue-100 text-sm font-medium">Your Next Session</span>
              </div>
              <h3 className="text-xl font-bold mb-1">{upcomingAppointment.provider}</h3>
              <p className="text-blue-100 text-sm mb-3">{upcomingAppointment.specialty}</p>
              
              <div className="space-y-1 text-sm">
                <div className="flex items-center space-x-2">
                  <span>📅</span>
                  <span>{upcomingAppointment.date} at {upcomingAppointment.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>🎥</span>
                  <span>{upcomingAppointment.type} • {upcomingAppointment.duration}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-medium hover:bg-white/30 transition-colors"
              >
                Join Session
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-medium hover:bg-white/20 transition-colors"
              >
                Reschedule
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Wellness Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Wellness Overview</h2>
          <div className="grid grid-cols-3 gap-4">
            {wellnessStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}<span className="text-sm text-gray-500">{stat.unit}</span>
                </div>
                <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
                <div className={`text-xs font-medium ${stat.color}`}>
                  ↗ {stat.trend} this week
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={action.action}
                className={`bg-gradient-to-br ${action.color} text-white rounded-xl p-4 text-left shadow-md hover:shadow-lg transition-all`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{action.icon}</span>
                  <svg className="w-5 h-5 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="font-semibold text-base mb-1">{action.title}</h3>
                <p className="text-sm opacity-90">{action.subtitle}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Mood Tracker - Replaces Treatment Progress */}
        <div id="mood-tracker">
          <MoodTracker />
        </div>

        {/* Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl shadow-lg p-6 border border-pink-200"
        >
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">💝</span>
            <h3 className="text-lg font-semibold text-purple-900">Need Support?</h3>
          </div>
          <p className="text-purple-700 text-sm mb-4">
            Remember, seeking help is a sign of strength. We&apos;re here for you 24/7.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/70 backdrop-blur-sm rounded-xl py-3 px-4 text-center font-medium text-purple-700 hover:bg-white/90 transition-colors"
            >
              🆘 Crisis Support
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-purple-600 rounded-xl py-3 px-4 text-center font-medium text-white hover:bg-purple-700 transition-colors"
            >
              🧘 Self-Care Tools
            </motion.button>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[
              { icon: '📝', action: 'Completed mood check-in', time: '2 hours ago', color: 'text-green-600' },
              { icon: '💬', action: 'Message from Dr. Johnson', time: '1 day ago', color: 'text-blue-600' },
              { icon: '🎯', action: 'Completed breathing exercise', time: '2 days ago', color: 'text-purple-600' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">{activity.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${activity.color.replace('text-', 'bg-')}`}></div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientDashboard;