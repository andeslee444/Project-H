import { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';
import { supabaseServiceDebug } from '../services/supabaseService-debug';

// Check if we're in demo mode (GitHub Pages)
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || import.meta.env.GITHUB_PAGES === 'true';

// Define mock data at module level
const mockEntries = [
  {
    entry_id: '1',
    patient_id: 'p1',
    patient: {
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@email.com',
      phone: '(415) 555-0101',
      preferences: {
        primaryCondition: 'Anxiety',
        preferredTimes: ['Morning', 'Early Afternoon']
      },
      insurance_info: {
        provider: 'Blue Cross Blue Shield'
      }
    },
    priority_score: 95,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'waiting',
    notes: 'Urgent - experiencing increased anxiety'
  },
  {
    entry_id: '2',
    patient_id: 'p2',
    patient: {
      first_name: 'Emily',
      last_name: 'Davis',
      email: 'emily.davis@email.com',
      phone: '(415) 555-0102',
      preferences: {
        primaryCondition: 'Depression',
        preferredTimes: ['Evening']
      },
      insurance_info: {
        provider: 'Aetna'
      }
    },
    priority_score: 82,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'waiting',
    notes: null
  },
  {
    entry_id: '3',
    patient_id: 'p3',
    patient: {
      first_name: 'Michael',
      last_name: 'Brown',
      email: 'michael.brown@email.com',
      phone: '(415) 555-0103',
      preferences: {
        primaryCondition: 'ADHD',
        preferredTimes: ['Afternoon']
      },
      insurance_info: {
        provider: 'United Healthcare'
      }
    },
    priority_score: 78,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'waiting',
    notes: null
  },
  {
    entry_id: '4',
    patient_id: 'p4',
    patient: {
      first_name: 'Sarah',
      last_name: 'Wilson',
      email: 'sarah.wilson@email.com',
      phone: '(415) 555-0104',
      preferences: {
        primaryCondition: 'PTSD',
        preferredTimes: ['Morning', 'Weekend']
      },
      insurance_info: {
        provider: 'Cigna'
      }
    },
    priority_score: 90,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    status: 'waiting',
    notes: 'Prefers morning appointments'
  },
  {
    entry_id: '5',
    patient_id: 'p5',
    patient: {
      first_name: 'David',
      last_name: 'Martinez',
      email: 'david.martinez@email.com',
      phone: '(415) 555-0105',
      preferences: {
        primaryCondition: 'Bipolar Disorder',
        preferredTimes: ['Afternoon', 'Evening']
      },
      insurance_info: {
        provider: 'Kaiser Permanente'
      }
    },
    priority_score: 85,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'waiting',
    notes: null
  }
];

export function useWaitlist() {
  const [waitlistEntries, setWaitlistEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWaitlistEntries();
  }, []);

  const fetchWaitlistEntries = async () => {
    try {
      setLoading(true);
      console.log('DEBUG: Starting fetchWaitlistEntries...');
      
      // In demo mode, use mock data immediately
      if (isDemoMode) {
        console.log('Demo mode: Using mock data');
        const mockResponse = {
          data: mockEntries,
          success: true,
          error: null
        };
        const response = mockResponse;
        const { data: entries, success, error: serviceError } = response;
        
        if (entries && entries.length > 0) {
          const formattedEntries = entries.map((entry, index) => ({
            id: entry.entry_id,
            name: entry.patient ? `${entry.patient.first_name} ${entry.patient.last_name}` : 'Unknown Patient',
            email: entry.patient?.email || 'No email',
            phone: entry.patient?.phone || 'No phone',
            photo: `https://i.pravatar.cc/150?u=${entry.patient_id}`,
            condition: entry.patient?.preferences?.modality || entry.patient?.preferences?.primaryCondition || entry.notes || 'Not specified',
            insurance: entry.patient?.insurance_info?.provider || 'Not specified',
            preferredTimes: entry.patient?.preferences?.preferredTimes || ['Any time'],
            joinedDate: new Date(entry.created_at).toLocaleDateString(),
            position: index + 1,
            matchScore: entry.priority_score || 50,
            handRaised: entry.priority_score > 80,
            urgency: entry.priority_score > 85 ? 'high' : entry.priority_score > 70 ? 'medium' : 'low',
            lastContact: entry.updated_at ? new Date(entry.updated_at).toLocaleDateString() : null,
            responseRate: 75 + Math.random() * 25,
            provider: entry.provider ? `Dr. ${entry.provider.last_name}` : null,
            notes: entry.notes || '',
            status: entry.status,
            waitlistName: entry.waitlist?.name || 'General Waitlist'
          }));
          setWaitlistEntries(formattedEntries);
        }
        setLoading(false);
        return;
      }
      
      // Non-demo mode: fetch from Supabase
      // Add timeout to prevent hanging (increased to 15 seconds to allow for table joins)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Supabase query timeout after 15 seconds')), 15000)
      );
      
      // Use debug service for testing
      const queryPromise = supabaseServiceDebug.getWaitlistEntriesSimple();
      
      console.log('DEBUG: Waiting for Supabase response...');
      const response = await Promise.race([queryPromise, timeoutPromise]);
      
      console.log('Full Supabase response:', response);
      
      const { data: entries, success, error: serviceError } = response;
      
      // Debug: Log the structure of the first entry
      if (entries && entries.length > 0) {
        console.log('DEBUG: First entry structure:', JSON.stringify(entries[0], null, 2));
        console.log('DEBUG: Patient data:', entries[0].patient);
        console.log('DEBUG: Preferences:', entries[0].patient?.preferences);
      }
      
      if (!success || serviceError) {
        console.error('Service error:', serviceError);
        setError(serviceError || 'Failed to fetch waitlist entries');
      }
      
      // Temporarily show raw data to debug
      if (!success || !entries || entries.length === 0) {
        console.log('No data from Supabase, using mock data');
      } else {
        console.log(`Found ${entries.length} real entries from Supabase!`);
      }
      
      // Use mock data for now, but keep the same transformation logic
      const dataToUse = entries && entries.length > 0 ? entries : mockEntries;
      
      if (dataToUse) {
        // Transform the data to match the frontend format
        const formattedEntries = dataToUse.map((entry, index) => ({
          id: entry.entry_id,
          name: entry.patient ? `${entry.patient.first_name} ${entry.patient.last_name}` : 'Unknown Patient',
          email: entry.patient?.email || 'No email',
          phone: entry.patient?.phone || 'No phone',
          photo: `https://i.pravatar.cc/150?u=${entry.patient_id}`,
          // Map modality to condition for now
          condition: entry.patient?.preferences?.modality || entry.notes || 'Not specified',
          insurance: entry.patient?.insurance_info?.provider || 'Not specified',
          preferredTimes: entry.patient?.preferences?.preferredTimes || ['Any time'],
          joinedDate: new Date(entry.created_at).toLocaleDateString(),
          position: index + 1,
          matchScore: entry.priority_score || 50,
          handRaised: entry.priority_score > 80,
          urgency: entry.priority_score > 85 ? 'high' : entry.priority_score > 70 ? 'medium' : 'low',
          lastContact: entry.updated_at ? new Date(entry.updated_at).toLocaleDateString() : null,
          responseRate: 75 + Math.random() * 25, // Mock for now
          provider: entry.provider ? `Dr. ${entry.provider.last_name}` : null,
          notes: entry.notes || '',
          status: entry.status,
          waitlistName: entry.waitlist?.name || 'General Waitlist'
        }));
        
        setWaitlistEntries(formattedEntries);
        console.log(`Successfully formatted ${formattedEntries.length} entries`);
      }
    } catch (err) {
      console.error('Error fetching waitlist entries:', err);
      console.error('Full error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setError(err.message);
      
      // Use mock data if there's an error
      const formattedMockEntries = mockEntries.map((entry, index) => ({
        id: entry.entry_id,
        name: entry.patient ? `${entry.patient.first_name} ${entry.patient.last_name}` : 'Unknown Patient',
        email: entry.patient?.email || 'No email',
        phone: entry.patient?.phone || 'No phone',
        photo: `https://i.pravatar.cc/150?u=${entry.patient_id}`,
        condition: entry.patient?.preferences?.primaryCondition || 'Not specified',
        insurance: entry.patient?.insurance_info?.provider || 'Not specified',
        preferredTimes: entry.patient?.preferences?.preferredTimes || ['Any time'],
        joinedDate: new Date(entry.created_at).toLocaleDateString(),
        position: index + 1,
        matchScore: entry.priority_score || 50,
        handRaised: entry.priority_score > 80,
        urgency: entry.priority_score > 85 ? 'high' : entry.priority_score > 70 ? 'medium' : 'low',
        lastContact: entry.updated_at ? new Date(entry.updated_at).toLocaleDateString() : null,
        responseRate: 75 + Math.random() * 25,
        provider: entry.provider ? `Dr. ${entry.provider.last_name}` : null,
        notes: entry.notes || '',
        status: entry.status,
        waitlistName: entry.waitlist?.name || 'General Waitlist'
      }));
      setWaitlistEntries(formattedMockEntries);
      console.log('Using mock data due to error:', err.message);
      console.log('Note: Queries might be slow due to table joins. Consider optimizing the query.');
    } finally {
      setLoading(false);
    }
  };

  const updateWaitlistEntry = async (entryId, updates) => {
    try {
      await supabaseService.updateWaitlistEntry(entryId, updates);
      await fetchWaitlistEntries(); // Refresh the list
    } catch (err) {
      console.error('Error updating waitlist entry:', err);
      throw err;
    }
  };

  const addToWaitlist = async (patientData) => {
    try {
      await supabaseService.joinWaitlist(patientData);
      await fetchWaitlistEntries(); // Refresh the list
    } catch (err) {
      console.error('Error adding to waitlist:', err);
      throw err;
    }
  };

  return {
    waitlistEntries,
    loading,
    error,
    refreshWaitlist: fetchWaitlistEntries,
    updateWaitlistEntry,
    addToWaitlist
  };
}