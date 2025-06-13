import { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';
import { supabaseServiceDebug } from '../services/supabaseService-debug';

// Check if we're in demo mode (GitHub Pages)
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || import.meta.env.GITHUB_PAGES === 'true';

// Define mock data at module level - subset of patients from the full patient list
const mockEntries = [
  {
    entry_id: '1',
    patient_id: 'p3',
    patient: {
      first_name: 'Michael',
      last_name: 'Brown',
      email: 'michael.brown@email.com',
      phone: '(415) 555-0105',
      preferences: {
        primaryCondition: 'New patient consultation',
        preferredTimes: ['Flexible']
      },
      insurance_info: {
        provider: 'United'
      }
    },
    priority_score: 78,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    status: 'waiting',
    notes: 'New patient consultation'
  },
  {
    entry_id: '2',
    patient_id: 'p4',
    patient: {
      first_name: 'Sarah',
      last_name: 'Wilson',
      email: 'sarah.wilson@email.com',
      phone: '(415) 555-0104',
      preferences: {
        primaryCondition: 'Prefers morning appointments',
        preferredTimes: ['Flexible']
      },
      insurance_info: {
        provider: 'Cigna'
      }
    },
    priority_score: 90,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    status: 'waiting',
    notes: 'Prefers morning appointments'
  },
  {
    entry_id: '3',
    patient_id: 'p1',
    patient: {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@email.com',
      phone: '(415) 555-0101',
      preferences: {
        primaryCondition: 'Urgent - experiencing increased anxiety',
        preferredTimes: ['morning', 'afternoon']
      },
      insurance_info: {
        provider: 'Blue Cross Blue Shield'
      }
    },
    priority_score: 95,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    status: 'waiting',
    notes: 'Urgent - experiencing increased anxiety'
  },
  {
    entry_id: '4',
    patient_id: 'p5',
    patient: {
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@email.com',
      phone: '(415) 555-0102',
      preferences: {
        primaryCondition: 'New patient consultation',
        preferredTimes: ['evening']
      },
      insurance_info: {
        provider: 'Aetna'
      }
    },
    priority_score: 82,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    status: 'waiting',
    notes: 'New patient consultation'
  },
  {
    entry_id: '5',
    patient_id: 'p6',
    patient: {
      first_name: 'Emma',
      last_name: 'Johnson',
      email: 'emma.johnson@email.com',
      phone: '(415) 555-0107',
      preferences: {
        primaryCondition: 'Flexible with scheduling',
        preferredTimes: ['Flexible']
      },
      insurance_info: {
        provider: 'United Healthcare'
      }
    },
    priority_score: 75,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'waiting',
    notes: 'Flexible with scheduling'
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
            name: `${entry.patient.first_name} ${entry.patient.last_name}`,
            email: entry.patient.email || 'No email',
            phone: entry.patient.phone || 'No phone',
            photo: entry.patient.photo || `https://i.pravatar.cc/150?u=${entry.patient_id}`,
            condition: entry.patient.preferences?.primaryCondition || entry.notes || 'General',
            insurance: entry.patient.insurance_info?.provider || 'Self-pay',
            preferredTimes: entry.patient.preferences?.preferredTimes || ['Flexible'],
            joinedDate: new Date(entry.created_at).toLocaleDateString(),
            position: index + 1,
            matchScore: entry.priority_score || 75,
            handRaised: entry.priority_score > 80,
            urgency: entry.priority_score > 85 ? 'high' : entry.priority_score > 70 ? 'medium' : 'low',
            lastContact: entry.updated_at ? new Date(entry.updated_at).toLocaleDateString() : null,
            responseRate: Math.floor(70 + Math.random() * 30),
            provider: entry.provider ? `Dr. ${entry.provider.last_name}` : 'Unassigned',
            notes: entry.notes || '',
            status: entry.status || 'waiting',
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
        const formattedEntries = dataToUse.map((entry, index) => {
          // Skip entries without patient data
          if (!entry.patient) {
            console.warn(`Waitlist entry ${entry.entry_id} has no patient data`);
            return null;
          }
          
          return {
            id: entry.entry_id,
            name: `${entry.patient.first_name} ${entry.patient.last_name}`,
            email: entry.patient.email || 'No email',
            phone: entry.patient.phone || 'No phone',
            photo: entry.patient.photo || `https://i.pravatar.cc/150?u=${entry.patient_id}`,
            // Use primaryCondition from preferences, fallback to notes
            condition: entry.patient.preferences?.primaryCondition || entry.notes || 'General',
            insurance: entry.patient.insurance_info?.provider || 'Self-pay',
            preferredTimes: entry.patient.preferences?.preferredTimes || ['Flexible'],
            joinedDate: new Date(entry.created_at).toLocaleDateString(),
            position: index + 1,
            matchScore: entry.priority_score || 75,
            handRaised: entry.priority_score > 80,
            urgency: entry.priority_score > 85 ? 'high' : entry.priority_score > 70 ? 'medium' : 'low',
            lastContact: entry.updated_at ? new Date(entry.updated_at).toLocaleDateString() : null,
            responseRate: Math.floor(70 + Math.random() * 30), // Mock for now
            provider: entry.provider ? `Dr. ${entry.provider.last_name}` : 'Unassigned',
            notes: entry.notes || '',
            status: entry.status || 'waiting',
            waitlistName: entry.waitlist?.name || 'General Waitlist'
          };
        }).filter(Boolean); // Remove null entries
        
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
        name: `${entry.patient.first_name} ${entry.patient.last_name}`,
        email: entry.patient.email || 'No email',
        phone: entry.patient.phone || 'No phone',
        photo: `https://i.pravatar.cc/150?u=${entry.patient_id}`,
        condition: entry.patient.preferences?.primaryCondition || 'General',
        insurance: entry.patient.insurance_info?.provider || 'Self-pay',
        preferredTimes: entry.patient.preferences?.preferredTimes || ['Flexible'],
        joinedDate: new Date(entry.created_at).toLocaleDateString(),
        position: index + 1,
        matchScore: entry.priority_score || 75,
        handRaised: entry.priority_score > 80,
        urgency: entry.priority_score > 85 ? 'high' : entry.priority_score > 70 ? 'medium' : 'low',
        lastContact: entry.updated_at ? new Date(entry.updated_at).toLocaleDateString() : null,
        responseRate: Math.floor(70 + Math.random() * 30),
        provider: entry.provider ? `Dr. ${entry.provider.last_name}` : 'Unassigned',
        notes: entry.notes || '',
        status: entry.status || 'waiting',
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