import { useState, useEffect, useRef } from 'react';
import { supabaseService } from '../services/supabaseService';
import { supabaseServiceDebug } from '../services/supabaseService-debug';
import { getConfig } from '../config';
import { supabase } from '../lib/supabase';

// Check if we're in demo mode using centralized configuration
const isDemoMode = getConfig().auth.mode === 'demo';

// Define mock data at module level - ALL patients from the full patient list
const mockEntries = [
  {
    entry_id: '1',
    patient_id: 'p1',
    patient: {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@email.com',
      phone: '(425) 533-6828',
      preferences: {
        primaryCondition: 'Substance abuse',
        preferredTimes: ['morning', 'afternoon']
      },
      insurance_info: {
        provider: 'Cigna'
      }
    },
    priority_score: 95,
    created_at: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    status: 'waiting',
    notes: 'Substance abuse',
    hand_raised: true
  },
  {
    entry_id: '2',
    patient_id: 'p2',
    patient: {
      first_name: 'Michael',
      last_name: 'Brown',
      email: 'michael.brown@email.com',
      phone: '(425) 533-6828',
      preferences: {
        primaryCondition: 'Anxiety',
        preferredTimes: ['evening']
      },
      insurance_info: {
        provider: 'Aetna'
      }
    },
    priority_score: 78,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    status: 'waiting',
    notes: 'Anxiety and stress management'
  },
  {
    entry_id: '3',
    patient_id: 'p3',
    patient: {
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(415) 555-0103',
      preferences: {
        primaryCondition: 'PTSD',
        preferredTimes: ['Flexible']
      },
      insurance_info: {
        provider: 'Blue Cross Blue Shield'
      }
    },
    priority_score: 85,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    status: 'waiting',
    notes: 'PTSD treatment'
  },
  {
    entry_id: '4',
    patient_id: 'p4',
    patient: {
      first_name: 'Sarah',
      last_name: 'Wilson',
      email: 'sarah.wilson@email.com',
      phone: '(425) 533-6828',
      preferences: {
        primaryCondition: 'Depression',
        preferredTimes: ['morning']
      },
      insurance_info: {
        provider: 'Cigna'
      }
    },
    priority_score: 90,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    status: 'waiting',
    notes: 'Depression and mood management',
    hand_raised: true
  },
  {
    entry_id: '5',
    patient_id: 'p5',
    patient: {
      first_name: 'Emily',
      last_name: 'Davis',
      email: 'emily.davis@email.com',
      phone: '(415) 555-0105',
      preferences: {
        primaryCondition: 'Couples therapy',
        preferredTimes: ['weekend']
      },
      insurance_info: {
        provider: 'United Healthcare'
      }
    },
    priority_score: 70,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    status: 'waiting',
    notes: 'Couples therapy'
  },
  {
    entry_id: '6',
    patient_id: 'p6',
    patient: {
      first_name: 'James',
      last_name: 'Martinez',
      email: 'james.martinez@email.com',
      phone: '(415) 555-0106',
      preferences: {
        primaryCondition: 'Bipolar disorder',
        preferredTimes: ['afternoon']
      },
      insurance_info: {
        provider: 'Kaiser Permanente'
      }
    },
    priority_score: 88,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    status: 'waiting',
    notes: 'Bipolar disorder management'
  },
  {
    entry_id: '7',
    patient_id: 'p7',
    patient: {
      first_name: 'Emma',
      last_name: 'Johnson',
      email: 'emma.johnson@email.com',
      phone: '(415) 555-0107',
      preferences: {
        primaryCondition: 'ADHD',
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
    notes: 'ADHD evaluation and treatment'
  },
  {
    entry_id: '8',
    patient_id: 'p8',
    patient: {
      first_name: 'Robert',
      last_name: 'Taylor',
      email: 'robert.taylor@email.com',
      phone: '(415) 555-0108',
      preferences: {
        primaryCondition: 'Grief counseling',
        preferredTimes: ['morning', 'evening']
      },
      insurance_info: {
        provider: 'Anthem'
      }
    },
    priority_score: 72,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    status: 'waiting',
    notes: 'Grief counseling'
  },
  {
    entry_id: '9',
    patient_id: 'p9',
    patient: {
      first_name: 'Linda',
      last_name: 'Anderson',
      email: 'linda.anderson@email.com',
      phone: '(415) 555-0109',
      preferences: {
        primaryCondition: 'Eating disorder',
        preferredTimes: ['afternoon']
      },
      insurance_info: {
        provider: 'Cigna'
      }
    },
    priority_score: 83,
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    status: 'waiting',
    notes: 'Eating disorder treatment'
  },
  {
    entry_id: '10',
    patient_id: 'p10',
    patient: {
      first_name: 'David',
      last_name: 'Thomas',
      email: 'david.thomas@email.com',
      phone: '(415) 555-0110',
      preferences: {
        primaryCondition: 'OCD',
        preferredTimes: ['Flexible']
      },
      insurance_info: {
        provider: 'Blue Cross Blue Shield'
      }
    },
    priority_score: 79,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    status: 'waiting',
    notes: 'OCD treatment'
  },
  {
    entry_id: '11',
    patient_id: 'p11',
    patient: {
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@email.com',
      phone: '(415) 555-0102',
      preferences: {
        primaryCondition: 'Panic disorder',
        preferredTimes: ['evening']
      },
      insurance_info: {
        provider: 'Aetna'
      }
    },
    priority_score: 82,
    created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    status: 'waiting',
    notes: 'Panic disorder management'
  }
];

export function useWaitlist() {
  const [waitlistEntries, setWaitlistEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const subscriptionRef = useRef(null);

  useEffect(() => {
    fetchWaitlistEntries();
    
    // Set up real-time subscription if not in demo mode
    if (!isDemoMode) {
      console.log('Setting up real-time subscription for waitlist...');
      
      // Subscribe to waitlist_entries table changes
      const subscription = supabase
        .channel('waitlist_changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'waitlist_entries'
          },
          (payload) => {
            console.log('Waitlist change detected:', payload.eventType);
            
            // Refresh data when any change occurs
            // This ensures we get the latest data with all relationships
            fetchWaitlistEntries();
            
            // You could also handle specific events:
            switch (payload.eventType) {
              case 'INSERT':
                console.log('New patient added to waitlist');
                break;
              case 'UPDATE':
                console.log('Waitlist entry updated');
                break;
              case 'DELETE':
                console.log('Patient removed from waitlist');
                break;
            }
          }
        )
        .on('system', { event: 'error' }, (payload) => {
          console.error('Subscription error:', payload);
          setConnectionStatus('error');
        })
        .on('system', { event: 'connected' }, () => {
          console.log('Real-time subscription connected');
          setConnectionStatus('connected');
        })
        .subscribe((status) => {
          console.log('Subscription status:', status);
          if (status === 'SUBSCRIBED') {
            setConnectionStatus('connected');
          }
        });
      
      subscriptionRef.current = subscription;
      
      // Also subscribe to patient table changes (in case patient info updates)
      const patientSubscription = supabase
        .channel('patient_changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'patients'
          },
          (payload) => {
            console.log('Patient data updated:', payload);
            // Always refresh when patient data changes
            // The fetchWaitlistEntries will handle filtering to only show waitlisted patients
            console.log('Updating waitlist due to patient change');
            fetchWaitlistEntries();
          }
        )
        .subscribe();
      
      // Cleanup function
      return () => {
        console.log('Cleaning up waitlist subscriptions');
        if (subscriptionRef.current) {
          supabase.removeChannel(subscriptionRef.current);
        }
        supabase.removeChannel(patientSubscription);
      };
    }
  }, []);

  const fetchWaitlistEntries = async () => {
    try {
      setLoading(true);
      console.log('DEBUG: Starting fetchWaitlistEntries...');
      
      // In demo mode, use mock data immediately
      if (isDemoMode) {
        console.log('Demo mode: Using mock data');
        console.log('Mock entries count:', mockEntries.length);
        const mockResponse = {
          data: mockEntries,
          success: true,
          error: null
        };
        const response = mockResponse;
        const { data: entries, success, error: serviceError } = response;
        
        if (entries && entries.length > 0) {
          console.log('Processing', entries.length, 'mock entries');
          const formattedEntries = entries.map((entry, index) => ({
            id: entry.patient_id,
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
            handRaised: entry.hand_raised || entry.priority_score > 80, // Use explicit field or fallback to score
            urgency: entry.priority_score > 85 ? 'high' : entry.priority_score > 70 ? 'medium' : 'low',
            lastContact: entry.updated_at ? new Date(entry.updated_at).toLocaleDateString() : null,
            responseRate: Math.floor(70 + Math.random() * 30),
            provider: entry.provider ? `Dr. ${entry.provider.last_name}` : 'Unassigned',
            notes: entry.notes || '',
            status: entry.status || 'waiting',
            waitlistName: entry.waitlist?.name || 'General Waitlist',
            location: entry.patient.location || 'New York, NY',
            distance: Math.floor(Math.random() * 30) + 1,
            excluded: entry.status === 'excluded'
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
        // Create a map to track unique patients
        const uniquePatients = new Map();
        
        dataToUse.forEach((entry) => {
          // Skip entries without patient data
          if (!entry.patient) {
            console.warn(`Waitlist entry ${entry.entry_id} has no patient data`);
            return;
          }
          
          const patientId = entry.patient_id;
          
          // If we haven't seen this patient yet, or if this entry has higher priority, use it
          if (!uniquePatients.has(patientId) || 
              (entry.priority_score || 0) > (uniquePatients.get(patientId).priority_score || 0)) {
            uniquePatients.set(patientId, entry);
          }
        });
        
        // Convert unique patients map to array and format
        const formattedEntries = Array.from(uniquePatients.values()).map((entry, index) => {
          return {
            id: entry.patient_id, // Use patient_id as unique identifier
            name: `${entry.patient.first_name} ${entry.patient.last_name}`,
            email: entry.patient.email || 'No email',
            phone: entry.patient.phone || 'No phone',
            photo: entry.patient.photo || `https://i.pravatar.cc/150?u=${entry.patient_id}`,
            // Handle multiple diagnoses and standardized insurance format
            condition: Array.isArray(entry.patient.diagnosis) && entry.patient.diagnosis.length > 0 
              ? entry.patient.diagnosis[0] // Use primary diagnosis for display
              : entry.notes || 'General mental health',
            allDiagnoses: entry.patient.diagnosis || [], // Pass full array for matching
            insurance: entry.patient.insurance_info?.provider || 'Self-pay',
            preferredTimes: entry.patient.preferred_days || entry.patient.preferences?.preferredTimes || ['Flexible'],
            joinedDate: new Date(entry.created_at).toLocaleDateString(),
            position: index + 1,
            matchScore: entry.priority_score || 75,
            handRaised: entry.hand_raised || entry.priority_score > 80, // Use explicit field or fallback to score
            urgency: entry.priority_score > 85 ? 'high' : entry.priority_score > 70 ? 'medium' : 'low',
            lastContact: entry.updated_at ? new Date(entry.updated_at).toLocaleDateString() : null,
            responseRate: Math.floor(70 + Math.random() * 30), // Mock for now
            provider: entry.provider ? `Dr. ${entry.provider.last_name}` : 'Unassigned',
            notes: entry.notes || '',
            status: entry.status || 'waiting',
            waitlistName: entry.waitlist?.name || 'General Waitlist',
            location: entry.patient.location || entry.patient.address?.city || 'New York, NY',
            distance: Math.floor(Math.random() * 30) + 1, // TODO: Calculate real distance
            excluded: entry.status === 'excluded',
            preferredModality: entry.patient.preferred_modality || entry.patient.preferences?.modality || 'either',
            preferredGender: entry.patient.preferred_gender || entry.patient.preferences?.gender || 'no preference'
          };
        });
        
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
        id: entry.patient_id,
        name: `${entry.patient.first_name} ${entry.patient.last_name}`,
        email: entry.patient.email || 'No email',
        phone: entry.patient.phone || 'No phone',
        photo: `https://i.pravatar.cc/150?u=${entry.patient_id}`,
        condition: entry.patient.preferences?.primaryCondition || entry.notes || 'General mental health',
        insurance: entry.patient.insurance_info?.provider || 'Self-pay',
        preferredTimes: entry.patient.preferences?.preferredTimes || ['Flexible'],
        joinedDate: new Date(entry.created_at).toLocaleDateString(),
        position: index + 1,
        matchScore: entry.priority_score || 75,
        handRaised: entry.hand_raised || entry.priority_score > 80,
        urgency: entry.priority_score > 85 ? 'high' : entry.priority_score > 70 ? 'medium' : 'low',
        lastContact: entry.updated_at ? new Date(entry.updated_at).toLocaleDateString() : null,
        responseRate: Math.floor(70 + Math.random() * 30),
        provider: entry.provider ? `Dr. ${entry.provider.last_name}` : 'Unassigned',
        notes: entry.notes || '',
        status: entry.status || 'waiting',
        waitlistName: entry.waitlist?.name || 'General Waitlist',
        location: entry.patient.location || 'New York, NY',
        distance: Math.floor(Math.random() * 30) + 1,
        excluded: entry.status === 'excluded',
        preferredModality: entry.patient.preferred_modality || 'either',
        preferredGender: entry.patient.preferred_gender || 'no preference'
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
    connectionStatus,
    refreshWaitlist: fetchWaitlistEntries,
    updateWaitlistEntry,
    addToWaitlist
  };
}