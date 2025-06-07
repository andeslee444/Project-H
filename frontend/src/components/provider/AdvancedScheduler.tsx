import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../ui/HealthcareIcons';
import { cn } from '../../utils/cn';
import type { Appointment } from '@/lib/database/types';

// Types
interface Provider {
  id: string;
  name: string;
  color: string;
}

interface AppointmentType {
  id: string;
  name: string;
}

interface ScheduleAppointment {
  id: number;
  patient: string | null;
  provider: string;
  type: string;
  time: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'open' | 'blocked';
  isVirtual: boolean;
  priority: 'normal' | 'high' | 'urgent';
  notes?: string;
}

interface Filters {
  provider: string;
  appointmentType: string;
  status: string;
}

interface AppointmentCardProps {
  appointment: ScheduleAppointment;
  index: number;
}

type ViewType = 'day' | 'week' | 'month';

const AdvancedScheduler: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [draggedAppointment, setDraggedAppointment] = useState<ScheduleAppointment | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({
    provider: 'all',
    appointmentType: 'all',
    status: 'all'
  });

  const timeSlots: string[] = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8; // Start from 8 AM
    return `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
  });

  const providers: Provider[] = [
    { id: 'all', name: 'All Providers', color: 'gray' },
    { id: 'johnson', name: 'Dr. Johnson', color: 'blue' },
    { id: 'chen', name: 'Dr. Chen', color: 'green' },
    { id: 'rodriguez', name: 'Dr. Rodriguez', color: 'purple' }
  ];

  const appointmentTypes: AppointmentType[] = [
    { id: 'all', name: 'All Types' },
    { id: 'initial', name: 'Initial Consultation' },
    { id: 'followup', name: 'Follow-up' },
    { id: 'therapy', name: 'Therapy Session' },
    { id: 'medication', name: 'Medication Review' }
  ];

  const appointments: ScheduleAppointment[] = [
    {
      id: 1,
      patient: 'Sarah Johnson',
      provider: 'johnson',
      type: 'therapy',
      time: '9:00 AM',
      duration: 60,
      status: 'confirmed',
      isVirtual: true,
      priority: 'normal',
      notes: 'Follow-up on anxiety treatment'
    },
    {
      id: 2,
      patient: 'Michael Chen',
      provider: 'johnson',
      type: 'initial',
      time: '10:30 AM',
      duration: 90,
      status: 'confirmed',
      isVirtual: false,
      priority: 'high',
      notes: 'New patient consultation'
    },
    {
      id: 3,
      patient: 'Emma Davis',
      provider: 'chen',
      type: 'medication',
      time: '11:00 AM',
      duration: 30,
      status: 'pending',
      isVirtual: true,
      priority: 'urgent',
      notes: 'Medication adjustment needed'
    },
    {
      id: 4,
      patient: null,
      provider: 'johnson',
      type: 'available',
      time: '2:00 PM',
      duration: 60,
      status: 'open',
      isVirtual: false,
      priority: 'normal'
    }
  ];

  const getProviderColor = (providerId: string): string => {
    const provider = providers.find(p => p.id === providerId);
    return provider?.color || 'gray';
  };

  const getStatusColor = (status: ScheduleAppointment['status'], priority: ScheduleAppointment['priority']): string => {
    if (priority === 'urgent') return 'red';
    if (status === 'confirmed') return 'green';
    if (status === 'pending') return 'yellow';
    if (status === 'open') return 'blue';
    return 'gray';
  };

  const handleDragStart = (appointment: ScheduleAppointment): void => {
    setDraggedAppointment(appointment);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
  };

  const handleDrop = (newTime: string, provider: string): void => {
    if (draggedAppointment) {
      // In a real app, this would update the appointment in the database
      console.log(`Moving appointment ${draggedAppointment.id} to ${newTime} with ${provider}`);
      setDraggedAppointment(null);
    }
  };

  const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, index }) => {
    const isAvailable = appointment.status === 'open';
    const statusColor = getStatusColor(appointment.status, appointment.priority);
    const providerColor = getProviderColor(appointment.provider);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        draggable={!isAvailable}
        onDragStart={() => handleDragStart(appointment)}
        className={cn(
          "p-3 rounded-lg border-l-4 cursor-move transition-all hover:shadow-md group",
          isAvailable 
            ? "bg-blue-50 border-blue-400 hover:bg-blue-100" 
            : "bg-white border-gray-300 hover:shadow-lg",
          statusColor === 'red' && "border-l-red-500 bg-red-50",
          statusColor === 'green' && "border-l-green-500 bg-green-50",
          statusColor === 'yellow' && "border-l-yellow-500 bg-yellow-50",
          draggedAppointment?.id === appointment.id && "opacity-50"
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {isAvailable ? (
              <div className="flex items-center space-x-2">
                <Icons.Plus className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Available Slot</span>
                <span className="text-xs text-blue-600">({appointment.duration}min)</span>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-gray-900 text-sm truncate">
                    {appointment.patient}
                  </h4>
                  {appointment.priority === 'urgent' && (
                    <Icons.AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />
                  )}
                  {appointment.isVirtual && (
                    <Icons.ArrowRight className="w-3 h-3 text-blue-500 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                  <span>{appointment.type.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span>•</span>
                  <span>{appointment.duration}min</span>
                </div>
                {appointment.notes && (
                  <p className="text-xs text-gray-600 truncate">{appointment.notes}</p>
                )}
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isAvailable && (
              <>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Icons.Edit className="w-3 h-3 text-gray-500" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Icons.ArrowRight className="w-3 h-3 text-gray-500" />
                </button>
              </>
            )}
          </div>
        </div>
        
        {!isAvailable && (
          <div className={cn(
            "flex items-center justify-between mt-2 pt-2 border-t border-gray-100"
          )}>
            <div className={cn(
              "px-2 py-1 rounded text-xs font-medium",
              statusColor === 'green' && "bg-green-100 text-green-700",
              statusColor === 'yellow' && "bg-yellow-100 text-yellow-700",
              statusColor === 'red' && "bg-red-100 text-red-700"
            )}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </div>
            <span className="text-xs text-gray-500">{appointment.time}</span>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule Manager</h1>
          <p className="text-gray-600">Drag and drop to reschedule appointments</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* View Toggle */}
          <div className="flex bg-white rounded-lg border border-gray-300 p-1">
            {(['day', 'week', 'month'] as ViewType[]).map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize",
                  currentView === view
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {view}
              </button>
            ))}
          </div>
          
          {/* Filters */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors",
              showFilters 
                ? "bg-blue-600 text-white border-blue-600" 
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            )}
          >
            <Icons.Search className="w-4 h-4" />
            <span>Filters</span>
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>New Appointment</span>
          </motion.button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-sm border p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                <select 
                  value={filters.provider}
                  onChange={(e) => setFilters({...filters, provider: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {providers.map(provider => (
                    <option key={provider.id} value={provider.id}>{provider.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
                <select 
                  value={filters.appointmentType}
                  onChange={(e) => setFilters({...filters, appointmentType: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {appointmentTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select 
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="open">Open Slots</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Grid */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="grid grid-cols-8 border-b border-gray-200">
          <div className="p-4 bg-gray-50 border-r border-gray-200">
            <span className="text-sm font-medium text-gray-600">Time</span>
          </div>
          {providers.slice(1).map(provider => (
            <div key={provider.id} className="p-4 bg-gray-50 border-r border-gray-200 last:border-r-0">
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  provider.color === 'blue' && "bg-blue-500",
                  provider.color === 'green' && "bg-green-500",
                  provider.color === 'purple' && "bg-purple-500"
                )} />
                <span className="text-sm font-medium text-gray-700">{provider.name}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="max-h-[600px] overflow-y-auto">
          {timeSlots.map((time, timeIndex) => (
            <div key={time} className="grid grid-cols-8 border-b border-gray-100 min-h-[80px]">
              <div className="p-4 bg-gray-50 border-r border-gray-200 flex items-center">
                <span className="text-sm font-medium text-gray-600">{time}</span>
              </div>
              
              {providers.slice(1).map((provider, providerIndex) => {
                const appointmentForSlot = appointments.find(
                  apt => apt.time === time && apt.provider === provider.id
                );
                
                return (
                  <div
                    key={`${time}-${provider.id}`}
                    className="p-2 border-r border-gray-200 last:border-r-0 min-h-[80px]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDrop(time, provider.id);
                    }}
                  >
                    {appointmentForSlot ? (
                      <AppointmentCard 
                        appointment={appointmentForSlot} 
                        index={timeIndex * providers.length + providerIndex}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <button className="w-full h-12 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center group">
                          <Icons.Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today&apos;s Appointments</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <Icons.Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open Slots</p>
              <p className="text-2xl font-bold text-gray-900">4</p>
            </div>
            <Icons.Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Utilization</p>
              <p className="text-2xl font-bold text-gray-900">87%</p>
            </div>
            <Icons.TrendUp className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <Icons.AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdvancedScheduler;