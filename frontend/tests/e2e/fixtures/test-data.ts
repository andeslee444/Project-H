export const testAppointments = {
  standard: {
    type: 'Initial Consultation',
    duration: 50,
    reason: 'General anxiety and stress management',
    notes: 'Looking for coping strategies for work-related stress',
    preferredTime: 'Morning',
    preferredDays: ['Monday', 'Wednesday', 'Friday'],
  },
  urgent: {
    type: 'Urgent',
    duration: 50,
    reason: 'Experiencing increased anxiety symptoms',
    notes: 'Need immediate support',
    preferredTime: 'Any',
    preferredDays: ['Any'],
  },
  followUp: {
    type: 'Follow-up',
    duration: 30,
    reason: 'Medication review and progress check',
    notes: 'Discuss current medication effectiveness',
    preferredTime: 'Afternoon',
    preferredDays: ['Tuesday', 'Thursday'],
  },
};

export const testNotifications = {
  appointmentConfirmation: {
    type: 'appointment_confirmation',
    title: 'Appointment Confirmed',
    body: 'Your appointment has been confirmed',
  },
  appointmentReminder: {
    type: 'appointment_reminder',
    title: 'Appointment Reminder',
    body: 'You have an appointment tomorrow',
  },
  waitlistUpdate: {
    type: 'waitlist_update',
    title: 'Waitlist Update',
    body: 'An appointment slot has become available',
  },
  providerMessage: {
    type: 'provider_message',
    title: 'Message from Provider',
    body: 'You have a new message from your provider',
  },
};

export const testWaitlistPreferences = {
  flexible: {
    timePreference: 'Any',
    dayPreference: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    urgency: 'Low',
    maxWaitTime: '2 weeks',
    acceptShortNotice: true,
  },
  specific: {
    timePreference: 'Morning',
    dayPreference: ['Monday', 'Wednesday'],
    urgency: 'Medium',
    maxWaitTime: '1 week',
    acceptShortNotice: false,
  },
  urgent: {
    timePreference: 'Any',
    dayPreference: ['Any'],
    urgency: 'High',
    maxWaitTime: '48 hours',
    acceptShortNotice: true,
  },
};

export const testProviderSchedule = {
  standard: {
    monday: [
      { start: '09:00', end: '12:00' },
      { start: '13:00', end: '17:00' },
    ],
    tuesday: [
      { start: '09:00', end: '12:00' },
      { start: '13:00', end: '17:00' },
    ],
    wednesday: [
      { start: '09:00', end: '12:00' },
      { start: '13:00', end: '17:00' },
    ],
    thursday: [
      { start: '09:00', end: '12:00' },
      { start: '13:00', end: '17:00' },
    ],
    friday: [
      { start: '09:00', end: '15:00' },
    ],
  },
  limited: {
    monday: [{ start: '14:00', end: '18:00' }],
    wednesday: [{ start: '14:00', end: '18:00' }],
    friday: [{ start: '14:00', end: '18:00' }],
  },
};