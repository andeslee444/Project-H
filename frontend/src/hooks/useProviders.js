import { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';

export function useProviders() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const { data, success } = await supabaseService.getProviders();
      
      console.log('Raw provider data from Supabase:', data);
      
      // Mock data for demonstration
      const mockProviders = [
        {
          provider_id: 'prov1',
          first_name: 'Sarah',
          last_name: 'Chen',
          email: 'sarah.chen@serenitymhc.com',
          specialties: ['Anxiety Disorders', 'Depression', 'PTSD', 'Stress Management'],
          modalities: ['Cognitive Behavioral Therapy (CBT)', 'Mindfulness-Based Therapy', 'EMDR'],
          availability: {
            monday: { start: '9:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
            tuesday: { start: '9:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
            wednesday: { start: '10:00', end: '18:00', breaks: [{ start: '13:00', end: '14:00' }] },
            thursday: { start: '9:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
            friday: { start: '9:00', end: '15:00', breaks: [{ start: '12:00', end: '12:30' }] }
          },
          experience: 10,
          telehealth: true
        },
        {
          provider_id: 'prov2',
          first_name: 'Michael',
          last_name: 'Rodriguez',
          email: 'michael.rodriguez@serenitymhc.com',
          specialties: ['Bipolar Disorder', 'Depression', 'Mood Disorders'],
          modalities: ['Dialectical Behavior Therapy (DBT)', 'Medication Management', 'Psychodynamic Therapy'],
          availability: {
            monday: { start: '11:00', end: '19:00', breaks: [{ start: '14:00', end: '15:00' }] },
            tuesday: { start: '11:00', end: '19:00', breaks: [{ start: '14:00', end: '15:00' }] },
            wednesday: { start: '11:00', end: '19:00', breaks: [{ start: '14:00', end: '15:00' }] },
            thursday: { start: '11:00', end: '19:00', breaks: [{ start: '14:00', end: '15:00' }] }
          },
          experience: 15,
          telehealth: true
        },
        {
          provider_id: 'prov3',
          first_name: 'Emily',
          last_name: 'Johnson',
          email: 'emily.johnson@serenitymhc.com',
          specialties: ['ADHD', 'Autism Spectrum', 'Learning Disabilities'],
          modalities: ['Behavioral Therapy', 'Play Therapy', 'Parent Training'],
          availability: {
            monday: { start: '8:00', end: '16:00', breaks: [{ start: '12:00', end: '13:00' }] },
            tuesday: { start: '8:00', end: '16:00', breaks: [{ start: '12:00', end: '13:00' }] },
            thursday: { start: '8:00', end: '16:00', breaks: [{ start: '12:00', end: '13:00' }] },
            friday: { start: '8:00', end: '14:00', breaks: [{ start: '11:30', end: '12:00' }] }
          },
          experience: 8,
          telehealth: true
        }
      ];
      
      const dataToUse = data && data.length > 0 ? data : mockProviders;
      
      if (dataToUse) {
        // Transform the data to match the frontend format
        const formattedProviders = dataToUse.map(provider => ({
          id: provider.provider_id,
          name: `${provider.first_name} ${provider.last_name}`,
          title: provider.title || 'MD',
          specialties: provider.specialties || [],
          rating: provider.rating || 4.5 + Math.random() * 0.5, // Mock rating for now
          reviewCount: Math.floor(Math.random() * 200) + 50, // Mock review count
          nextAvailable: getNextAvailableSlot(provider.availability),
          image: `https://i.pravatar.cc/150?u=${provider.provider_id}`,
          insurance: ['Blue Cross Blue Shield', 'Aetna', 'United Healthcare', 'Cigna'],
          languages: provider.languages || ['English'],
          experience: provider.experience || 10,
          education: provider.education || 'Medical School',
          bio: provider.bio || `Dr. ${provider.first_name} ${provider.last_name} is a dedicated mental health professional with ${provider.experience || 10} years of experience.`,
          location: provider.practice?.address || {
            street: '123 Wellness Way',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105'
          },
          virtualAvailable: provider.telehealth || false,
          availability: provider.availability || {}
        }));
        
        setProviders(formattedProviders);
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getNextAvailableSlot = (availability) => {
    if (!availability) return 'Contact for availability';
    
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date();
    const currentDay = daysOfWeek[today.getDay()];
    const currentHour = today.getHours();
    
    // Check today first
    if (availability[currentDay]) {
      const todaySlot = availability[currentDay];
      const endHour = parseInt(todaySlot.end.split(':')[0]);
      
      if (currentHour < endHour - 1) {
        return 'Today';
      }
    }
    
    // Check next 7 days
    for (let i = 1; i <= 7; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      const dayName = daysOfWeek[nextDate.getDay()];
      
      if (availability[dayName]) {
        if (i === 1) return 'Tomorrow';
        return nextDate.toLocaleDateString('en-US', { weekday: 'long' });
      }
    }
    
    return 'Next week';
  };

  const searchProviders = async (searchTerm) => {
    if (!searchTerm) {
      await fetchProviders();
      return;
    }

    const filteredProviders = providers.filter(provider => {
      const searchLower = searchTerm.toLowerCase();
      return (
        provider.name.toLowerCase().includes(searchLower) ||
        provider.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchLower)
        )
      );
    });

    setProviders(filteredProviders);
  };

  const filterBySpecialty = (specialty) => {
    if (!specialty || specialty === 'all') {
      fetchProviders();
      return;
    }

    const filtered = providers.filter(provider =>
      provider.specialties.includes(specialty)
    );
    
    setProviders(filtered);
  };

  const filterByAvailability = (timePreference) => {
    if (!timePreference || timePreference === 'any') {
      fetchProviders();
      return;
    }

    const filtered = providers.filter(provider => {
      // Implement time preference filtering logic
      return true; // Placeholder
    });
    
    setProviders(filtered);
  };

  return {
    providers,
    loading,
    error,
    searchProviders,
    filterBySpecialty,
    filterByAvailability,
    refreshProviders: fetchProviders
  };
}