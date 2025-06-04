import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../ui/HealthcareIcons';
import { cn } from '../../utils/cn';

const EnhancedDashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');
  
  // Mock data for dashboard
  const dashboardStats = {
    today: {
      appointments: 12,
      waitlist: 3,
      cancellations: 2,
      utilization: 95
    },
    week: {
      appointments: 67,
      waitlist: 12,
      cancellations: 8,
      utilization: 89
    }
  };

  const currentStats = dashboardStats[selectedTimeframe];
  
  const priorityActions = [
    {
      id: 1,
      type: 'urgent',
      title: '2 urgent follow-ups due today',
      icon: <Icons.AlertTriangle className="w-5 h-5" />,
      action: 'Review',
      color: 'red'
    },
    {
      id: 2,
      type: 'medication',
      title: '1 medication review overdue',
      icon: <Icons.Pills className="w-5 h-5" />,
      action: 'Schedule',
      color: 'orange'
    },
    {
      id: 3,
      type: 'insurance',
      title: '3 insurance authorizations needed',
      icon: <Icons.Shield className="w-5 h-5" />,
      action: 'Process',
      color: 'blue'
    }
  ];

  const upcomingAppointments = [
    {
      id: 1,
      time: '9:00 AM',
      patient: 'Sarah Johnson',
      type: 'Initial Consultation',
      status: 'confirmed',
      duration: 60,
      isVirtual: false
    },
    {
      id: 2,
      time: '10:30 AM',
      patient: 'Michael Chen',
      type: 'Follow-up',
      status: 'confirmed',
      duration: 30,
      isVirtual: true
    },
    {
      id: 3,
      time: '11:00 AM',
      patient: null,
      type: 'available',
      status: 'open',
      duration: 30,
      isVirtual: false
    },
    {
      id: 4,
      time: '12:00 PM',
      patient: 'Lunch Break',
      type: 'break',
      status: 'blocked',
      duration: 60,
      isVirtual: false
    }
  ];

  const getStatColor = (value, type) => {
    if (type === 'utilization') {
      if (value >= 90) return 'text-green-600';
      if (value >= 75) return 'text-yellow-600';
      return 'text-red-600';
    }
    return 'text-blue-600';
  };

  const getAppointmentStatusStyle = (status, type) => {
    if (type === 'break') return 'bg-gray-100 border-gray-300';
    if (status === 'confirmed') return 'bg-green-50 border-green-200';
    if (status === 'open') return 'bg-blue-50 border-blue-200 border-dashed';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good morning, Dr. Smith</h1>
          <p className="text-gray-600">Here's your practice overview for today</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Quick Search */}
          <div className="relative">
            <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Quick search patients..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>
          
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Icons.Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Appointments</p>
              <p className={cn("text-3xl font-bold", getStatColor(currentStats.appointments, 'appointments'))}>
                {currentStats.appointments}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Icons.Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-green-600 font-medium">+12% from yesterday</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Waitlist</p>
              <p className={cn("text-3xl font-bold", getStatColor(currentStats.waitlist, 'waitlist'))}>
                {currentStats.waitlist}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Icons.Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-yellow-600 font-medium">2 urgent</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6 border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cancellations</p>
              <p className={cn("text-3xl font-bold", getStatColor(currentStats.cancellations, 'cancellations'))}>
                {currentStats.cancellations}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <Icons.XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-red-600 font-medium">-2 from yesterday</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6 border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilization</p>
              <p className={cn("text-3xl font-bold", getStatColor(currentStats.utilization, 'utilization'))}>
                {currentStats.utilization}%
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Icons.TrendUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-green-600 h-1.5 rounded-full" 
                style={{ width: `${currentStats.utilization}%` }}
              ></div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Priority Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 border"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Icons.AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
            Priority Actions
          </h3>
          <div className="space-y-3">
            {priorityActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "p-2 rounded-full",
                    action.color === 'red' && "bg-red-100 text-red-600",
                    action.color === 'orange' && "bg-orange-100 text-orange-600",
                    action.color === 'blue' && "bg-blue-100 text-blue-600"
                  )}>
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{action.title}</span>
                </div>
                <button className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                  action.color === 'red' && "bg-red-600 text-white hover:bg-red-700",
                  action.color === 'orange' && "bg-orange-600 text-white hover:bg-orange-700",
                  action.color === 'blue' && "bg-blue-600 text-white hover:bg-blue-700"
                )}>
                  {action.action}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Schedule */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-2 bg-white rounded-xl shadow-sm p-6 border"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Icons.Calendar className="w-5 h-5 text-blue-500 mr-2" />
              Today's Schedule
            </h3>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                View Full Calendar
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            {upcomingAppointments.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border-2 transition-all hover:shadow-sm",
                  getAppointmentStatusStyle(appointment.status, appointment.type)
                )}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-gray-900 min-w-[70px]">
                    {appointment.time}
                  </div>
                  
                  {appointment.type === 'break' ? (
                    <div className="flex items-center space-x-2">
                      <Icons.Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">{appointment.patient}</span>
                    </div>
                  ) : appointment.status === 'open' ? (
                    <div className="flex items-center space-x-2">
                      <Icons.Plus className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-blue-600 font-medium">Available Slot</span>
                      <span className="text-xs text-gray-500">({appointment.duration}min)</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Icons.User className="w-4 h-4 text-gray-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-900">{appointment.patient}</span>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>{appointment.type}</span>
                          <span>•</span>
                          <span>{appointment.duration}min</span>
                          {appointment.isVirtual && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600">Virtual</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {appointment.status === 'open' ? (
                    <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      Book Slot
                    </button>
                  ) : appointment.type !== 'break' && (
                    <>
                      {appointment.isVirtual && (
                        <button className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                          Join Call
                        </button>
                      )}
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <Icons.Edit className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Analytics Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm p-6 border"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Icons.Chart className="w-5 h-5 text-purple-500 mr-2" />
            Weekly Performance
          </h3>
          <button className="px-3 py-1 text-sm text-purple-600 hover:text-purple-800 transition-colors">
            View Full Report
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">92%</div>
            <div className="text-sm text-gray-600">Patient Satisfaction</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">18min</div>
            <div className="text-sm text-gray-600">Avg Session Length</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">4.8</div>
            <div className="text-sm text-gray-600">Provider Rating</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EnhancedDashboard;