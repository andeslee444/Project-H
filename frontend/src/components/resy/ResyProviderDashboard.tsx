import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, Users, Bell, ChevronRight, MoreVertical, 
  AlertCircle, CheckCircle, TrendingUp, DollarSign, Star, 
  Activity, Send, UserPlus, Filter, MessageSquare, Edit,
  X, Check, RefreshCw, ExternalLink, Phone, Mail, Zap,
  ArrowRight, HandMetal, Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Appointment {
  id: string;
  time: string;
  patient: {
    id: string;
    name: string;
    phone: string;
    email: string;
    condition: string;
  };
  status: 'confirmed' | 'pending' | 'cancelled' | 'no-show';
  type: 'initial' | 'follow-up' | 'urgent';
  duration: number;
  notes?: string;
}

interface WaitlistPatient {
  id: string;
  name: string;
  condition: string;
  preferredTimes: string[];
  insurance: string;
  matchScore: number;
  handRaised: boolean;
  urgency: 'low' | 'medium' | 'high';
  photo?: string;
}

interface AvailableSlot {
  time: string;
  duration: 30 | 60 | 90;
  matchedPatients: number;
}

const ResyProviderDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showQuickBookModal, setShowQuickBookModal] = useState(false);
  const [showBulkMessageModal, setShowBulkMessageModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedPatientForNotify, setSelectedPatientForNotify] = useState<WaitlistPatient | null>(null);
  const [notificationType, setNotificationType] = useState<'waterfall' | 'blast'>('waterfall');

  // Mock data
  const todaysAppointments: Appointment[] = [
    {
      id: '1',
      time: '9:00 AM',
      patient: {
        id: 'p1',
        name: 'Sarah Johnson',
        phone: '(555) 123-4567',
        email: 'sarah.j@email.com',
        condition: 'Anxiety'
      },
      status: 'confirmed',
      type: 'follow-up',
      duration: 50
    },
    {
      id: '2',
      time: '10:00 AM',
      patient: {
        id: 'p2',
        name: 'Michael Chen',
        phone: '(555) 234-5678',
        email: 'mchen@email.com',
        condition: 'Depression'
      },
      status: 'pending',
      type: 'initial',
      duration: 90
    },
    {
      id: '3',
      time: '2:00 PM',
      patient: {
        id: 'p3',
        name: 'Emma Davis',
        phone: '(555) 345-6789',
        email: 'emma.d@email.com',
        condition: 'ADHD'
      },
      status: 'confirmed',
      type: 'follow-up',
      duration: 50
    }
  ];

  const waitlistPatients: WaitlistPatient[] = [
    {
      id: 'w1',
      name: 'John Williams',
      condition: 'Anxiety',
      preferredTimes: ['Morning', 'Early Afternoon'],
      insurance: 'Blue Cross',
      matchScore: 95,
      handRaised: true,
      urgency: 'high',
      photo: 'https://i.pravatar.cc/150?img=4'
    },
    {
      id: 'w2',
      name: 'Lisa Martinez',
      condition: 'Stress Management',
      preferredTimes: ['Evening'],
      insurance: 'Aetna',
      matchScore: 82,
      handRaised: true,
      urgency: 'medium',
      photo: 'https://i.pravatar.cc/150?img=5'
    },
    {
      id: 'w3',
      name: 'Robert Taylor',
      condition: 'Depression',
      preferredTimes: ['Afternoon'],
      insurance: 'United',
      matchScore: 78,
      handRaised: false,
      urgency: 'low',
      photo: 'https://i.pravatar.cc/150?img=6'
    }
  ];

  const availableSlots: AvailableSlot[] = [
    { time: '11:00 AM', duration: 60, matchedPatients: 3 },
    { time: '1:00 PM', duration: 30, matchedPatients: 2 },
    { time: '3:00 PM', duration: 60, matchedPatients: 5 },
    { time: '4:30 PM', duration: 30, matchedPatients: 1 }
  ];

  const quickStats = [
    { label: 'Today\'s Revenue', value: '$1,450', change: '+12%', icon: DollarSign, color: 'green' },
    { label: 'Utilization', value: '87%', change: '+5%', icon: TrendingUp, color: 'blue' },
    { label: 'No-Shows', value: '2', change: '-25%', icon: AlertCircle, color: 'red' },
    { label: 'Avg Rating', value: '4.9', change: '+0.1', icon: Star, color: 'yellow' }
  ];

  const handleAppointmentStatusChange = (appointmentId: string, newStatus: string) => {
    console.log('Changing appointment', appointmentId, 'to', newStatus);
    // In real app, update via API
  };

  const handleQuickBook = (patientData: any) => {
    console.log('Quick booking:', patientData);
    setShowQuickBookModal(false);
    // Show success toast
  };

  const handleSendBulkMessage = (message: string, recipients: string[]) => {
    console.log('Sending message:', message, 'to', recipients);
    setShowBulkMessageModal(false);
    // Show success toast
  };

  const handleNotifyPatient = (patient: WaitlistPatient, slot: AvailableSlot) => {
    setSelectedPatientForNotify(patient);
    setShowNotificationModal(true);
  };

  const handleSlotClick = (slot: AvailableSlot) => {
    // Show modal with matched patients for this slot
    setShowNotificationModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'no-show': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Provider Dashboard</h1>
              <p className="text-gray-600">Welcome back, Dr. Chen</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Next patient in 45 min</span>
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/schedule')}
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
          >
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="font-medium">View Full Schedule</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/waitlist')}
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
          >
            <Users className="w-5 h-5 text-green-600" />
            <span className="font-medium">Manage Waitlist</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowQuickBookModal(true)}
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
          >
            <Zap className="w-5 h-5 text-yellow-600" />
            <span className="font-medium">Quick Book</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowBulkMessageModal(true)}
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
          >
            <Send className="w-5 h-5 text-purple-600" />
            <span className="font-medium">Send Update</span>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Today's Schedule</h2>
              </div>
              <div className="p-4 space-y-3">
                {todaysAppointments.map((appointment) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-semibold">{appointment.time}</span>
                          <button
                            onClick={() => handleAppointmentStatusChange(appointment.id, 'confirmed')}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}
                          >
                            {appointment.status}
                          </button>
                          <span className="text-sm text-gray-500">{appointment.duration} min</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/patients/${appointment.patient.id}`)}
                            className="font-medium hover:text-blue-600 transition-colors"
                          >
                            {appointment.patient.name}
                          </button>
                          <span className="text-sm text-gray-600">• {appointment.patient.condition}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <button className="flex items-center gap-1 hover:text-blue-600">
                            <Phone className="w-4 h-4" />
                            {appointment.patient.phone}
                          </button>
                          <button className="flex items-center gap-1 hover:text-blue-600">
                            <Mail className="w-4 h-4" />
                            {appointment.patient.email}
                          </button>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <button
                          onClick={() => setSelectedAppointment(appointment)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {selectedAppointment?.id === appointment.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10"
                          >
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                              Cancel Appointment
                            </button>
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                              Reschedule
                            </button>
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                              Send Reminder
                            </button>
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                              Add Note
                            </button>
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600">
                              Mark as No-Show
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Available Slots */}
            <div className="bg-white rounded-lg shadow-sm mt-6">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Available Slots Today</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {availableSlots.map((slot, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSlotClick(slot)}
                      className="bg-green-50 border border-green-200 rounded-lg p-3 hover:bg-green-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-green-700">{slot.time}</p>
                          <p className="text-sm text-gray-600">{slot.duration} minutes</p>
                        </div>
                        {slot.matchedPatients > 0 && (
                          <div className="bg-yellow-100 px-2 py-1 rounded-full">
                            <p className="text-xs text-yellow-700 font-medium">
                              {slot.matchedPatients} matches
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
                <button className="mt-3 w-full text-sm text-blue-600 hover:text-blue-700">
                  View more slots →
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              {quickStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                    <span className={`text-xs font-medium text-${stat.color}-600`}>
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Waitlist Patients */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">Waitlist Patients</h3>
                <button
                  onClick={() => navigate('/waitlist')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View All
                </button>
              </div>
              <div className="p-4 space-y-3">
                {waitlistPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={patient.photo || `https://ui-avatars.com/api/?name=${patient.name}`}
                        alt={patient.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {patient.name}
                          {patient.handRaised && (
                            <HandMetal className="w-4 h-4 text-yellow-500" />
                          )}
                        </p>
                        <p className="text-sm text-gray-600">
                          {patient.condition} • {patient.matchScore}% match
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNotifyPatient(patient, availableSlots[0])}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      Notify
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Book Modal */}
      <AnimatePresence>
        {showQuickBookModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowQuickBookModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Quick Book Appointment</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Patient</label>
                  <input
                    type="text"
                    placeholder="Search or add new patient..."
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <input type="date" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Time</label>
                    <select className="w-full px-3 py-2 border rounded-lg">
                      <option>11:00 AM</option>
                      <option>1:00 PM</option>
                      <option>3:00 PM</option>
                      <option>4:30 PM</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option>Initial Consultation (90 min)</option>
                    <option>Follow-up (50 min)</option>
                    <option>Brief Check-in (30 min)</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowQuickBookModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleQuickBook({})}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Book Appointment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Modal */}
      <AnimatePresence>
        {showNotificationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNotificationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Send Slot Notification</h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  Notifying for: <strong>Today at 3:00 PM (60 min)</strong>
                </p>
                
                <div className="space-y-3">
                  <label className="block">
                    <input
                      type="radio"
                      value="waterfall"
                      checked={notificationType === 'waterfall'}
                      onChange={(e) => setNotificationType('waterfall')}
                      className="mr-2"
                    />
                    <span className="font-medium">Waterfall</span>
                    <p className="text-sm text-gray-600 ml-6">
                      Notify one patient at a time with 5-minute response window
                    </p>
                  </label>
                  
                  <label className="block">
                    <input
                      type="radio"
                      value="blast"
                      checked={notificationType === 'blast'}
                      onChange={(e) => setNotificationType('blast')}
                      className="mr-2"
                    />
                    <span className="font-medium">Blast</span>
                    <p className="text-sm text-gray-600 ml-6">
                      Notify all matched patients at once, first to respond wins
                    </p>
                  </label>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Message Preview</label>
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  Hi! A 3:00 PM appointment just opened up today with Dr. Chen.
                  Reply YES to claim this slot. This offer expires in {notificationType === 'waterfall' ? '5' : '10'} minutes.
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Sending notification...');
                    setShowNotificationModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Notification
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResyProviderDashboard;