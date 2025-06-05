import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HealthcareIcons, UIIcons } from '../ui/HealthcareIcons';

// Create a combined Icons object for easier access
const Icons = {
  ...HealthcareIcons,
  ...UIIcons,
  // Add specific mappings for missing icons
  Calendar: UIIcons.Calendar,
  Users: UIIcons.Users,
  XCircle: UIIcons.XCircle,
  TrendUp: HealthcareIcons.TrendUp,
  Bell: UIIcons.Bell,
  Settings: UIIcons.Settings,
  Pills: HealthcareIcons.Pills,
  Shield: UIIcons.Shield,
  AlertTriangle: UIIcons.AlertTriangle,
  Mail: UIIcons.Mail,
  ChartBar: HealthcareIcons.Chart,
  ArrowRight: ({ className, ...props }) => (
    <svg className={className} {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  ),
  UserPlus: ({ className, ...props }) => (
    <svg className={className} {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.47a7.78 7.78 0 0115.556 0v.47A48.195 48.195 0 008 21c-2.597 0-5.053-.503-7.334-1.398z" />
    </svg>
  ),
  QuestionMark: ({ className, ...props }) => (
    <svg className={className} {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
  )
};
import { cn } from '../../utils/cn';

const CleanDashboard = () => {
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
      title: 'Urgent follow-ups due',
      count: 2,
      icon: <Icons.AlertTriangle className="w-5 h-5" />,
      action: 'Review Now',
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      iconColor: 'text-red-600'
    },
    {
      id: 2,
      type: 'medication',
      title: 'Medication reviews overdue',
      count: 1,
      icon: <Icons.Pills className="w-5 h-5" />,
      action: 'Schedule',
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      iconColor: 'text-orange-600'
    },
    {
      id: 3,
      type: 'insurance',
      title: 'Insurance authorizations needed',
      count: 3,
      icon: <Icons.Shield className="w-5 h-5" />,
      action: 'Process',
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-600'
    }
  ];

  const upcomingAppointments = [
    {
      id: 1,
      time: '9:00 AM',
      patient: 'Sarah Johnson',
      type: 'Initial Consultation',
      status: 'confirmed',
      duration: '60 min'
    },
    {
      id: 2,
      time: '10:30 AM',
      patient: 'Michael Chen',
      type: 'Follow-up',
      status: 'confirmed',
      duration: '30 min'
    },
    {
      id: 3,
      time: '11:00 AM',
      patient: 'Emma Davis',
      type: 'Therapy Session',
      status: 'pending',
      duration: '50 min'
    },
    {
      id: 4,
      time: '2:00 PM',
      patient: 'John Smith',
      type: 'Medication Review',
      status: 'confirmed',
      duration: '20 min'
    }
  ];

  const quickStats = [
    {
      title: 'Appointments',
      value: currentStats.appointments,
      icon: <Icons.Calendar className="w-6 h-6" />,
      change: '+12%',
      positive: true,
      color: 'blue'
    },
    {
      title: 'Waitlist',
      value: currentStats.waitlist,
      icon: <Icons.Users className="w-6 h-6" />,
      change: '-2',
      positive: true,
      color: 'green'
    },
    {
      title: 'Cancellations',
      value: currentStats.cancellations,
      icon: <Icons.XCircle className="w-6 h-6" />,
      change: '+1',
      positive: false,
      color: 'red'
    },
    {
      title: 'Utilization',
      value: `${currentStats.utilization}%`,
      icon: <Icons.TrendUp className="w-6 h-6" />,
      change: '+5%',
      positive: true,
      color: 'purple'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, Dr. Smith</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedTimeframe('today')}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  selectedTimeframe === 'today'
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                Today
              </button>
              <button
                onClick={() => setSelectedTimeframe('week')}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  selectedTimeframe === 'week'
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                This Week
              </button>
            </div>
            
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Icons.Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Icons.Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={cn(
                      "text-xs font-medium",
                      stat.positive ? "text-green-600" : "text-red-600"
                    )}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">from last period</span>
                  </div>
                </div>
                <div className={cn(
                  "p-3 rounded-lg",
                  stat.color === 'blue' && "bg-blue-50 text-blue-600",
                  stat.color === 'green' && "bg-green-50 text-green-600",
                  stat.color === 'red' && "bg-red-50 text-red-600",
                  stat.color === 'purple' && "bg-purple-50 text-purple-600"
                )}>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Priority Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Priority Actions</h2>
              <p className="text-sm text-gray-600 mt-1">Items requiring immediate attention</p>
            </div>
            <div className="p-6 space-y-4">
              {priorityActions.map((action) => (
                <div key={action.id} className={cn(
                  "p-4 rounded-lg border",
                  action.bgColor,
                  "border-gray-200"
                )}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={cn("p-2 rounded-lg bg-white", action.iconColor)}>
                        {action.icon}
                      </div>
                      <div>
                        <h3 className={cn("font-medium", action.textColor)}>{action.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{action.count} items</p>
                      </div>
                    </div>
                    <button className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                      action.color === 'red' && "bg-red-600 text-white hover:bg-red-700",
                      action.color === 'orange' && "bg-orange-600 text-white hover:bg-orange-700",
                      action.color === 'blue' && "bg-blue-600 text-white hover:bg-blue-700"
                    )}>
                      {action.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Today's Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Schedule</h2>
                  <p className="text-sm text-gray-600 mt-1">{upcomingAppointments.length} appointments scheduled</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  View Full Schedule
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {upcomingAppointments.map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-2 rounded-lg min-w-[80px] text-center">
                        {appointment.time}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{appointment.patient}</h3>
                        <p className="text-sm text-gray-600">{appointment.type} • {appointment.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        appointment.status === 'confirmed' 
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      )}>
                        {appointment.status}
                      </span>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Icons.ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'New Patient', icon: <Icons.UserPlus className="w-5 h-5" />, color: 'blue' },
              { name: 'Schedule', icon: <Icons.Calendar className="w-5 h-5" />, color: 'green' },
              { name: 'Messages', icon: <Icons.Mail className="w-5 h-5" />, color: 'purple' },
              { name: 'Reports', icon: <Icons.ChartBar className="w-5 h-5" />, color: 'orange' },
              { name: 'Settings', icon: <Icons.Settings className="w-5 h-5" />, color: 'gray' },
              { name: 'Help', icon: <Icons.QuestionMark className="w-5 h-5" />, color: 'indigo' }
            ].map((action) => (
              <button
                key={action.name}
                className={cn(
                  "p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm group",
                  "flex flex-col items-center space-y-2 text-gray-600 hover:text-gray-900"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg group-hover:scale-105 transition-transform",
                  action.color === 'blue' && "bg-blue-50 text-blue-600",
                  action.color === 'green' && "bg-green-50 text-green-600",
                  action.color === 'purple' && "bg-purple-50 text-purple-600",
                  action.color === 'orange' && "bg-orange-50 text-orange-600",
                  action.color === 'gray' && "bg-gray-50 text-gray-600",
                  action.color === 'indigo' && "bg-indigo-50 text-indigo-600"
                )}>
                  {action.icon}
                </div>
                <span className="text-sm font-medium">{action.name}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CleanDashboard;