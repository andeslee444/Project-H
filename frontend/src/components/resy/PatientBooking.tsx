import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, MapPin, Clock, Calendar, ChevronRight, 
  Star, Heart, Info, Shield, Video, Building, X,
  Check, AlertCircle, Plus, Minus, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  bio: string;
  languages: string[];
  waitlistCount: number;
}

interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
}

const PatientBooking: React.FC = () => {
  const navigate = useNavigate();
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [onWaitlist, setOnWaitlist] = useState<{ [key: string]: boolean }>({});
  const [savedProviders, setSavedProviders] = useState<string[]>([]);
  const [preferredTimes, setPreferredTimes] = useState<string[]>([]);
  const [insurance, setInsurance] = useState('');

  // Filters
  const [filters, setFilters] = useState({
    specialty: '',
    insurance: '',
    availability: 'any',
    modality: 'both',
    location: ''
  });

  // Mock providers data
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
      location: '456 Park Ave, Floor 10, New York, NY 10016',
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Provider List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Available Providers</h2>
              <p className="text-sm text-gray-600">{providers.length} providers found</p>
            </div>

            {providers.map((provider) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedProvider(provider)}
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
                      
                      {/* Modality & Insurance */}
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          {provider.virtual && <Video className="w-4 h-4" />}
                          {provider.inPerson && <Building className="w-4 h-4" />}
                          <span>
                            {provider.virtual && provider.inPerson ? 'Virtual & In-Person' :
                             provider.virtual ? 'Virtual Only' : 'In-Person Only'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4" />
                          <span>{provider.insurance[0]}</span>
                          {provider.insurance.length > 1 && (
                            <span>+{provider.insurance.length - 1}</span>
                          )}
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
                              {provider.availability.today.length > 3 && (
                                <span className="px-3 py-1 text-gray-500 text-sm">
                                  +{provider.availability.today.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-gray-600">Next available:</p>
                            <p className="text-sm font-medium text-gray-900">{provider.nextAvailable}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/provider/${provider.id}`);
                          }}
                          className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                          title="View full profile"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
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
                          {onWaitlist[provider.id] ? (
                            <>
                              <Check className="w-4 h-4 inline mr-1" />
                              On Waitlist
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 inline mr-1" />
                              Join Waitlist
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {onWaitlist[provider.id] && (
                      <p className="text-xs text-gray-500 mt-2">
                        {provider.waitlistCount} others on waitlist • You'll be notified of openings
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Sidebar - Selected Provider Details */}
          <div className="lg:col-span-1">
            {selectedProvider ? (
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-20">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">Provider Details</h3>
                  <button
                    onClick={() => setSelectedProvider(null)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <img
                  src={selectedProvider.photo}
                  alt={selectedProvider.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                
                <h4 className="font-semibold text-lg">{selectedProvider.name}</h4>
                <p className="text-gray-600 mb-4">{selectedProvider.title}</p>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-sm text-gray-700 mb-2">About</h5>
                    <p className="text-sm text-gray-600">{selectedProvider.bio}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-sm text-gray-700 mb-2">Insurance</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedProvider.insurance.map((ins) => (
                        <span key={ins} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {ins}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-sm text-gray-700 mb-2">Languages</h5>
                    <p className="text-sm text-gray-600">{selectedProvider.languages.join(', ')}</p>
                  </div>
                  
                  {selectedProvider.location && (
                    <div>
                      <h5 className="font-medium text-sm text-gray-700 mb-2">Location</h5>
                      <p className="text-sm text-gray-600">{selectedProvider.location}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 mt-6">
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    View Available Times
                  </button>
                  <button
                    onClick={() => navigate(`/provider/${selectedProvider.id}`)}
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>View Full Profile</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Your Preferences</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Times
                    </label>
                    <div className="space-y-2">
                      {['Morning', 'Afternoon', 'Evening', 'Weekend'].map((time) => (
                        <label key={time} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={preferredTimes.includes(time)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPreferredTimes([...preferredTimes, time]);
                              } else {
                                setPreferredTimes(preferredTimes.filter(t => t !== time));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600"
                          />
                          <span className="ml-2 text-sm">{time}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Insurance
                    </label>
                    <select
                      value={insurance}
                      onChange={(e) => setInsurance(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="">Select insurance...</option>
                      <option value="bcbs">Blue Cross Blue Shield</option>
                      <option value="aetna">Aetna</option>
                      <option value="united">United Healthcare</option>
                      <option value="cigna">Cigna</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-sm mb-2">Saved Providers</h4>
                    {savedProviders.length > 0 ? (
                      <div className="space-y-2">
                        {providers
                          .filter(p => savedProviders.includes(p.id))
                          .map(p => (
                            <div
                              key={p.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                              onClick={() => setSelectedProvider(p)}
                            >
                              <span className="text-sm">{p.name}</span>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No saved providers yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}
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
                
                {/* Appointment Type */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Appointment Type</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="p-3 border-2 border-blue-600 text-blue-600 rounded-lg text-sm font-medium">
                      Initial Consultation (60 min)
                    </button>
                    <button className="p-3 border rounded-lg text-sm hover:bg-gray-50">
                      Follow-up (45 min)
                    </button>
                  </div>
                </div>
                
                {/* Insurance Verification */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900">Insurance Verified</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Your Blue Cross Blue Shield plan covers this provider with a $25 copay
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Reason for Visit */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for visit (optional)
                  </label>
                  <textarea
                    placeholder="Brief description of what you'd like to discuss..."
                    className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                    rows={3}
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      // Handle booking
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

export default PatientBooking;