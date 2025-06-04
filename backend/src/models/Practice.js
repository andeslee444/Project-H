/**
 * Practice model for Mental Health Practice Scheduling and Waitlist Management System
 */

class Practice {
  constructor(db) {
    this.db = db;
    this.tableName = 'practices';
  }

  /**
   * Create a new practice
   * @param {Object} practiceData - Practice data
   * @returns {Promise<Object>} Created practice
   */
  async create(practiceData) {
    const [practice] = await this.db(this.tableName)
      .insert(practiceData)
      .returning('*');
    return practice;
  }

  /**
   * Get practice by ID
   * @param {string} practiceId - Practice ID
   * @returns {Promise<Object|null>} Practice or null if not found
   */
  async getById(practiceId) {
    return this.db(this.tableName)
      .where('practice_id', practiceId)
      .first();
  }

  /**
   * Get practice by email
   * @param {string} email - Practice email
   * @returns {Promise<Object|null>} Practice or null if not found
   */
  async getByEmail(email) {
    return this.db(this.tableName)
      .where('email', email)
      .first();
  }

  /**
   * Update practice
   * @param {string} practiceId - Practice ID
   * @param {Object} practiceData - Updated practice data
   * @returns {Promise<Object>} Updated practice
   */
  async update(practiceId, practiceData) {
    const [practice] = await this.db(this.tableName)
      .where('practice_id', practiceId)
      .update({
        ...practiceData,
        updated_at: this.db.fn.now()
      })
      .returning('*');
    return practice;
  }

  /**
   * Delete practice
   * @param {string} practiceId - Practice ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  async delete(practiceId) {
    const deleted = await this.db(this.tableName)
      .where('practice_id', practiceId)
      .delete();
    return deleted > 0;
  }

  /**
   * List all practices with pagination
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated practices
   */
  async list(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [count] = await this.db(this.tableName).count();
    const practices = await this.db(this.tableName)
      .select('*')
      .offset(offset)
      .limit(limit)
      .orderBy('name', 'asc');
    
    return {
      data: practices,
      pagination: {
        total: parseInt(count.count),
        per_page: limit,
        current_page: page,
        last_page: Math.ceil(parseInt(count.count) / limit)
      }
    };
  }

  /**
   * Get practice settings
   * @param {string} practiceId - Practice ID
   * @returns {Promise<Object>} Practice settings
   */
  async getSettings(practiceId) {
    const practice = await this.getById(practiceId);
    return practice ? practice.settings : null;
  }

  /**
   * Update practice settings
   * @param {string} practiceId - Practice ID
   * @param {Object} settings - Updated settings
   * @returns {Promise<Object>} Updated practice
   */
  async updateSettings(practiceId, settings) {
    const practice = await this.getById(practiceId);
    if (!practice) return null;
    
    const updatedSettings = { ...practice.settings, ...settings };
    
    return this.update(practiceId, { settings: updatedSettings });
  }
}

module.exports = Practice;
