import React, { useState } from 'react';
import { 
  Calendar, Clock, Users, Send, Filter, MessageSquare, 
  TrendingUp, AlertCircle, CheckCircle, X, ChevronRight,
  User, Star, Bell, Search, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimeSlot {
  time: string;
  date: string;
  available: boolean;
  patient?: {
    name: string;
    id: string;
  };
}

interface Provider {
  id: string;
  name: string;
  photo: string;
  nextAvailable: string;
  utilization: number;
  todayAppointments: number;
  waitlistCount: number;
}

interface WaitlistPatient {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferredTimes: string[];
  insurance: string;
  reason: string;
  handRaised: boolean;
  matchScore?: number;
  joinedDate: string;
  urgency: 'low' | 'medium' | 'high';
  excluded?: boolean;
}

const ProviderDashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [showBlastModal, setShowBlastModal] = useState(false);
  const [blastMessage, setBlastMessage] = useState('');
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'schedule' | 'waitlist' | 'exclusions'>('schedule');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for providers in a practice
  const providers: Provider[] = [
    {
      id: '1',
      name: 'Dr. Sarah Chen',
      photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100',
      nextAvailable: '2:00 PM',
      utilization: 85,
      todayAppointments: 6,
      waitlistCount: 12
    },
    {
      id: '2',
      name: 'Dr. Michael Rodriguez',
      photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100',
      nextAvailable: '4:30 PM',
      utilization: 92,
      todayAppointments: 7,
      waitlistCount: 8
    },
    {
      id: '3',
      name: 'Dr. Emily Williams',
      photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100',
      nextAvailable: 'Tomorrow 10:00 AM',
      utilization: 78,
      todayAppointments: 5,
      waitlistCount: 15
    }
  ];

  // Mock waitlist data
  const waitlistPatients: WaitlistPatient[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      preferredTimes: ['Morning', 'Early Afternoon'],
      insurance: 'Blue Cross',
      reason: 'Anxiety management',
      handRaised: true,
      matchScore: 95,
      joinedDate: '2024-01-15',
      urgency: 'high'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '(555) 234-5678',
      preferredTimes: ['Evening', 'Weekend'],
      insurance: 'Aetna',
      reason: 'Depression',
      handRaised: true,
      matchScore: 88,
      joinedDate: '2024-01-18',
      urgency: 'medium'
    },
    {
      id: '3',
      name: 'Robert Johnson',
      email: 'robert@example.com',
      phone: '(555) 345-6789',
      preferredTimes: ['Afternoon'],
      insurance: 'United Healthcare',
      reason: 'Couples therapy',
      handRaised: false,
      matchScore: 72,
      joinedDate: '2024-01-20',
      urgency: 'low',
      excluded: true
    }
  ];

  // Generate time slots for the day
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 8;
    const endHour = 18;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour > 12 ? hour - 12 : hour}:${minute === 0 ? '00' : '30'} ${hour >= 12 ? 'PM' : 'AM'}`;
        const isAvailable = Math.random() > 0.6;
        
        slots.push({
          time,
          date: selectedDate.toISOString().split('T')[0],
          available: isAvailable,
          patient: isAvailable ? undefined : {
            name: `Patient ${Math.floor(Math.random() * 100)}`,
            id: `p${Math.floor(Math.random() * 1000)}`
          }
        });
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleTimeSlotClick = (slot: TimeSlot) => {
    if (slot.available) {
      setSelectedTimeSlot(slot);
    }
  };

  const handleBlastMessage = () => {
    // In real app, this would send notifications
    console.log('Sending blast message:', blastMessage);
    console.log('To patients:', selectedPatients);
    setShowBlastModal(false);
    setBlastMessage('');
    setSelectedPatients([]);
  };

  const handleQuickFill = (time: string) => {
    setSearchTerm(time);
    // Filter waitlist patients and show blast option
    setShowBlastModal(true);
  };

  const filteredWaitlist = waitlistPatients.filter(patient => 
    !patient.excluded && 
    (patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     patient.reason.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Provider Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Bell className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100"
                  alt="Provider"
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium">Dr. Sarah Chen</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Provider List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-4">Today's Providers</h2>
              
              <div className="space-y-3">
                {providers.map((provider) => (
                  <div
                    key={provider.id}
                    className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={provider.photo}
                          alt={provider.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-sm">{provider.name}</p>
                          <p className="text-xs text-gray-500">
                            {provider.todayAppointments} appointments today
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">Next Available</p>
                        <p className="font-semibold text-green-600">{provider.nextAvailable}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Utilization</p>
                        <p className="font-semibold">{provider.utilization}%</p>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Waitlist</span>
                        <span className="font-semibold">{provider.waitlistCount} patients</span>
                      </div>
                      <button className="mt-2 w-full text-xs bg-blue-50 text-blue-600 py-1 rounded hover:bg-blue-100 transition-colors">
                        View Suggested Patients
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Schedule and Waitlist */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('schedule')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'schedule'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Schedule
                  </button>
                  <button
                    onClick={() => setActiveTab('waitlist')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'waitlist'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Waitlist ({waitlistPatients.filter(p => !p.excluded).length})
                  </button>
                  <button
                    onClick={() => setActiveTab('exclusions')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'exclusions'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Exclusions ({waitlistPatients.filter(p => p.excluded).length})
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-4">
                {activeTab === 'schedule' && (
                  <div>
                    {/* Quick Fill Section */}
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-900 mb-2">Quick Fill Opening</h3>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Type time (e.g., 3pm)"
                          className="flex-1 px-3 py-2 border border-blue-200 rounded-md text-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleQuickFill(e.currentTarget.value);
                            }
                          }}
                        />
                        <button
                          onClick={() => setShowBlastModal(true)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          <Send className="w-4 h-4 inline mr-1" />
                          Send Blast
                        </button>
                      </div>
                    </div>

                    {/* Time Slots Grid */}
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map((slot, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleTimeSlotClick(slot)}
                          className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${
                            slot.available
                              ? 'border-green-300 bg-green-50 hover:bg-green-100'
                              : 'border-gray-300 bg-gray-50'
                          }`}
                        >
                          <p className="text-sm font-medium">{slot.time}</p>
                          {slot.available ? (
                            <p className="text-xs text-green-600 mt-1">Available</p>
                          ) : (
                            <p className="text-xs text-gray-600 mt-1 truncate">
                              {slot.patient?.name}
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'waitlist' && (
                  <div>
                    {/* Search and Filter */}
                    <div className="mb-4 flex items-center space-x-2">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search patients..."
                          className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
                        />
                      </div>
                      <button className="px-3 py-2 border rounded-md text-sm hover:bg-gray-50">
                        <Filter className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Waitlist Patients */}
                    <div className="space-y-2">
                      {filteredWaitlist.map((patient) => (
                        <div
                          key={patient.id}
                          className="border rounded-lg p-4 hover:bg-gray-50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={selectedPatients.includes(patient.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedPatients([...selectedPatients, patient.id]);
                                    } else {
                                      setSelectedPatients(selectedPatients.filter(id => id !== patient.id));
                                    }
                                  }}
                                  className="rounded border-gray-300"
                                />
                                <h4 className="font-medium text-sm">{patient.name}</h4>
                                {patient.handRaised && (
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                    Hand Raised
                                  </span>
                                )}
                                {patient.matchScore && patient.matchScore > 80 && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                    {patient.matchScore}% Match
                                  </span>
                                )}
                              </div>
                              
                              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                                <div>
                                  <span className="font-medium">Preferred:</span> {patient.preferredTimes.join(', ')}
                                </div>
                                <div>
                                  <span className="font-medium">Insurance:</span> {patient.insurance}
                                </div>
                                <div>
                                  <span className="font-medium">Reason:</span> {patient.reason}
                                </div>
                                <div>
                                  <span className="font-medium">Joined:</span> {patient.joinedDate}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                <MessageSquare className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:bg-gray-50 rounded">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bulk Actions */}
                    {selectedPatients.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                        <span className="text-sm text-blue-900">
                          {selectedPatients.length} patients selected
                        </span>
                        <button
                          onClick={() => setShowBlastModal(true)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Send Notification
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'exclusions' && (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Patients excluded from waitlist notifications
                    </p>
                    <div className="space-y-2">
                      {waitlistPatients.filter(p => p.excluded).map((patient) => (
                        <div
                          key={patient.id}
                          className="border rounded-lg p-4 bg-gray-50"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-sm">{patient.name}</h4>
                              <p className="text-xs text-gray-600 mt-1">
                                Excluded on: {patient.joinedDate}
                              </p>
                            </div>
                            <button className="text-xs text-blue-600 hover:underline">
                              Remove from exclusions
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blast Message Modal */}
      <AnimatePresence>
        {showBlastModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowBlastModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Send Notification</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button className="px-3 py-2 border-2 border-blue-500 text-blue-600 rounded-md text-sm">
                    Waterfall (Sequential)
                  </button>
                  <button className="px-3 py-2 border rounded-md text-sm hover:bg-gray-50">
                    Blast (All at once)
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={blastMessage}
                  onChange={(e) => setBlastMessage(e.target.value)}
                  placeholder="Hi! A 3:00 PM slot just opened up today. Reply YES to book."
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  rows={3}
                />
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Sending to: {selectedPatients.length > 0 ? `${selectedPatients.length} selected patients` : 'All waitlisted patients'}
                </p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowBlastModal(false)}
                  className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlastMessage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
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

export default ProviderDashboard;