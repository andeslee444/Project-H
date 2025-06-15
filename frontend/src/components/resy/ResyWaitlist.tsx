import React, { useState, useEffect } from 'react';
import { 
  Users, Send, Filter, AlertCircle, Clock, MessageSquare,
  TrendingUp, CheckCircle, X, ChevronRight, User, Star,
  Bell, Search, HandMetal, Ban, Timer, Zap, ChevronDown, Loader2,
  MapPin, Shield, Stethoscope, ChevronLeft, Calendar, Phone, Mail, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWaitlist } from '../../hooks/useWaitlist';
import { useProvidersSupabase } from '../../hooks/useProvidersSupabase';
import { calculateProviderPatientMatch } from '../../utils/providerMatching';
import ProviderAvailability from './ProviderAvailability';
import NotificationModal from './NotificationModal';

interface WaitlistPatient {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  condition: string;
  allDiagnoses?: string[];
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
  location?: string;
  distance?: number;
  preferredModality?: string;
  preferredGender?: string;
}

interface Provider {
  provider_id: string;
  first_name: string;
  last_name: string;
  name?: string;
  title: string;
  photo?: string;
  specialties: string[];
  insurance_accepted: string[];
  location?: string;
  availability?: {
    today: string[];
    tomorrow: string[];
    thisWeek: number;
  };
  next_available?: string;
  rating?: number;
  review_count?: number;
  patients_seen?: number;
  weekly_slots?: number;
  virtual_available?: boolean;
  in_person_available?: boolean;
}

// Custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
`;

const ResyWaitlist: React.FC = () => {
  const { waitlistEntries = [], loading, error, refreshWaitlist } = useWaitlist();
  const { providers: supabaseProviders = [], loading: providersLoading } = useProvidersSupabase();
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    handRaised: false,
    diagnosis: '',
    insurance: '',
    maxDistance: 50,
    searchTerm: ''
  });
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [hoveredProviderId, setHoveredProviderId] = useState<string | null>(null);
  const [providerWaitlistMap, setProviderWaitlistMap] = useState<Map<string, Set<string>>>(new Map());
  const [expandedProviderId, setExpandedProviderId] = useState<string | null>(null);
  const carouselRef = React.useRef<HTMLDivElement>(null);

  // Process provider data with stable values from Supabase
  const providers: Provider[] = supabaseProviders.map(p => ({
    ...p,
    name: p.name || `${p.first_name} ${p.last_name}`,
    photo: p.photo || `https://ui-avatars.com/api/?name=${p.first_name}+${p.last_name}&background=6366f1&color=fff`,
    patients_seen: p.patients_seen || 100, // Use real data from Supabase
    rating: p.rating || 4.5, // Use real rating from Supabase
    location: p.location || 'Manhattan, NY',
    availability: {
      today: p.weekly_slots === 0 ? [] : ['2:00 PM', '3:30 PM', '5:00 PM'], // No slots if weekly_slots is 0
      tomorrow: p.weekly_slots === 0 ? [] : ['9:00 AM', '11:00 AM', '2:00 PM'],
      thisWeek: p.weekly_slots !== undefined ? p.weekly_slots : 10 // Use real weekly slots from Supabase, handle 0 properly
    }
  }));

  // The waitlistEntries are already transformed by the hook
  const waitlistPatients: WaitlistPatient[] = waitlistEntries;

  // Build provider-patient mapping from waitlist entries
  useEffect(() => {
    const fetchProviderWaitlists = async () => {
      try {
        // Get all waitlist entries with provider information
        // Fetch waitlists and their entries separately to avoid view permission issues
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/waitlists?select=provider_id,waitlist_entries(patient_id,hand_raised)`, {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const providerMap = new Map<string, Set<string>>();
          
          // Process waitlists and their entries
          data.forEach(waitlist => {
            if (waitlist.provider_id && waitlist.waitlist_entries) {
              const providerId = waitlist.provider_id;
              if (!providerMap.has(providerId)) {
                providerMap.set(providerId, new Set());
              }
              // Add each patient from this provider's waitlist
              waitlist.waitlist_entries.forEach(entry => {
                if (entry.patient_id) {
                  providerMap.get(providerId)?.add(entry.patient_id);
                }
              });
            }
          });
          
          setProviderWaitlistMap(providerMap);
          console.log('Provider waitlist map:', Array.from(providerMap.entries()).map(([k, v]) => ({ provider: k, patients: v.size })));
          console.log('Raw waitlist data:', data.slice(0, 5)); // Log first 5 entries
        }
      } catch (error) {
        console.error('Error fetching provider waitlists:', error);
      }
    };

    fetchProviderWaitlists();
  }, []);

  // Filter patients based on selected provider and filters
  const filteredPatients = waitlistPatients.filter(patient => {
    if (patient.excluded) return false;

    // Search filter
    if (filters.searchTerm && !patient.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }

    // Hand raised filter
    if (filters.handRaised && !patient.handRaised) return false;

    // Distance filter
    if (patient.distance && patient.distance > filters.maxDistance) return false;

    // Diagnosis filter
    if (filters.diagnosis && patient.condition !== filters.diagnosis) return false;

    // Insurance filter
    if (filters.insurance && patient.insurance !== filters.insurance) return false;

    // Provider-specific filtering
    if (selectedProvider) {
      // Check if patient is on this provider's waitlist
      const isOnProviderWaitlist = patient.provider && patient.provider.includes(selectedProvider.last_name);
      
      // Also check matching criteria for additional context
      const matchResult = calculateProviderPatientMatch(
        {
          specialties: selectedProvider.specialties || [],
          insurance_accepted: selectedProvider.insurance_accepted || [],
          location: selectedProvider.location,
          virtual_available: selectedProvider.virtual_available,
          in_person_available: selectedProvider.in_person_available
        },
        {
          diagnosis: patient.allDiagnoses || patient.condition,
          insurance: patient.insurance,
          location: patient.location || '',
          preferredModality: patient.preferredModality,
          preferredGender: patient.preferredGender
        }
      );
      
      // Show patient if they're on this provider's waitlist OR if they match the provider criteria
      if (!isOnProviderWaitlist && !matchResult.matches) {
        return false;
      }
    }

    return true;
  });

  // Get unique values for filters
  const uniqueDiagnoses = [...new Set(waitlistPatients.map(p => p.condition))];
  const uniqueInsurances = [...new Set(waitlistPatients.map(p => p.insurance))];

  const handleProviderCardClick = (provider: Provider) => {
    // Toggle availability expansion instead of selecting provider
    if (expandedProviderId === provider.provider_id) {
      setExpandedProviderId(null);
    } else {
      setExpandedProviderId(provider.provider_id);
      setSelectedProvider(provider);
    }
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    
    const scrollAmount = 300; // Scroll by approximately one card width
    const currentScroll = carouselRef.current.scrollLeft;
    
    if (direction === 'left') {
      carouselRef.current.scrollTo({
        left: Math.max(0, currentScroll - scrollAmount),
        behavior: 'smooth'
      });
    } else {
      carouselRef.current.scrollTo({
        left: currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Handle checkbox selection with shift-click support
  const handlePatientSelection = (patientId: string, index: number, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelectedIndex !== null) {
      // Shift-click: select range
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const patientIdsInRange = filteredPatients
        .slice(start, end + 1)
        .map(p => p.id);
      
      setSelectedPatients(prev => {
        const newSelection = new Set(prev);
        patientIdsInRange.forEach(id => newSelection.add(id));
        return Array.from(newSelection);
      });
    } else {
      // Regular click: toggle single selection
      setSelectedPatients(prev => {
        if (prev.includes(patientId)) {
          return prev.filter(id => id !== patientId);
        } else {
          return [...prev, patientId];
        }
      });
    }
    setLastSelectedIndex(index);
  };

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Waitlist Management</h1>
              <p className="text-gray-600 mt-1">
                {waitlistPatients.filter(p => !p.excluded).length} patients waiting • 
                {providers.length} providers available
              </p>
            </div>
            <button
              onClick={() => setShowNotificationModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
              disabled={selectedPatients.length === 0}
            >
              <Send className="w-4 h-4" />
              Notify Selected ({selectedPatients.length})
            </button>
          </div>
        </div>
      </div>

      {/* Provider Carousel */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Select Provider to Match Patients</h2>
            <div className="flex gap-2">
              <button
                onClick={() => scrollCarousel('left')}
                className="p-2 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollCarousel('right')}
                className="p-2 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Provider Cards */}
          <div className="relative">
            <div 
              ref={carouselRef}
              className="overflow-x-auto pb-4 pt-4 custom-scrollbar"
              style={{
                scrollbarWidth: 'thin',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <div className="flex gap-4 pb-2">
              {providers.map((provider) => {
                // Get actual waitlist count from the map
                const providerPatients = providerWaitlistMap.get(provider.provider_id);
                
                // Count patients actually on this provider's waitlist
                // Look for patients where provider matches this provider's name
                const patientsOnWaitlist = waitlistPatients.filter(patient => {
                  if (patient.excluded) return false;
                  // Check if patient's provider field matches this provider
                  const providerLastName = provider.last_name;
                  return patient.provider && patient.provider.includes(providerLastName);
                });
                
                // Use the actual count from filtered patients
                const actualWaitlistCount = patientsOnWaitlist.length;
                
                // Debug logging
                if (provider.last_name === 'Johnson' || provider.last_name === 'Wilson') {
                  console.log(`${provider.last_name} - ID: ${provider.provider_id}, Patients:`, patientsOnWaitlist.map(p => p.name));
                }
                
                // Find patients that match criteria but aren't on waitlist yet
                const potentialMatchesData = waitlistPatients.filter(patient => {
                  if (patient.excluded) return false;
                  
                  // Skip if already on this provider's waitlist
                  if (patient.provider && patient.provider.includes(provider.last_name)) return false;
                  
                  // Check if matches criteria
                  const matchResult = calculateProviderPatientMatch(
                    {
                      specialties: provider.specialties || [],
                      insurance_accepted: provider.insurance_accepted || [],
                      location: provider.location,
                      virtual_available: provider.virtual_available,
                      in_person_available: provider.in_person_available
                    },
                    {
                      diagnosis: patient.allDiagnoses || patient.condition,
                      insurance: patient.insurance,
                      location: patient.location || '',
                      preferredModality: patient.preferredModality,
                      preferredGender: patient.preferredGender
                    }
                  );
                  
                  return matchResult.matches;
                });
                
                const handRaisedCount = patientsOnWaitlist.filter(p => p.handRaised).length;
                const potentialMatches = potentialMatchesData.length;

                return (
                  <div
                    key={provider.provider_id}
                    className={`flex-shrink-0 w-64 cursor-pointer relative transition-transform hover:-translate-y-1 ${
                      expandedProviderId === provider.provider_id
                        ? 'ring-2 ring-blue-600 rounded-lg'
                        : ''
                    }`}
                    onClick={() => handleProviderCardClick(provider)}
                  >
                    {/* Matching patients indicator */}
                    {(actualWaitlistCount > 0 || potentialMatches > 0) && (
                      <div className="absolute -top-3 -right-3 z-10">
                        <div 
                          className="bg-orange-500 text-white text-xs font-semibold rounded px-2 py-1 flex items-center justify-center relative group shadow-md"
                          onMouseEnter={() => setHoveredProviderId(provider.provider_id)}
                          onMouseLeave={() => setHoveredProviderId(null)}
                        >
                          {actualWaitlistCount} waitlisted
                          
                          {/* Tooltip */}
                          {hoveredProviderId === provider.provider_id && (
                            <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-lg">
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span>Hand Raised:</span>
                                  <span className="font-bold">{handRaisedCount}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>On Waitlist:</span>
                                  <span className="font-bold">{actualWaitlistCount}</span>
                                </div>
                                {potentialMatches > 0 && (
                                  <div className="flex justify-between">
                                    <span>Potential Matches:</span>
                                    <span className="font-bold">{potentialMatches}</span>
                                  </div>
                                )}
                                {provider.availability?.thisWeek === 0 && (
                                  <div className="border-t pt-1 mt-1 text-red-400 font-medium">
                                    No slots available
                                  </div>
                                )}
                              </div>
                              <div className="absolute -bottom-1 right-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className={`bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow ${provider.availability?.thisWeek === 0 ? 'border-red-200 bg-red-50' : ''}`}>
                      <div className="flex items-start gap-3">
                        <img
                          src={provider.photo}
                          alt={provider.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900">{provider.name}</h3>
                            {provider.availability?.thisWeek === 0 && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">Fully Booked</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{provider.title}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-1" />
                          {provider.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Star className="w-4 h-4 mr-1 text-yellow-500" />
                          {provider.rating?.toFixed(1)} • {provider.patients_seen} patients
                        </div>
                        <div className={`flex items-center text-sm ${provider.availability?.thisWeek === 0 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                          <Calendar className={`w-4 h-4 mr-1 ${provider.availability?.thisWeek === 0 ? 'text-red-500' : ''}`} />
                          {provider.availability?.thisWeek === 0 ? 'No slots available' : `${provider.availability?.thisWeek} slots this week`}
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-700 mb-1">Specialties:</p>
                        <div className="flex flex-wrap gap-1">
                          {(provider.specialties || []).slice(0, 3).map((specialty, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                              {specialty}
                            </span>
                          ))}
                          {(provider.specialties || []).length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{(provider.specialties || []).length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Insurance accepted preview */}
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-xs text-gray-500">
                          Accepts: {(provider.insurance_accepted || []).slice(0, 2).join(', ')}
                          {(provider.insurance_accepted || []).length > 2 && ` +${(provider.insurance_accepted || []).length - 2}`}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        </div>
        
        {/* Provider Availability Section */}
        {expandedProviderId && selectedProvider && (
          <ProviderAvailability
            providerId={expandedProviderId}
            providerName={`${selectedProvider.first_name} ${selectedProvider.last_name}`}
            isOpen={true}
            onClose={() => {
              setExpandedProviderId(null);
              setSelectedProvider(null);
            }}
          />
        )}
      </div>

      {/* Filters Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Hand Raised Filter */}
              <button
                onClick={() => setFilters({ ...filters, handRaised: !filters.handRaised })}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  filters.handRaised 
                    ? 'bg-yellow-100 text-yellow-700 border-yellow-300' 
                    : 'border hover:bg-gray-50'
                }`}
              >
                <HandMetal className="w-4 h-4" />
                Hand Raised
              </button>

              {/* Diagnosis Filter */}
              <div className="relative">
                <select
                  value={filters.diagnosis}
                  onChange={(e) => setFilters({ ...filters, diagnosis: e.target.value })}
                  className="pl-3 pr-8 py-2 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Diagnoses</option>
                  {uniqueDiagnoses.map(diagnosis => (
                    <option key={diagnosis} value={diagnosis}>{diagnosis}</option>
                  ))}
                </select>
                <Stethoscope className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Insurance Filter */}
              <div className="relative">
                <select
                  value={filters.insurance}
                  onChange={(e) => setFilters({ ...filters, insurance: e.target.value })}
                  className="pl-3 pr-8 py-2 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Insurance</option>
                  {uniqueInsurances.map(insurance => (
                    <option key={insurance} value={insurance}>{insurance}</option>
                  ))}
                </select>
                <Shield className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Distance Filter */}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={filters.maxDistance}
                  onChange={(e) => setFilters({ ...filters, maxDistance: parseInt(e.target.value) })}
                  className="w-24"
                />
                <span className="text-sm text-gray-600">{filters.maxDistance} mi</span>
              </div>
            </div>

            {/* Clear Filters */}
            {(filters.handRaised || filters.diagnosis || filters.insurance || filters.searchTerm || filters.maxDistance !== 50) && (
              <button
                onClick={() => setFilters({
                  handRaised: false,
                  diagnosis: '',
                  insurance: '',
                  maxDistance: 50,
                  searchTerm: ''
                })}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Waitlisted Patients */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Waitlisted Patients
                {selectedProvider && (
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    - Filtered for Dr. {selectedProvider.last_name}
                  </span>
                )}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {filteredPatients.length} patients match current filters
              </p>
            </div>

            {loading || providersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading patients...</span>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No patients match the current filters</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredPatients.map((patient, index) => {
                  const isSelected = selectedPatients.includes(patient.id);
                  return (
                    <motion.div
                      key={patient.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`relative transition-all duration-200 ${
                        isSelected 
                          ? 'bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100' 
                          : 'hover:bg-gray-50 border-l-4 border-transparent'
                      }`}
                      onClick={(e) => {
                        // Click on row selects the patient
                        if (!(e.target as HTMLElement).closest('button')) {
                          handlePatientSelection(patient.id, index, e);
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* Row Number */}
                            <span className="text-sm font-medium text-gray-400 w-8">
                              {index + 1}
                            </span>
                            
                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePatientSelection(patient.id, index, e);
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />

                        {/* Patient Photo */}
                        <img
                          src={patient.photo || `https://ui-avatars.com/api/?name=${patient.name}`}
                          alt={patient.name}
                          className="w-10 h-10 rounded-full"
                        />

                        {/* Patient Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium text-gray-900">{patient.name}</h3>
                            
                            {/* Badges */}
                            {patient.handRaised && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1">
                                <HandMetal className="w-3 h-3" />
                                Hand Raised
                              </span>
                            )}
                            
                            {selectedProvider && (() => {
                              const isOnProviderWaitlist = patient.provider && patient.provider.includes(selectedProvider.last_name);
                              
                              if (isOnProviderWaitlist) {
                                return (
                                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                    On Dr. {selectedProvider.last_name}'s Waitlist
                                  </span>
                                );
                              }
                              
                              const matchResult = calculateProviderPatientMatch(
                                {
                                  specialties: selectedProvider.specialties || [],
                                  insurance_accepted: selectedProvider.insurance_accepted || [],
                                  location: selectedProvider.location,
                                  virtual_available: selectedProvider.virtual_available,
                                  in_person_available: selectedProvider.in_person_available
                                },
                                {
                                  diagnosis: patient.allDiagnoses || patient.condition,
                                  insurance: patient.insurance,
                                  location: patient.location || '',
                                  preferredModality: patient.preferredModality,
                                  preferredGender: patient.preferredGender
                                }
                              );
                              
                              if (matchResult.matches && matchResult.reasons.length > 0) {
                                return (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium" title={matchResult.reasons.join(', ')}>
                                    Match: {matchResult.reasons[0]}
                                  </span>
                                );
                              }
                              return null;
                            })()}

                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              patient.urgency === 'high' ? 'bg-red-100 text-red-700' :
                              patient.urgency === 'medium' ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {patient.urgency} urgency
                            </span>
                          </div>

                          <div className="flex items-center gap-6 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Stethoscope className="w-4 h-4" />
                              {patient.condition}
                            </div>
                            <div className="flex items-center gap-1">
                              <Shield className="w-4 h-4" />
                              {patient.insurance}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {patient.location} • {patient.distance} mi away
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {patient.preferredTimes.join(', ')}
                            </div>
                          </div>

                          {patient.notes && (
                            <p className="text-sm text-gray-500 mt-2 italic">{patient.notes}</p>
                          )}
                        </div>
                      </div>

                      {/* Contact Actions */}
                      <div className="flex items-center gap-2">
                        <button 
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Call patient"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Email patient"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Send message"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
                );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      <AnimatePresence>
        {showNotificationModal && (
          <NotificationModal
            selectedPatients={selectedPatients}
            patients={filteredPatients.filter(p => selectedPatients.includes(p.id))}
            onClose={() => setShowNotificationModal(false)}
            onSend={() => {
              setSelectedPatients([]);
              setShowNotificationModal(false);
            }}
          />
        )}
      </AnimatePresence>
      </div>
    </>
  );
};

export default ResyWaitlist;