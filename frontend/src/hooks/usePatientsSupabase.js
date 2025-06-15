import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase-no-rate-limit';
import { getConfig } from '../config';

// Check if we're in demo mode using centralized configuration
const isDemoMode = getConfig().auth.mode === 'demo';

// Mock data for demo mode
const mockPatients = [
  {
    patient_id: '1',
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@email.com',
    phone: '(415) 555-0101',
    date_of_birth: '1985-03-15',
    insurance_info: {
      provider: 'Blue Cross Blue Shield',
      verified: true,
      expiresIn: 45
    },
    preferences: {
      primaryCondition: 'Anxiety',
      preferredTimes: ['Morning', 'Early Afternoon'],
      communicationPreference: 'email'
    },
    emergency_contact: {
      name: 'Mary Smith',
      phone: '(415) 555-0102',
      relationship: 'Spouse'
    },
    tags: ['VIP', 'High Priority'],
    notes: 'Prefers morning appointments. Sensitive to medication side effects.',
    status: 'active',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-06-10T14:30:00Z'
  },
  {
    patient_id: '2',
    first_name: 'Emily',
    last_name: 'Davis',
    email: 'emily.davis@email.com',
    phone: '(415) 555-0103',
    date_of_birth: '1992-07-22',
    insurance_info: {
      provider: 'Aetna',
      verified: true
    },
    preferences: {
      primaryCondition: 'Depression',
      preferredTimes: ['Evening'],
      communicationPreference: 'sms'
    },
    emergency_contact: {
      name: 'Robert Davis',
      phone: '(415) 555-0104',
      relationship: 'Father'
    },
    tags: ['Regular'],
    status: 'active',
    created_at: '2024-02-20T11:00:00Z',
    updated_at: '2024-06-12T09:15:00Z'
  },
  {
    patient_id: '3',
    first_name: 'Michael',
    last_name: 'Brown',
    email: 'michael.brown@email.com',
    phone: '(415) 555-0105',
    date_of_birth: '1978-11-03',
    insurance_info: {
      provider: 'United Healthcare',
      verified: false,
      expiresIn: -5
    },
    preferences: {
      primaryCondition: 'ADHD',
      preferredTimes: ['Afternoon'],
      communicationPreference: 'phone'
    },
    emergency_contact: {
      name: 'Lisa Brown',
      phone: '(415) 555-0106',
      relationship: 'Sister'
    },
    tags: ['New Patient'],
    status: 'new',
    created_at: '2024-06-01T13:00:00Z',
    updated_at: '2024-06-05T10:00:00Z'
  }
];

export function usePatientsSupabase() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      console.log('DEBUG: Starting fetchPatients...');
      
      // In demo mode, use mock data
      if (isDemoMode) {
        console.log('Demo mode: Using mock patient data');
        setPatients(mockPatients);
        setLoading(false);
        return;
      }

      // Use direct REST API call
      const url = `${supabase.supabaseUrl}/rest/v1/patients?select=*&limit=100`;
      console.log('DEBUG: Fetching patients from:', url);

      const response = await fetch(url, {
        headers: {
          'apikey': supabase.supabaseKey,
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });

      console.log('DEBUG: Patient response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Patient fetch error:', errorText);
        throw new Error(`Failed to fetch patients: ${response.status}`);
      }

      const data = await response.json();
      console.log('DEBUG: Patient data received:', data);

      if (data && data.length > 0) {
        setPatients(data);
      } else {
        // Use mock data if no patients in database
        console.log('No patients in database, using mock data');
        setPatients(mockPatients);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err.message);
      // Use mock data on error
      setPatients(mockPatients);
    } finally {
      setLoading(false);
    }
  };

  const searchPatients = (searchTerm) => {
    if (!searchTerm) return patients;
    
    const searchLower = searchTerm.toLowerCase();
    return patients.filter(patient => 
      patient.first_name.toLowerCase().includes(searchLower) ||
      patient.last_name.toLowerCase().includes(searchLower) ||
      patient.email.toLowerCase().includes(searchLower) ||
      patient.phone.includes(searchTerm)
    );
  };

  const filterPatients = (filters) => {
    let filtered = [...patients];
    
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    
    if (filters.insurance) {
      filtered = filtered.filter(p => 
        p.insurance_info?.provider?.toLowerCase().includes(filters.insurance.toLowerCase())
      );
    }
    
    if (filters.condition) {
      filtered = filtered.filter(p => 
        p.preferences?.primaryCondition?.toLowerCase().includes(filters.condition.toLowerCase())
      );
    }
    
    return filtered;
  };

  const updatePatient = async (patientId, updates) => {
    try {
      if (isDemoMode) {
        // In demo mode, just update local state
        setPatients(prev => prev.map(p => 
          p.patient_id === patientId ? { ...p, ...updates } : p
        ));
        return { success: true };
      }

      const url = `${supabase.supabaseUrl}/rest/v1/patients?patient_id=eq.${patientId}`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'apikey': supabase.supabaseKey,
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update patient: ${response.status}`);
      }

      await fetchPatients(); // Refresh the list
      return { success: true };
    } catch (err) {
      console.error('Error updating patient:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    patients,
    loading,
    error,
    refreshPatients: fetchPatients,
    searchPatients,
    filterPatients,
    updatePatient
  };
}