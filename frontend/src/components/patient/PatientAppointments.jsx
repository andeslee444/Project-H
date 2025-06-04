import React from 'react';
import { motion } from 'framer-motion';

const PatientAppointments = () => {
  const appointments = [
    {
      id: 1,
      provider: 'Dr. Sarah Johnson',
      specialty: 'Clinical Psychologist',
      date: 'Tomorrow',
      time: '2:00 PM',
      type: 'Video Session',
      status: 'confirmed'
    },
    {
      id: 2,
      provider: 'Dr. Michael Chen',
      specialty: 'Psychiatrist',
      date: 'Next Monday',
      time: '10:00 AM',
      type: 'In-Person',
      status: 'confirmed'
    },
    {
      id: 3,
      provider: 'Dr. Sarah Johnson',
      specialty: 'Clinical Psychologist',
      date: 'Dec 15, 2024',
      time: '2:00 PM',
      type: 'Video Session',
      status: 'completed'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Appointments</h1>
        
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{appointment.provider}</h3>
                  <p className="text-sm text-gray-600">{appointment.specialty}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <span className="flex items-center space-x-1">
                      <span>📅</span>
                      <span>{appointment.date}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span>🕐</span>
                      <span>{appointment.time}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span>{appointment.type === 'Video Session' ? '🎥' : '🏥'}</span>
                      <span>{appointment.type}</span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {appointment.status === 'confirmed' && (
                    <>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Confirmed
                      </span>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Join Session
                      </button>
                    </>
                  )}
                  {appointment.status === 'completed' && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      Completed
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-6 w-full bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 transition-colors"
        >
          Book New Appointment
        </motion.button>
      </motion.div>
    </div>
  );
};

export default PatientAppointments;