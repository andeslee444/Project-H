import React, { useState } from 'react';
import { 
  Calendar, Clock, ChevronLeft, ChevronRight, Users, 
  Coffee, Zap, Copy, Settings, TrendingUp, AlertCircle,
  Plus, Minus, Lock, Unlock, Sun, Moon, Cloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimeSlot {
  time: string;
  available: boolean;
  booked?: {
    patientName: string;
    patientId: string;
    type: string;
  };
  blocked?: boolean;
  break?: boolean;
  waitlistCount?: number;
}

interface DaySchedule {
  date: Date;
  slots: TimeSlot[];
  utilization: number;
}

interface Provider {
  id: string;
  name: string;
  photo: string;
}

const ResyAvailabilityGrid: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<string>('1');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{day: number, time: string} | null>(null);
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [quickEntryValue, setQuickEntryValue] = useState('');
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

  // Mock providers
  const providers: Provider[] = [
    { id: '1', name: 'Dr. Sarah Chen', photo: 'https://i.pravatar.cc/150?img=1' },
    { id: '2', name: 'Dr. Michael Rodriguez', photo: 'https://i.pravatar.cc/150?img=2' },
    { id: '3', name: 'Dr. Jennifer Williams', photo: 'https://i.pravatar.cc/150?img=3' }
  ];

  // Generate time slots from 8 AM to 6 PM
  const generateTimeSlots = (): string[] => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
    }
    return slots;
  };

  // Generate mock schedule for the week
  const generateWeekSchedule = (): DaySchedule[] => {
    const schedule: DaySchedule[] = [];
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const slots: TimeSlot[] = generateTimeSlots().map(time => {
        const hour = parseInt(time.split(':')[0]);
        const random = Math.random();
        
        // Mock data generation
        if (hour === 12) {
          return { time, available: false, break: true };
        } else if (random < 0.4) {
          return {
            time,
            available: false,
            booked: {
              patientName: 'Patient Name',
              patientId: Math.random().toString(),
              type: random < 0.2 ? 'New' : 'Follow-up'
            }
          };
        } else if (random < 0.5) {
          return { time, available: false, blocked: true };
        } else if (random < 0.7) {
          return { time, available: true, waitlistCount: Math.floor(Math.random() * 5) };
        }
        return { time, available: true };
      });

      const bookedSlots = slots.filter(s => s.booked).length;
      const totalSlots = slots.filter(s => !s.break).length;
      const utilization = Math.round((bookedSlots / totalSlots) * 100);

      schedule.push({ date, slots, utilization });
    }

    return schedule;
  };

  const weekSchedule = generateWeekSchedule();

  const handleQuickEntry = () => {
    const input = quickEntryValue.toLowerCase();
    
    // Parse input like "3pm", "tue 2:30", "tomorrow 10am"
    if (input.includes('pm') || input.includes('am')) {
      // Find matching slot and select it
      console.log('Quick fill:', input);
      setShowQuickEntry(false);
      setQuickEntryValue('');
    }
  };

  const handleSlotClick = (dayIndex: number, time: string, slot: TimeSlot) => {
    if (slot.available || slot.booked || slot.waitlistCount) {
      setSelectedSlot({ day: dayIndex, time });
    }
  };

  const handleCreateRecurring = () => {
    console.log('Creating recurring schedule pattern');
  };

  const handleCopySchedule = () => {
    console.log('Copying schedule to other providers/weeks');
  };

  const getSlotColor = (slot: TimeSlot) => {
    if (slot.break) return 'bg-gray-100 cursor-default';
    if (slot.blocked) return 'bg-gray-200 cursor-default';
    if (slot.booked) return 'bg-blue-500 text-white hover:bg-blue-600';
    if (slot.waitlistCount && slot.waitlistCount > 0) return 'bg-yellow-100 hover:bg-yellow-200';
    return 'bg-green-100 hover:bg-green-200';
  };

  const getSlotIcon = (slot: TimeSlot) => {
    if (slot.break) return <Coffee className="w-3 h-3" />;
    if (slot.blocked) return <Lock className="w-3 h-3" />;
    if (slot.booked?.type === 'New') return <Users className="w-3 h-3" />;
    if (slot.waitlistCount && slot.waitlistCount > 0) return <span className="text-xs font-medium">{slot.waitlistCount}</span>;
    return null;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Availability Grid</h1>
              <p className="text-gray-600 mt-1">
                Click any slot to manage appointments • Drag to create blocks
              </p>
            </div>

            {/* Quick Entry */}
            <div className="flex items-center gap-3">
              {showQuickEntry ? (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Type time (e.g., 3pm, tue 2:30)"
                    value={quickEntryValue}
                    onChange={(e) => setQuickEntryValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleQuickEntry();
                    }}
                    onBlur={() => setShowQuickEntry(false)}
                    className="px-3 py-2 border rounded-lg w-48"
                    autoFocus
                  />
                  <button
                    onClick={handleQuickEntry}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <button
                  onClick={() => setShowQuickEntry(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Quick Entry
                </button>
              )}

              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1 rounded ${viewMode === 'week' ? 'bg-white shadow-sm' : ''}`}
                >
                  Week
                </button>
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-3 py-1 rounded ${viewMode === 'day' ? 'bg-white shadow-sm' : ''}`}
                >
                  Day
                </button>
              </div>

              {/* Actions */}
              <button
                onClick={handleCopySchedule}
                className="p-2 border rounded-lg hover:bg-gray-50"
                title="Copy Schedule"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={handleCreateRecurring}
                className="p-2 border rounded-lg hover:bg-gray-50"
                title="Create Recurring Pattern"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Provider Selector */}
          <div className="flex items-center gap-4 mt-4">
            <span className="text-sm font-medium text-gray-600">Provider:</span>
            <div className="flex gap-2">
              {providers.map(provider => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                    selectedProvider === provider.id 
                      ? 'bg-blue-100 text-blue-700 border-blue-300' 
                      : 'border hover:bg-gray-50'
                  }`}
                >
                  <img src={provider.photo} alt={provider.name} className="w-6 h-6 rounded-full" />
                  <span className="text-sm">{provider.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {/* Week Navigation */}
        <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => {
                const newWeek = new Date(currentWeek);
                newWeek.setDate(currentWeek.getDate() - 7);
                setCurrentWeek(newWeek);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-semibold">
              {currentWeek.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} 
              {' - Week of '}
              {new Date(currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay())).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </h2>

            <button
              onClick={() => {
                const newWeek = new Date(currentWeek);
                newWeek.setDate(currentWeek.getDate() + 7);
                setCurrentWeek(newWeek);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Utilization Summary */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekSchedule.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-500 mb-1">
                  {day.utilization}% booked
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      day.utilization > 80 ? 'bg-red-500' : 
                      day.utilization > 60 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${day.utilization}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="overflow-x-auto">
            <div className="grid grid-cols-8 gap-1 min-w-[800px]">
              {/* Time Column */}
              <div className="sticky left-0 bg-white">
                <div className="h-12 flex items-center justify-center font-medium text-sm text-gray-600 border-b">
                  Time
                </div>
                {generateTimeSlots().map(time => (
                  <div key={time} className="h-10 flex items-center justify-center text-sm text-gray-600 border-b">
                    {time}
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              {weekSchedule.map((day, dayIndex) => (
                <div key={dayIndex}>
                  <div className="h-12 flex flex-col items-center justify-center font-medium text-sm border-b">
                    <span>{day.date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span className="text-xs text-gray-500">{day.date.getDate()}</span>
                  </div>
                  {day.slots.map((slot, slotIndex) => (
                    <motion.div
                      key={`${dayIndex}-${slot.time}`}
                      whileHover={{ scale: slot.available || slot.booked || slot.waitlistCount ? 1.05 : 1 }}
                      whileTap={{ scale: slot.available || slot.booked || slot.waitlistCount ? 0.95 : 1 }}
                      onClick={() => handleSlotClick(dayIndex, slot.time, slot)}
                      className={`h-10 flex items-center justify-center text-xs cursor-pointer border-b transition-colors ${getSlotColor(slot)}`}
                    >
                      {getSlotIcon(slot)}
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 rounded" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded" />
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 rounded" />
              <span>Waitlist Interest</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded" />
              <span>Blocked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 rounded" />
              <span>Break</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold">78%</p>
                <p className="text-xs text-green-600">+5% from last week</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Slots</p>
                <p className="text-2xl font-bold">24</p>
                <p className="text-xs text-gray-500">Across all providers</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Waitlist</p>
                <p className="text-2xl font-bold">15</p>
                <p className="text-xs text-yellow-600">8 urgent</p>
              </div>
              <Users className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Peak Hours</p>
                <p className="text-2xl font-bold">2-4 PM</p>
                <p className="text-xs text-gray-500">Most requested</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Slot Detail Modal */}
      <AnimatePresence>
        {selectedSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedSlot(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">
                {weekSchedule[selectedSlot.day].date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                {' at '}
                {selectedSlot.time}
              </h3>

              {weekSchedule[selectedSlot.day].slots.find(s => s.time === selectedSlot.time)?.booked ? (
                <div>
                  <p className="text-sm text-gray-600 mb-4">This slot is currently booked</p>
                  <div className="space-y-3">
                    <button className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                      Cancel Appointment
                    </button>
                    <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Reschedule
                    </button>
                    <button className="w-full py-2 border rounded-lg hover:bg-gray-50">
                      View Patient Details
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-4">This slot is available</p>
                  {weekSchedule[selectedSlot.day].slots.find(s => s.time === selectedSlot.time)?.waitlistCount ? (
                    <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        {weekSchedule[selectedSlot.day].slots.find(s => s.time === selectedSlot.time)?.waitlistCount} patients
                        interested in this time
                      </p>
                    </div>
                  ) : null}
                  <div className="space-y-3">
                    <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Fill from Waitlist
                    </button>
                    <button className="w-full py-2 border rounded-lg hover:bg-gray-50">
                      Block Time
                    </button>
                    <button className="w-full py-2 border rounded-lg hover:bg-gray-50">
                      Create Recurring Block
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedSlot(null)}
                className="w-full mt-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResyAvailabilityGrid;