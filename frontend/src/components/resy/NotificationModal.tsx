import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Clock, Users, X, Phone, MessageSquare, AlertCircle, CheckCircle, Calendar, UserCheck } from 'lucide-react';
import twilioService from '../../services/twilioService';
import { format } from 'date-fns';

interface Patient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface Provider {
  provider_id: string;
  first_name: string;
  last_name: string;
  title?: string;
}

interface TimeSlot {
  date: string;
  start_time: string;
  end_time: string;
}

interface NotificationModalProps {
  selectedPatients: string[];
  patients: Patient[];
  selectedProvider?: Provider | null;
  selectedTimeSlot?: TimeSlot | null;
  onClose: () => void;
  onSend: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  selectedPatients,
  patients,
  selectedProvider,
  selectedTimeSlot,
  onClose,
  onSend
}) => {
  const [notificationType, setNotificationType] = useState<'provider-led' | 'calendar-link'>('provider-led');
  
  // Log props for debugging
  console.log('NotificationModal props:', {
    selectedProvider,
    selectedTimeSlot,
    patientsCount: patients.length
  });
  
  // Utility function to parse date string correctly
  // When using new Date('YYYY-MM-DD'), JavaScript interprets it as UTC midnight,
  // which can appear as the previous day in local time zones.
  // This function ensures the date is parsed as local time.
  const parseLocalDate = useCallback((dateString: string) => {
    try {
      if (!dateString) {
        console.warn('parseLocalDate: No date string provided');
        return new Date();
      }
      const [year, month, day] = dateString.split('-').map(Number);
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        console.error('parseLocalDate: Invalid date parts', { year, month, day, dateString });
        return new Date();
      }
      return new Date(year, month - 1, day); // month is 0-indexed
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return new Date(); // Fallback to current date
    }
  }, []);
  
  // Generate appropriate message based on context
  const generateMessage = useCallback(() => {
    const providerName = selectedProvider 
      ? `Dr. ${selectedProvider.last_name}` 
      : 'Your preferred provider';
    
    const timeSlotInfo = selectedTimeSlot 
      ? ` on ${format(parseLocalDate(selectedTimeSlot.date), 'EEEE, MMMM d')} at ${selectedTimeSlot.start_time}`
      : '';
    
    if (notificationType === 'provider-led') {
      if (selectedProvider && selectedTimeSlot) {
        return `Hi {name}, ${providerName} has a new appointment slot available${timeSlotInfo}. Reply YES if you're interested and we'll book it for you.`;
      } else if (selectedProvider) {
        return `Hi {name}, ${providerName} has new appointment slots available. Reply YES if you're interested and we'll help you book one.`;
      } else {
        return `Hi {name}, new appointment slots have opened up with our providers. Reply YES if you're interested and we'll help match you with the right provider.`;
      }
    } else {
      // calendar-link type
      if (selectedProvider && selectedTimeSlot) {
        return `Hi {name}, ${providerName} has a new appointment slot available${timeSlotInfo}. Click here to book directly: [booking-link]`;
      } else if (selectedProvider) {
        return `Hi {name}, ${providerName} has new appointment slots available. Click here to view and book: [booking-link]`;
      } else {
        return `Hi {name}, new appointment slots are available with our providers. Click here to view available times and book: [booking-link]`;
      }
    }
  }, [notificationType, selectedProvider, selectedTimeSlot, parseLocalDate]);
  
  const [message, setMessage] = useState('');
  const [sendingStatus, setSendingStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [sendingProgress, setSendingProgress] = useState({ sent: 0, total: 0 });
  const [waterfallStatus, setWaterfallStatus] = useState<{ sent: number; total: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize message on mount
  useEffect(() => {
    setMessage(generateMessage());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update message when notification type or context changes
  useEffect(() => {
    setMessage(generateMessage());
  }, [generateMessage]);

  const handleSendNotifications = async () => {
    console.log('handleSendNotifications called');
    console.log('Patients to notify:', patients);
    console.log('Notification type:', notificationType);
    
    setSendingStatus('sending');
    setSendingProgress({ sent: 0, total: patients.length });
    setErrorMessage(null);

    try {
      // For now, both provider-led and calendar-link use the same sending mechanism
      // In a real implementation, calendar-link would include actual booking links
      await sendNotifications();
    } catch (error) {
      console.error('Error sending notifications:', error);
      setSendingStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send notifications');
    }
  };

  const sendNotifications = async () => {
    // Check for patients without phone numbers
    const patientsWithoutPhone = patients.filter(patient => !patient.phone || patient.phone === 'No phone');
    if (patientsWithoutPhone.length > 0) {
      const names = patientsWithoutPhone.map(p => p.name).join(', ');
      throw new Error(`Cannot send SMS - the following patients do not have phone numbers: ${names}`);
    }

    // Personalize messages for each patient
    const messages = patients.map(patient => {
      const personalizedMessage = message.replace('{name}', patient.name);
      return {
        to: patient.phone!,
        message: personalizedMessage,
        patientName: patient.name
      };
    });

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

        {/* Context Information */}
        {(selectedProvider || selectedTimeSlot) && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Notification Context</h4>
            {selectedProvider && (
              <p className="text-sm text-blue-700">
                Provider: Dr. {selectedProvider.last_name}
              </p>
            )}
            {selectedTimeSlot && (
              <p className="text-sm text-blue-700">
                Time Slot: {format(parseLocalDate(selectedTimeSlot.date), 'EEEE, MMMM d')} at {selectedTimeSlot.start_time}
              </p>
            )}
          </div>
        )}

        {/* Notification Type Selection */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Scheduling Method
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setNotificationType('provider-led')}
              className={`p-4 rounded-lg border-2 transition-all ${
                notificationType === 'provider-led'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <UserCheck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">Provider-Led Scheduling</h4>
              <p className="text-sm text-gray-600 mt-1">
                Patients reply YES to express interest, staff schedules appointment
              </p>
            </button>

            <button
              onClick={() => setNotificationType('calendar-link')}
              className={`p-4 rounded-lg border-2 transition-all ${
                notificationType === 'calendar-link'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">Send Calendar Link</h4>
              <p className="text-sm text-gray-600 mt-1">
                Patients click link to self-schedule appointment
              </p>
            </button>
          </div>
        </div>

        {/* Info for Provider-Led */}
        {notificationType === 'provider-led' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-900">Provider-Led Scheduling</p>
              <p className="text-green-700 mt-1">
                Patients who reply YES will be contacted by staff to schedule. This allows for 
                personalized scheduling and ensures the best match between patient and provider.
              </p>
            </div>
          </div>
        )}

        {/* Info for Calendar Link */}
        {notificationType === 'calendar-link' && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-purple-900">Self-Service Scheduling</p>
              <p className="text-purple-700 mt-1">
                Patients will receive a secure link to view available times and book directly. 
                First-come, first-served basis.
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
                    {patient.phone && patient.phone !== 'No phone' ? (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{patient.phone}</span>
                      </div>
                    ) : (
                      <span className="text-red-500 text-xs font-medium">No phone number</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* Sending Progress */}
        {sendingStatus === 'sending' && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Sending messages...
              </span>
              <span className="text-sm text-gray-600">
                {sendingProgress.sent} / {sendingProgress.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(sendingProgress.sent / sendingProgress.total) * 100}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Success Message */}
        {sendingStatus === 'sent' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Messages sent successfully!</p>
              <p className="text-sm text-green-700 mt-1">
                All {patients.length} messages have been sent successfully.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {sendingStatus === 'error' && errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Failed to send messages</p>
              <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
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
                Send {notificationType === 'provider-led' ? 'Provider-Led' : 'Calendar Link'} Notifications
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NotificationModal;