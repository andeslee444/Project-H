import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export function useAppointments(filters = {}) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAppointments(filters);
      
      if (response.success) {
        setAppointments(response.appointments);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const createAppointment = async (appointmentData) => {
    try {
      setError(null);
      const response = await apiService.createAppointment(appointmentData);
      
      if (response.success) {
        await fetchAppointments(); // Refresh list
        return { success: true, appointment: response.appointment };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to create appointment';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateAppointment = async (id, updates) => {
    try {
      setError(null);
      const response = await apiService.updateAppointment(id, updates);
      
      if (response.success) {
        await fetchAppointments(); // Refresh list
        return { success: true, appointment: response.appointment };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update appointment';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const cancelAppointment = async (id, reason) => {
    try {
      setError(null);
      const response = await apiService.cancelAppointment(id, reason);
      
      if (response.success) {
        await fetchAppointments(); // Refresh list
        return { success: true };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to cancel appointment';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return {
    appointments,
    loading,
    error,
    refetch: fetchAppointments,
    createAppointment,
    updateAppointment,
    cancelAppointment,
  };
}

export function useProviderAvailability(providerId, date) {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAvailability = useCallback(async () => {
    if (!providerId || !date) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getProviderAvailability(providerId, date);
      
      if (response.success) {
        setAvailability(response.availableSlots);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch availability');
    } finally {
      setLoading(false);
    }
  }, [providerId, date]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const updateAvailability = async (availabilityData) => {
    try {
      setError(null);
      const response = await apiService.setProviderAvailability(providerId, availabilityData);
      
      if (response.success) {
        await fetchAvailability(); // Refresh availability
        return { success: true };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to set availability';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return {
    availability,
    loading,
    error,
    refetch: fetchAvailability,
    updateAvailability,
  };
}

export function useMatchedProviders() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMatchedProviders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getMatchedProviders();
      
      if (response.success) {
        setProviders(response.matches);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch matched providers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatchedProviders();
  }, [fetchMatchedProviders]);

  return {
    providers,
    loading,
    error,
    refetch: fetchMatchedProviders,
  };
}