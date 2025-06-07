import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, CheckCircle, AlertCircle, Info, Calendar, DollarSign, FileText, Users } from 'lucide-react';
import { NotificationService, Notification, NotificationType } from '@/lib/notifications/NotificationService';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface NotificationDropdownProps {
  onClose: () => void;
  onNotificationRead?: () => void;
}

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  appointment_reminder: <Calendar className="w-5 h-5 text-blue-500" />,
  appointment_confirmed: <CheckCircle className="w-5 h-5 text-green-500" />,
  appointment_cancelled: <X className="w-5 h-5 text-red-500" />,
  appointment_rescheduled: <Clock className="w-5 h-5 text-yellow-500" />,
  waitlist_available: <AlertCircle className="w-5 h-5 text-purple-500" />,
  waitlist_position_update: <Users className="w-5 h-5 text-indigo-500" />,
  provider_message: <Info className="w-5 h-5 text-blue-500" />,
  system_alert: <AlertCircle className="w-5 h-5 text-red-500" />,
  payment_reminder: <DollarSign className="w-5 h-5 text-green-500" />,
  document_ready: <FileText className="w-5 h-5 text-gray-500" />
};

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  onClose,
  onNotificationRead
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    if (!user?.id) return;

    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getUserNotifications(user.id, {
          limit: 10
        });
        setNotifications(data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Listen for new notifications
    const handleNewNotification = (event: CustomEvent<Notification>) => {
      setNotifications(prev => [event.detail, ...prev].slice(0, 10));
    };

    window.addEventListener('notification:new' as any, handleNewNotification);

    return () => {
      window.removeEventListener('notification:new' as any, handleNewNotification);
    };
  }, [user?.id]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.readAt) {
      await notificationService.markAsRead(notification.id, user!.id);
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, readAt: new Date() } : n)
      );
      onNotificationRead?.();
    }

    // Mark as clicked
    await notificationService.markAsClicked(notification.id, user!.id);

    // Handle navigation based on notification type
    switch (notification.type) {
      case 'appointment_reminder':
      case 'appointment_confirmed':
      case 'appointment_cancelled':
      case 'appointment_rescheduled':
        if (notification.data?.appointmentId) {
          window.location.href = `/appointments/${notification.data.appointmentId}`;
        }
        break;
      case 'waitlist_available':
        if (notification.data?.providerId) {
          window.location.href = `/providers/${notification.data.providerId}/book`;
        }
        break;
      case 'provider_message':
        window.location.href = '/messages';
        break;
      case 'payment_reminder':
        window.location.href = '/billing';
        break;
      case 'document_ready':
        window.location.href = '/documents';
        break;
    }

    onClose();
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.readAt);
    
    await Promise.all(
      unreadNotifications.map(n => 
        notificationService.markAsRead(n.id, user!.id)
      )
    );

    setNotifications(prev =>
      prev.map(n => ({ ...n, readAt: n.readAt || new Date() }))
    );

    onNotificationRead?.();
  };

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        <div className="flex items-center gap-2">
          {notifications.some(n => !n.readAt) && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Mark all as read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close notifications"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-2 text-sm text-gray-600">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No notifications yet</p>
            <p className="text-sm text-gray-500 mt-1">
              We'll notify you when something important happens
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <motion.button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                  !notification.readAt ? 'bg-blue-50' : ''
                }`}
                whileHover={{ x: 2 }}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {notificationIcons[notification.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.readAt ? 'font-semibold' : ''} text-gray-900`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.readAt && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200">
          <a
            href="/notifications"
            className="block w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all notifications
          </a>
        </div>
      )}
    </motion.div>
  );
};

// Import Bell icon
import { Bell } from 'lucide-react';