import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase-no-rate-limit';

// Check if we're in demo mode
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || import.meta.env.GITHUB_PAGES === 'true';

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
  }
];

export function useProvidersSupabase() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProviders();
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
        const transformedProviders = data.map(provider => ({
          ...provider,
          // Add computed fields
          name: `${provider.first_name} ${provider.last_name}`,
          insurance: provider.insurance_accepted || ['Blue Cross Blue Shield', 'Aetna'],
          availability: {
            today: ['2:00 PM', '3:30 PM'], // Mock for now
            tomorrow: ['9:00 AM', '11:00 AM'],
            thisWeek: 10
          },
          next_available: 'Today at 2:00 PM',
          rating: provider.rating || 4.8,
          reviews: provider.review_count || 50,
          waitlist_count: provider.waitlist_count || 5,
          bio: provider.bio || `${provider.title} specializing in mental health care.`
        }));
        
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
    refreshProviders: fetchProviders,
    searchProviders,
    filterProviders
  };
}