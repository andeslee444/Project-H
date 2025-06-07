import React, { useState, useEffect } from 'react';
import { Bell, Filter, Check, Archive, Settings } from 'lucide-react';
import { NotificationService, Notification, NotificationType } from '@/lib/notifications/NotificationService';
import { NotificationPreferences } from '@/components/notifications/NotificationPreferences';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button/Button';
import { Select } from '@/components/ui/select/Select';
import { Card } from '@/components/ui/card/Card';
import { motion, AnimatePresence } from 'framer-motion';

const notificationTypeIcons: Record<NotificationType, string> = {
  appointment_reminder: '📅',
  appointment_confirmed: '✅',
  appointment_cancelled: '❌',
  appointment_rescheduled: '🔄',
  waitlist_available: '🎯',
  waitlist_position_update: '📊',
  provider_message: '💬',
  system_alert: '⚠️',
  payment_reminder: '💳',
  document_ready: '📄'
};

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | NotificationType>('all');
  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    if (!user?.id) return;
    fetchNotifications();
  }, [user?.id, filter]);

  const fetchNotifications = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const options = filter === 'unread' 
        ? { unreadOnly: true }
        : filter !== 'all'
        ? { type: filter as NotificationType }
        : {};

      const data = await notificationService.getUserNotifications(user.id, {
        ...options,
        limit: 50
      });
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user?.id) return;

    await notificationService.markAsRead(notificationId, user.id);
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, readAt: new Date() } : n)
    );
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;

    const unreadNotifications = notifications.filter(n => !n.readAt);
    await Promise.all(
      unreadNotifications.map(n => notificationService.markAsRead(n.id, user.id))
    );
    
    setNotifications(prev =>
      prev.map(n => ({ ...n, readAt: n.readAt || new Date() }))
    );
  };

  const handleMarkSelectedAsRead = async () => {
    if (!user?.id) return;

    const selected = notifications.filter(n => selectedNotifications.has(n.id) && !n.readAt);
    await Promise.all(
      selected.map(n => notificationService.markAsRead(n.id, user.id))
    );

    setNotifications(prev =>
      prev.map(n => selectedNotifications.has(n.id) ? { ...n, readAt: n.readAt || new Date() } : n)
    );
    setSelectedNotifications(new Set());
  };

  const toggleSelection = (notificationId: string) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.map(n => n.id)));
    }
  };

  if (showPreferences) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setShowPreferences(false)}
            className="mb-4"
          >
            ← Back to Notifications
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Notification Preferences</h1>
          <p className="text-gray-600 mt-1">Manage how and when you receive notifications</p>
        </div>
        <NotificationPreferences />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-6 h-6" />
              Notifications
            </h1>
            <p className="text-gray-600 mt-1">
              Stay updated with your appointments and messages
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowPreferences(true)}
            icon={<Settings className="w-4 h-4" />}
          >
            Preferences
          </Button>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="w-48"
            options={[
              { value: 'all', label: 'All Notifications' },
              { value: 'unread', label: 'Unread Only' },
              { value: 'appointment_reminder', label: 'Appointments' },
              { value: 'provider_message', label: 'Messages' },
              { value: 'waitlist_available', label: 'Waitlist' },
              { value: 'payment_reminder', label: 'Payments' },
              { value: 'system_alert', label: 'System Alerts' }
            ]}
          />
        </div>

        <div className="flex gap-2">
          {selectedNotifications.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkSelectedAsRead}
              icon={<Check className="w-4 h-4" />}
            >
              Mark {selectedNotifications.size} as Read
            </Button>
          )}
          {notifications.some(n => !n.readAt) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
            >
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* Notification List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <Card className="text-center py-12">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-600">
            {filter === 'unread' 
              ? "You're all caught up!"
              : "You don't have any notifications yet"}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {/* Select All */}
          <div className="flex items-center gap-3 px-4 py-2">
            <input
              type="checkbox"
              checked={selectedNotifications.size === notifications.length}
              onChange={toggleSelectAll}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
              Select all {notifications.length} notifications
            </span>
          </div>

          {/* Notifications */}
          <AnimatePresence>
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className={cn(
                    'p-4 cursor-pointer hover:shadow-md transition-shadow',
                    !notification.readAt && 'bg-blue-50 border-blue-200',
                    selectedNotifications.has(notification.id) && 'ring-2 ring-blue-500'
                  )}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.has(notification.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelection(notification.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    
                    <div className="text-2xl">
                      {notificationTypeIcons[notification.type]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className={cn(
                            'text-sm font-medium text-gray-900',
                            !notification.readAt && 'font-semibold'
                          )}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.readAt && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                        
                        {notification.type === 'appointment_reminder' && notification.data?.appointmentId && (
                          <Button
                            size="xs"
                            variant="link"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/appointments/${notification.data.appointmentId}`;
                            }}
                          >
                            View Appointment
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

// Import cn utility
import { cn } from '@/lib/utils';