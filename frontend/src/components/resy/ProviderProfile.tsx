import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Clock, MapPin, Shield, Star, 
  Heart, Video, Building, CheckCircle, Award, 
  Users, MessageSquare, Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Provider {
  id: string;
  name: string;
  title: string;
  photo: string;
  specialties: string[];
  rating: number;
  reviews: number;
  insurance: string[];
  bio: string;
  education: string[];
  experience: string;
  languages: string[];
  location: string;
  virtual: boolean;
  inPerson: boolean;
  sessionLength: string;
  sessionCost: string;
  availability: {
    monday: string[];
    tuesday: string[];
    wednesday: string[];
    thursday: string[];
    friday: string[];
  };
}

const ProviderProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Mock provider data - in real app, fetch based on ID
  const provider: Provider = {
    id: id || '1',
    name: 'Dr. Sarah Chen',
    title: 'Clinical Psychologist',
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600',
    specialties: ['Anxiety', 'Depression', 'ADHD', 'Trauma', 'Stress Management'],
    rating: 4.9,
    reviews: 127,
    insurance: ['Blue Cross Blue Shield', 'Aetna', 'United Healthcare', 'Cigna'],
    bio: 'Dr. Sarah Chen is a licensed clinical psychologist with over 15 years of experience in evidence-based treatments for anxiety, mood disorders, and trauma. She specializes in Cognitive Behavioral Therapy (CBT) and mindfulness-based approaches. Dr. Chen is passionate about helping individuals develop practical coping strategies and achieve lasting positive change in their lives.',
    education: [
      'PhD in Clinical Psychology - Stanford University',
      'MA in Psychology - UC Berkeley',
      'BA in Psychology - UCLA'
    ],
    experience: '15+ years',
    languages: ['English', 'Mandarin', 'Spanish'],
    location: '123 Main St, Suite 200, New York, NY 10001',
    virtual: true,
    inPerson: true,
    sessionLength: '50 minutes',
    sessionCost: '$200-250',
    availability: {
      monday: ['9:00 AM', '10:00 AM', '2:00 PM', '3:00 PM'],
      tuesday: ['10:00 AM', '11:00 AM', '3:00 PM', '4:00 PM'],
      wednesday: ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'],
      thursday: ['10:00 AM', '2:00 PM', '3:00 PM', '5:00 PM'],
      friday: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM']
    }
  };

  const stats = [
    { label: 'Years Experience', value: provider.experience, icon: Award },
    { label: 'Total Reviews', value: provider.reviews.toString(), icon: MessageSquare },
    { label: 'Languages', value: provider.languages.length.toString(), icon: Globe },
    { label: 'Patients Helped', value: '500+', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Search</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Provider Photo and Quick Info */}
            <div className="md:col-span-1">
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                src={provider.photo}
                alt={provider.name}
                className="w-full h-80 object-cover rounded-xl shadow-lg"
              />
              
              <div className="mt-6 space-y-4">
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Book Appointment
                </button>
                
                <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  <Heart className="w-5 h-5" />
                  Save Provider
                </button>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-sm mb-2">Session Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span>{provider.sessionLength}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cost:</span>
                      <span>{provider.sessionCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Format:</span>
                      <span>{provider.virtual && provider.inPerson ? 'Both' : provider.virtual ? 'Virtual' : 'In-Person'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Info */}
            <div className="md:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-3xl font-bold">{provider.name}</h1>
                <p className="text-xl text-gray-600 mt-1">{provider.title}</p>
                
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="ml-1 font-semibold">{provider.rating}</span>
                    <span className="ml-1 text-gray-500">({provider.reviews} reviews)</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-gray-600">
                    {provider.virtual && <Video className="w-5 h-5" />}
                    {provider.inPerson && <Building className="w-5 h-5" />}
                  </div>
                </div>

                {/* Specialties */}
                <div className="mt-6">
                  <h2 className="text-lg font-semibold mb-3">Specialties</h2>
                  <div className="flex flex-wrap gap-2">
                    {provider.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* About */}
                <div className="mt-8">
                  <h2 className="text-lg font-semibold mb-3">About</h2>
                  <p className="text-gray-700 leading-relaxed">{provider.bio}</p>
                </div>

                {/* Education */}
                <div className="mt-8">
                  <h2 className="text-lg font-semibold mb-3">Education & Credentials</h2>
                  <ul className="space-y-2">
                    {provider.education.map((edu, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <span className="text-gray-700">{edu}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Insurance */}
                <div className="mt-8">
                  <h2 className="text-lg font-semibold mb-3">Insurance Accepted</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {provider.insurance.map((ins) => (
                      <div key={ins} className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-700">{ins}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div className="mt-8">
                  <h2 className="text-lg font-semibold mb-3">Languages</h2>
                  <p className="text-gray-700">{provider.languages.join(', ')}</p>
                </div>

                {/* Location */}
                {provider.location && (
                  <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-3">Office Location</h2>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                      <p className="text-gray-700">{provider.location}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-6 text-center shadow-sm"
            >
              <stat.icon className="w-8 h-8 mx-auto text-blue-600 mb-3" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Availability Section */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Weekly Availability</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(provider.availability).map(([day, times]) => (
              <div key={day} className="text-center">
                <h3 className="font-medium capitalize mb-2">{day}</h3>
                <div className="space-y-1">
                  {times.length > 0 ? (
                    times.map((time) => (
                      <button
                        key={time}
                        className="w-full px-3 py-1 bg-green-50 text-green-700 rounded text-sm hover:bg-green-100"
                      >
                        {time}
                      </button>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">Not available</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;