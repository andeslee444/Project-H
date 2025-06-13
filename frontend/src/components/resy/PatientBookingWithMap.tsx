import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, MapPin, Clock, Calendar, ChevronRight, 
  Star, Heart, Info, Shield, Video, Building, X,
  Check, AlertCircle, Plus, Minus, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GoogleMapComponent from './GoogleMapComponent';

interface Provider {
  id: string;
  name: string;
  title: string;
  photo: string;
  specialties: string[];
  rating: number;
  reviews: number;
  insurance: string[];
  availability: {
    today: string[];
    tomorrow: string[];
    thisWeek: number;
  };
  nextAvailable: string;
  virtual: boolean;
  inPerson: boolean;
  location?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  bio: string;
  languages: string[];
  waitlistCount: number;
}

interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
}


const PatientBookingWithMap: React.FC = () => {
  const navigate = useNavigate();
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [hoveredProvider, setHoveredProvider] = useState<Provider | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [onWaitlist, setOnWaitlist] = useState<{ [key: string]: boolean }>({});
  const [savedProviders, setSavedProviders] = useState<string[]>([]);
  
  // Filters
  const [filters, setFilters] = useState({
    specialty: '',
    insurance: '',
    availability: 'any',
    modality: 'both',
    preferredTimes: [] as string[]
  });

  // Mock providers data with coordinates
  const providers: Provider[] = [
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
  ];

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

  const generateTimeSlots = (provider: Provider): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const dates = [new Date(), new Date(Date.now() + 86400000), new Date(Date.now() + 172800000)];
    
    dates.forEach((date, dateIndex) => {
      const daySlots = dateIndex === 0 ? provider.availability.today :
                      dateIndex === 1 ? provider.availability.tomorrow : [];
      
      if (daySlots.length > 0) {
        daySlots.forEach(time => {
          slots.push({
            date: date.toLocaleDateString(),
            time,
            available: true
          });
        });
      }
    });
    
    return slots;
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
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by specialty, condition, or provider name..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Quick Filters */}
            <div className="flex gap-2">
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Available Now
              </button>
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Video className="w-4 h-4" />
                Virtual
              </button>
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                More Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Provider List */}
          <div className="space-y-4">
            {/* Preferences Bar */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Available Providers</h2>
                <p className="text-sm text-gray-600">{providers.length} providers found</p>
              </div>
              
              {/* Preference Buttons */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 mr-2">Preferred times:</span>
                {['Morning', 'Afternoon', 'Evening', 'Weekend'].map((time) => (
                  <button
                    key={time}
                    onClick={() => togglePreferredTime(time)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filters.preferredTimes.includes(time)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Provider Cards */}
            {providers.map((provider) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedProvider(provider)}
                onMouseEnter={() => setHoveredProvider(provider)}
                onMouseLeave={() => setHoveredProvider(null)}
              >
                <div className="p-6">
                  <div className="flex gap-4">
                    {/* Provider Photo */}
                    <img
                      src={provider.photo}
                      alt={provider.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    
                    {/* Provider Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">{provider.name}</h3>
                          <p className="text-gray-600">{provider.title}</p>
                          
                          {/* Rating */}
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="ml-1 text-sm font-medium">{provider.rating}</span>
                            </div>
                            <span className="text-sm text-gray-500">({provider.reviews} reviews)</span>
                          </div>
                        </div>
                        
                        {/* Save Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveProvider(provider.id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Heart 
                            className={`w-5 h-5 ${
                              savedProviders.includes(provider.id) 
                                ? 'text-red-500 fill-current' 
                                : 'text-gray-400'
                            }`}
                          />
                        </button>
                      </div>
                      
                      {/* Specialties */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {provider.specialties.slice(0, 3).map((specialty) => (
                          <span
                            key={specialty}
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                          >
                            {specialty}
                          </span>
                        ))}
                        {provider.specialties.length > 3 && (
                          <span className="px-2 py-1 text-gray-500 text-sm">
                            +{provider.specialties.length - 3} more
                          </span>
                        )}
                      </div>
                      
                      {/* Location & Modality */}
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{provider.location?.split(',')[0]}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {provider.virtual && <Video className="w-4 h-4" />}
                          {provider.inPerson && <Building className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Availability Preview */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <div>
                        {provider.availability.today.length > 0 ? (
                          <div>
                            <p className="text-sm text-gray-600">Available today:</p>
                            <div className="flex gap-2 mt-1">
                              {provider.availability.today.slice(0, 3).map((time) => (
                                <button
                                  key={time}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProvider(provider);
                                    setSelectedTime(time);
                                    setShowBookingModal(true);
                                  }}
                                  className="px-3 py-1 bg-green-50 text-green-700 rounded text-sm hover:bg-green-100"
                                >
                                  {time}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-gray-600">Next available:</p>
                            <p className="text-sm font-medium text-gray-900">{provider.nextAvailable}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinWaitlist(provider.id);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          onWaitlist[provider.id]
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {onWaitlist[provider.id] ? 'On Waitlist' : 'Join Waitlist'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Side - Map */}
          <div className="sticky top-20 h-[600px]">
            <div className="bg-white rounded-lg shadow-sm border h-full p-2">
              <GoogleMapComponent
                providers={providers}
                selectedProvider={selectedProvider}
                hoveredProvider={hoveredProvider}
                onProviderSelect={setSelectedProvider}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedProvider && (
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
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-semibold">Book Appointment</h3>
                    <p className="text-gray-600 mt-1">with {selectedProvider.name}</p>
                  </div>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Calendar View */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Select a date and time</h4>
                  
                  {/* Date Selector */}
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
                      const date = new Date();
                      date.setDate(date.getDate() + dayOffset);
                      const isSelected = selectedDate.toDateString() === date.toDateString();
                      
                      return (
                        <button
                          key={dayOffset}
                          onClick={() => setSelectedDate(date)}
                          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <div className="text-xs">
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                          <div className="font-medium">
                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Time Slots */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {generateTimeSlots(selectedProvider).map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                          selectedTime === slot.time
                            ? 'bg-blue-600 text-white'
                            : slot.available
                            ? 'bg-gray-100 hover:bg-gray-200'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      alert('Appointment booked!');
                      setShowBookingModal(false);
                    }}
                    disabled={!selectedTime}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300"
                  >
                    Confirm Booking
                  </button>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="px-6 py-3 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
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

export default PatientBookingWithMap;