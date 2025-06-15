import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

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

interface UseProviderAvailabilityProps {
  providerId: string;
  date?: Date;
}

export const useProviderAvailability = ({ providerId, date }: UseProviderAvailabilityProps) => {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true); // Start with true to show loading initially
  const [error, setError] = useState<string | null>(null);
  
  console.log('useProviderAvailability hook called with:', { providerId, date });

  // Generate mock availability data for now
  const generateMockSlots = (providerId: string, date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) {
      return slots;
    }

    // Morning slots (9 AM - 12 PM)
    for (let hour = 9; hour < 12; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
        const endHour = minute === 30 ? hour + 1 : hour;
        const endMinute = minute === 30 ? 0 : 30;
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`;
        
        // Randomly mark some slots as booked
        const isBooked = Math.random() > 0.7;
        
        slots.push({
          id: `${providerId}-${dateStr}-${startTime}`,
          provider_id: providerId,
          date: dateStr,
          start_time: startTime,
          end_time: endTime,
          is_available: true,
          is_booked: isBooked,
          appointment_type: 'both'
        });
      }
    }

    // Afternoon slots (2 PM - 5 PM)
    for (let hour = 14; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
        const endHour = minute === 30 ? hour + 1 : hour;
        const endMinute = minute === 30 ? 0 : 30;
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`;
        
        // Randomly mark some slots as booked
        const isBooked = Math.random() > 0.7;
        
        slots.push({
          id: `${providerId}-${dateStr}-${startTime}`,
          provider_id: providerId,
          date: dateStr,
          start_time: startTime,
          end_time: endTime,
          is_available: true,
          is_booked: isBooked,
          appointment_type: 'both'
        });
      }
    }

    return slots.filter(slot => !slot.is_booked);
  };

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!providerId || !date) {
        console.log('No providerId or date provided:', { providerId, date });
        setLoading(false);
        return;
      }

      console.log('Starting to fetch availability...');
      setLoading(true);
      setError(null);

      // Temporarily use mock data while we debug the Supabase connection
      setTimeout(() => {
        const mockSlots = generateMockSlots(providerId, date);
        setAvailableSlots(mockSlots);
        setLoading(false);
        console.log('Using mock data - slots generated:', mockSlots.length);
      }, 500); // Short delay to simulate loading
    };

    fetchAvailability();
  }, [providerId, date]);

  const bookSlot = async (slotId: string, patientId: string) => {
    try {
      const { error } = await supabase
        .from('provider_availability')
        .update({ 
          is_booked: true, 
          patient_id: patientId 
        })
        .eq('id', slotId);

      if (error) throw error;

      // Update local state
      setAvailableSlots(prev => prev.filter(slot => slot.id !== slotId));
      
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to book slot' };
    }
  };

  return {
    availableSlots,
    loading,
    error,
    bookSlot
  };
};