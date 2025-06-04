/**
 * Provider model for Mental Health Practice Scheduling and Waitlist Management System
 */

class Provider {
  constructor(db) {
    this.db = db;
    this.tableName = 'providers';
  }

  /**
   * Create a new provider
   * @param {Object} providerData - Provider data
   * @returns {Promise<Object>} Created provider
   */
  async create(providerData) {
    const [provider] = await this.db(this.tableName)
      .insert(providerData)
      .returning('*');
    return provider;
  }

  /**
   * Get provider by ID
   * @param {string} providerId - Provider ID
   * @returns {Promise<Object|null>} Provider or null if not found
   */
  async getById(providerId) {
    return this.db(this.tableName)
      .where('provider_id', providerId)
      .first();
  }

  /**
   * Get provider by email
   * @param {string} email - Provider email
   * @returns {Promise<Object|null>} Provider or null if not found
   */
  async getByEmail(email) {
    return this.db(this.tableName)
      .where('email', email)
      .first();
  }

  /**
   * Update provider
   * @param {string} providerId - Provider ID
   * @param {Object} providerData - Updated provider data
   * @returns {Promise<Object>} Updated provider
   */
  async update(providerId, providerData) {
    const [provider] = await this.db(this.tableName)
      .where('provider_id', providerId)
      .update({
        ...providerData,
        updated_at: this.db.fn.now()
      })
      .returning('*');
    return provider;
  }

  /**
   * Delete provider
   * @param {string} providerId - Provider ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  async delete(providerId) {
    const deleted = await this.db(this.tableName)
      .where('provider_id', providerId)
      .delete();
    return deleted > 0;
  }

  /**
   * List providers by practice with pagination
   * @param {string} practiceId - Practice ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated providers
   */
  async listByPractice(practiceId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [count] = await this.db(this.tableName)
      .where('practice_id', practiceId)
      .count();
      
    const providers = await this.db(this.tableName)
      .where('practice_id', practiceId)
      .select('*')
      .offset(offset)
      .limit(limit)
      .orderBy('last_name', 'asc');
    
    return {
      data: providers,
      pagination: {
        total: parseInt(count.count),
        per_page: limit,
        current_page: page,
        last_page: Math.ceil(parseInt(count.count) / limit)
      }
    };
  }

  /**
   * Get provider availability
   * @param {string} providerId - Provider ID
   * @returns {Promise<Object>} Provider availability
   */
  async getAvailability(providerId) {
    const provider = await this.getById(providerId);
    return provider ? provider.availability : null;
  }

  /**
   * Update provider availability
   * @param {string} providerId - Provider ID
   * @param {Object} availability - Updated availability
   * @returns {Promise<Object>} Updated provider
   */
  async updateAvailability(providerId, availability) {
    return this.update(providerId, { availability });
  }

  /**
   * Add specialty to provider
   * @param {string} providerId - Provider ID
   * @param {string} specialty - Specialty to add
   * @returns {Promise<Object>} Updated provider
   */
  async addSpecialty(providerId, specialty) {
    const provider = await this.getById(providerId);
    if (!provider) return null;
    
    const specialties = [...provider.specialties];
    if (!specialties.includes(specialty)) {
      specialties.push(specialty);
    }
    
    return this.update(providerId, { specialties });
  }

  /**
   * Remove specialty from provider
   * @param {string} providerId - Provider ID
   * @param {string} specialty - Specialty to remove
   * @returns {Promise<Object>} Updated provider
   */
  async removeSpecialty(providerId, specialty) {
    const provider = await this.getById(providerId);
    if (!provider) return null;
    
    const specialties = provider.specialties.filter(s => s !== specialty);
    
    return this.update(providerId, { specialties });
  }

  /**
   * Add modality to provider
   * @param {string} providerId - Provider ID
   * @param {string} modality - Modality to add
   * @returns {Promise<Object>} Updated provider
   */
  async addModality(providerId, modality) {
    const provider = await this.getById(providerId);
    if (!provider) return null;
    
    const modalities = [...provider.modalities];
    if (!modalities.includes(modality)) {
      modalities.push(modality);
    }
    
    return this.update(providerId, { modalities });
  }

  /**
   * Remove modality from provider
   * @param {string} providerId - Provider ID
   * @param {string} modality - Modality to remove
   * @returns {Promise<Object>} Updated provider
   */
  async removeModality(providerId, modality) {
    const provider = await this.getById(providerId);
    if (!provider) return null;
    
    const modalities = provider.modalities.filter(m => m !== modality);
    
    return this.update(providerId, { modalities });
  }

  /**
   * Find providers by specialty
   * @param {string} specialty - Specialty to search for
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated providers
   */
  async findBySpecialty(specialty, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    // Using raw query with JSONB containment operator
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE specialties @> ?::jsonb
      ORDER BY last_name ASC
      LIMIT ? OFFSET ?
    `;
    
    const countQuery = `
      SELECT COUNT(*) FROM ${this.tableName}
      WHERE specialties @> ?::jsonb
    `;
    
    const providers = await this.db.raw(query, [JSON.stringify([specialty]), limit, offset]);
    const [count] = await this.db.raw(countQuery, [JSON.stringify([specialty])]);
    
    return {
      data: providers.rows,
      pagination: {
        total: parseInt(count.rows[0].count),
        per_page: limit,
        current_page: page,
        last_page: Math.ceil(parseInt(count.rows[0].count) / limit)
      }
    };
  }
}

module.exports = Provider;
