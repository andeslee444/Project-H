import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Clock, Users, X, Phone, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import twilioService from '../../services/twilioService';

interface Patient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface NotificationModalProps {
  selectedPatients: string[];
  patients: Patient[];
  onClose: () => void;
  onSend: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  selectedPatients,
  patients,
  onClose,
  onSend
}) => {
  const [notificationType, setNotificationType] = useState<'waterfall' | 'blast'>('waterfall');
  const [message, setMessage] = useState(
    "Hi {name}, an appointment slot just opened up! Click here to book: [link]"
  );
  const [sendingStatus, setSendingStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [sendingProgress, setSendingProgress] = useState({ sent: 0, total: 0 });
  const [waterfallStatus, setWaterfallStatus] = useState<{ sent: number; total: number } | null>(null);

  // Check waterfall status periodically
  useEffect(() => {
    if (notificationType === 'waterfall' && sendingStatus === 'sending') {
      const interval = setInterval(() => {
        const status = twilioService.getWaterfallStatus();
        if (status) {
          setWaterfallStatus({ sent: status.sent, total: status.total });
          if (status.sent >= status.total) {
            setSendingStatus('sent');
            setTimeout(() => onSend(), 1500);
          }
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [notificationType, sendingStatus, onSend]);

  const handleSendNotifications = async () => {
    setSendingStatus('sending');
    setSendingProgress({ sent: 0, total: patients.length });

    try {
      if (notificationType === 'waterfall') {
        // Waterfall: Send one at a time with 5-minute intervals
        await sendWaterfallNotifications();
      } else {
        // Blast: Send to all at once
        await sendBlastNotifications();
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
      setSendingStatus('idle');
    }
  };

  const sendWaterfallNotifications = async () => {
    const messages = patients.map(patient => ({
      to: patient.phone || '+1234567890', // Use default if no phone
      message,
      patientName: patient.name
    }));

    await twilioService.startWaterfallSMS(messages, 5, {
      onMessageSent: (sent, total) => {
        setWaterfallStatus({ sent, total });
      },
      onComplete: () => {
        setSendingStatus('sent');
        setTimeout(() => onSend(), 1500);
      }
    });
  };

  const sendBlastNotifications = async () => {
    const messages = patients.map(patient => ({
      to: patient.phone || '+1234567890', // Use default if no phone
      message,
      patientName: patient.name
    }));

    const result = await twilioService.sendBlastSMS(messages, (sent, total) => {
      setSendingProgress({ sent, total });
    });

    if (result.success) {
      setSendingStatus('sent');
      setTimeout(() => onSend(), 1500);
    } else {
      console.error('Some messages failed:', result.errors);
      setSendingStatus('idle');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Notify Selected Patients</h3>
            <p className="text-sm text-gray-600 mt-1">
              Send notifications to {selectedPatients.length} selected patients
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Notification Type Selection */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Notification Method
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setNotificationType('waterfall')}
              className={`p-4 rounded-lg border-2 transition-all ${
                notificationType === 'waterfall'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">Waterfall</h4>
              <p className="text-sm text-gray-600 mt-1">
                Text one patient at a time, every 5 minutes until slot is filled
              </p>
            </button>

            <button
              onClick={() => setNotificationType('blast')}
              className={`p-4 rounded-lg border-2 transition-all ${
                notificationType === 'blast'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">Blast</h4>
              <p className="text-sm text-gray-600 mt-1">
                Text all selected patients simultaneously
              </p>
            </button>
          </div>
        </div>

        {/* Warning for Blast */}
        {notificationType === 'blast' && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-900">Blast Notification Warning</p>
              <p className="text-amber-700 mt-1">
                All patients will receive the message at the same time. This may result in multiple 
                patients attempting to book the same slot.
              </p>
            </div>
          </div>
        )}

        {/* Message Template */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Message Template
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="Enter your message..."
          />
          <p className="text-xs text-gray-500 mt-2">
            Use {'{name}'} to personalize with patient's name
          </p>
        </div>

        {/* Selected Patients Preview */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Recipients ({patients.length})
          </label>
          <div className="max-h-40 overflow-y-auto border rounded-lg p-3">
            <div className="space-y-2">
              {patients.map((patient, index) => (
                <div key={patient.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 w-6">{index + 1}.</span>
                    <span className="font-medium">{patient.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    {patient.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{patient.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Information for Waterfall */}
        {notificationType === 'waterfall' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Waterfall Timing</p>
                <p className="text-blue-700 mt-1">
                  Messages will be sent in the order shown above, with a 5-minute delay between each patient.
                  Total time: ~{(patients.length - 1) * 5} minutes
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sending Progress */}
        {sendingStatus === 'sending' && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {notificationType === 'waterfall' ? 'Sending messages sequentially...' : 'Sending messages...'}
              </span>
              <span className="text-sm text-gray-600">
                {notificationType === 'waterfall' && waterfallStatus
                  ? `${waterfallStatus.sent} / ${waterfallStatus.total}`
                  : `${sendingProgress.sent} / ${sendingProgress.total}`
                }
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    notificationType === 'waterfall' && waterfallStatus
                      ? (waterfallStatus.sent / waterfallStatus.total) * 100
                      : (sendingProgress.sent / sendingProgress.total) * 100
                  }%`
                }}
              />
            </div>
            {notificationType === 'waterfall' && waterfallStatus && waterfallStatus.sent < waterfallStatus.total && (
              <p className="text-xs text-gray-500 mt-2">
                Next message will be sent in 5 minutes. {(waterfallStatus.total - waterfallStatus.sent - 1) * 5} minutes remaining.
              </p>
            )}
          </div>
        )}

        {/* Success Message */}
        {sendingStatus === 'sent' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Messages sent successfully!</p>
              <p className="text-sm text-green-700 mt-1">
                {notificationType === 'waterfall' 
                  ? 'All messages have been queued and will be sent at 5-minute intervals.'
                  : `All ${patients.length} messages have been sent.`
                }
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={sendingStatus === 'sending'}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSendNotifications}
            disabled={sendingStatus === 'sending' || patients.length === 0}
            className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              sendingStatus === 'sending'
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : sendingStatus === 'sent'
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {sendingStatus === 'sending' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Sending...
              </>
            ) : sendingStatus === 'sent' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Done
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                Send {notificationType === 'waterfall' ? 'Waterfall' : 'Blast'}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NotificationModal;