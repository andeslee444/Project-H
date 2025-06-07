import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Video, MapPin, Filter, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card/Card';
import { Button } from '@/components/ui/button/Button';
import { Select } from '@/components/ui/select/Select';
import { StatusIndicator } from '@/components/ui/status/status-indicator';
import { formatDate, formatTime, formatDuration } from '@/utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  time: string;
  duration: number;
  type: 'in-person' | 'video' | 'phone';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'no-show' | 'cancelled';
  reason: string;
  notes?: string;
  isNewPatient: boolean;
}

interface TimeSlot {
  time: string;
  available: boolean;
  appointment?: Appointment;
}

const VIEW_MODES = ['day', 'week', 'month'] as const;
type ViewMode = typeof VIEW_MODES[number];

export const ProviderScheduleDashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Generate time slots for the day
  useEffect(() => {
    const slots: TimeSlot[] = [];
    const startHour = 8;
    const endHour = 18;

    // Mock appointments
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        patientName: 'John Doe',
        patientId: 'P001',
        time: '09:00',
        duration: 60,
        type: 'in-person',
        status: 'confirmed',
        reason: 'Follow-up - Depression',
        isNewPatient: false
      },
      {
        id: '2',
        patientName: 'Jane Smith',
        patientId: 'P002',
        time: '10:00',
        duration: 50,
        type: 'video',
        status: 'scheduled',
        reason: 'Initial Consultation',
        isNewPatient: true
      },
      {
        id: '3',
        patientName: 'Robert Johnson',
        patientId: 'P003',
        time: '11:00',
        duration: 30,
        type: 'in-person',
        status: 'in-progress',
        reason: 'Medication Review',
        isNewPatient: false
      },
      {
        id: '4',
        patientName: 'Emily Davis',
        patientId: 'P004',
        time: '14:00',
        duration: 60,
        type: 'video',
        status: 'scheduled',
        reason: 'Therapy Session - Anxiety',
        isNewPatient: false
      }
    ];

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const appointment = mockAppointments.find(apt => apt.time === timeStr);
        
        slots.push({
          time: timeStr,
          available: !appointment,
          appointment
        });
      }
    }

    setTimeSlots(slots);
  }, [selectedDate]);

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'in-progress': return 'info';
      case 'scheduled': return 'warning';
      case 'no-show': return 'error';
      case 'cancelled': return 'idle';
      case 'completed': return 'success';
      default: return 'idle';
    }
  };

  const getAppointmentTypeIcon = (type: Appointment['type']) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'phone': return '📞';
      case 'in-person': return <MapPin className="w-4 h-4" />;
    }
  };

  // Stats calculation
  const todayStats = {
    total: timeSlots.filter(slot => slot.appointment).length,
    completed: timeSlots.filter(slot => slot.appointment?.status === 'completed').length,
    remaining: timeSlots.filter(slot => slot.appointment && ['scheduled', 'confirmed'].includes(slot.appointment.status)).length,
    newPatients: timeSlots.filter(slot => slot.appointment?.isNewPatient).length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Schedule Dashboard</h1>
        <p className="text-gray-600">Manage your appointments and availability</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-bold">{todayStats.total}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{todayStats.completed}</p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-2xl font-bold">{todayStats.remaining}</p>
              </div>
              <Users className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Patients</p>
                <p className="text-2xl font-bold">{todayStats.newPatients}</p>
              </div>
              <Plus className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDateChange('prev')}
            icon={<ChevronLeft className="w-4 h-4" />}
          />
          <h2 className="text-lg font-semibold">
            {formatDate(selectedDate, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDateChange('next')}
            icon={<ChevronRight className="w-4 h-4" />}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(new Date())}
          >
            Today
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
            options={VIEW_MODES.map(mode => ({ value: mode, label: mode.charAt(0).toUpperCase() + mode.slice(1) }))}
          />
          <Button
            icon={<Plus className="w-4 h-4" />}
          >
            Block Time
          </Button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time Slots */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Schedule</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {timeSlots.map((slot) => (
                  <div
                    key={slot.time}
                    className={`flex items-center p-3 rounded-lg border transition-colors ${
                      slot.appointment
                        ? 'bg-blue-50 border-blue-200 cursor-pointer hover:bg-blue-100'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                    onClick={() => slot.appointment && setSelectedAppointment(slot.appointment)}
                  >
                    <div className="w-20 text-sm font-medium text-gray-600">
                      {slot.time}
                    </div>
                    
                    {slot.appointment ? (
                      <div className="flex-1 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <StatusIndicator
                            status={getStatusColor(slot.appointment.status)}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {slot.appointment.patientName}
                              {slot.appointment.isNewPatient && (
                                <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                  New Patient
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-600">
                              {slot.appointment.reason} • {formatDuration(slot.appointment.duration)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getAppointmentTypeIcon(slot.appointment.type)}
                          {slot.appointment.type === 'video' && (
                            <Button size="xs" variant="primary">
                              Join Call
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 text-sm text-gray-400">
                        Available
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointment Details */}
        <div>
          <AnimatePresence mode="wait">
            {selectedAppointment ? (
              <motion.div
                key={selectedAppointment.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Appointment Details</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedAppointment(null)}
                      >
                        ✕
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Patient</p>
                      <p className="font-medium">{selectedAppointment.patientName}</p>
                      <p className="text-sm text-gray-500">ID: {selectedAppointment.patientId}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-medium">
                        {selectedAppointment.time} ({formatDuration(selectedAppointment.duration)})
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <div className="flex items-center gap-2">
                        {getAppointmentTypeIcon(selectedAppointment.type)}
                        <span className="font-medium capitalize">{selectedAppointment.type}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <div className="flex items-center gap-2">
                        <StatusIndicator
                          status={getStatusColor(selectedAppointment.status)}
                          size="sm"
                        />
                        <span className="font-medium capitalize">{selectedAppointment.status}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Reason</p>
                      <p className="font-medium">{selectedAppointment.reason}</p>
                    </div>

                    {selectedAppointment.notes && (
                      <div>
                        <p className="text-sm text-gray-600">Notes</p>
                        <p className="text-sm">{selectedAppointment.notes}</p>
                      </div>
                    )}

                    <div className="pt-4 space-y-2">
                      {selectedAppointment.status === 'scheduled' && (
                        <>
                          <Button fullWidth variant="primary">
                            Start Session
                          </Button>
                          <Button fullWidth variant="outline">
                            Reschedule
                          </Button>
                        </>
                      )}
                      {selectedAppointment.status === 'in-progress' && (
                        <Button fullWidth variant="success">
                          Complete Session
                        </Button>
                      )}
                      <Button fullWidth variant="ghost">
                        View Patient Record
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">Select an appointment to view details</p>
                </CardContent>
              </Card>
            )}
          </AnimatePresence>

          {/* Upcoming Waitlist */}
          <Card className="mt-6">
            <CardHeader>
              <h3 className="text-lg font-semibold">Waitlist Alerts</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-purple-900">Sarah Williams</p>
                  <p className="text-xs text-purple-700">Urgent - Looking for next available slot</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-sm font-medium text-amber-900">Michael Brown</p>
                  <p className="text-xs text-amber-700">Flexible - Any time this week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};