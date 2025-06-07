import React, { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { CheckCircle, X, AlertCircle, Info, Calendar } from 'lucide-react';
import { NotificationType } from '@/lib/notifications/NotificationService';
import 'react-toastify/dist/ReactToastify.css';

interface NotificationDetail {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: Record<string, any>;
}

const notificationConfig = {
  position: toast.POSITION.TOP_RIGHT as const,
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

const CustomToast: React.FC<NotificationDetail> = ({ type, title, message }) => {
  const getIcon = () => {
    switch (type) {
      case 'appointment_confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'appointment_cancelled':
        return <X className="w-5 h-5 text-red-500" />;
      case 'appointment_reminder':
      case 'appointment_rescheduled':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'system_alert':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0">{getIcon()}</div>
      <div className="flex-1">
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600 mt-1">{message}</p>
      </div>
    </div>
  );
};

export const NotificationToastContainer: React.FC = () => {
  useEffect(() => {
    const handleNotificationShow = (event: CustomEvent<NotificationDetail>) => {
      const { priority, ...notification } = event.detail;

      const toastType = priority === 'urgent' || priority === 'high' 
        ? toast.error 
        : priority === 'medium' 
        ? toast.warning 
        : toast.info;

      toastType(<CustomToast {...notification} />, {
        ...notificationConfig,
        autoClose: priority === 'urgent' ? false : notificationConfig.autoClose,
        toastId: notification.id, // Prevent duplicate toasts
      });
    };

    window.addEventListener('notification:show' as any, handleNotificationShow);

    return () => {
      window.removeEventListener('notification:show' as any, handleNotificationShow);
    };
  }, []);

  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      className="mt-16" // Account for header height
    />
  );
};