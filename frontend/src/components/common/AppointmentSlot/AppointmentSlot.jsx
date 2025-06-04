/**
 * AppointmentSlot model for Mental Health Practice Scheduling and Waitlist Management System
 */

class AppointmentSlot {
  constructor(db) {
    this.db = db;
    this.tableName = 'appointment_slots';
  }

  /**
   * Create a new appointment slot
   * @param {Object} slotData - Appointment slot data
   * @returns {Promise<Object>} Created appointment slot
   */
  async create(slotData) {
    const [slot] = await this.db(this.tableName)
      .insert(slotData)
      .returning('*');
    return slot;
  }

  /**
   * Create multiple appointment slots
   * @param {Array} slotsData - Array of appointment slot data
   * @returns {Promise<Array>} Created appointment slots
   */
  async createBulk(slotsData) {
    return this.db(this.tableName)
      .insert(slotsData)
      .returning('*');
  }

  /**
   * Get appointment slot by ID
   * @param {string} slotId - Appointment slot ID
   * @returns {Promise<Object|null>} Appointment slot or null if not found
   */
  async getById(slotId) {
    return this.db(this.tableName)
      .where('slot_id', slotId)
      .first();
  }

  /**
   * Update appointment slot
   * @param {string} slotId - Appointment slot ID
   * @param {Object} slotData - Updated appointment slot data
   * @returns {Promise<Object>} Updated appointment slot
   */
  async update(slotId, slotData) {
    const [slot] = await this.db(this.tableName)
      .where('slot_id', slotId)
      .update({
        ...slotData,
        updated_at: this.db.fn.now()
      })
      .returning('*');
    return slot;
  }

  /**
   * Delete appointment slot
   * @param {string} slotId - Appointment slot ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  async delete(slotId) {
    const deleted = await this.db(this.tableName)
      .where('slot_id', slotId)
      .delete();
    return deleted > 0;
  }

  /**
   * List appointment slots with pagination and filters
   * @param {Object} filters - Filter criteria
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated appointment slots
   */
  async list(filters = {}, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    let query = this.db(this.tableName)
      .join('providers', 'appointment_slots.provider_id', 'providers.provider_id');
    
    // Apply filters
    if (filters.providerId) {
      query = query.where('appointment_slots.provider_id', filters.providerId);
    }
    
    if (filters.status) {
      query = query.where('appointment_slots.status', filters.status);
    }
    
    if (filters.from) {
      query = query.where('appointment_slots.start_time', '>=', filters.from);
    }
    
    if (filters.to) {
      query = query.where('appointment_slots.start_time', '<=', filters.to);
    }
    
    // Get count
    const [count] = await query.clone().count();
    
    // Get paginated data
    const slots = await query
      .select(
        'appointment_slots.*',
        'providers.first_name as provider_first_name',
        'providers.last_name as provider_last_name'
      )
      .offset(offset)
      .limit(limit)
      .orderBy('appointment_slots.start_time', 'asc');
    
    return {
      data: slots,
      pagination: {
        total: parseInt(count.count),
        per_page: limit,
        current_page: page,
        last_page: Math.ceil(parseInt(count.count) / limit)
      }
    };
  }

  /**
   * Get available slots for a provider
   * @param {string} providerId - Provider ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Available appointment slots
   */
  async getAvailableSlots(providerId, startDate, endDate) {
    return this.db(this.tableName)
      .where('provider_id', providerId)
      .where('status', 'available')
      .where('start_time', '>=', startDate)
      .where('start_time', '<=', endDate)
      .orderBy('start_time', 'asc');
  }

  /**
   * Find matching patients for a slot
   * @param {string} slotId - Appointment slot ID
   * @param {Object} criteria - Matching criteria
   * @returns {Promise<Array>} Matching patients with scores
   */
  async findMatchingPatients(slotId, criteria = {}) {
    const slot = await this.getById(slotId);
    if (!slot) return [];
    
    // Get provider details
    const provider = await this.db('providers')
      .where('provider_id', slot.provider_id)
      .first();
    
    if (!provider) return [];
    
    // Build query to find matching patients from waitlists
    let query = this.db('waitlist_entries')
      .join('patients', 'waitlist_entries.patient_id', 'patients.patient_id')
      .join('waitlists', 'waitlist_entries.waitlist_id', 'waitlists.waitlist_id')
      .where('waitlist_entries.status', 'active');
    
    // Filter by practice
    query = query.where('waitlists.practice_id', provider.practice_id);
    
    // Filter by preferred provider if specified
    if (criteria.preferredProviderOnly) {
      query = query.where('waitlist_entries.provider_id', slot.provider_id);
    } else {
      // Otherwise include entries with no provider preference or matching provider
      query = query.where(function() {
        this.where('waitlist_entries.provider_id', slot.provider_id)
            .orWhereNull('waitlist_entries.provider_id');
      });
    }
    
    // Get matching patients
    const patients = await query
      .select(
        'waitlist_entries.*',
        'patients.first_name',
        'patients.last_name',
        'patients.email',
        'patients.insurance_info',
        'patients.preferences'
      )
      .orderBy('waitlist_entries.priority_score', 'desc');
    
    // Calculate match scores
    return patients.map(patient => {
      let matchScore = patient.priority_score; // Base score from waitlist
      
      // Adjust score based on provider specialties matching patient preferences
      if (patient.preferences && patient.preferences.specialties) {
        const specialtyMatch = provider.specialties.filter(s => 
          patient.preferences.specialties.includes(s)
        ).length;
        
        if (specialtyMatch > 0) {
          matchScore += 0.1 * specialtyMatch;
        }
      }
      
      // Adjust score based on provider modalities matching patient preferences
      if (patient.preferences && patient.preferences.modalities) {
        const modalityMatch = provider.modalities.filter(m => 
          patient.preferences.modalities.includes(m)
        ).length;
        
        if (modalityMatch > 0) {
          matchScore += 0.1 * modalityMatch;
        }
      }
      
      // Adjust score based on telehealth preference
      if (patient.preferences && patient.preferences.telehealth !== undefined) {
        if (patient.preferences.telehealth === provider.telehealth) {
          matchScore += 0.1;
        } else {
          matchScore -= 0.1;
        }
      }
      
      // Cap score at 1.0
      matchScore = Math.min(matchScore, 1.0);
      
      return {
        ...patient,
        match_score: matchScore
      };
    })
    .sort((a, b) => b.match_score - a.match_score);
  }
}

module.exports = AppointmentSlot;
