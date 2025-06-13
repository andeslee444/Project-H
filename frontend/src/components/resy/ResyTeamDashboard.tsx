import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, TrendingUp, Star, Clock, Copy,
  AlertCircle, CheckCircle, ChevronRight, MoreVertical,
  Shield, Activity, MapPin, Video, Building, Coffee,
  Bell, Mail, Phone, BarChart3, Zap, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProvidersSupabase } from '../../hooks/useProvidersSupabase';

interface Provider {
  id: string;
  name: string;
  title: string;
  photo: string;
  utilization: number;
  activePatients: number;
  nextAvailable: string;
  waitlistCount: number;
  rating: number;
  status: 'available' | 'in-session' | 'break' | 'offline';
  todayStats: {
    seen: number;
    scheduled: number;
    noShows: number;
  };
  weeklyHours: number;
  specialties: string[];
  availability: {
    [key: string]: { start: string; end: string; booked: number; total: number }[];
  };
  upcomingLeave?: {
    start: string;
    end: string;
    type: string;
  };
}

const ResyTeamDashboard: React.FC = () => {
  const { providers: supabaseProviders, loading, error } = useProvidersSupabase();
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'heatmap'>('cards');

  // Transform Supabase providers to match component format
  const providers: Provider[] = supabaseProviders.map((p: any) => ({
    id: p.provider_id,
    name: p.name || `${p.first_name} ${p.last_name}`,
    title: p.title || 'Mental Health Professional',
    photo: p.photo || `https://i.pravatar.cc/150?u=${p.provider_id}`,
    utilization: Math.floor(Math.random() * 30) + 65, // Mock data for now
    activePatients: Math.floor(Math.random() * 30) + 20,
    nextAvailable: p.next_available || 'Today',
    waitlistCount: p.waitlist_count || Math.floor(Math.random() * 15),
    rating: p.rating || 4.5 + Math.random() * 0.5,
    status: ['available', 'in-session', 'break', 'offline'][Math.floor(Math.random() * 4)] as any,
    todayStats: {
      seen: Math.floor(Math.random() * 5) + 2,
      scheduled: Math.floor(Math.random() * 4) + 4,
      noShows: Math.floor(Math.random() * 2)
    },
    weeklyHours: Math.floor(Math.random() * 20) + 20,
    specialties: p.specialties || ['General Therapy'],
    availability: {
      Monday: [
        { start: '9:00', end: '12:00', booked: 5, total: 6 },
        { start: '13:00', end: '17:00', booked: 7, total: 8 }
      ],
      Tuesday: [
        { start: '9:00', end: '12:00', booked: 6, total: 6 },
        { start: '13:00', end: '17:00', booked: 6, total: 8 }
      ]
    },
    upcomingLeave: Math.random() > 0.7 ? {
      start: 'Mar 20',
      end: 'Mar 27',
      type: 'Vacation'
    } : undefined
  }));

  // Remove the old mock data array
  /*const providers: Provider[] = [
    {
      id: '1',
      name: 'Dr. Sarah Chen',
      title: 'Clinical Psychologist',
      photo: 'https://i.pravatar.cc/150?img=1',
      utilization: 92,
      activePatients: 45,
      nextAvailable: 'Today 2pm',
      waitlistCount: 8,
      rating: 4.9,
      status: 'available',
      todayStats: {
        seen: 4,
        scheduled: 6,
        noShows: 0
      },
      weeklyHours: 38,
      specialties: ['Anxiety', 'Depression', 'ADHD'],
      availability: {
        Monday: [
          { start: '9:00', end: '12:00', booked: 5, total: 6 },
          { start: '13:00', end: '17:00', booked: 7, total: 8 }
        ],
        Tuesday: [
          { start: '9:00', end: '12:00', booked: 6, total: 6 },
          { start: '13:00', end: '17:00', booked: 6, total: 8 }
        ]
      }
    },
    {
      id: '2',
      name: 'Dr. Michael Rodriguez',
      title: 'Psychiatrist',
      photo: 'https://i.pravatar.cc/150?img=2',
      utilization: 78,
      activePatients: 52,
      nextAvailable: 'Tomorrow 10am',
      waitlistCount: 12,
      rating: 4.8,
      status: 'in-session',
      todayStats: {
        seen: 5,
        scheduled: 8,
        noShows: 1
      },
      weeklyHours: 35,
      specialties: ['Medication Management', 'Bipolar', 'Schizophrenia'],
      availability: {
        Monday: [
          { start: '10:00', end: '12:00', booked: 3, total: 4 },
          { start: '14:00', end: '18:00', booked: 6, total: 8 }
        ]
      },
      upcomingLeave: {
        start: 'Mar 20',
        end: 'Mar 27',
        type: 'Vacation'
      }
    },
    {
      id: '3',
      name: 'Dr. Jennifer Williams',
      title: 'Therapist',
      photo: 'https://i.pravatar.cc/150?img=3',
      utilization: 65,
      activePatients: 28,
      nextAvailable: 'Today 4pm',
      waitlistCount: 3,
      rating: 4.7,
      status: 'break',
      todayStats: {
        seen: 3,
        scheduled: 5,
        noShows: 0
      },
      weeklyHours: 25,
      specialties: ['Couples Therapy', 'Family Therapy', 'Grief'],
      availability: {
        Monday: [
          { start: '12:00', end: '17:00', booked: 6, total: 10 }
        ]
      }
    }
  ];*/

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />;
      case 'in-session':
        return <div className="w-3 h-3 bg-blue-500 rounded-full" />;
      case 'break':
        return <Coffee className="w-3 h-3 text-gray-500" />;
      case 'offline':
        return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-50';
    if (percentage >= 70) return 'text-green-600 bg-green-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  const generateHeatmapData = () => {
    const hours = ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm'];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    
    return {
      hours,
      days,
      data: days.map(() => 
        hours.map(() => Math.floor(Math.random() * 100))
      )
    };
  };

  const heatmapData = generateHeatmapData();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Team Dashboard</h1>
              <p className="text-gray-600 mt-1">
                {providers.length} providers • {providers.filter(p => p.status === 'available').length} available now
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1 rounded ${viewMode === 'cards' ? 'bg-white shadow-sm' : ''}`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('heatmap')}
                  className={`px-3 py-1 rounded ${viewMode === 'heatmap' ? 'bg-white shadow-sm' : ''}`}
                >
                  Heatmap
                </button>
              </div>

              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Leave Calendar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {loading ? (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      ) : error ? (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            <p>Error loading team data: {error}</p>
          </div>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Team Insights Summary */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Team Utilization</p>
                  <p className="text-2xl font-bold">78%</p>
                  <p className="text-xs text-green-600">Optimal range</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available Today</p>
                  <p className="text-2xl font-bold">14</p>
                  <p className="text-xs text-gray-500">Open slots</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">On Waitlist</p>
                  <p className="text-2xl font-bold">23</p>
                  <p className="text-xs text-yellow-600">Needs attention</p>
                </div>
                <Users className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold">4.8</p>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </div>
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Provider Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {providers.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={provider.photo}
                          alt={provider.name}
                          className="w-16 h-16 rounded-full"
                        />
                        <div className="absolute bottom-0 right-0">
                          {getStatusIcon(provider.status)}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold">{provider.name}</h3>
                        <p className="text-sm text-gray-600">{provider.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm">{provider.rating}</span>
                        </div>
                      </div>
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className={`rounded-lg p-3 ${getUtilizationColor(provider.utilization)}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold">{provider.utilization}%</p>
                          <p className="text-xs">utilization</p>
                        </div>
                        <BarChart3 className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="bg-blue-50 text-blue-700 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold">{provider.activePatients}</p>
                          <p className="text-xs">active patients</p>
                        </div>
                        <Users className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Next Available */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Next available</p>
                        <p className="font-medium">{provider.nextAvailable}</p>
                      </div>
                      <Clock className="w-5 h-5 text-gray-500" />
                    </div>
                  </div>

                  {/* Waitlist Alert */}
                  {provider.waitlistCount > 5 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm text-yellow-800">
                          {provider.waitlistCount} on waitlist
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Upcoming Leave */}
                  {provider.upcomingLeave && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-600" />
                        <span className="text-sm text-orange-800">
                          {provider.upcomingLeave.type}: {provider.upcomingLeave.start} - {provider.upcomingLeave.end}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Today's Stats */}
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-2">Today</p>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{provider.todayStats.seen} seen</span>
                      <span>{provider.todayStats.scheduled} scheduled</span>
                      <span className={provider.todayStats.noShows > 0 ? 'text-red-600' : ''}>
                        {provider.todayStats.noShows} no-shows
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <button
                      onClick={() => setSelectedProvider(provider)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      View Schedule
                    </button>
                    <button className="px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm">
                      Manage Waitlist
                    </button>
                    <button className="px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm">
                      Analytics
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setShowCopyModal(true)}
                className="p-4 border rounded-lg hover:bg-gray-50 flex items-center gap-3"
              >
                <Copy className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium">Copy Schedule</p>
                  <p className="text-sm text-gray-600">Between providers or weeks</p>
                </div>
              </button>
              <button className="p-4 border rounded-lg hover:bg-gray-50 flex items-center gap-3">
                <Users className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <p className="font-medium">Shift Patients</p>
                  <p className="text-sm text-gray-600">For coverage needs</p>
                </div>
              </button>
              <button className="p-4 border rounded-lg hover:bg-gray-50 flex items-center gap-3">
                <Shield className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <p className="font-medium">Block Time</p>
                  <p className="text-sm text-gray-600">For meetings or breaks</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Availability Heatmap View */
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold mb-4">Team Availability Heatmap</h3>
            <p className="text-sm text-gray-600 mb-6">Darker colors indicate higher booking density</p>
            
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="grid grid-cols-10 gap-1">
                  <div></div>
                  {heatmapData.hours.map(hour => (
                    <div key={hour} className="text-center text-sm text-gray-600">
                      {hour}
                    </div>
                  ))}
                  
                  {heatmapData.days.map((day, dayIndex) => (
                    <React.Fragment key={day}>
                      <div className="text-right pr-2 text-sm text-gray-600">
                        {day}
                      </div>
                      {heatmapData.data[dayIndex].map((value, hourIndex) => (
                        <div
                          key={`${dayIndex}-${hourIndex}`}
                          className="h-12 rounded cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                          style={{
                            backgroundColor: `rgba(59, 130, 246, ${value / 100})`,
                          }}
                          title={`${day} ${heatmapData.hours[hourIndex]}: ${value}% booked`}
                        />
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 rounded" />
                  <span>Low utilization</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-300 rounded" />
                  <span>Moderate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded" />
                  <span>High utilization</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <span className="font-medium">Peak times:</span> Tue-Thu 2-4pm
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Optimization Opportunity</p>
                <p className="text-sm text-blue-800 mt-1">
                  Consider opening more Thursday afternoon slots - high demand with 8+ waitlist patients
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Schedule Detail Modal */}
      <AnimatePresence>
        {selectedProvider && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedProvider(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{selectedProvider.name}'s Schedule</h3>
                <button
                  onClick={() => setSelectedProvider(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5 transform rotate-90" />
                </button>
              </div>

              {/* Weekly Schedule Preview */}
              <div className="space-y-4">
                {Object.entries(selectedProvider.availability).map(([day, slots]) => (
                  <div key={day} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">{day}</h4>
                    <div className="space-y-2">
                      {slots.map((slot, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            {slot.start} - {slot.end}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${(slot.booked / slot.total) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">
                              {slot.booked}/{slot.total} booked
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  View Full Calendar
                </button>
                <button className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Edit Schedule
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResyTeamDashboard;