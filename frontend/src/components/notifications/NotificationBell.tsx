import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationService } from '@/lib/notifications/NotificationService';
import { NotificationDropdown } from './NotificationDropdown';
import { useAuth } from '@/hooks/useAuth';

export const NotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user } = useAuth();
  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    if (!user?.id) return;

    // Fetch initial unread count
    notificationService.getUnreadCount(user.id).then(setUnreadCount);

    // Listen for new notifications
    const handleNewNotification = () => {
      notificationService.getUnreadCount(user.id).then(setUnreadCount);
    };

    const handleReadNotification = () => {
      notificationService.getUnreadCount(user.id).then(setUnreadCount);
    };

    window.addEventListener('notification:new', handleNewNotification);
    window.addEventListener('notification:read', handleReadNotification);

    return () => {
      window.removeEventListener('notification:new', handleNewNotification);
      window.removeEventListener('notification:read', handleReadNotification);
    };
  }, [user?.id]);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-6 h-6" />
        
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {showDropdown && (
          <NotificationDropdown
            onClose={() => setShowDropdown(false)}
            onNotificationRead={() => {
              notificationService.getUnreadCount(user!.id).then(setUnreadCount);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};