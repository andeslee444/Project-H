/**
 * Patient model for Mental Health Practice Scheduling and Waitlist Management System
 */

class Patient {
  constructor(db) {
    this.db = db;
    this.tableName = 'patients';
  }

  /**
   * Create a new patient
   * @param {Object} patientData - Patient data
   * @returns {Promise<Object>} Created patient
   */
  async create(patientData) {
    const [patient] = await this.db(this.tableName)
      .insert(patientData)
      .returning('*');
    return patient;
  }

  /**
   * Get patient by ID
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object|null>} Patient or null if not found
   */
  async getById(patientId) {
    return this.db(this.tableName)
      .where('patient_id', patientId)
      .first();
  }

  /**
   * Get patient by email
   * @param {string} email - Patient email
   * @returns {Promise<Object|null>} Patient or null if not found
   */
  async getByEmail(email) {
    return this.db(this.tableName)
      .where('email', email)
      .first();
  }

  /**
   * Update patient
   * @param {string} patientId - Patient ID
   * @param {Object} patientData - Updated patient data
   * @returns {Promise<Object>} Updated patient
   */
  async update(patientId, patientData) {
    const [patient] = await this.db(this.tableName)
      .where('patient_id', patientId)
      .update({
        ...patientData,
        updated_at: this.db.fn.now()
      })
      .returning('*');
    return patient;
  }

  /**
   * Delete patient
   * @param {string} patientId - Patient ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  async delete(patientId) {
    const deleted = await this.db(this.tableName)
      .where('patient_id', patientId)
      .delete();
    return deleted > 0;
  }

  /**
   * List patients with pagination and filters
   * @param {Object} filters - Filter criteria
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated patients
   */
  async list(filters = {}, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    let query = this.db(this.tableName);
    
    // Apply filters
    if (filters.name) {
      query = query.where(function() {
        this.where('first_name', 'ilike', `%${filters.name}%`)
            .orWhere('last_name', 'ilike', `%${filters.name}%`);
      });
    }
    
    if (filters.email) {
      query = query.where('email', 'ilike', `%${filters.email}%`);
    }
    
    if (filters.insurance) {
      // Using raw query with JSONB containment
      query = query.whereRaw("insurance_info @> ?::jsonb", [JSON.stringify({ provider: filters.insurance })]);
    }
    
    // Get count
    const [count] = await query.clone().count();
    
    // Get paginated data
    const patients = await query
      .select('*')
      .offset(offset)
      .limit(limit)
      .orderBy('last_name', 'asc');
    
    return {
      data: patients,
      pagination: {
        total: parseInt(count.count),
        per_page: limit,
        current_page: page,
        last_page: Math.ceil(parseInt(count.count) / limit)
      }
    };
  }

  /**
   * Update patient preferences
   * @param {string} patientId - Patient ID
   * @param {Object} preferences - Updated preferences
   * @returns {Promise<Object>} Updated patient
   */
  async updatePreferences(patientId, preferences) {
    const patient = await this.getById(patientId);
    if (!patient) return null;
    
    const updatedPreferences = { ...patient.preferences, ...preferences };
    
    return this.update(patientId, { preferences: updatedPreferences });
  }

  /**
   * Get patient waitlists
   * @param {string} patientId - Patient ID
   * @returns {Promise<Array>} Waitlists the patient is on
   */
  async getWaitlists(patientId) {
    return this.db('waitlist_entries')
      .join('waitlists', 'waitlist_entries.waitlist_id', 'waitlists.waitlist_id')
      .where('waitlist_entries.patient_id', patientId)
      .select(
        'waitlists.*',
        'waitlist_entries.entry_id',
        'waitlist_entries.priority_score',
        'waitlist_entries.status',
        'waitlist_entries.created_at as joined_at'
      );
  }

  /**
   * Get patient appointments
   * @param {string} patientId - Patient ID
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Patient appointments
   */
  async getAppointments(patientId, filters = {}) {
    let query = this.db('appointments')
      .join('providers', 'appointments.provider_id', 'providers.provider_id')
      .where('appointments.patient_id', patientId);
    
    // Apply filters
    if (filters.status) {
      query = query.where('appointments.status', filters.status);
    }
    
    if (filters.from) {
      query = query.where('appointments.start_time', '>=', filters.from);
    }
    
    if (filters.to) {
      query = query.where('appointments.start_time', '<=', filters.to);
    }
    
    return query.select(
      'appointments.*',
      'providers.first_name as provider_first_name',
      'providers.last_name as provider_last_name'
    ).orderBy('appointments.start_time', 'asc');
  }
}

module.exports = Patient;
