import React from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { HealthcareIcons } from './HealthcareIcons';
import 'react-toastify/dist/ReactToastify.css';

// Healthcare-themed toast notifications
export const healthcareToast = {
  success: (message, options = {}) => {
    toast.success(message, {
      icon: <HealthcareIcons.CheckCircle className="w-5 h-5 text-green-500" />,
      className: 'bg-green-50 border-l-4 border-green-500',
      ...options
    });
  },
  
  error: (message, options = {}) => {
    toast.error(message, {
      icon: <HealthcareIcons.XCircle className="w-5 h-5 text-red-500" />,
      className: 'bg-red-50 border-l-4 border-red-500',
      ...options
    });
  },
  
  warning: (message, options = {}) => {
    toast.warning(message, {
      icon: <HealthcareIcons.AlertTriangle className="w-5 h-5 text-yellow-500" />,
      className: 'bg-yellow-50 border-l-4 border-yellow-500',
      ...options
    });
  },
  
  info: (message, options = {}) => {
    toast.info(message, {
      icon: <HealthcareIcons.Info className="w-5 h-5 text-blue-500" />,
      className: 'bg-blue-50 border-l-4 border-blue-500',
      ...options
    });
  },
  
  // Healthcare-specific notifications
  appointment: (message, options = {}) => {
    toast.success(message, {
      icon: <HealthcareIcons.Calendar className="w-5 h-5 text-blue-500" />,
      className: 'bg-blue-50 border-l-4 border-blue-500',
      ...options
    });
  },
  
  medication: (message, options = {}) => {
    toast.info(message, {
      icon: <HealthcareIcons.Pills className="w-5 h-5 text-purple-500" />,
      className: 'bg-purple-50 border-l-4 border-purple-500',
      ...options
    });
  },
  
  vital: (message, options = {}) => {
    toast.info(message, {
      icon: <HealthcareIcons.Activity className="w-5 h-5 text-red-500" />,
      className: 'bg-red-50 border-l-4 border-red-500',
      ...options
    });
  }
};

// Toast Container Component
export const HealthcareToastContainer = () => (
  <ToastContainer
    position="top-right"
    autoClose={5000}
    hideProgressBar={false}
    newestOnTop={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="light"
    className="mt-16"
    toastClassName="rounded-lg shadow-lg"
  />
);

export default healthcareToast;