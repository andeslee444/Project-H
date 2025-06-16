import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronDown, ChevronRight, X } from 'lucide-react';
import { format, addDays, startOfDay, isToday, isPast, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useProviderAvailability } from '../../hooks/useProviderAvailability';

interface TimeSlot {
  id: string;
  provider_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_booked: boolean;
  appointment_type: 'in-person' | 'virtual' | 'both';
  patient_id?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface ProviderAvailabilityProps {
  providerId: string;
  providerName: string;
  isOpen: boolean;
  onClose: () => void;
  onTimeSlotSelect?: (slot: TimeSlot) => void;
  selectedTimeSlot?: TimeSlot | null;
}

// CSS for hiding scrollbar
const hideScrollbarStyles = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

const ProviderAvailability: React.FC<ProviderAvailabilityProps> = ({
  providerId,
  providerName,
  isOpen,
  onClose,
  onTimeSlotSelect,
  selectedTimeSlot
}) => {
  console.log('ProviderAvailability component rendered:', { providerId, providerName, isOpen });
  // Initialize with next weekday if today is weekend
  const getNextWeekday = (date: Date) => {
    const day = date.getDay();
    if (day === 0) return addDays(date, 1); // Sunday -> Monday
    if (day === 6) return addDays(date, 2); // Saturday -> Monday
    return date;
  };
  
  const [selectedDate, setSelectedDate] = useState<Date>(getNextWeekday(new Date()));
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>('all');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeFilter, setShowTimeFilter] = useState(false);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const { availableSlots, loading, error } = useProviderAvailability({ 
    providerId, 
    date: selectedDate 
  });

