import { supabase } from '../lib/supabase';

class SupabaseService {
  // Authentication methods are handled by the useAuth hook
  
  // Practice Management
  async getPractices() {
    const { data, error } = await supabase
      .from('practices')
      .select('*');
    
    if (error) throw error;
    return { data, success: true };
  }

  async createPractice(practiceData) {
    const { data, error } = await supabase
      .from('practices')
      .insert(practiceData)
      .select()
      .single();
    
    if (error) throw error;
    return { data, success: true };
  }

  // Provider Management
  async getProviders(practiceId = null) {
    let query = supabase
      .from('providers')
      .select(`
        *,
        practice:practices(*)
      `);
    
    if (practiceId) {
      query = query.eq('practice_id', practiceId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return { data, success: true };
  }

  async createProvider(providerData) {
    const { data, error } = await supabase
      .from('providers')
      .insert(providerData)
      .select()
      .single();
    
    if (error) throw error;
    return { data, success: true };
  }

  // Patient Management
  async getPatients() {
    const { data, error } = await supabase
      .from('patients')
      .select('*');
    
    if (error) throw error;
    return { data, success: true };
  }

  async createPatient(patientData) {
    const { data, error } = await supabase
      .from('patients')
      .insert(patientData)
      .select()
      .single();
    
    if (error) throw error;
    return { data, success: true };
  }

  async getPatient(patientId) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('patient_id', patientId)
      .single();
    
    if (error) throw error;
    return { data, success: true };
  }

  // Appointment Management
  async getAppointments(filters = {}) {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        provider:providers(*),
        patient:patients(*)
      `);
    
    if (filters.provider_id) {
      query = query.eq('provider_id', filters.provider_id);
    }
    if (filters.patient_id) {
      query = query.eq('patient_id', filters.patient_id);
    }
    if (filters.start_date) {
      query = query.gte('start_time', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('start_time', filters.end_date);
    }
    
    const { data, error } = await query.order('start_time');
    if (error) throw error;
    return { data, success: true };
  }

  async createAppointment(appointmentData) {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();
    
    if (error) throw error;
    return { data, success: true };
  }

  async updateAppointment(appointmentId, updates) {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('appointment_id', appointmentId)
      .select()
      .single();
    
    if (error) throw error;
    return { data, success: true };
  }

  // Appointment Slots
  async getAppointmentSlots(filters = {}) {
    let query = supabase
      .from('appointment_slots')
      .select(`
        *,
        provider:providers(*)
      `);
    
    if (filters.provider_id) {
      query = query.eq('provider_id', filters.provider_id);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.start_date) {
      query = query.gte('start_time', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('start_time', filters.end_date);
    }
    
    const { data, error } = await query.order('start_time');
    if (error) throw error;
    return { data, success: true };
  }

  async createAppointmentSlot(slotData) {
    const { data, error } = await supabase
      .from('appointment_slots')
      .insert(slotData)
      .select()
      .single();
    
    if (error) throw error;
    return { data, success: true };
  }

  // Waitlist Management
  async getWaitlists(practiceId = null) {
    let query = supabase
      .from('waitlists')
      .select(`
        *,
        practice:practices(*)
      `);
    
    if (practiceId) {
      query = query.eq('practice_id', practiceId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return { data, success: true };
  }

  async createWaitlist(waitlistData) {
    const { data, error } = await supabase
      .from('waitlists')
      .insert(waitlistData)
      .select()
      .single();
    
    if (error) throw error;
    return { data, success: true };
  }

  async getWaitlistEntries(waitlistId = null, patientId = null) {
    console.log('DEBUG: getWaitlistEntries called with:', { waitlistId, patientId });
    
    // First, let's check if we can access the tables at all
    console.log('DEBUG: Testing table access...');
    
    // Test simple queries first
    const { data: entriesTest, error: entriesError } = await supabase
      .from('waitlist_entries')
      .select('*')
      .limit(1);
    console.log('DEBUG: waitlist_entries test:', { data: entriesTest, error: entriesError });
    
    const { data: patientsTest, error: patientsError } = await supabase
      .from('patients')
      .select('*')
      .limit(1);
    console.log('DEBUG: patients test:', { data: patientsTest, error: patientsError });
    
    // Now try the full query
    let query = supabase
      .from('waitlist_entries')
      .select(`
        *,
        patient:patients(*),
        waitlist:waitlists(*),
        provider:providers(*)
      `);
    
    if (waitlistId) {
      query = query.eq('waitlist_id', waitlistId);
    }
    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    
    console.log('DEBUG: Executing full query...');
    const { data, error } = await query.order('priority_score', { ascending: false });
    
    console.log('DEBUG: Full query result:', { 
      data, 
      error,
      dataLength: data?.length,
      dataType: typeof data 
    });
    
    // Log the actual error for debugging
    if (error) {
      console.error('Supabase getWaitlistEntries error:', error);
      return { data: null, success: false, error: error.message };
    }
    
    return { data, success: true };
  }

  async joinWaitlist(waitlistData) {
    const { data, error } = await supabase
      .from('waitlist_entries')
      .insert(waitlistData)
      .select()
      .single();
    
    if (error) throw error;
    return { data, success: true };
  }

  async updateWaitlistEntry(entryId, updates) {
    const { data, error } = await supabase
      .from('waitlist_entries')
      .update(updates)
      .eq('entry_id', entryId)
      .select()
      .single();
    
    if (error) throw error;
    return { data, success: true };
  }

  // Patient Matching (Edge Function)
  async findMatchingPatients(slotId, options = {}) {
    const { data, error } = await supabase.functions.invoke('patient-matching', {
      body: { 
        slot_id: slotId, 
        options 
      }
    });
    
    if (error) throw error;
    return data;
  }

  async findMatchingSlots(patientId, options = {}) {
    const { data, error } = await supabase.functions.invoke('patient-matching', {
      body: { 
        patient_id: patientId, 
        options 
      }
    });
    
    if (error) throw error;
    return data;
  }

  // Notifications
  async getNotifications(recipientId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', recipientId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data, success: true };
  }

  async createNotification(notificationData) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();
    
    if (error) throw error;
    return { data, success: true };
  }

  async markNotificationAsRead(notificationId) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ 
        status: 'read', 
        read_at: new Date().toISOString() 
      })
      .eq('notification_id', notificationId)
      .select()
      .single();
    
    if (error) throw error;
    return { data, success: true };
  }

  // Real-time subscriptions
  subscribeToAppointments(callback, filters = {}) {
    let channel = supabase
      .channel('appointments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          ...(filters.provider_id && { filter: `provider_id=eq.${filters.provider_id}` })
        },
        callback
      )
      .subscribe();
    
    return () => supabase.removeChannel(channel);
  }

  subscribeToWaitlistEntries(callback, waitlistId = null) {
    let channel = supabase
      .channel('waitlist_entries')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'waitlist_entries',
          ...(waitlistId && { filter: `waitlist_id=eq.${waitlistId}` })
        },
        callback
      )
      .subscribe();
    
    return () => supabase.removeChannel(channel);
  }

  subscribeToNotifications(callback, recipientId) {
    let channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${recipientId}`
        },
        callback
      )
      .subscribe();
    
    return () => supabase.removeChannel(channel);
  }
}

export const supabaseService = new SupabaseService();
export default supabaseService;