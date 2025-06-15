import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

const TestAvailability: React.FC = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTest = async () => {
      console.log('TestAvailability: Starting fetch...');
      
      try {
        // Get first provider
        const { data: providers, error: provError } = await supabase
          .from('providers')
          .select('provider_id, first_name, last_name')
          .limit(1);
        
        if (provError || !providers || providers.length === 0) {
          throw new Error('No providers found');
        }
        
        const provider = providers[0];
        const testDate = '2025-06-16'; // Monday
        
        console.log('TestAvailability: Fetching for', provider.provider_id, testDate);
        
        const { data, error: slotsError } = await supabase
          .from('provider_availability')
          .select('*')
          .eq('provider_id', provider.provider_id)
          .eq('date', testDate)
          .eq('is_available', true)
          .eq('is_booked', false)
          .order('start_time')
          .limit(5);
        
        console.log('TestAvailability: Result', { data, error: slotsError });
        
        if (slotsError) throw slotsError;
        
        setSlots(data || []);
      } catch (err: any) {
        console.error('TestAvailability: Error', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTest();
  }, []);

  return (
    <div className="fixed top-4 left-4 bg-white border rounded-lg shadow-lg p-4 max-w-md z-50">
      <h3 className="font-bold text-sm mb-2">Test Availability Component</h3>
      
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      {!loading && !error && (
        <div>
          <div>Found {slots.length} slots</div>
          {slots.map((slot, idx) => (
            <div key={idx} className="text-xs">
              {slot.start_time} - {slot.end_time}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestAvailability;