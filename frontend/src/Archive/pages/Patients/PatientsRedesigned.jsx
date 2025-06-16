import React, { useState, useEffect } from 'react';
import { Calendar, MessageSquare, Clock, MapPin, Shield, Stethoscope, ChevronRight, Search, Filter, User, Phone, Mail } from 'lucide-react';
import { supabaseAnon } from '../../lib/supabase-anon';
import { calculateProviderPatientMatch } from '../../utils/providerMatching';
import { motion, AnimatePresence } from 'framer-motion';

const PatientsRedesigned = () => {
  console.log('PatientsRedesigned component rendering');
  
  const [patients, setPatients] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPatientForBooking, setSelectedPatientForBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('PatientsRedesigned useEffect running');
    // Force real data fetch by clearing demo mode
    localStorage.removeItem('isDemoMode');
    localStorage.removeItem('demoUser');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('PatientsRedesigned: Starting data fetch...');
      
      // Fetch patients with their appointments
      const { data: patientsData, error: patientsError } = await supabaseAnon
        .from('patients')
        .select(`
          *,
          appointments!left (
            appointment_id,
            start_time,
            end_time,
            provider:providers!left (
              first_name,
              last_name,
              title
            ),
            status
          )
        `)
        .order('created_at', { ascending: false });

      console.log('PatientsRedesigned: Patients query result:', { patientsData, patientsError });

      if (patientsError) {
        console.error('Patients query error:', patientsError);
        setError(`Failed to load patients: ${patientsError.message}`);
      }

      // Fetch providers for matching
      const { data: providersData, error: providersError } = await supabaseAnon
        .from('providers')
        .select('*');

      console.log('PatientsRedesigned: Providers query result:', { providersData, providersError });

      if (providersError) {
        console.error('Providers query error:', providersError);
        // Don't set error for providers, as we can still show patients
      }

      setPatients(patientsData || []);
      setProviders(providersData || []);
      console.log('PatientsRedesigned: State updated with', patientsData?.length || 0, 'patients and', providersData?.length || 0, 'providers');
    } catch (error) {
      console.error('PatientsRedesigned: Error fetching data:', error);
      setError(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Get best matching providers for a patient
  const getBestProvidersForPatient = (patient) => {
    const matchedProviders = providers.map(provider => {
      const matchResult = calculateProviderPatientMatch(
        {
          specialties: provider.specialties || [],
          insurance_accepted: provider.insurance_accepted || [],
          location: provider.location,
          virtual_available: provider.virtual_available,
          in_person_available: provider.in_person_available
        },
        {
          diagnosis: patient.diagnosis || patient.primary_condition || '',
          insurance: patient.insurance_info?.provider || patient.insurance_provider || '',
          location: patient.location || patient.city || 'New York, NY',
          preferredModality: patient.preferred_modality || 'either',
          preferredGender: patient.preferred_gender || 'no preference'
        }
      );

      return {
        ...provider,
        matchScore: matchResult.score,
        matchReasons: matchResult.reasons
      };
    }).filter(p => p.matchScore > 0);

    return matchedProviders.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
  };

  // Get patient's next or last appointment
  const getPatientAppointmentInfo = (patient) => {
    if (!patient.appointments || patient.appointments.length === 0) {
      return { type: 'new', text: 'New Patient - No appointments yet' };
    }

    const now = new Date();
    const futureAppointments = patient.appointments
      .filter(apt => new Date(apt.start_time || apt.appointment_date) > now && apt.status !== 'cancelled')
      .sort((a, b) => new Date(a.start_time || a.appointment_date) - new Date(b.start_time || b.appointment_date));

    if (futureAppointments.length > 0) {
      const nextApt = futureAppointments[0];
      const provider = nextApt.provider;
      const date = new Date(nextApt.start_time || nextApt.appointment_date);
      return {
        type: 'next',
        text: `Next: ${date.toLocaleDateString()} with Dr. ${provider?.last_name || 'Provider'}`,
        date: date,
        provider: provider
      };
    }

    const pastAppointments = patient.appointments
      .filter(apt => apt.status === 'completed')
      .sort((a, b) => new Date(b.start_time || b.appointment_date) - new Date(a.start_time || a.appointment_date));

    if (pastAppointments.length > 0) {
      const lastApt = pastAppointments[0];
      const provider = lastApt.provider;
      const date = new Date(lastApt.start_time || lastApt.appointment_date);
      return {
        type: 'last',
        text: `Last seen: ${date.toLocaleDateString()} by Dr. ${provider?.last_name || 'Provider'}`,
        date: date,
        provider: provider
      };
    }

    return { type: 'new', text: 'New Patient - No completed appointments' };
  };

  const handleBookAppointment = (patient) => {
    setSelectedPatientForBooking(patient);
    setShowBookingModal(true);
  };

  const handleMessage = (patient) => {
    console.log('Message patient:', patient);
    // TODO: Implement messaging functionality
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm);
    
    if (filterStatus === 'all') return matchesSearch;
    
    const appointmentInfo = getPatientAppointmentInfo(patient);
    if (filterStatus === 'new' && appointmentInfo.type === 'new') return matchesSearch;
    if (filterStatus === 'scheduled' && appointmentInfo.type === 'next') return matchesSearch;
    if (filterStatus === 'seen' && appointmentInfo.type === 'last') return matchesSearch;
    
    return false;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">All Patients</h1>
          
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>

            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Patients</option>
              <option value="new">New Patients</option>
              <option value="scheduled">Scheduled</option>
              <option value="seen">Previously Seen</option>
            </select>

            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              + Add Patient
            </button>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-4">
          {filteredPatients.map((patient) => {
            const appointmentInfo = getPatientAppointmentInfo(patient);
            const bestProviders = getBestProvidersForPatient(patient);
            
            return (
              <motion.div
                key={patient.patient_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Patient Photo */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                        {patient.photo ? (
                          <img src={patient.photo} alt={patient.first_name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-gray-500" />
                        )}
                      </div>
                    </div>

                    {/* Patient Info - Middle Section */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {patient.first_name} {patient.last_name}
                          </h3>
                          
                          <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {patient.email}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {patient.phone}
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              {patient.insurance_provider || 'Self-pay'}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {patient.city || 'New York'}, {patient.state || 'NY'}
                            </div>
                          </div>

                          <div className="mt-3 flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Stethoscope className="w-4 h-4 text-blue-600" />
                              <span className="text-gray-700">
                                {patient.primary_condition || patient.diagnosis || 'General consultation'}
                              </span>
                            </div>
                            {patient.secondary_conditions && patient.secondary_conditions.length > 0 && (
                              <span className="text-gray-500">
                                +{patient.secondary_conditions.length} more conditions
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right Section - Actions and Appointment Info */}
                        <div className="flex flex-col items-end gap-3">
                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleBookAppointment(patient)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                              <Calendar className="w-4 h-4" />
                              Book
                            </button>
                            <button
                              onClick={() => handleMessage(patient)}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                            >
                              <MessageSquare className="w-4 h-4" />
                              Message
                            </button>
                          </div>

                          {/* Appointment Info */}
                          <div className={`text-sm px-3 py-1 rounded-full ${
                            appointmentInfo.type === 'new' ? 'bg-green-100 text-green-700' :
                            appointmentInfo.type === 'next' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {appointmentInfo.text}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {filteredPatients.length === 0 && (
            <div className="text-center py-12">
              {error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-red-800 font-medium">Error loading patients</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                  <button 
                    onClick={() => {
                      setError(null);
                      fetchData();
                    }}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <p className="text-gray-500">No patients found matching your criteria</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedPatientForBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">
                  Book Appointment for {selectedPatientForBooking.first_name} {selectedPatientForBooking.last_name}
                </h2>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <h3 className="font-medium text-gray-700 mb-4">Recommended Providers</h3>
                <div className="space-y-4">
                  {getBestProvidersForPatient(selectedPatientForBooking).map((provider) => (
                    <div key={provider.provider_id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">
                            Dr. {provider.first_name} {provider.last_name}
                          </h4>
                          <p className="text-sm text-gray-600">{provider.title}</p>
                          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                            <span>{provider.location}</span>
                            <span>•</span>
                            <span>{provider.specialties?.slice(0, 2).join(', ')}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">
                            {provider.matchScore}% Match
                          </div>
                          <button className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                            Select
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                    View All Providers
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientsRedesigned;