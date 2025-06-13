import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, MapPin, Clock, Calendar, ChevronRight, 
  Star, Heart, Info, Shield, Video, Building,
  Check, AlertCircle, Plus, Minus, ExternalLink, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GoogleMapComponent from './GoogleMapComponent';
import { useProvidersSupabase } from '../../hooks/useProvidersSupabase';

interface Provider {
  provider_id: string;
  first_name: string;
  last_name: string;
  name?: string;
  title: string;
  photo?: string;
  specialties: string[];
  rating: number;
  reviews: number;
  insurance: string[];
  insurance_accepted?: string[];
  availability: {
    today: string[];
    tomorrow: string[];
    thisWeek: number;
  };
  next_available: string;
  virtual_available: boolean;
  in_person_available: boolean;
  location?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  bio: string;
  languages: string[];
  waitlist_count: number;
}



const PatientBookingWithMap: React.FC = () => {
  const navigate = useNavigate();
  const { providers: supabaseProviders = [], loading, error, searchProviders, filterProviders } = useProvidersSupabase();
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [hoveredProvider, setHoveredProvider] = useState<Provider | null>(null);
  const [onWaitlist, setOnWaitlist] = useState<{ [key: string]: boolean }>({});
  const [savedProviders, setSavedProviders] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false);
  const [showInsuranceDropdown, setShowInsuranceDropdown] = useState(false);
  
  // Mental health specialties
  const specialties = [
    'Anxiety Disorders',
    'Depression',
    'ADHD',
    'Trauma & PTSD',
    'Couples Therapy',
    'Family Therapy',
    'Substance Abuse',
    'Eating Disorders',
    'Bipolar Disorder',
    'OCD',
    'Child & Adolescent',
    'Grief Counseling'
  ];
  
  // Common insurance providers
  const insuranceProviders = [
    'Aetna',
    'Blue Cross Blue Shield',
    'Cigna',
    'United Healthcare',
    'Humana',
    'Kaiser Permanente',
    'Medicare',
    'Medicaid',
    'Self-Pay/Cash'
  ];
  
  // Filters
  const [filters, setFilters] = useState({
    specialty: '',
    insurance: '',
    availability: 'any',
    modality: 'both',
    preferredTimes: [] as string[]
  });

  // Process providers data
  const providers: Provider[] = supabaseProviders.map((p, index) => ({
    ...p,
    id: p.provider_id,
    name: p.name || `${p.first_name} ${p.last_name}`,
    photo: p.photo || `https://i.pravatar.cc/150?u=${p.provider_id}`,
    insurance: p.insurance_accepted || p.insurance || [],
    virtual: p.virtual_available,
    inPerson: p.in_person_available,
    nextAvailable: p.next_available,
    waitlistCount: p.waitlist_count,
    // Add mock coordinates for NYC area
    coordinates: {
      lat: 40.7128 + (Math.random() - 0.5) * 0.1,
      lng: -74.0060 + (Math.random() - 0.5) * 0.1
    },
    location: p.location || `${['Manhattan', 'Brooklyn', 'Queens', 'Bronx'][index % 4]}, NY`
  }));

  // Filter providers based on search and filters
  const filteredProviders = React.useMemo(() => {
    let result = [...providers];
    
    // Apply search
    if (searchTerm) {
      result = searchProviders(searchTerm);
    }
    
    // Apply filters
    if (filters.specialty || filters.insurance || filters.modality !== 'both' || filters.availability !== 'any') {
      result = filterProviders(filters);
    }
    
    return result;
  }, [providers, searchTerm, filters, searchProviders, filterProviders]);

  // Remove the mock providers array
  /*const providers: Provider[] = [
    {
      id: '1',
      name: 'Dr. Sarah Chen',
      title: 'Clinical Psychologist',
      photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
      specialties: ['Anxiety', 'Depression', 'ADHD', 'Trauma'],
      rating: 4.9,
      reviews: 127,
      insurance: ['Blue Cross Blue Shield', 'Aetna', 'United Healthcare', 'Cigna'],
      availability: {
        today: ['2:00 PM', '3:30 PM', '5:00 PM'],
        tomorrow: ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'],
        thisWeek: 12
      },
      nextAvailable: '2:00 PM Today',
      virtual: true,
      inPerson: true,
      location: '123 Main St, Suite 200, New York, NY 10001',
      coordinates: { lat: 40.7488, lng: -73.9854 }, // Near Empire State Building
      bio: 'Dr. Chen specializes in evidence-based treatments for anxiety and mood disorders...',
      languages: ['English', 'Mandarin'],
      waitlistCount: 8
    },
    {
      id: '2',
      name: 'Dr. Michael Rodriguez',
      title: 'Licensed Therapist, LCSW',
      photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
      specialties: ['Couples Therapy', 'Family Therapy', 'Relationships'],
      rating: 4.8,
      reviews: 89,
      insurance: ['Aetna', 'Cigna', 'Oscar', 'Empire BCBS'],
      availability: {
        today: [],
        tomorrow: ['4:30 PM', '5:30 PM'],
        thisWeek: 6
      },
      nextAvailable: '4:30 PM Tomorrow',
      virtual: true,
      inPerson: false,
      location: '456 Park Ave, Floor 8, New York, NY 10016',
      coordinates: { lat: 40.7614, lng: -73.9714 }, // Upper East Side
      bio: 'Specializing in relationship dynamics and communication strategies...',
      languages: ['English', 'Spanish'],
      waitlistCount: 12
    },
    {
      id: '3',
      name: 'Dr. Emily Williams',
      title: 'Psychiatrist, MD',
      photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400',
      specialties: ['Medication Management', 'Bipolar Disorder', 'OCD', 'PTSD'],
      rating: 4.9,
      reviews: 156,
      insurance: ['Most Major Insurance Accepted'],
      availability: {
        today: [],
        tomorrow: [],
        thisWeek: 3
      },
      nextAvailable: 'Monday 10:00 AM',
      virtual: true,
      inPerson: true,
      location: '789 Broadway, Suite 400, New York, NY 10003',
      coordinates: { lat: 40.7317, lng: -73.9916 }, // Greenwich Village
      bio: 'Board-certified psychiatrist with expertise in psychopharmacology...',
      languages: ['English'],
      waitlistCount: 25
    }
  ];*/

  const handleJoinWaitlist = (providerId: string) => {
    setOnWaitlist({ ...onWaitlist, [providerId]: !onWaitlist[providerId] });
  };

  const handleSaveProvider = (providerId: string) => {
    if (savedProviders.includes(providerId)) {
      setSavedProviders(savedProviders.filter(id => id !== providerId));
    } else {
      setSavedProviders([...savedProviders, providerId]);
    }
  };


  const togglePreferredTime = (time: string) => {
    setFilters(prev => ({
      ...prev,
      preferredTimes: prev.preferredTimes.includes(time)
        ? prev.preferredTimes.filter(t => t !== time)
        : [...prev.preferredTimes, time]
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Logo/Title */}
            <h1 className="text-xl font-semibold text-gray-900 whitespace-nowrap">MindfulMatch</h1>
            
            {/* Search Bar */}
            <div className="flex-1 relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by specialty, condition, or provider name..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              />
            </div>
            
            {/* Quick Filters */}
            <div className="flex gap-2">
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap flex items-center gap-1 ${
                  filters.modality === 'inPerson' 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setFilters({ ...filters, modality: filters.modality === 'inPerson' ? 'both' : 'inPerson' })}
              >
                <Building className="w-4 h-4" />
                In-Person
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap flex items-center gap-1 ${
                  filters.insurance !== '' 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => {/* TODO: Open insurance filter */}}
              >
                <Shield className="w-4 h-4" />
                Insurance
              </button>
              <button 
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors whitespace-nowrap flex items-center gap-1"
                onClick={() => {/* TODO: Open advanced filters */}}
              >
                <Filter className="w-4 h-4" />
                More Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Full Width */}
      <div className="flex h-[calc(100vh-60px)]">
        {/* Left Side - Provider List */}
        <div className="w-[480px] overflow-y-auto border-r">
          {/* Header with Filters */}
          <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-medium">
                {loading ? 'Loading...' : `${filteredProviders.length} providers available`}
              </h2>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex gap-1">
              <button
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  filters.specialty === '' 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setFilters({ ...filters, specialty: '' })}
              >
                All Providers
              </button>
              <button 
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  filters.specialty === 'Anxiety Disorders' 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setFilters({ ...filters, specialty: 'Anxiety Disorders' })}
              >
                Anxiety
              </button>
              <button 
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  filters.specialty === 'Depression' 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setFilters({ ...filters, specialty: 'Depression' })}
              >
                Depression
              </button>
              <button 
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  filters.specialty === 'Couples Therapy' 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setFilters({ ...filters, specialty: 'Couples Therapy' })}
              >
                Couples
              </button>
              <button 
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  filters.modality === 'virtual' 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setFilters({ ...filters, modality: filters.modality === 'virtual' ? 'both' : 'virtual' })}
              >
                <Video className="w-4 h-4 inline mr-1" />
                Virtual
              </button>
              <button 
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  filters.availability === 'today' 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setFilters({ ...filters, availability: filters.availability === 'today' ? 'any' : 'today' })}
              >
                Available Today
              </button>
            </div>
          </div>

          {/* Provider Cards */}
          <div className="px-4 py-2">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg m-4">
                <p>Error loading providers: {error}</p>
              </div>
            ) : filteredProviders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No providers found matching your criteria.</p>
              </div>
            ) : (
              filteredProviders.map((provider) => (
              <motion.div
                key={provider.provider_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/provider/${provider.provider_id}`)}
                onMouseEnter={() => setHoveredProvider(provider)}
                onMouseLeave={() => setHoveredProvider(null)}
              >
                <div className="py-4">
                  <div className="flex gap-4">
                    {/* Provider Photo */}
                    <img
                      src={provider.photo}
                      alt={provider.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    
                    {/* Provider Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.floor(provider.rating) 
                                      ? 'text-red-500 fill-current' 
                                      : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {provider.rating} ({provider.reviews} reviews) · {provider.title}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-0.5">
                            {provider.specialties.slice(0, 2).join(', ')}
                            {provider.specialties.length > 2 && ` +${provider.specialties.length - 2}`}
                          </p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {provider.location?.split(',')[0]} · {provider.insurance[0]}
                          </p>
                        </div>
                        
                        {/* Save Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveProvider(provider.provider_id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Heart 
                            className={`w-5 h-5 ${
                              savedProviders.includes(provider.provider_id) 
                                ? 'text-red-500 fill-current' 
                                : 'text-gray-400'
                            }`}
                          />
                        </button>
                      </div>
                      
                      {/* Time Slots */}
                      <div className="flex gap-1.5 mt-3">
                        {provider.availability.today.length > 0 ? (
                          provider.availability.today.slice(0, 4).map((time) => (
                            <button
                              key={time}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/provider/${provider.provider_id}`);
                              }}
                              className="group"
                            >
                              <div className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors">
                                {time}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {provider.virtual_available ? 'Virtual' : 'In-person'}
                              </div>
                            </button>
                          ))
                        ) : provider.availability.tomorrow.length > 0 ? (
                          provider.availability.tomorrow.slice(0, 4).map((time) => (
                            <button
                              key={time}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/provider/${provider.provider_id}`);
                              }}
                              className="group"
                            >
                              <div className="px-3 py-1.5 bg-gray-800 text-white rounded text-sm font-medium hover:bg-gray-900 transition-colors">
                                {time}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {provider.virtual_available ? 'Virtual' : 'In-person'}
                              </div>
                            </button>
                          ))
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinWaitlist(provider.provider_id);
                            }}
                            className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-gray-300 transition-colors"
                          >
                            Join Waitlist
                          </button>
                        )}
                        {(provider.availability.today.length > 4 || provider.availability.tomorrow.length > 4) && (
                          <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )))}
          </div>
        </div>

        {/* Right Side - Map */}
        <div className="flex-1 relative">
          <GoogleMapComponent
            providers={filteredProviders}
            selectedProvider={selectedProvider}
            hoveredProvider={hoveredProvider}
            onProviderSelect={setSelectedProvider}
          />
        </div>
      </div>

    </div>
  );
};

export default PatientBookingWithMap;