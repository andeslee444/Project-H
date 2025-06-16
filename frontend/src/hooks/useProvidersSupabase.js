import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase-no-rate-limit';
import { getConfig } from '../config';

// Check if we're in demo mode using centralized configuration
// TEMPORARILY DISABLED: Force production mode to test new provider data
const isDemoMode = false; // getConfig().auth.mode === 'demo';

// Mock data for demo mode
const mockProviders = [
  {
    provider_id: '1',
    first_name: 'Sarah',
    last_name: 'Chen',
    title: 'Clinical Psychologist',
    email: 'sarah.chen@serenitymhc.com',
    phone: '(415) 555-0101',
    specialties: ['Anxiety', 'Depression', 'ADHD', 'Trauma'],
    modalities: ['Cognitive Behavioral Therapy (CBT)', 'Mindfulness-Based Therapy', 'EMDR'],
    languages: ['English', 'Mandarin'],
    insurance_accepted: ['Blue Cross Blue Shield', 'Aetna', 'United Healthcare', 'Cigna'],
    availability: {
      today: ['2:00 PM', '3:30 PM', '5:00 PM'],
      tomorrow: ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'],
      thisWeek: 12
    },
    location: '123 Main St, Suite 200, New York, NY 10001',
    coordinates: { lat: 40.7488, lng: -73.9854 },
    virtual_available: true,
    in_person_available: true,
    rating: 4.9,
    reviews: 127,
    bio: 'Dr. Chen specializes in evidence-based treatments for anxiety and mood disorders...',
    waitlist_count: 8,
    next_available: '2:00 PM Today'
  },
  {
    provider_id: '2',
    first_name: 'Michael',
    last_name: 'Rodriguez',
    title: 'Licensed Therapist, LCSW',
    email: 'michael.rodriguez@serenitymhc.com',
    phone: '(415) 555-0102',
    specialties: ['Couples Therapy', 'Family Therapy', 'Relationships'],
    modalities: ['Dialectical Behavior Therapy (DBT)', 'Psychodynamic Therapy'],
    languages: ['English', 'Spanish'],
    insurance_accepted: ['Aetna', 'Cigna', 'Oscar', 'Empire BCBS'],
    availability: {
      today: [],
      tomorrow: ['4:30 PM', '5:30 PM'],
      thisWeek: 6
    },
    location: '456 Park Ave, Floor 8, New York, NY 10016',
    coordinates: { lat: 40.7614, lng: -73.9714 },
    virtual_available: true,
    in_person_available: false,
    rating: 4.8,
    reviews: 89,
    bio: 'Specializing in relationship dynamics and communication strategies...',
    waitlist_count: 12,
    next_available: '4:30 PM Tomorrow'
  },
  {
    provider_id: '3',
    first_name: 'Emily',
    last_name: 'Williams',
    title: 'Psychiatrist, MD',
    email: 'emily.williams@serenitymhc.com',
    phone: '(415) 555-0103',
    specialties: ['Medication Management', 'Bipolar Disorder', 'OCD', 'PTSD'],
    modalities: ['Medication Management', 'Psychopharmacology'],
    languages: ['English'],
    insurance_accepted: ['Most Major Insurance Accepted'],
    availability: {
      today: [],
      tomorrow: [],
      thisWeek: 3
    },
    location: '789 Broadway, Suite 400, New York, NY 10003',
    coordinates: { lat: 40.7317, lng: -73.9916 },
    virtual_available: true,
    in_person_available: true,
    rating: 4.9,
    reviews: 156,
    bio: 'Board-certified psychiatrist with expertise in psychopharmacology...',
    waitlist_count: 25,
    next_available: 'Monday 10:00 AM'
  },
  {
    provider_id: '4',
    first_name: 'David',
    last_name: 'Kim',
    title: 'Licensed Therapist, LMFT',
    email: 'david.kim@serenitymhc.com',
    phone: '(415) 555-0104',
    specialties: ['Trauma', 'PTSD', 'Grief Counseling', 'Life Transitions'],
    modalities: ['EMDR', 'Somatic Therapy', 'Narrative Therapy'],
    languages: ['English', 'Korean'],
    insurance_accepted: ['Blue Cross Blue Shield', 'United Healthcare', 'Anthem'],
    availability: {
      today: ['4:00 PM', '5:30 PM'],
      tomorrow: ['10:00 AM', '1:00 PM', '3:00 PM'],
      thisWeek: 15
    },
    location: '321 5th Avenue, Suite 12, New York, NY 10001',
    coordinates: { lat: 40.7478, lng: -73.9856 },
    virtual_available: true,
    in_person_available: true,
    rating: 4.8,
    reviews: 92,
    bio: 'Specializing in trauma-informed care and healing approaches...',
    waitlist_count: 10,
    next_available: '4:00 PM Today'
  },
  {
    provider_id: '5',
    first_name: 'Jessica',
    last_name: 'Thompson',
    title: 'Clinical Social Worker, LCSW',
    email: 'jessica.thompson@serenitymhc.com',
    phone: '(415) 555-0105',
    specialties: ['Adolescent Therapy', 'Teen Issues', 'School Problems', 'Behavioral Issues'],
    modalities: ['Solution-Focused Therapy', 'Play Therapy', 'Art Therapy'],
    languages: ['English', 'French'],
    insurance_accepted: ['Aetna', 'Cigna', 'Humana', 'Medicare'],
    availability: {
      today: ['3:00 PM'],
      tomorrow: ['2:00 PM', '4:00 PM', '5:00 PM'],
      thisWeek: 9
    },
    location: '555 Lexington Ave, Floor 10, New York, NY 10022',
    coordinates: { lat: 40.7568, lng: -73.9726 },
    virtual_available: true,
    in_person_available: false,
    rating: 4.9,
    reviews: 108,
    bio: 'Expert in working with adolescents and families navigating teen challenges...',
    waitlist_count: 14,
    next_available: '3:00 PM Today'
  },
  {
    provider_id: '6',
    first_name: 'Robert',
    last_name: 'Martinez',
    title: 'Psychiatrist, MD',
    email: 'robert.martinez@serenitymhc.com',
    phone: '(415) 555-0106',
    specialties: ['Addiction Medicine', 'Substance Abuse', 'Dual Diagnosis', 'Depression'],
    modalities: ['Medication Management', 'Motivational Interviewing', 'Psychotherapy'],
    languages: ['English', 'Spanish', 'Portuguese'],
    insurance_accepted: ['Blue Cross Blue Shield', 'United Healthcare', 'Oxford'],
    availability: {
      today: [],
      tomorrow: ['11:00 AM'],
      thisWeek: 4
    },
    location: '890 7th Avenue, Suite 2400, New York, NY 10019',
    coordinates: { lat: 40.7652, lng: -73.9816 },
    virtual_available: true,
    in_person_available: true,
    rating: 4.7,
    reviews: 134,
    bio: 'Dual board-certified in psychiatry and addiction medicine...',
    waitlist_count: 18,
    next_available: '11:00 AM Tomorrow'
  },
  {
    provider_id: '7',
    first_name: 'Amanda',
    last_name: 'Lee',
    title: 'Psychologist, PhD',
    email: 'amanda.lee@serenitymhc.com',
    phone: '(415) 555-0107',
    specialties: ['Eating Disorders', 'Body Image', 'Self-Esteem', 'Women\'s Issues'],
    modalities: ['Acceptance and Commitment Therapy', 'Body-Positive Therapy'],
    languages: ['English', 'Cantonese'],
    insurance_accepted: ['Aetna', 'Cigna', 'Empire BCBS'],
    availability: {
      today: ['5:00 PM', '6:00 PM'],
      tomorrow: ['9:00 AM', '10:00 AM', '2:00 PM'],
      thisWeek: 11
    },
    location: '234 Hudson Street, Suite 304, New York, NY 10013',
    coordinates: { lat: 40.7263, lng: -74.0080 },
    virtual_available: true,
    in_person_available: true,
    rating: 4.9,
    reviews: 87,
    bio: 'Specializing in eating disorder recovery and body image healing...',
    waitlist_count: 16,
    next_available: '5:00 PM Today'
  },
  {
    provider_id: '8',
    first_name: 'James',
    last_name: 'Wilson',
    title: 'Licensed Counselor, LPC',
    email: 'james.wilson@serenitymhc.com',
    phone: '(415) 555-0108',
    specialties: ['Men\'s Issues', 'Anger Management', 'Career Counseling', 'Stress'],
    modalities: ['Cognitive Behavioral Therapy', 'Mindfulness-Based Stress Reduction'],
    languages: ['English'],
    insurance_accepted: ['United Healthcare', 'Oxford', 'Anthem', 'Tricare'],
    availability: {
      today: ['7:00 PM'],
      tomorrow: ['12:00 PM', '6:00 PM', '7:00 PM'],
      thisWeek: 8
    },
    location: '1001 Avenue of the Americas, Floor 15, New York, NY 10018',
    coordinates: { lat: 40.7522, lng: -73.9867 },
    virtual_available: true,
    in_person_available: true,
    rating: 4.6,
    reviews: 72,
    bio: 'Helping men navigate life challenges with practical strategies...',
    waitlist_count: 6,
    next_available: '7:00 PM Today'
  }
];

