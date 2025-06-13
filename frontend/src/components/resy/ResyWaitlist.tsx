import React, { useState, useEffect } from 'react';
import { 
  Users, Send, Filter, AlertCircle, Clock, MessageSquare,
  TrendingUp, CheckCircle, X, ChevronRight, User, Star,
  Bell, Search, HandMetal, Ban, Timer, Zap, ChevronDown, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWaitlist } from '../../hooks/useWaitlist';

interface WaitlistPatient {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  condition: string;
  insurance: string;
  preferredTimes: string[];
  joinedDate: string;
  position: number;
  matchScore: number;
  handRaised: boolean;
  urgency: 'low' | 'medium' | 'high';
  lastContact?: string;
  responseRate: number;
  provider?: string;
  excluded?: boolean;
  notes?: string;
  status?: string;
  waitlistName?: string;
}

interface TimeSlot {
  time: string;
  date: string;
  provider: string;
  duration: number;
}

const ResyWaitlist: React.FC = () => {
  console.log('ResyWaitlist rendering - With patient data');
  const { waitlistEntries, loading, error, refreshWaitlist } = useWaitlist();
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [showBlastModal, setShowBlastModal] = useState(false);
  const [showExclusionModal, setShowExclusionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHandraised, setFilterHandraised] = useState(false);
  const [notificationType, setNotificationType] = useState<'waterfall' | 'blast'>('waterfall');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [quickFillTime, setQuickFillTime] = useState('');

  // Use real data from Supabase
  const waitlistPatients: WaitlistPatient[] = waitlistEntries;

  // Mock data as fallback (will be used if no real data)
  const mockWaitlistPatients: WaitlistPatient[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '(555) 123-4567',
      photo: 'https://i.pravatar.cc/150?img=1',
      condition: 'Anxiety',
      insurance: 'Blue Cross',
      preferredTimes: ['Morning', 'Early Afternoon'],
      joinedDate: '2 days ago',
      position: 1,
      matchScore: 95,
      handRaised: true,
      urgency: 'high',
      lastContact: '1 hour ago',
      responseRate: 92,
      provider: 'Dr. Chen',
      notes: 'Prefers video sessions'
    },
    {
      id: '2',
      name: 'Michael Davis',
      email: 'mdavis@email.com',
      phone: '(555) 234-5678',
      photo: 'https://i.pravatar.cc/150?img=2',
      condition: 'Depression',
      insurance: 'Aetna',
      preferredTimes: ['Evening', 'Weekend'],
      joinedDate: '1 week ago',
      position: 2,
      matchScore: 82,
      handRaised: true,
      urgency: 'medium',
      lastContact: '3 days ago',
      responseRate: 75,
      provider: 'Dr. Rodriguez'
    },
    {
      id: '3',
      name: 'Emily Chen',
      email: 'echen@email.com',
      phone: '(555) 345-6789',
      photo: 'https://i.pravatar.cc/150?img=3',
      condition: 'ADHD',
      insurance: 'United',
      preferredTimes: ['Afternoon'],
      joinedDate: '2 weeks ago',
      position: 3,
      matchScore: 78,
      handRaised: false,
      urgency: 'low',
      lastContact: '1 week ago',
      responseRate: 88,
      provider: 'Dr. Chen'
    }
  ];

  const availableSlots: TimeSlot[] = [
    { time: '2:00 PM', date: 'Today', provider: 'Dr. Chen', duration: 50 },
    { time: '3:30 PM', date: 'Today', provider: 'Dr. Rodriguez', duration: 50 },
    { time: '10:00 AM', date: 'Tomorrow', provider: 'Dr. Williams', duration: 50 },
    { time: '4:00 PM', date: 'Tomorrow', provider: 'Dr. Chen', duration: 50 }
  ];

  const handleQuickFill = () => {
    // Parse time like "3pm" or "tue 2:30"
    const matchingSlot = availableSlots.find(slot => 
      slot.time.toLowerCase().includes(quickFillTime.toLowerCase())
    );
    if (matchingSlot) {
      setSelectedSlot(matchingSlot);
      setShowBlastModal(true);
    }
  };

  const handleNotifyPatients = () => {
    console.log('Notifying patients:', {
      type: notificationType,
      patients: selectedPatients.length > 0 ? selectedPatients : 'All eligible',
      slot: selectedSlot
    });
    setShowBlastModal(false);
  };

  const filteredPatients = waitlistPatients.filter(patient => {
    if (patient.excluded) return false;
    if (filterHandraised && !patient.handRaised) return false;
    if (searchTerm && !patient.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Waitlist Management</h1>
              <p className="text-gray-600 mt-1">
                {waitlistPatients.filter(p => !p.excluded).length} patients waiting • 
                {availableSlots.length} slots available today
              </p>
            </div>

            {/* Quick Fill */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type time (e.g., 3pm)"
                  value={quickFillTime}
                  onChange={(e) => setQuickFillTime(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleQuickFill();
                  }}
                  className="px-4 py-2 border rounded-lg w-48"
                />
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <button
                onClick={handleQuickFill}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Quick Fill
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-64"
                />
              </div>

              {/* Filters */}
              <button
                onClick={() => setFilterHandraised(!filterHandraised)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  filterHandraised 
                    ? 'bg-yellow-100 text-yellow-700 border-yellow-300' 
                    : 'border hover:bg-gray-50'
                }`}
              >
                <HandMetal className="w-4 h-4" />
                Hand Raised Only
              </button>

              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                More Filters
              </button>
            </div>

            {/* Bulk Actions */}
            <div className="flex items-center gap-3">
              {selectedPatients.length > 0 && (
                <span className="text-sm text-gray-600">
                  {selectedPatients.length} selected
                </span>
              )}
              <button
                onClick={() => setShowBlastModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Notify Patients
              </button>
              <button
                onClick={() => setShowExclusionModal(true)}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
              >
                <Ban className="w-4 h-4" />
                Manage Exclusions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {/* Available Slots Preview */}
        <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-900 mb-3">Available Slots to Fill</h3>
          <div className="grid grid-cols-4 gap-3">
            {availableSlots.map((slot, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedSlot(slot);
                  setShowBlastModal(true);
                }}
                className="bg-white border border-green-300 rounded-lg p-3 hover:bg-green-100 transition-colors text-left"
              >
                <div className="font-medium">{slot.time}</div>
                <div className="text-sm text-gray-600">{slot.date} • {slot.provider}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Waitlist Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading waitlist...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">Error loading waitlist: {error}</p>
              <button 
                onClick={refreshWaitlist}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No patients in waitlist</p>
            </div>
          ) : (
            filteredPatients.map((patient, index) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b last:border-b-0 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
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
                    className="mt-1 rounded border-gray-300"
                  />

                  {/* Position Badge */}
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-semibold text-gray-700">
                    {patient.position}
                  </div>

                  {/* Patient Photo */}
                  <img
                    src={patient.photo || `https://ui-avatars.com/api/?name=${patient.name}`}
                    alt={patient.name}
                    className="w-10 h-10 rounded-full"
                  />

                  {/* Patient Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-base">{patient.name}</h3>
                      
                      {/* Badges */}
                      {patient.handRaised && (
                        <span className="px-1.5 py-0.5 bg-yellow-50 text-yellow-700 rounded text-xs font-medium flex items-center gap-1">
                          <HandMetal className="w-3 h-3" />
                          Hand Raised
                        </span>
                      )}
                      
                      {patient.matchScore > 90 && (
                        <span className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium">
                          {patient.matchScore}% Match
                        </span>
                      )}

                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        patient.urgency === 'high' ? 'bg-red-50 text-red-700' :
                        patient.urgency === 'medium' ? 'bg-orange-50 text-orange-700' :
                        'bg-gray-50 text-gray-700'
                      }`}>
                        {patient.urgency} urgency
                      </span>
                    </div>

                    <div className="flex items-center gap-6 mt-2 text-sm text-gray-600">
                      <div>{patient.condition}</div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {patient.preferredTimes.join(', ')}
                      </div>
                      <div>{patient.insurance}</div>
                      {patient.provider && <div>Provider: {patient.provider}</div>}
                      <div className="text-gray-500">Joined {patient.joinedDate}</div>
                    </div>

                    {patient.notes && (
                      <p className="text-xs text-gray-500 mt-1.5 italic">{patient.notes}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Send message">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded" title="View details">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
            ))
          )}
        </div>
      </div>
      </div>

      {/* Blast Notification Modal */}
      <AnimatePresence>
        {showBlastModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBlastModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4">Send Notifications</h3>

              {selectedSlot && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    Filling slot: <strong>{selectedSlot.time} {selectedSlot.date}</strong> with {selectedSlot.provider}
                  </p>
                </div>
              )}

              {/* Notification Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Notification Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setNotificationType('waterfall')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      notificationType === 'waterfall' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Timer className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <h4 className="font-medium">Waterfall</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Notify one at a time, 5-min response window
                    </p>
                  </button>
                  
                  <button
                    onClick={() => setNotificationType('blast')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      notificationType === 'blast' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Zap className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <h4 className="font-medium">Blast</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Notify all at once, first to respond wins
                    </p>
                  </button>
                </div>
              </div>

              {/* Recipients */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Recipients</label>
                <p className="text-sm text-gray-600">
                  {selectedPatients.length > 0 
                    ? `${selectedPatients.length} selected patients`
                    : `All eligible patients (${filteredPatients.length})`}
                </p>
              </div>

              {/* Message Preview */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Message Preview</label>
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  Hi! A {selectedSlot?.time} appointment just opened up {selectedSlot?.date} with {selectedSlot?.provider}. 
                  Reply YES to claim this slot. This offer expires in {notificationType === 'waterfall' ? '5 minutes' : '10 minutes'}.
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowBlastModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNotifyPatients}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Notifications
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResyWaitlist;