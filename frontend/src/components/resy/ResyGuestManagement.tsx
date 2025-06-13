import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Star, Calendar, Clock, MessageSquare,
  AlertCircle, TrendingUp, User, Phone, Mail, Shield,
  ChevronRight, MoreVertical, CheckCircle, XCircle,
  Bell, Send, FileText, Activity, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePatientsSupabase } from '../../hooks/usePatientsSupabase';

interface Patient {
  id: string;
  name: string;
  photo?: string;
  email: string;
  phone: string;
  reliabilityScore: number;
  totalVisits: number;
  preferredTimes: string[];
  conditions: string[];
  insurance: {
    provider: string;
    verified: boolean;
    expiresIn?: number; // days
  };
  lastSeen: string;
  provider: string;
  status: 'active' | 'inactive' | 'new';
  attendanceRate: number;
  averageRating?: number;
  communicationPreference: 'email' | 'sms' | 'phone';
  tags: string[];
  notes?: string;
  nextAppointment?: {
    date: string;
    time: string;
    provider: string;
  };
  balance?: number;
  isVIP?: boolean;
  cancellationCount: number;
}

const ResyGuestManagement: React.FC = () => {
  const { patients: supabasePatients, loading, error, searchPatients, filterPatients } = usePatientsSupabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Transform Supabase patients to match component format
  const patients: Patient[] = supabasePatients.map((p: any) => ({
    id: p.patient_id,
    name: `${p.first_name} ${p.last_name}`,
    photo: `https://i.pravatar.cc/150?u=${p.patient_id}`,
    email: p.email,
    phone: p.phone,
    reliabilityScore: Math.floor(Math.random() * 30) + 70, // Mock for now
    totalVisits: Math.floor(Math.random() * 50) + 10,
    preferredTimes: p.preferences?.preferredTimes || ['Morning'],
    conditions: [p.preferences?.primaryCondition || 'General'],
    insurance: {
      provider: p.insurance_info?.provider || 'Unknown',
      verified: p.insurance_info?.verified || false,
      expiresIn: p.insurance_info?.expiresIn
    },
    lastSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    provider: 'Dr. Chen', // Mock for now
    status: p.status || 'active',
    attendanceRate: Math.floor(Math.random() * 20) + 80,
    averageRating: 4 + Math.random(),
    communicationPreference: p.preferences?.communicationPreference || 'email',
    tags: p.tags || [],
    notes: p.notes,
    nextAppointment: Math.random() > 0.5 ? {
      date: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
      time: '2:00 PM',
      provider: 'Dr. Chen'
    } : undefined,
    balance: Math.random() > 0.7 ? Math.floor(Math.random() * 500) : 0,
    isVIP: p.tags?.includes('VIP'),
    cancellationCount: Math.floor(Math.random() * 5)
  }));

  // Filter patients based on search and filter
  const filteredPatients = React.useMemo(() => {
    let result = [...patients];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(patient => 
        patient.name.toLowerCase().includes(searchLower) ||
        patient.email.toLowerCase().includes(searchLower) ||
        patient.conditions.some(c => c.toLowerCase().includes(searchLower))
      );
    }
    
    switch (selectedFilter) {
      case 'unseen30':
        // Filter patients not seen in 30+ days
        result = result.filter(p => {
          const lastSeenDate = new Date(p.lastSeen);
          const daysSince = (Date.now() - lastSeenDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysSince > 30;
        });
        break;
      case 'highcancel':
        result = result.filter(p => p.cancellationCount > 2);
        break;
      case 'vip':
        result = result.filter(p => p.isVIP);
        break;
      case 'insurance':
        result = result.filter(p => p.insurance.expiresIn && p.insurance.expiresIn < 60);
        break;
      case 'balance':
        result = result.filter(p => p.balance && p.balance > 0);
        break;
    }
    
    return result;
  }, [patients, searchTerm, selectedFilter]);

  const filters = [
    { id: 'all', label: 'All Patients', count: patients.length },
    { id: 'unseen30', label: "Haven't seen in 30+ days", count: patients.filter(p => {
      const lastSeenDate = new Date(p.lastSeen);
      const daysSince = (Date.now() - lastSeenDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 30;
    }).length },
    { id: 'highcancel', label: 'High cancellation rate', count: patients.filter(p => p.cancellationCount > 2).length },
    { id: 'vip', label: 'VIP/Priority patients', count: patients.filter(p => p.isVIP).length },
    { id: 'insurance', label: 'Insurance expiring soon', count: patients.filter(p => p.insurance.expiresIn && p.insurance.expiresIn < 60).length },
    { id: 'balance', label: 'Outstanding balance', count: patients.filter(p => p.balance && p.balance > 0).length }
  ];

  const handleBulkAction = (action: string) => {
    console.log('Bulk action:', action, 'for patients:', selectedPatients);
    setShowBulkActions(false);
    setSelectedPatients([]);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Patient Management</h1>
              <p className="text-gray-600 mt-1">
                {filteredPatients.length} patients • {patients.filter(p => p.status === 'active').length} active
              </p>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients, conditions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-96"
                />
              </div>

              {selectedPatients.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{selectedPatients.length} selected</span>
                  <button
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Bulk Actions
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Smart Filters */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 transition-colors ${
                  selectedFilter === filter.id
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'border hover:bg-gray-50'
                }`}
              >
                <span>{filter.label}</span>
                <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk Actions Dropdown */}
      <AnimatePresence>
        {showBulkActions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-blue-50 border-b border-blue-200 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleBulkAction('reminder')}
                  className="px-4 py-2 bg-white rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Send Appointment Reminders
                </button>
                <button
                  onClick={() => handleBulkAction('slots')}
                  className="px-4 py-2 bg-white rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Offer Available Slots
                </button>
                <button
                  onClick={() => handleBulkAction('feedback')}
                  className="px-4 py-2 bg-white rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Request Feedback
                </button>
                <button
                  onClick={() => handleBulkAction('export')}
                  className="px-4 py-2 bg-white rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Export Data
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Scrollable Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {/* Patient Cards Grid */}
        <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            <p>Error loading patients: {error}</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No patients found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient, index) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
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
                    <img
                      src={patient.photo || `https://ui-avatars.com/api/?name=${patient.name}`}
                      alt={patient.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {patient.name}
                        {patient.isVIP && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                            VIP
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{patient.reliabilityScore} reliability</span>
                        <span>•</span>
                        <span>{patient.totalVisits} visits</span>
                      </div>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* Key Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Activity className="w-4 h-4" />
                    <span>{patient.conditions.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>{patient.insurance.provider}</span>
                    {patient.insurance.verified ? (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-yellow-600" />
                    )}
                    {patient.insurance.expiresIn && (
                      <span className="text-xs text-orange-600">
                        Expires in {patient.insurance.expiresIn}d
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span>Last seen: {patient.lastSeen} with {patient.provider}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {patient.tags.map(tag => (
                    <span
                      key={tag}
                      className={`px-2 py-1 text-xs rounded-full ${
                        tag === 'VIP' ? 'bg-yellow-100 text-yellow-700' :
                        tag === 'Reliable' ? 'bg-green-100 text-green-700' :
                        tag === 'High Cancellation' ? 'bg-red-100 text-red-700' :
                        tag === 'New Patient' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Next Appointment or Action */}
                {patient.nextAppointment ? (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <p className="font-medium text-blue-900">Next appointment</p>
                        <p className="text-blue-700">
                          {patient.nextAppointment.date} at {patient.nextAppointment.time}
                        </p>
                      </div>
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                      Book
                    </button>
                    <button className="flex-1 px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm">
                      Message
                    </button>
                  </div>
                )}

                {/* Engagement Metrics */}
                <div className="mt-4 pt-4 border-t flex justify-between text-xs text-gray-500">
                  <span>Attendance: {patient.attendanceRate}%</span>
                  <span>Prefers: {patient.preferredTimes.join(', ')}</span>
                  <span>
                    {patient.communicationPreference === 'sms' && <Phone className="w-3 h-3" />}
                    {patient.communicationPreference === 'email' && <Mail className="w-3 h-3" />}
                  </span>
                </div>

                {/* Outstanding Balance */}
                {patient.balance && patient.balance > 0 && (
                  <div className="mt-2 flex items-center justify-between p-2 bg-orange-50 rounded text-sm">
                    <span className="text-orange-700">Balance: ${patient.balance}</span>
                    <button className="text-orange-600 hover:text-orange-700 font-medium">
                      Send Invoice
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Attendance</p>
                <p className="text-2xl font-bold">87%</p>
                <p className="text-xs text-green-600">+3% this month</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Patients</p>
                <p className="text-2xl font-bold">{patients.filter(p => p.status === 'active').length}</p>
                <p className="text-xs text-gray-500">Last 90 days</p>
              </div>
              <User className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Insurance Issues</p>
                <p className="text-2xl font-bold">{patients.filter(p => !p.insurance.verified || p.insurance.expiresIn).length}</p>
                <p className="text-xs text-orange-600">Needs attention</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold">${patients.reduce((sum, p) => sum + (p.balance || 0), 0)}</p>
                <p className="text-xs text-gray-500">Total balance</p>
              </div>
              <DollarSign className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ResyGuestManagement;