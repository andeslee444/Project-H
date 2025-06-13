import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Star, MapPin, Video, Building, Calendar, Clock, 
  Shield, Globe, Award, GraduationCap, Heart, Share2, MessageSquare,
  CheckCircle, Info, DollarSign, Users, Brain, Stethoscope,
  Phone, Mail, ExternalLink, ChevronRight, AlertCircle, Briefcase,
  BookOpen, Timer, CreditCard, FileText, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProvidersSupabase } from '../../hooks/useProvidersSupabase';

interface TimeSlot {
  date: Date;
  time: string;
  available: boolean;
  type: 'virtual' | 'in-person';
}

const ProviderProfile: React.FC = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const { providers, loading } = useProvidersSupabase();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [showBookingConfirm, setShowBookingConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'availability'>('overview');
  const [isSaved, setIsSaved] = useState(false);

  // Find the provider
  const provider = providers.find(p => p.provider_id === providerId);

  // Mock additional data for comprehensive profile
  const mockProvider = provider ? {
    ...provider,
    bio: "I am a licensed clinical psychologist with over 15 years of experience helping individuals navigate life's challenges. My approach combines evidence-based therapies with compassionate care, creating a safe space for healing and growth. I specialize in treating anxiety, depression, and trauma-related disorders.",
    education: [
      { degree: "Ph.D. in Clinical Psychology", school: "Columbia University", year: "2008" },
      { degree: "M.A. in Psychology", school: "New York University", year: "2004" },
      { degree: "B.A. in Psychology", school: "Yale University", year: "2002" }
    ],
    credentials: ["Licensed Clinical Psychologist", "Board Certified in Clinical Psychology", "Certified EMDR Therapist"],
    languages: ["English", "Spanish", "Mandarin"],
    sessionTypes: ["Individual Therapy", "Couples Therapy", "Group Therapy"],
    ageGroups: ["Adults (18-64)", "Seniors (65+)"],
    modalities: ["Cognitive Behavioral Therapy (CBT)", "EMDR", "Mindfulness-Based Therapy", "Psychodynamic Therapy"],
    fees: {
      initial: 250,
      followUp: 200,
      cancellationPolicy: "24 hours notice required"
    },
    availability: {
      monday: ["9:00 AM", "10:00 AM", "2:00 PM", "3:00 PM"],
      tuesday: ["10:00 AM", "11:00 AM", "3:00 PM", "4:00 PM"],
      wednesday: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"],
      thursday: ["10:00 AM", "2:00 PM", "3:00 PM", "5:00 PM"],
      friday: ["9:00 AM", "10:00 AM", "11:00 AM"],
      saturday: [],
      sunday: []
    } as Record<string, string[]>,
    reviews: [
      {
        id: 1,
        author: "Sarah M.",
        rating: 5,
        date: "2 weeks ago",
        text: "Dr. Chen has been instrumental in helping me manage my anxiety. Her approach is both professional and compassionate.",
        helpful: 12
      },
      {
        id: 2,
        author: "John D.",
        rating: 5,
        date: "1 month ago",
        text: "I've seen several therapists over the years, and Dr. Chen is by far the best. She really listens and provides practical strategies.",
        helpful: 8
      },
      {
        id: 3,
        author: "Emily R.",
        rating: 4,
        date: "2 months ago",
        text: "Great therapist, very knowledgeable. The only downside is that she's often booked up weeks in advance.",
        helpful: 5
      }
    ],
    similarProviders: [
      { id: "2", name: "Dr. Michael Rodriguez", specialty: "Anxiety & Depression", rating: 4.8 },
      { id: "3", name: "Dr. Emily Williams", specialty: "Trauma & PTSD", rating: 4.9 }
    ]
  } : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!mockProvider) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Provider not found</h2>
          <button
            onClick={() => navigate('/search')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Return to search
          </button>
        </div>
      </div>
    );
  }

  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayIndex = selectedDate.getDay();
    const dayName = days[dayIndex] as keyof typeof mockProvider.availability;
    const daySlots = mockProvider.availability[dayName] || [];
    
    daySlots.forEach(time => {
      slots.push({
        date: selectedDate,
        time,
        available: true,
        type: Math.random() > 0.5 ? 'virtual' : 'in-person'
      });
    });
    
    return slots;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/search')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to search</span>
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSaved(!isSaved)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Provider Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex gap-6">
                <img
                  src={mockProvider.photo || `https://i.pravatar.cc/150?u=${mockProvider.provider_id}`}
                  alt={mockProvider.name}
                  className="w-32 h-32 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{mockProvider.name}</h1>
                  <p className="text-lg text-gray-600 mt-1">{mockProvider.title}</p>
                  
                  {/* Rating and Reviews */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(mockProvider.rating) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="ml-2 font-semibold">{mockProvider.rating}</span>
                      <span className="text-gray-600">({mockProvider.reviews.length} reviews)</span>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="flex flex-wrap gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{mockProvider.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Next available: Today</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      {mockProvider.virtual_available && <Video className="w-4 h-4" />}
                      {mockProvider.in_person_available && <Building className="w-4 h-4" />}
                      <span>
                        {mockProvider.virtual_available && mockProvider.in_person_available 
                          ? 'Virtual & In-person' 
                          : mockProvider.virtual_available 
                          ? 'Virtual only' 
                          : 'In-person only'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                      activeTab === 'overview' 
                        ? 'text-blue-600 border-blue-600' 
                        : 'text-gray-600 border-transparent hover:text-gray-900'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                      activeTab === 'reviews' 
                        ? 'text-blue-600 border-blue-600' 
                        : 'text-gray-600 border-transparent hover:text-gray-900'
                    }`}
                  >
                    Reviews ({mockProvider.reviews.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('availability')}
                    className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                      activeTab === 'availability' 
                        ? 'text-blue-600 border-blue-600' 
                        : 'text-gray-600 border-transparent hover:text-gray-900'
                    }`}
                  >
                    Availability
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* About */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                      <p className="text-gray-700 leading-relaxed">{mockProvider.bio}</p>
                    </div>

                    {/* Specialties */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        Specialties & Expertise
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {mockProvider.specialties.map((specialty) => (
                          <span
                            key={specialty}
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Treatment Approaches */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Stethoscope className="w-5 h-5" />
                        Treatment Approaches
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {mockProvider.modalities.map((modality) => (
                          <div key={modality} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-gray-700">{modality}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Education & Credentials */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" />
                        Education & Credentials
                      </h3>
                      <div className="space-y-3">
                        {mockProvider.education.map((edu, index) => (
                          <div key={index} className="flex justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{edu.degree}</p>
                              <p className="text-gray-600">{edu.school}</p>
                            </div>
                            <span className="text-gray-500">{edu.year}</span>
                          </div>
                        ))}
                        <div className="pt-3 border-t">
                          {mockProvider.credentials.map((cred) => (
                            <div key={cred} className="flex items-center gap-2 mt-2">
                              <Award className="w-4 h-4 text-blue-600" />
                              <span className="text-gray-700">{cred}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Languages & Demographics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Globe className="w-5 h-5" />
                          Languages
                        </h3>
                        <div className="space-y-1">
                          {mockProvider.languages.map((lang) => (
                            <p key={lang} className="text-gray-700">{lang}</p>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Age Groups
                        </h3>
                        <div className="space-y-1">
                          {mockProvider.ageGroups.map((age) => (
                            <p key={age} className="text-gray-700">{age}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {mockProvider.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{review.author}</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating 
                                        ? 'text-yellow-400 fill-current' 
                                        : 'text-gray-300'
                                    }`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{review.date}</p>
                          </div>
                        </div>
                        <p className="text-gray-700 mt-2">{review.text}</p>
                        <button className="text-sm text-gray-500 hover:text-gray-700 mt-2">
                          Helpful ({review.helpful})
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Availability Tab */}
                {activeTab === 'availability' && (
                  <div>
                    <div className="mb-4">
                      <p className="text-gray-600">
                        View available appointment times for the next 30 days
                      </p>
                    </div>
                    
                    {/* Calendar */}
                    <div className="grid grid-cols-7 gap-1">
                      {/* Calendar implementation would go here */}
                      <div className="text-center p-2 text-sm font-medium text-gray-600">Sun</div>
                      <div className="text-center p-2 text-sm font-medium text-gray-600">Mon</div>
                      <div className="text-center p-2 text-sm font-medium text-gray-600">Tue</div>
                      <div className="text-center p-2 text-sm font-medium text-gray-600">Wed</div>
                      <div className="text-center p-2 text-sm font-medium text-gray-600">Thu</div>
                      <div className="text-center p-2 text-sm font-medium text-gray-600">Fri</div>
                      <div className="text-center p-2 text-sm font-medium text-gray-600">Sat</div>
                      
                      {/* Sample calendar days */}
                      {[...Array(30)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            const newDate = new Date();
                            newDate.setDate(newDate.getDate() + i);
                            setSelectedDate(newDate);
                          }}
                          className={`p-2 text-sm rounded hover:bg-gray-100 ${
                            i === 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : ''
                          }`}
                        >
                          {new Date().getDate() + i}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Similar Providers */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Providers</h3>
              <div className="space-y-3">
                {mockProvider.similarProviders.map((similar) => (
                  <div 
                    key={similar.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/provider/${similar.id}`)}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{similar.name}</p>
                      <p className="text-sm text-gray-600">{similar.specialty}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{similar.rating}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Booking & Info */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Book an Appointment</h3>
              
              {/* Date Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Time Slots */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Times
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {generateTimeSlots().map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedTimeSlot?.time === slot.time
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <div>{slot.time}</div>
                      <div className="text-xs opacity-75 mt-0.5">
                        {slot.type === 'virtual' ? 'Virtual' : 'In-person'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={() => setShowBookingConfirm(true)}
                disabled={!selectedTimeSlot}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Book Appointment
              </button>

              {/* Fee Information */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Initial consultation</span>
                  <span className="font-medium">${mockProvider.fees.initial}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">Follow-up sessions</span>
                  <span className="font-medium">${mockProvider.fees.followUp}</span>
                </div>
              </div>

              {/* Insurance */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Insurance Accepted
                </h4>
                <div className="space-y-1">
                  {mockProvider.insurance_accepted?.slice(0, 3).map((ins) => (
                    <p key={ins} className="text-sm text-gray-600">{ins}</p>
                  ))}
                  {mockProvider.insurance_accepted && mockProvider.insurance_accepted.length > 3 && (
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      +{mockProvider.insurance_accepted.length - 3} more
                    </button>
                  )}
                </div>
              </div>

              {/* Contact Options */}
              <div className="mt-4 pt-4 border-t">
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm font-medium">
                    <MessageSquare className="w-4 h-4" />
                    Send Message
                  </button>
                  <button className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm font-medium">
                    <Phone className="w-4 h-4" />
                    Call Office
                  </button>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Cancellation Policy</p>
                    <p className="text-sm text-yellow-800 mt-0.5">{mockProvider.fees.cancellationPolicy}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      <AnimatePresence>
        {showBookingConfirm && selectedTimeSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBookingConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Booking</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={mockProvider.photo || `https://i.pravatar.cc/150?u=${mockProvider.provider_id}`}
                    alt={mockProvider.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{mockProvider.name}</p>
                    <p className="text-sm text-gray-600">{mockProvider.title}</p>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium">{selectedDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Time</span>
                    <span className="font-medium">{selectedTimeSlot.time}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium capitalize">{selectedTimeSlot.type}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Fee</span>
                    <span className="font-medium">${mockProvider.fees.initial}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    alert('Appointment booked successfully!');
                    setShowBookingConfirm(false);
                    navigate('/appointments');
                  }}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Confirm Booking
                </button>
                <button
                  onClick={() => setShowBookingConfirm(false)}
                  className="flex-1 py-2 border rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProviderProfile;