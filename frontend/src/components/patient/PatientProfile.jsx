import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth-mock.jsx';

const PatientProfile = () => {
  const { user, logout } = useAuth();

  const profileSections = [
    {
      title: 'Personal Information',
      items: [
        { label: 'Full Name', value: user?.firstName || 'Sarah Thompson', icon: '👤' },
        { label: 'Email', value: user?.email || 'sarah.thompson@email.com', icon: '✉️' },
        { label: 'Phone', value: '+1 (555) 123-4567', icon: '📱' },
        { label: 'Date of Birth', value: 'March 15, 1990', icon: '🎂' }
      ]
    },
    {
      title: 'Emergency Contact',
      items: [
        { label: 'Name', value: 'John Thompson', icon: '🆘' },
        { label: 'Relationship', value: 'Spouse', icon: '💑' },
        { label: 'Phone', value: '+1 (555) 987-6543', icon: '📞' }
      ]
    }
  ];

  const quickActions = [
    { label: 'Insurance Information', icon: '🏥', color: 'bg-blue-100 text-blue-700' },
    { label: 'Medical History', icon: '📋', color: 'bg-green-100 text-green-700' },
    { label: 'Preferences', icon: '⚙️', color: 'bg-purple-100 text-purple-700' },
    { label: 'Privacy Settings', icon: '🔒', color: 'bg-gray-100 text-gray-700' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-3xl text-white font-bold">
              {(user?.firstName || 'S')[0]}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user?.firstName || 'Sarah Thompson'}</h1>
            <p className="text-gray-600">Patient ID: #PT-2024-1234</p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">15</p>
            <p className="text-sm text-gray-600">Sessions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">92%</p>
            <p className="text-sm text-gray-600">Attendance</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">7.5</p>
            <p className="text-sm text-gray-600">Mood Avg</p>
          </div>
        </div>
      </motion.div>

      {/* Profile Information */}
      {profileSections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (sectionIndex + 1) * 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{section.title}</h2>
          <div className="space-y-3">
            {section.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="font-medium text-gray-900">{item.value}</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm">
                  Edit
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`${action.color} p-4 rounded-xl text-left transition-all`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{action.icon}</span>
                <span className="font-medium">{action.label}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Logout Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="w-full bg-red-600 text-white rounded-xl py-3 font-medium hover:bg-red-700 transition-colors"
        >
          Sign Out
        </motion.button>
      </motion.div>
    </div>
  );
};

export default PatientProfile;