// Helper function to transform provider data from database to frontend format
const transformProvider = (provider) => ({
  ...provider,
  // Add computed fields
  name: `${provider.first_name} ${provider.last_name}`,
  insurance: provider.insurance_accepted || ['Blue Cross Blue Shield', 'Aetna'],
  availability: {
    today: provider.weekly_slots === 0 ? [] : ['2:00 PM', '3:30 PM'], // Mock for now
    tomorrow: provider.weekly_slots === 0 ? [] : ['9:00 AM', '11:00 AM'],
    thisWeek: provider.weekly_slots || 10
  },
  next_available: 'Today at 2:00 PM',
  rating: provider.rating || 4.8,
  reviews: provider.review_count || 50,
  waitlist_count: provider.waitlist_count || 5,
  bio: provider.bio || `${provider.title} specializing in mental health care.`
});

export function useProvidersSupabase() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const subscriptionRef = useRef(null);

  useEffect(() => {
    fetchProviders();
    
    // Set up real-time subscription if not in demo mode
    if (!isDemoMode) {
      console.log('Setting up real-time subscription for providers...');
      
      // Subscribe to providers table changes
      const subscription = supabase
        .channel('providers_changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'providers'
          },
          (payload) => {
            console.log('Provider change detected:', payload.eventType);
            
            // Handle different event types
            switch (payload.eventType) {
              case 'INSERT':
                console.log('New provider added:', payload.new);
                // Transform and add the new provider to the list
                const newProvider = transformProvider(payload.new);
                setProviders(prev => [...prev, newProvider]);
                break;
                
              case 'UPDATE':
                console.log('Provider updated:', payload.new);
                // Transform and update the provider in the list
                const updatedProvider = transformProvider(payload.new);
                setProviders(prev => prev.map(provider => 
                  provider.provider_id === updatedProvider.provider_id ? updatedProvider : provider
                ));
                break;
                
              case 'DELETE':
                console.log('Provider deleted:', payload.old);
                // Remove the provider from the list
                setProviders(prev => prev.filter(provider => 
                  provider.provider_id !== payload.old.provider_id
                ));
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
      
      // Cleanup function
      return () => {
        console.log('Cleaning up providers subscription');
        if (subscriptionRef.current) {
          supabase.removeChannel(subscriptionRef.current);
        }
      };
    }
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      console.log('DEBUG: Starting fetchProviders...');
      
      // In demo mode, use mock data
      if (isDemoMode) {
        console.log('Demo mode: Using mock provider data');
        setProviders(mockProviders);
        setLoading(false);
        return;
      }

      // Use direct REST API call to avoid SDK issues
      const url = `${supabase.supabaseUrl}/rest/v1/providers?select=*&limit=50`;
      console.log('DEBUG: Fetching providers from:', url);

      const response = await fetch(url, {
        headers: {
          'apikey': supabase.supabaseKey,
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });

      console.log('DEBUG: Provider response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Provider fetch error:', errorText);
        throw new Error(`Failed to fetch providers: ${response.status}`);
      }

      const data = await response.json();
      console.log('DEBUG: Provider data received:', data);

      if (data && data.length > 0) {
        // Transform database data to match frontend format
        const transformedProviders = data.map(transformProvider);
        setProviders(transformedProviders);
      } else {
        // Fallback to mock data if no providers in database
        console.log('No providers in database, using mock data');
        setProviders(mockProviders);
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError(err.message);
      // Use mock data on error
      setProviders(mockProviders);
    } finally {
      setLoading(false);
    }
  };

  const searchProviders = (searchTerm) => {
    if (!searchTerm) return providers;
    
    const searchLower = searchTerm.toLowerCase();
    return providers.filter(provider => 
      provider.first_name.toLowerCase().includes(searchLower) ||
      provider.last_name.toLowerCase().includes(searchLower) ||
      provider.specialties.some(s => s.toLowerCase().includes(searchLower)) ||
      provider.title?.toLowerCase().includes(searchLower)
    );
  };

  const filterProviders = (filters) => {
    let filtered = [...providers];
    
    if (filters.specialty) {
      filtered = filtered.filter(p => 
        p.specialties.some(s => s.toLowerCase().includes(filters.specialty.toLowerCase()))
      );
    }
    
    if (filters.insurance) {
      filtered = filtered.filter(p => 
        p.insurance_accepted?.includes(filters.insurance)
      );
    }
    
    if (filters.modality === 'virtual') {
      filtered = filtered.filter(p => p.virtual_available);
    } else if (filters.modality === 'in-person') {
      filtered = filtered.filter(p => p.in_person_available);
    }
    
    if (filters.availability === 'today') {
      filtered = filtered.filter(p => p.availability.today.length > 0);
    } else if (filters.availability === 'thisWeek') {
      filtered = filtered.filter(p => p.availability.thisWeek > 0);
    }
    
    return filtered;
  };

  return {
    providers,
    loading,
    error,
    connectionStatus,
    refreshProviders: fetchProviders,
    searchProviders,
    filterProviders
  };
}