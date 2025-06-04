/**
 * Appointment model for Mental Health Practice Scheduling and Waitlist Management System
 */

class Appointment {
  constructor(db) {
    this.db = db;
    this.tableName = 'appointments';
  }

  /**
   * Create a new appointment
   * @param {Object} appointmentData - Appointment data
   * @returns {Promise<Object>} Created appointment
   */
  async create(appointmentData) {
    const [appointment] = await this.db(this.tableName)
      .insert(appointmentData)
      .returning('*');
    return appointment;
  }

  /**
   * Get appointment by ID
   * @param {string} appointmentId - Appointment ID
   * @returns {Promise<Object|null>} Appointment or null if not found
   */
  async getById(appointmentId) {
    return this.db(this.tableName)
      .where('appointment_id', appointmentId)
      .first();
  }

  /**
   * Update appointment
   * @param {string} appointmentId - Appointment ID
   * @param {Object} appointmentData - Updated appointment data
   * @returns {Promise<Object>} Updated appointment
   */
  async update(appointmentId, appointmentData) {
    const [appointment] = await this.db(this.tableName)
      .where('appointment_id', appointmentId)
      .update({
        ...appointmentData,
        updated_at: this.db.fn.now()
      })
      .returning('*');
    return appointment;
  }

  /**
   * Delete/cancel appointment
   * @param {string} appointmentId - Appointment ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  async delete(appointmentId) {
    const deleted = await this.db(this.tableName)
      .where('appointment_id', appointmentId)
      .delete();
    return deleted > 0;
  }

  /**
   * List appointments with pagination and filters
   * @param {Object} filters - Filter criteria
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated appointments
   */
  async list(filters = {}, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    let query = this.db(this.tableName)
      .join('providers', 'appointments.provider_id', 'providers.provider_id')
      .join('patients', 'appointments.patient_id', 'patients.patient_id');
    
    // Apply filters
    if (filters.providerId) {
      query = query.where('appointments.provider_id', filters.providerId);
    }
    
    if (filters.patientId) {
      query = query.where('appointments.patient_id', filters.patientId);
    }
    
    if (filters.status) {
      query = query.where('appointments.status', filters.status);
    }
    
    if (filters.from) {
      query = query.where('appointments.start_time', '>=', filters.from);
    }
    
    if (filters.to) {
      query = query.where('appointments.start_time', '<=', filters.to);
    }
    
    if (filters.type) {
      query = query.where('appointments.type', filters.type);
    }
    
    // Get count
    const [count] = await query.clone().count();
    
    // Get paginated data
    const appointments = await query
      .select(
        'appointments.*',
        'providers.first_name as provider_first_name',
        'providers.last_name as provider_last_name',
        'patients.first_name as patient_first_name',
        'patients.last_name as patient_last_name'
      )
      .offset(offset)
      .limit(limit)
      .orderBy('appointments.start_time', 'asc');
    
    return {
      data: appointments,
      pagination: {
        total: parseInt(count.count),
        per_page: limit,
        current_page: page,
        last_page: Math.ceil(parseInt(count.count) / limit)
      }
    };
  }

  /**
   * Get calendar view of appointments
   * @param {string} providerId - Provider ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Appointments in date range
   */
  async getCalendarView(providerId, startDate, endDate) {
    return this.db(this.tableName)
      .join('patients', 'appointments.patient_id', 'patients.patient_id')
      .where('appointments.provider_id', providerId)
      .where('appointments.start_time', '>=', startDate)
      .where('appointments.start_time', '<=', endDate)
      .select(
        'appointments.*',
        'patients.first_name as patient_first_name',
        'patients.last_name as patient_last_name'
      )
      .orderBy('appointments.start_time', 'asc');
  }

  /**
   * Reschedule appointment
   * @param {string} appointmentId - Appointment ID
   * @param {Date} startTime - New start time
   * @param {Date} endTime - New end time
   * @returns {Promise<Object>} Updated appointment
   */
  async reschedule(appointmentId, startTime, endTime) {
    return this.update(appointmentId, {
      start_time: startTime,
      end_time: endTime,
      updated_at: this.db.fn.now()
    });
  }

  /**
   * Change appointment status
   * @param {string} appointmentId - Appointment ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated appointment
   */
  async changeStatus(appointmentId, status) {
    return this.update(appointmentId, { status });
  }

  /**
   * Create appointment from waitlist entry
   * @param {string} slotId - Appointment slot ID
   * @param {string} entryId - Waitlist entry ID
   * @returns {Promise<Object>} Created appointment
   */
  async createFromWaitlist(slotId, entryId) {
    // Get slot details
    const slot = await this.db('appointment_slots')
      .where('slot_id', slotId)
      .first();
    
    if (!slot) {
      throw new Error('Appointment slot not found');
    }
    
    // Get waitlist entry details
    const entry = await this.db('waitlist_entries')
      .where('entry_id', entryId)
      .first();
    
    if (!entry) {
      throw new Error('Waitlist entry not found');
    }
    
    // Create appointment
    const [appointment] = await this.db(this.tableName)
      .insert({
        provider_id: slot.provider_id,
        patient_id: entry.patient_id,
        waitlist_entry_id: entryId,
        start_time: slot.start_time,
        end_time: slot.end_time,
        status: 'scheduled',
        type: 'in-person', // Default, can be updated later
      })
      .returning('*');
    
    // Update slot status
    await this.db('appointment_slots')
      .where('slot_id', slotId)
      .update({
        status: 'booked',
        updated_at: this.db.fn.now()
      });
    
    // Update waitlist entry status
    await this.db('waitlist_entries')
      .where('entry_id', entryId)
      .update({
        status: 'scheduled',
        updated_at: this.db.fn.now()
      });
    
    return appointment;
  }
}

module.exports = Appointment;
