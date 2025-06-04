/**
 * Notification model for Mental Health Practice Scheduling and Waitlist Management System
 */

class Notification {
  constructor(db) {
    this.db = db;
    this.tableName = 'notifications';
  }

  /**
   * Create a new notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Created notification
   */
  async create(notificationData) {
    const [notification] = await this.db(this.tableName)
      .insert(notificationData)
      .returning('*');
    return notification;
  }

  /**
   * Get notification by ID
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object|null>} Notification or null if not found
   */
  async getById(notificationId) {
    return this.db(this.tableName)
      .where('notification_id', notificationId)
      .first();
  }

  /**
   * Update notification
   * @param {string} notificationId - Notification ID
   * @param {Object} notificationData - Updated notification data
   * @returns {Promise<Object>} Updated notification
   */
  async update(notificationId, notificationData) {
    const [notification] = await this.db(this.tableName)
      .where('notification_id', notificationId)
      .update({
        ...notificationData,
        updated_at: this.db.fn.now()
      })
      .returning('*');
    return notification;
  }

  /**
   * Delete notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  async delete(notificationId) {
    const deleted = await this.db(this.tableName)
      .where('notification_id', notificationId)
      .delete();
    return deleted > 0;
  }

  /**
   * List notifications for a recipient with pagination
   * @param {string} recipientId - Recipient ID
   * @param {string} recipientType - Recipient type (patient, provider, practice)
   * @param {Object} filters - Filter criteria
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated notifications
   */
  async listForRecipient(recipientId, recipientType, filters = {}, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    let query = this.db(this.tableName)
      .where('recipient_id', recipientId)
      .where('recipient_type', recipientType);
    
    // Apply filters
    if (filters.status) {
      query = query.where('status', filters.status);
    }
    
    if (filters.type) {
      query = query.where('type', filters.type);
    }
    
    if (filters.read === true) {
      query = query.whereNotNull('read_at');
    } else if (filters.read === false) {
      query = query.whereNull('read_at');
    }
    
    // Get count
    const [count] = await query.clone().count();
    
    // Get paginated data
    const notifications = await query
      .select('*')
      .offset(offset)
      .limit(limit)
      .orderBy('created_at', 'desc');
    
    return {
      data: notifications,
      pagination: {
        total: parseInt(count.count),
        per_page: limit,
        current_page: page,
        last_page: Math.ceil(parseInt(count.count) / limit)
      }
    };
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(notificationId) {
    return this.update(notificationId, {
      status: 'read',
      read_at: this.db.fn.now()
    });
  }

  /**
   * Mark all notifications as read for a recipient
   * @param {string} recipientId - Recipient ID
   * @param {string} recipientType - Recipient type
   * @returns {Promise<number>} Number of updated notifications
   */
  async markAllAsRead(recipientId, recipientType) {
    return this.db(this.tableName)
      .where('recipient_id', recipientId)
      .where('recipient_type', recipientType)
      .whereNull('read_at')
      .update({
        status: 'read',
        read_at: this.db.fn.now(),
        updated_at: this.db.fn.now()
      });
  }

  /**
   * Send notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Updated notification
   */
  async send(notificationId) {
    return this.update(notificationId, {
      status: 'sent',
      sent_at: this.db.fn.now()
    });
  }

  /**
   * Create and send notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Created and sent notification
   */
  async createAndSend(notificationData) {
    const notification = await this.create({
      ...notificationData,
      status: 'pending'
    });
    
    return this.send(notification.notification_id);
  }

  /**
   * Get unread count for recipient
   * @param {string} recipientId - Recipient ID
   * @param {string} recipientType - Recipient type
   * @returns {Promise<number>} Number of unread notifications
   */
  async getUnreadCount(recipientId, recipientType) {
    const [result] = await this.db(this.tableName)
      .where('recipient_id', recipientId)
      .where('recipient_type', recipientType)
      .whereNull('read_at')
      .count();
    
    return parseInt(result.count);
  }
}

module.exports = Notification;
