/**
 * Waitlist model for Mental Health Practice Scheduling and Waitlist Management System
 */

class Waitlist {
  constructor(db) {
    this.db = db;
    this.tableName = 'waitlists';
  }

  /**
   * Create a new waitlist
   * @param {Object} waitlistData - Waitlist data
   * @returns {Promise<Object>} Created waitlist
   */
  async create(waitlistData) {
    const [waitlist] = await this.db(this.tableName)
      .insert(waitlistData)
      .returning('*');
    return waitlist;
  }

  /**
   * Get waitlist by ID
   * @param {string} waitlistId - Waitlist ID
   * @returns {Promise<Object|null>} Waitlist or null if not found
   */
  async getById(waitlistId) {
    return this.db(this.tableName)
      .where('waitlist_id', waitlistId)
      .first();
  }

  /**
   * Update waitlist
   * @param {string} waitlistId - Waitlist ID
   * @param {Object} waitlistData - Updated waitlist data
   * @returns {Promise<Object>} Updated waitlist
   */
  async update(waitlistId, waitlistData) {
    const [waitlist] = await this.db(this.tableName)
      .where('waitlist_id', waitlistId)
      .update({
        ...waitlistData,
        updated_at: this.db.fn.now()
      })
      .returning('*');
    return waitlist;
  }

  /**
   * Delete waitlist
   * @param {string} waitlistId - Waitlist ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  async delete(waitlistId) {
    const deleted = await this.db(this.tableName)
      .where('waitlist_id', waitlistId)
      .delete();
    return deleted > 0;
  }

  /**
   * List waitlists by practice with pagination
   * @param {string} practiceId - Practice ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated waitlists
   */
  async listByPractice(practiceId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [count] = await this.db(this.tableName)
      .where('practice_id', practiceId)
      .count();
      
    const waitlists = await this.db(this.tableName)
      .where('practice_id', practiceId)
      .select('*')
      .offset(offset)
      .limit(limit)
      .orderBy('name', 'asc');
    
    return {
      data: waitlists,
      pagination: {
        total: parseInt(count.count),
        per_page: limit,
        current_page: page,
        last_page: Math.ceil(parseInt(count.count) / limit)
      }
    };
  }

  /**
   * Get waitlist entries
   * @param {string} waitlistId - Waitlist ID
   * @param {Object} filters - Filter criteria
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated waitlist entries
   */
  async getEntries(waitlistId, filters = {}, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    let query = this.db('waitlist_entries')
      .join('patients', 'waitlist_entries.patient_id', 'patients.patient_id')
      .leftJoin('providers', 'waitlist_entries.provider_id', 'providers.provider_id')
      .where('waitlist_entries.waitlist_id', waitlistId);
    
    // Apply filters
    if (filters.status) {
      query = query.where('waitlist_entries.status', filters.status);
    }
    
    if (filters.priority) {
      if (filters.priority === 'high') {
        query = query.where('waitlist_entries.priority_score', '>=', 0.7);
      } else if (filters.priority === 'medium') {
        query = query.where('waitlist_entries.priority_score', '>=', 0.4)
                     .where('waitlist_entries.priority_score', '<', 0.7);
      } else if (filters.priority === 'low') {
        query = query.where('waitlist_entries.priority_score', '<', 0.4);
      }
    }
    
    // Get count
    const [count] = await query.clone().count();
    
    // Get paginated data
    const entries = await query
      .select(
        'waitlist_entries.*',
        'patients.first_name as patient_first_name',
        'patients.last_name as patient_last_name',
        'patients.email as patient_email',
        'providers.first_name as provider_first_name',
        'providers.last_name as provider_last_name'
      )
      .offset(offset)
      .limit(limit)
      .orderBy('waitlist_entries.priority_score', 'desc');
    
    return {
      data: entries,
      pagination: {
        total: parseInt(count.count),
        per_page: limit,
        current_page: page,
        last_page: Math.ceil(parseInt(count.count) / limit)
      }
    };
  }

  /**
   * Add patient to waitlist
   * @param {string} waitlistId - Waitlist ID
   * @param {string} patientId - Patient ID
   * @param {Object} entryData - Entry data
   * @returns {Promise<Object>} Created waitlist entry
   */
  async addPatient(waitlistId, patientId, entryData = {}) {
    const [entry] = await this.db('waitlist_entries')
      .insert({
        waitlist_id: waitlistId,
        patient_id: patientId,
        ...entryData,
        status: entryData.status || 'active'
      })
      .returning('*');
    
    return entry;
  }

  /**
   * Remove patient from waitlist
   * @param {string} entryId - Waitlist entry ID
   * @returns {Promise<boolean>} True if removed, false otherwise
   */
  async removePatient(entryId) {
    const deleted = await this.db('waitlist_entries')
      .where('entry_id', entryId)
      .delete();
    
    return deleted > 0;
  }

  /**
   * Update waitlist entry
   * @param {string} entryId - Waitlist entry ID
   * @param {Object} entryData - Updated entry data
   * @returns {Promise<Object>} Updated waitlist entry
   */
  async updateEntry(entryId, entryData) {
    const [entry] = await this.db('waitlist_entries')
      .where('entry_id', entryId)
      .update({
        ...entryData,
        updated_at: this.db.fn.now()
      })
      .returning('*');
    
    return entry;
  }

  /**
   * Get waitlist entry by ID
   * @param {string} entryId - Waitlist entry ID
   * @returns {Promise<Object|null>} Waitlist entry or null if not found
   */
  async getEntryById(entryId) {
    return this.db('waitlist_entries')
      .where('entry_id', entryId)
      .first();
  }

  /**
   * Calculate waitlist position for a patient
   * @param {string} entryId - Waitlist entry ID
   * @returns {Promise<Object>} Position information
   */
  async calculatePosition(entryId) {
    const entry = await this.getEntryById(entryId);
    if (!entry) return null;
    
    // Count entries with higher priority
    const [higherPriority] = await this.db('waitlist_entries')
      .where('waitlist_id', entry.waitlist_id)
      .where('status', 'active')
      .where('priority_score', '>', entry.priority_score)
      .count();
    
    // Get total active entries
    const [totalActive] = await this.db('waitlist_entries')
      .where('waitlist_id', entry.waitlist_id)
      .where('status', 'active')
      .count();
    
    // Position is 1-based (higher priority = lower position number)
    const position = parseInt(higherPriority.count) + 1;
    
    return {
      position,
      total: parseInt(totalActive.count),
      priority_score: entry.priority_score
    };
  }
}

module.exports = Waitlist;
