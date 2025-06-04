/**
 * MatchingService for Mental Health Practice Scheduling and Waitlist Management System
 * This service implements the core matching algorithm for pairing patients with providers
 */

class MatchingService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Find matching patients for an open appointment slot
   * @param {string} slotId - Appointment slot ID
   * @param {Object} options - Matching options and criteria
   * @returns {Promise<Array>} Ranked list of matching patients with scores
   */
  async findMatchingPatientsForSlot(slotId, options = {}) {
    // Get slot details
    const slot = await this.db('appointment_slots')
      .where('slot_id', slotId)
      .first();
    
    if (!slot) {
      throw new Error('Appointment slot not found');
    }
    
    // Get provider details
    const provider = await this.db('providers')
      .where('provider_id', slot.provider_id)
      .first();
    
    if (!provider) {
      throw new Error('Provider not found');
    }
    
    // Get practice settings for matching criteria weights
    const practice = await this.db('practices')
      .where('practice_id', provider.practice_id)
      .first();
    
    // Default weights if not specified in practice settings
    const weights = practice?.settings?.matching_weights || {
      waitTime: 0.3,
      priority: 0.25,
      providerPreference: 0.2,
      specialtyMatch: 0.15,
      modalityMatch: 0.1
    };
    
    // Build query to find active waitlist entries for this practice
    let query = this.db('waitlist_entries')
      .join('patients', 'waitlist_entries.patient_id', 'patients.patient_id')
      .join('waitlists', 'waitlist_entries.waitlist_id', 'waitlists.waitlist_id')
      .where('waitlists.practice_id', provider.practice_id)
      .where('waitlist_entries.status', 'active');
    
    // Apply additional filters from options
    if (options.insuranceProvider) {
      query = query.whereRaw("patients.insurance_info->>'provider' = ?", [options.insuranceProvider]);
    }
    
    if (options.minPriorityScore) {
      query = query.where('waitlist_entries.priority_score', '>=', options.minPriorityScore);
    }
    
    // Get all potential matches
    const potentialMatches = await query
      .select(
        'waitlist_entries.*',
        'patients.*',
        'waitlists.name as waitlist_name',
        this.db.raw('EXTRACT(EPOCH FROM (NOW() - waitlist_entries.created_at))/86400 as days_waiting')
      );
    
    // Calculate match scores
    const matches = potentialMatches.map(patient => {
      let matchScore = 0;
      const scores = {};
      
      // 1. Wait time score (longer wait = higher score)
      const waitDays = parseFloat(patient.days_waiting) || 0;
      const maxWaitDays = 90; // Cap at 90 days for normalization
      scores.waitTime = Math.min(waitDays / maxWaitDays, 1) * weights.waitTime;
      
      // 2. Priority score from waitlist
      scores.priority = patient.priority_score * weights.priority;
      
      // 3. Provider preference score
      if (patient.provider_id === provider.provider_id) {
        scores.providerPreference = weights.providerPreference;
      } else if (patient.provider_id) {
        scores.providerPreference = 0; // Preferred another provider
      } else {
        scores.providerPreference = weights.providerPreference * 0.5; // No preference
      }
      
      // 4. Specialty match score
      if (patient.preferences && patient.preferences.specialties && provider.specialties) {
        const patientSpecialties = Array.isArray(patient.preferences.specialties) 
          ? patient.preferences.specialties 
          : [];
        
        const specialtyMatches = provider.specialties.filter(s => 
          patientSpecialties.includes(s)
        ).length;
        
        const maxSpecialties = Math.max(1, patientSpecialties.length);
        scores.specialtyMatch = Math.min(specialtyMatches / maxSpecialties, 1) * weights.specialtyMatch;
      } else {
        scores.specialtyMatch = 0;
      }
      
      // 5. Treatment modality match score
      if (patient.preferences && patient.preferences.modalities && provider.modalities) {
        const patientModalities = Array.isArray(patient.preferences.modalities) 
          ? patient.preferences.modalities 
          : [];
        
        const modalityMatches = provider.modalities.filter(m => 
          patientModalities.includes(m)
        ).length;
        
        const maxModalities = Math.max(1, patientModalities.length);
        scores.modalityMatch = Math.min(modalityMatches / maxModalities, 1) * weights.modalityMatch;
      } else {
        scores.modalityMatch = 0;
      }
      
      // Calculate total score
      matchScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
      
      // Apply penalties
      
      // Penalty for telehealth mismatch if specified in preferences
      if (patient.preferences && patient.preferences.telehealth !== undefined) {
        const slotIsTelehealth = slot.type === 'telehealth';
        if (patient.preferences.telehealth !== slotIsTelehealth) {
          matchScore *= 0.8; // 20% penalty
        }
      }
      
      // Penalty for previous no-shows
      if (patient.preferences && patient.preferences.no_show_count) {
        const noShowCount = parseInt(patient.preferences.no_show_count) || 0;
        if (noShowCount > 0) {
          matchScore *= Math.max(0.5, 1 - (noShowCount * 0.1)); // Up to 50% penalty
        }
      }
      
      return {
        patient_id: patient.patient_id,
        entry_id: patient.entry_id,
        first_name: patient.first_name,
        last_name: patient.last_name,
        email: patient.email,
        waitlist_name: patient.waitlist_name,
        days_waiting: waitDays,
        priority_score: patient.priority_score,
        match_score: matchScore,
        detailed_scores: scores
      };
    });
    
    // Sort by match score (descending)
    return matches.sort((a, b) => b.match_score - a.match_score);
  }

  /**
   * Find matching slots for a patient
   * @param {string} patientId - Patient ID
   * @param {Object} options - Matching options and criteria
   * @returns {Promise<Array>} Ranked list of matching slots with scores
   */
  async findMatchingSlotsForPatient(patientId, options = {}) {
    // Get patient details
    const patient = await this.db('patients')
      .where('patient_id', patientId)
      .first();
    
    if (!patient) {
      throw new Error('Patient not found');
    }
    
    // Get patient's waitlist entries
    const waitlistEntries = await this.db('waitlist_entries')
      .where('patient_id', patientId)
      .where('status', 'active');
    
    if (waitlistEntries.length === 0) {
      return []; // Patient not on any waitlist
    }
    
    // Get all waitlists the patient is on
    const waitlistIds = waitlistEntries.map(entry => entry.waitlist_id);
    const waitlists = await this.db('waitlists')
      .whereIn('waitlist_id', waitlistIds);
    
    if (waitlists.length === 0) {
      return []; // No valid waitlists
    }
    
    // Get practice IDs from waitlists
    const practiceIds = [...new Set(waitlists.map(w => w.practice_id))];
    
    // Get available slots
    let query = this.db('appointment_slots')
      .join('providers', 'appointment_slots.provider_id', 'providers.provider_id')
      .whereIn('providers.practice_id', practiceIds)
      .where('appointment_slots.status', 'available');
    
    // Apply date range filter if provided
    if (options.startDate) {
      query = query.where('appointment_slots.start_time', '>=', options.startDate);
    }
    
    if (options.endDate) {
      query = query.where('appointment_slots.start_time', '<=', options.endDate);
    }
    
    // Get all potential matching slots
    const potentialSlots = await query
      .select(
        'appointment_slots.*',
        'providers.first_name as provider_first_name',
        'providers.last_name as provider_last_name',
        'providers.specialties',
        'providers.modalities',
        'providers.telehealth',
        'providers.practice_id'
      );
    
    // Calculate match scores
    const matches = potentialSlots.map(slot => {
      let matchScore = 0;
      const scores = {};
      
      // Find the relevant waitlist entry for this practice
      const relevantWaitlist = waitlists.find(w => w.practice_id === slot.practice_id);
      const waitlistEntry = waitlistEntries.find(e => e.waitlist_id === relevantWaitlist?.waitlist_id);
      
      if (!waitlistEntry) {
        return null; // Skip if no relevant waitlist entry
      }
      
      // 1. Provider preference score
      if (waitlistEntry.provider_id === slot.provider_id) {
        scores.providerPreference = 0.3; // Preferred provider
      } else if (waitlistEntry.provider_id) {
        scores.providerPreference = 0; // Preferred another provider
      } else {
        scores.providerPreference = 0.15; // No preference
      }
      
      // 2. Specialty match score
      if (patient.preferences && patient.preferences.specialties) {
        const patientSpecialties = Array.isArray(patient.preferences.specialties) 
          ? patient.preferences.specialties 
          : [];
        
        const specialtyMatches = slot.specialties.filter(s => 
          patientSpecialties.includes(s)
        ).length;
        
        const maxSpecialties = Math.max(1, patientSpecialties.length);
        scores.specialtyMatch = Math.min(specialtyMatches / maxSpecialties, 1) * 0.25;
      } else {
        scores.specialtyMatch = 0;
      }
      
      // 3. Treatment modality match score
      if (patient.preferences && patient.preferences.modalities) {
        const patientModalities = Array.isArray(patient.preferences.modalities) 
          ? patient.preferences.modalities 
          : [];
        
        const modalityMatches = slot.modalities.filter(m => 
          patientModalities.includes(m)
        ).length;
        
        const maxModalities = Math.max(1, patientModalities.length);
        scores.modalityMatch = Math.min(modalityMatches / maxModalities, 1) * 0.2;
      } else {
        scores.modalityMatch = 0;
      }
      
      // 4. Telehealth preference score
      if (patient.preferences && patient.preferences.telehealth !== undefined) {
        const slotIsTelehealth = slot.type === 'telehealth';
        scores.telehealthMatch = patient.preferences.telehealth === slotIsTelehealth ? 0.15 : 0;
      } else {
        scores.telehealthMatch = 0.075; // Neutral if no preference
      }
      
      // 5. Time preference score
      if (patient.preferences && patient.preferences.preferred_times) {
        const slotHour = new Date(slot.start_time).getHours();
        const slotDay = new Date(slot.start_time).getDay();
        
        let timeScore = 0;
        
        // Check if slot time matches any preferred time
        if (patient.preferences.preferred_times.some(pref => {
          const dayMatches = pref.days.includes(slotDay);
          const hourMatches = slotHour >= pref.start_hour && slotHour <= pref.end_hour;
          return dayMatches && hourMatches;
        })) {
          timeScore = 0.1;
        }
        
        scores.timePreference = timeScore;
      } else {
        scores.timePreference = 0;
      }
      
      // Calculate total score
      matchScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
      
      return {
        slot_id: slot.slot_id,
        provider_id: slot.provider_id,
        provider_name: `${slot.provider_first_name} ${slot.provider_last_name}`,
        start_time: slot.start_time,
        end_time: slot.end_time,
        type: slot.type || 'in-person',
        match_score: matchScore,
        waitlist_entry_id: waitlistEntry.entry_id,
        detailed_scores: scores
      };
    })
    .filter(Boolean) // Remove null entries
    .sort((a, b) => b.match_score - a.match_score);
    
    return matches;
  }
}

module.exports = MatchingService;
