import React from 'react';
import { motion } from 'framer-motion';

const PatientMessages = () => {
  const messages = [
    {
      id: 1,
      from: 'Dr. Sarah Johnson',
      preview: 'Hi! Just wanted to check in on how you\'re feeling after our last session...',
      time: '2 hours ago',
      unread: true,
      avatar: '👩‍⚕️'
    },
    {
      id: 2,
      from: 'Care Team',
      preview: 'Your prescription refill is ready for pickup at the pharmacy.',
      time: 'Yesterday',
      unread: false,
      avatar: '🏥'
    },
    {
      id: 3,
      from: 'Dr. Michael Chen',
      preview: 'Please remember to complete the mood assessment before our next appointment.',
      time: '3 days ago',
      unread: false,
      avatar: '👨‍⚕️'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
        
        <div className="space-y-3">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl cursor-pointer transition-all ${
                message.unread 
                  ? 'bg-blue-50 hover:bg-blue-100 border border-blue-200' 
                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{message.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold ${message.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                      {message.from}
                    </h3>
                    <span className="text-xs text-gray-500">{message.time}</span>
                  </div>
                  <p className={`text-sm mt-1 ${message.unread ? 'text-gray-800' : 'text-gray-600'}`}>
                    {message.preview}
                  </p>
                </div>
                {message.unread && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-6 w-full bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 transition-colors"
        >
          Compose New Message
        </motion.button>
      </motion.div>
    </div>
  );
};

export default PatientMessages;