  // Generate next 30 days for calendar
  const next30Days = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i));
  
  // Time options for filter
  const timeOptions = [
    { value: 'all', label: 'All Day' },
    { value: 'morning', label: 'Morning (9 AM - 12 PM)' },
    { value: 'afternoon', label: 'Afternoon (12 PM - 5 PM)' },
    { value: 'evening', label: 'Evening (5 PM - 8 PM)' }
  ];

  // Generate available dates for next 30 days (excluding weekends)
  useEffect(() => {
    if (isOpen) {
      const dates = [];
      for (let i = 0; i < 30; i++) {
        const date = addDays(new Date(), i);
        // Skip weekends
        if (date.getDay() !== 0 && date.getDay() !== 6) {
          dates.push(date);
        }
      }
      setAvailableDates(dates);
    }
  }, [isOpen]);

  // Filter slots based on time filter
  const filteredSlots = React.useMemo(() => {
    if (!availableSlots) return [];
    
    let filtered = [...availableSlots];
    
    // Apply time filter
    if (selectedTimeFilter !== 'all') {
      filtered = filtered.filter(slot => {
        const hour = parseInt(slot.start_time.split(':')[0]);
        switch (selectedTimeFilter) {
          case 'morning':
            return hour >= 9 && hour < 12;
          case 'afternoon':
            return hour >= 12 && hour < 17;
          case 'evening':
            return hour >= 17 && hour < 20;
          default:
            return true;
        }
      });
    }
    
    // Filter out past time slots if today is selected
    if (isToday(selectedDate)) {
      const now = new Date();
      filtered = filtered.filter(slot => {
        const slotTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${slot.start_time}`);
        return slotTime > now;
      });
    }
    
    return filtered;
  }, [availableSlots, selectedTimeFilter, selectedDate]);

  const formatTimeSlot = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
  };

  const isDateAvailable = (date: Date) => {
    return availableDates.some(availableDate => 
      isSameDay(availableDate, date)
    );
  };

  return (
    <>
      <style>{hideScrollbarStyles}</style>
      <AnimatePresence>
        {isOpen && (
          <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="border-t border-gray-200 bg-gradient-to-b from-blue-50 to-white overflow-hidden"
        >
          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Available Appointments with {providerName}
              </h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Dropdowns */}
            <div className="flex gap-4 mb-6">
              {/* Calendar Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowCalendar(!showCalendar);
                    setShowTimeFilter(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">
                    {isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMM d, yyyy')}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {/* Calendar Dropdown Content */}
                {showCalendar && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Select Date</h4>
                      <div className="grid grid-cols-7 gap-1">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                          <div key={day} className="text-xs font-medium text-gray-500 text-center p-2">
                            {day}
                          </div>
                        ))}
                        {next30Days.map((date, index) => {
                          const isAvailable = isDateAvailable(date);
                          const isPastDate = isPast(date) && !isToday(date);
                          const isSelected = isSameDay(date, selectedDate);
                          
                          return (
                            <button
                              key={index}
                              onClick={() => {
                                if (!isPastDate && isAvailable) {
                                  setSelectedDate(date);
                                  setShowCalendar(false);
                                }
                              }}
                              disabled={isPastDate || !isAvailable}
                              className={`
                                p-2 text-sm rounded-lg transition-colors
                                ${isSelected ? 'bg-blue-600 text-white' : ''}
                                ${!isSelected && isAvailable && !isPastDate ? 'hover:bg-blue-50 text-gray-900' : ''}
                                ${isPastDate ? 'text-gray-300 cursor-not-allowed' : ''}
                                ${!isAvailable && !isPastDate ? 'text-gray-400 cursor-not-allowed line-through' : ''}
                              `}
                            >
                              {format(date, 'd')}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Time Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowTimeFilter(!showTimeFilter);
                    setShowCalendar(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">
                    {timeOptions.find(opt => opt.value === selectedTimeFilter)?.label}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {/* Time Filter Dropdown Content */}
                {showTimeFilter && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="py-1">
                      {timeOptions.map(option => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSelectedTimeFilter(option.value);
                            setShowTimeFilter(false);
                          }}
                          className={`
                            w-full text-left px-4 py-2 text-sm transition-colors
                            ${selectedTimeFilter === option.value 
                              ? 'bg-blue-50 text-blue-700' 
                              : 'hover:bg-gray-50 text-gray-700'
                            }
                          `}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Time Slots */}
            <div className="space-y-3">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  <p className="text-sm">{error}</p>
                </div>
              )}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading availability...</span>
                </div>
              ) : filteredSlots.length > 0 ? (
                <>
                  <p className="text-sm text-gray-600 mb-3">
                    {filteredSlots.length} available slots on {format(selectedDate, 'MMMM d, yyyy')}
                  </p>
                  
                  {/* Carousel container with extra space for hover effects */}
                  <div className="relative group -mx-2">
                    {/* Gradient fade on sides - matching the gradient background */}
                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-blue-50 via-blue-50/80 to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-blue-50 via-blue-50/80 to-transparent z-10 pointer-events-none" />
                    
                    <div className="overflow-x-auto overflow-y-visible pb-2 pt-4 px-2 hide-scrollbar">
                      <div className="flex gap-3 px-2">
                        {filteredSlots.map((slot, index) => (
                          <motion.button
                            key={slot.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.02 }}
                            whileHover={{ scale: 1.05, y: -3 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex-shrink-0 px-5 py-3 rounded-2xl transition-all duration-200 text-sm font-medium shadow-md hover:shadow-xl ${
                              selectedTimeSlot?.id === slot.id
                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 ring-2 ring-green-400'
                                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                            }`}
                            onClick={() => {
                              // Handle slot selection
                              console.log('Selected slot:', slot);
                              if (onTimeSlotSelect) {
                                onTimeSlotSelect(slot);
                              }
                            }}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <div className="font-semibold">
                                {format(new Date(`2000-01-01T${slot.start_time}`), 'h:mm a')}
                              </div>
                              <div className="text-xs opacity-90">
                                {slot.appointment_type === 'both' 
                                  ? 'In-person • Virtual' 
                                  : slot.appointment_type === 'virtual'
                                  ? 'Virtual only'
                                  : 'In-person only'
                                }
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Scroll hint */}
                    {filteredSlots.length > 8 && (
                      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-5 h-5 text-gray-400 animate-pulse" />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No available slots for the selected criteria.</p>
                  <p className="text-sm text-gray-400 mt-2">Try selecting a different date or time range.</p>
                </div>
              )}
            </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProviderAvailability;