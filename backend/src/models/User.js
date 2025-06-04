/**
 * User model for Mental Health Practice Scheduling and Waitlist Management System
 */

class User {
  constructor(db) {
    this.db = db;
    this.tableName = 'users';
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async create(userData) {
    const [user] = await this.db(this.tableName)
      .insert(userData)
      .returning('*');
    return user;
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User or null if not found
   */
  async getById(userId) {
    return this.db(this.tableName)
      .where('user_id', userId)
      .first();
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User or null if not found
   */
  async getByEmail(email) {
    return this.db(this.tableName)
      .where('email', email)
      .first();
  }

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user
   */
  async update(userId, userData) {
    const [user] = await this.db(this.tableName)
      .where('user_id', userId)
      .update({
        ...userData,
        updated_at: this.db.fn.now()
      })
      .returning('*');
    return user;
  }

  /**
   * Delete user
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  async delete(userId) {
    const deleted = await this.db(this.tableName)
      .where('user_id', userId)
      .delete();
    return deleted > 0;
  }

  /**
   * List users with pagination and filters
   * @param {Object} filters - Filter criteria
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated users
   */
  async list(filters = {}, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    let query = this.db(this.tableName);
    
    // Apply filters
    if (filters.email) {
      query = query.where('email', 'ilike', `%${filters.email}%`);
    }
    
    if (filters.role) {
      query = query.where('role', filters.role);
    }
    
    if (filters.active !== undefined) {
      query = query.where('active', filters.active);
    }
    
    if (filters.referenceType) {
      query = query.where('reference_type', filters.referenceType);
    }
    
    // Get count
    const [count] = await query.clone().count();
    
    // Get paginated data
    const users = await query
      .select('*')
      .offset(offset)
      .limit(limit)
      .orderBy('email', 'asc');
    
    return {
      data: users,
      pagination: {
        total: parseInt(count.count),
        per_page: limit,
        current_page: page,
        last_page: Math.ceil(parseInt(count.count) / limit)
      }
    };
  }

  /**
   * Update user password
   * @param {string} userId - User ID
   * @param {string} passwordHash - New password hash
   * @returns {Promise<Object>} Updated user
   */
  async updatePassword(userId, passwordHash) {
    return this.update(userId, { password_hash: passwordHash });
  }

  /**
   * Update user role
   * @param {string} userId - User ID
   * @param {string} role - New role
   * @returns {Promise<Object>} Updated user
   */
  async updateRole(userId, role) {
    return this.update(userId, { role });
  }

  /**
   * Activate or deactivate user
   * @param {string} userId - User ID
   * @param {boolean} active - Active status
   * @returns {Promise<Object>} Updated user
   */
  async setActiveStatus(userId, active) {
    return this.update(userId, { active });
  }

  /**
   * Record user login
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated user
   */
  async recordLogin(userId) {
    return this.update(userId, { last_login: this.db.fn.now() });
  }
}

module.exports = User;
