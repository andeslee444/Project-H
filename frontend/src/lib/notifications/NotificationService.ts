/**
 * Notification Service for Mental Health Practice Management System
 * 
 * Handles various types of notifications including:
 * - Appointment reminders
 * - Waitlist updates
 * - Provider availability changes
 * - System alerts
 * 
 * Supports multiple delivery channels:
 * - In-app notifications
 * - Email (via backend)
 * - SMS (via backend)
 * - Push notifications (future)
 */

import { supabase } from '@/lib/supabase';
import { AuditService } from '@/lib/security/hipaa/AuditService';

export type NotificationType = 
  | 'appointment_reminder'
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'appointment_rescheduled'
  | 'waitlist_available'
  | 'waitlist_position_update'
  | 'provider_message'
  | 'system_alert'
  | 'payment_reminder'
  | 'document_ready';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push';

export interface NotificationPreferences {
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  types: {
    [key in NotificationType]?: {
      enabled: boolean;
      channels: NotificationChannel[];
      advanceNotice?: number; // minutes before appointment
    };
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
    timezone: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels: NotificationChannel[];
  scheduledFor?: Date;
  sentAt?: Date;
  readAt?: Date;
  clickedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationTemplate {
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  defaultChannels: NotificationChannel[];
  variables: string[]; // e.g., ['patientName', 'appointmentTime', 'providerName']
}

// Notification templates
const NOTIFICATION_TEMPLATES: Record<NotificationType, NotificationTemplate> = {
  appointment_reminder: {
    type: 'appointment_reminder',
    title: 'Appointment Reminder',
    message: 'You have an appointment with {providerName} on {appointmentDate} at {appointmentTime}',
    priority: 'high',
    defaultChannels: ['in_app', 'email', 'sms'],
    variables: ['providerName', 'appointmentDate', 'appointmentTime']
  },
  appointment_confirmed: {
    type: 'appointment_confirmed',
    title: 'Appointment Confirmed',
    message: 'Your appointment with {providerName} on {appointmentDate} at {appointmentTime} has been confirmed',
    priority: 'medium',
    defaultChannels: ['in_app', 'email'],
    variables: ['providerName', 'appointmentDate', 'appointmentTime']
  },
  appointment_cancelled: {
    type: 'appointment_cancelled',
    title: 'Appointment Cancelled',
    message: 'Your appointment with {providerName} on {appointmentDate} has been cancelled',
    priority: 'high',
    defaultChannels: ['in_app', 'email', 'sms'],
    variables: ['providerName', 'appointmentDate']
  },
  appointment_rescheduled: {
    type: 'appointment_rescheduled',
    title: 'Appointment Rescheduled',
    message: 'Your appointment has been rescheduled to {newDate} at {newTime}',
    priority: 'high',
    defaultChannels: ['in_app', 'email', 'sms'],
    variables: ['newDate', 'newTime', 'oldDate', 'oldTime']
  },
  waitlist_available: {
    type: 'waitlist_available',
    title: 'Appointment Available',
    message: 'An appointment slot has become available for {providerName}. Click to book.',
    priority: 'urgent',
    defaultChannels: ['in_app', 'email', 'sms'],
    variables: ['providerName', 'availableDate', 'availableTime']
  },
  waitlist_position_update: {
    type: 'waitlist_position_update',
    title: 'Waitlist Update',
    message: 'You are now position {position} on the waitlist for {providerName}',
    priority: 'low',
    defaultChannels: ['in_app'],
    variables: ['position', 'providerName']
  },
  provider_message: {
    type: 'provider_message',
    title: 'Message from {providerName}',
    message: '{message}',
    priority: 'medium',
    defaultChannels: ['in_app', 'email'],
    variables: ['providerName', 'message']
  },
  system_alert: {
    type: 'system_alert',
    title: 'System Alert',
    message: '{message}',
    priority: 'high',
    defaultChannels: ['in_app'],
    variables: ['message']
  },
  payment_reminder: {
    type: 'payment_reminder',
    title: 'Payment Reminder',
    message: 'You have an outstanding balance of ${amount}. Please update your payment information.',
    priority: 'medium',
    defaultChannels: ['in_app', 'email'],
    variables: ['amount', 'dueDate']
  },
  document_ready: {
    type: 'document_ready',
    title: 'Document Ready',
    message: 'Your {documentType} is ready for download',
    priority: 'low',
    defaultChannels: ['in_app', 'email'],
    variables: ['documentType', 'documentName']
  }
};

export class NotificationService {
  private static instance: NotificationService;
  private preferences: Map<string, NotificationPreferences> = new Map();
  private auditService = AuditService.getInstance();

  private constructor() {
    this.initializeRealtimeSubscription();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize realtime subscription for notifications
   */
  private initializeRealtimeSubscription(): void {
    const user = supabase.auth.getUser();
    if (!user) return;

    supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user}`
        },
        (payload) => {
          this.handleRealtimeNotification(payload.new as Notification);
        }
      )
      .subscribe();
  }

  /**
   * Handle incoming realtime notification
   */
  private handleRealtimeNotification(notification: Notification): void {
    // Emit custom event for UI components to listen to
    window.dispatchEvent(
      new CustomEvent('notification:new', {
        detail: notification
      })
    );

    // Show in-app notification if enabled
    if (notification.channels.includes('in_app')) {
      this.showInAppNotification(notification);
    }

    // Log notification received
    this.auditService.logDataAccess({
      userId: notification.userId,
      action: 'NOTIFICATION_RECEIVED',
      resourceType: 'notification',
      resourceId: notification.id,
      details: {
        type: notification.type,
        channels: notification.channels
      }
    });
  }

  /**
   * Send a notification
   */
  async sendNotification(params: {
    userId: string;
    type: NotificationType;
    variables: Record<string, string>;
    priority?: NotificationPriority;
    channels?: NotificationChannel[];
    scheduledFor?: Date;
    expiresAt?: Date;
    data?: Record<string, any>;
  }): Promise<Notification> {
    const template = NOTIFICATION_TEMPLATES[params.type];
    if (!template) {
      throw new Error(`Unknown notification type: ${params.type}`);
    }

    // Get user preferences
    const preferences = await this.getUserPreferences(params.userId);
    const typePrefs = preferences.types[params.type];

    // Determine channels
    const channels = params.channels || 
      (typePrefs?.enabled ? typePrefs.channels : template.defaultChannels);

    // Filter channels based on user preferences
    const enabledChannels = channels.filter(channel => {
      switch (channel) {
        case 'in_app':
          return preferences.channels.inApp;
        case 'email':
          return preferences.channels.email;
        case 'sms':
          return preferences.channels.sms;
        case 'push':
          return preferences.channels.push;
        default:
          return false;
      }
    });

    // Interpolate template
    const title = this.interpolateTemplate(template.title, params.variables);
    const message = this.interpolateTemplate(template.message, params.variables);

    // Check quiet hours
    const scheduledFor = params.scheduledFor || new Date();
    const adjustedSchedule = this.adjustForQuietHours(
      scheduledFor,
      preferences.quietHours
    );

    // Create notification
    const notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: params.userId,
      type: params.type,
      priority: params.priority || template.priority,
      title,
      message,
      data: params.data,
      channels: enabledChannels,
      scheduledFor: adjustedSchedule,
      expiresAt: params.expiresAt
    };

    // Save to database
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }

    // Log notification created
    this.auditService.logDataAccess({
      userId: params.userId,
      action: 'NOTIFICATION_CREATED',
      resourceType: 'notification',
      resourceId: data.id,
      details: {
        type: params.type,
        channels: enabledChannels,
        scheduledFor: adjustedSchedule
      }
    });

    // If scheduled for now, send immediately
    if (adjustedSchedule <= new Date()) {
      await this.processNotification(data);
    }

    return data;
  }

  /**
   * Process and send a notification through various channels
   */
  private async processNotification(notification: Notification): Promise<void> {
    const promises: Promise<void>[] = [];

    if (notification.channels.includes('in_app')) {
      promises.push(this.sendInAppNotification(notification));
    }

    if (notification.channels.includes('email')) {
      promises.push(this.sendEmailNotification(notification));
    }

    if (notification.channels.includes('sms')) {
      promises.push(this.sendSMSNotification(notification));
    }

    if (notification.channels.includes('push')) {
      promises.push(this.sendPushNotification(notification));
    }

    await Promise.all(promises);

    // Update sent timestamp
    await supabase
      .from('notifications')
      .update({ sentAt: new Date() })
      .eq('id', notification.id);
  }

  /**
   * Send in-app notification
   */
  private async sendInAppNotification(notification: Notification): Promise<void> {
    // In-app notifications are handled by the realtime subscription
    // This method is for future enhancements
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(notification: Notification): Promise<void> {
    // Call backend API to send email
    const response = await fetch('/api/notifications/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getAuthToken()}`
      },
      body: JSON.stringify({
        notificationId: notification.id,
        userId: notification.userId,
        subject: notification.title,
        body: notification.message,
        data: notification.data
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send email notification');
    }
  }

  /**
   * Send SMS notification
   */
  private async sendSMSNotification(notification: Notification): Promise<void> {
    // Call backend API to send SMS
    const response = await fetch('/api/notifications/sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getAuthToken()}`
      },
      body: JSON.stringify({
        notificationId: notification.id,
        userId: notification.userId,
        message: `${notification.title}: ${notification.message}`,
        data: notification.data
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send SMS notification');
    }
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(notification: Notification): Promise<void> {
    // Future implementation for web push notifications
    console.log('Push notifications not yet implemented');
  }

  /**
   * Show in-app notification UI
   */
  private showInAppNotification(notification: Notification): void {
    // Emit event for toast/notification UI component
    window.dispatchEvent(
      new CustomEvent('notification:show', {
        detail: {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          data: notification.data
        }
      })
    );
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    // Check cache first
    if (this.preferences.has(userId)) {
      return this.preferences.get(userId)!;
    }

    // Fetch from database
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // Return default preferences
      return this.getDefaultPreferences();
    }

    const preferences = data.preferences as NotificationPreferences;
    this.preferences.set(userId, preferences);
    return preferences;
  }

  /**
   * Update user notification preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    const current = await this.getUserPreferences(userId);
    const updated = { ...current, ...preferences };

    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        preferences: updated,
        updated_at: new Date()
      });

    if (error) {
      throw new Error(`Failed to update preferences: ${error.message}`);
    }

    this.preferences.set(userId, updated);

    // Log preference update
    this.auditService.logDataAccess({
      userId,
      action: 'NOTIFICATION_PREFERENCES_UPDATED',
      resourceType: 'notification_preferences',
      resourceId: userId,
      details: { updated: Object.keys(preferences) }
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ readAt: new Date() })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }

    // Emit event
    window.dispatchEvent(
      new CustomEvent('notification:read', {
        detail: { notificationId }
      })
    );
  }

  /**
   * Mark notification as clicked
   */
  async markAsClicked(notificationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ clickedAt: new Date() })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to mark notification as clicked: ${error.message}`);
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    options?: {
      unreadOnly?: boolean;
      type?: NotificationType;
      limit?: number;
      offset?: number;
    }
  ): Promise<Notification[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.unreadOnly) {
      query = query.is('read_at', null);
    }

    if (options?.type) {
      query = query.eq('type', options.type);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null);

    if (error) {
      throw new Error(`Failed to get unread count: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Schedule appointment reminders
   */
  async scheduleAppointmentReminders(appointment: {
    id: string;
    patientId: string;
    providerId: string;
    providerName: string;
    appointmentDate: Date;
    appointmentTime: string;
  }): Promise<void> {
    const preferences = await this.getUserPreferences(appointment.patientId);
    const reminderPrefs = preferences.types.appointment_reminder;

    if (!reminderPrefs?.enabled) return;

    const advanceNotice = reminderPrefs.advanceNotice || 60; // Default 60 minutes
    const reminderTime = new Date(appointment.appointmentDate);
    reminderTime.setMinutes(reminderTime.getMinutes() - advanceNotice);

    await this.sendNotification({
      userId: appointment.patientId,
      type: 'appointment_reminder',
      variables: {
        providerName: appointment.providerName,
        appointmentDate: appointment.appointmentDate.toLocaleDateString(),
        appointmentTime: appointment.appointmentTime
      },
      scheduledFor: reminderTime,
      data: {
        appointmentId: appointment.id,
        providerId: appointment.providerId
      }
    });
  }

  /**
   * Helper: Interpolate template with variables
   */
  private interpolateTemplate(
    template: string,
    variables: Record<string, string>
  ): string {
    return template.replace(/{(\w+)}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  /**
   * Helper: Adjust schedule for quiet hours
   */
  private adjustForQuietHours(
    scheduledFor: Date,
    quietHours: NotificationPreferences['quietHours']
  ): Date {
    if (!quietHours.enabled) return scheduledFor;

    const scheduled = new Date(scheduledFor);
    const [startHour, startMin] = quietHours.start.split(':').map(Number);
    const [endHour, endMin] = quietHours.end.split(':').map(Number);

    const scheduledHour = scheduled.getHours();
    const scheduledMin = scheduled.getMinutes();

    // Check if in quiet hours
    const inQuietHours = 
      (scheduledHour > startHour || (scheduledHour === startHour && scheduledMin >= startMin)) &&
      (scheduledHour < endHour || (scheduledHour === endHour && scheduledMin < endMin));

    if (inQuietHours) {
      // Schedule for end of quiet hours
      scheduled.setHours(endHour, endMin, 0, 0);
    }

    return scheduled;
  }

  /**
   * Helper: Get auth token
   */
  private async getAuthToken(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');
    return session.access_token;
  }

  /**
   * Helper: Get default preferences
   */
  private getDefaultPreferences(): NotificationPreferences {
    return {
      channels: {
        inApp: true,
        email: true,
        sms: false,
        push: false
      },
      types: Object.keys(NOTIFICATION_TEMPLATES).reduce((acc, type) => {
        const template = NOTIFICATION_TEMPLATES[type as NotificationType];
        acc[type as NotificationType] = {
          enabled: true,
          channels: template.defaultChannels,
          advanceNotice: type === 'appointment_reminder' ? 60 : undefined
        };
        return acc;
      }, {} as NotificationPreferences['types']),
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
        timezone: 'America/New_York'
      }
    };
  }
}