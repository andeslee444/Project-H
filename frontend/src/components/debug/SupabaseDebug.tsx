import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

const SupabaseDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({
    connection: 'Checking...',
    tables: {},
    availability: null,
    error: null
  });

  useEffect(() => {
    const runDebugChecks = async () => {
      const info: any = { tables: {} };
      
      try {
        // 1. Check connection
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        info.connection = sessionError ? `Error: ${sessionError.message}` : 'Connected';
        
        // 2. Check tables
        const tables = ['patients', 'providers', 'provider_availability', 'waitlist_entries'];
        
        for (const table of tables) {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          info.tables[table] = error 
            ? `❌ Error: ${error.message}` 
            : `✅ Exists (${count} records)`;
        }
        
        // 3. Test availability query
        const today = new Date();
        const nextMonday = new Date(today);
        const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
        nextMonday.setDate(today.getDate() + daysUntilMonday);
        
        const { data: providers } = await supabase
          .from('providers')
          .select('provider_id, first_name, last_name')
          .limit(1);
        
        if (providers && providers[0]) {
          const provider = providers[0];
          const dateStr = format(nextMonday, 'yyyy-MM-dd');
          
          console.log('DEBUG: Testing availability query with:', {
            provider_id: provider.provider_id,
            date: dateStr
          });
          
          const { data: slots, error: slotsError } = await supabase
            .from('provider_availability')
            .select('*')
            .eq('provider_id', provider.provider_id)
            .eq('date', dateStr)
            .eq('is_available', true)
            .eq('is_booked', false)
            .order('start_time')
            .limit(5);
          
          if (slotsError) {
            info.availability = `Error: ${slotsError.message}`;
          } else {
            info.availability = {
              provider: `${provider.first_name} ${provider.last_name}`,
              date: dateStr,
              slotsFound: slots?.length || 0,
              firstSlot: slots?.[0] ? `${slots[0].start_time} - ${slots[0].end_time}` : 'None'
            };
          }
        }
        
      } catch (error: any) {
        info.error = error.message;
      }
      
      setDebugInfo(info);
    };
    
    runDebugChecks();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 max-w-md z-50">
      <h3 className="font-bold text-sm mb-2">Supabase Debug Info</h3>
      
      <div className="text-xs space-y-1">
        <div>
          <strong>Connection:</strong> {debugInfo.connection}
        </div>
        
        <div className="mt-2">
          <strong>Tables:</strong>
          {Object.entries(debugInfo.tables).map(([table, status]) => (
            <div key={table} className="ml-2">
              {table}: {status as string}
            </div>
          ))}
        </div>
        
        {debugInfo.availability && (
          <div className="mt-2">
            <strong>Availability Test:</strong>
            {typeof debugInfo.availability === 'string' ? (
              <div className="ml-2 text-red-600">{debugInfo.availability}</div>
            ) : (
              <div className="ml-2">
                <div>Provider: {debugInfo.availability.provider}</div>
                <div>Date: {debugInfo.availability.date}</div>
                <div>Slots: {debugInfo.availability.slotsFound}</div>
                <div>First: {debugInfo.availability.firstSlot}</div>
              </div>
            )}
          </div>
        )}
        
        {debugInfo.error && (
          <div className="mt-2 text-red-600">
            <strong>Error:</strong> {debugInfo.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupabaseDebug;