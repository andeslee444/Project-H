import { z } from 'zod'

/**
 * Zod validation schemas for Patient Dashboard components
 * These schemas ensure data integrity and provide runtime validation
 */

// Quick Action validation
export const QuickActionSchema = z.object({
  id: z.string().min(1, 'Action ID is required'),
  title: z.string().min(1, 'Action title is required'),
  subtitle: z.string().min(1, 'Action subtitle is required'),
  color: z.string().regex(/^from-\w+-\d+\s+to-\w+-\d+$/, 'Invalid gradient color format'),
  disabled: z.boolean().optional().default(false)
})

export type ValidatedQuickAction = z.infer<typeof QuickActionSchema>

// Upcoming Appointment validation
export const UpcomingAppointmentSchema = z.object({
  id: z.string().min(1, 'Appointment ID is required'),
  providerId: z.string().min(1, 'Provider ID is required'),
  providerName: z.string().min(1, 'Provider name is required'),
  providerSpecialty: z.string().min(1, 'Provider specialty is required'),
  date: z.string().min(1, 'Appointment date is required'),
  time: z.string().regex(/^\d{1,2}:\d{2}\s?(AM|PM)$/i, 'Invalid time format (expected: "2:00 PM")'),
  type: z.enum(['video', 'phone', 'in_person'], {
    errorMap: () => ({ message: 'Invalid appointment type' })
  }),
  duration: z.number()
    .int('Duration must be an integer')
    .min(15, 'Duration must be at least 15 minutes')
    .max(180, 'Duration cannot exceed 3 hours'),
  status: z.enum(['scheduled', 'confirmed', 'cancelled'], {
    errorMap: () => ({ message: 'Invalid appointment status' })
  }),
  location: z.string().optional()
})

export type ValidatedUpcomingAppointment = z.infer<typeof UpcomingAppointmentSchema>

// Wellness Stat validation
export const WellnessStatSchema = z.object({
  id: z.string().min(1, 'Stat ID is required'),
  label: z.string().min(1, 'Stat label is required'),
  value: z.union([
    z.string().min(1, 'Stat value cannot be empty'),
    z.number().finite('Stat value must be a valid number')
  ]),
  unit: z.string().optional(),
  trend: z.string().optional(),
  trendDirection: z.enum(['up', 'down', 'neutral']).optional(),
  color: z.string()
    .regex(/^text-\w+-\d+$/, 'Invalid Tailwind color class format')
    .optional(),
  description: z.string().optional()
})

export type ValidatedWellnessStat = z.infer<typeof WellnessStatSchema>

// Patient User validation (for dashboard display)
export const PatientUserSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  avatar: z.string().url('Invalid avatar URL').optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark'], {
      errorMap: () => ({ message: 'Theme must be either light or dark' })
    }),
    notifications: z.boolean(),
    language: z.string().min(2, 'Language code must be at least 2 characters')
  })
})

export type ValidatedPatientUser = z.infer<typeof PatientUserSchema>

// Dashboard props validation
export const DashboardPropsSchema = z.object({
  className: z.string().optional()
})

export type ValidatedDashboardProps = z.infer<typeof DashboardPropsSchema>

// Validation functions with error handling
export const validateQuickActions = (actions: unknown[]): ValidatedQuickAction[] => {
  return actions.map((action, index) => {
    try {
      return QuickActionSchema.parse(action)
    } catch (error) {
      console.error(`Validation error for quick action at index ${index}:`, error)
      throw new Error(`Invalid quick action data at position ${index}`)
    }
  })
}

export const validateUpcomingAppointment = (appointment: unknown): ValidatedUpcomingAppointment => {
  try {
    return UpcomingAppointmentSchema.parse(appointment)
  } catch (error) {
    console.error('Validation error for upcoming appointment:', error)
    throw new Error('Invalid upcoming appointment data')
  }
}

export const validateWellnessStats = (stats: unknown[]): ValidatedWellnessStat[] => {
  return stats.map((stat, index) => {
    try {
      return WellnessStatSchema.parse(stat)
    } catch (error) {
      console.error(`Validation error for wellness stat at index ${index}:`, error)
      throw new Error(`Invalid wellness stat data at position ${index}`)
    }
  })
}

export const validatePatientUser = (user: unknown): ValidatedPatientUser => {
  try {
    return PatientUserSchema.parse(user)
  } catch (error) {
    console.error('Validation error for patient user:', error)
    throw new Error('Invalid patient user data')
  }
}

// Mock data factory with validation
export const createMockQuickActions = (): ValidatedQuickAction[] => {
  const mockActions = [
    {
      id: 'book-session',
      title: 'Book Session',
      subtitle: 'Schedule your next appointment',
      color: 'from-blue-500 to-blue-600',
      disabled: false
    },
    {
      id: 'message-provider',
      title: 'Message Provider',
      subtitle: 'Secure messaging with your care team',
      color: 'from-green-500 to-green-600',
      disabled: false
    },
    {
      id: 'log-mood',
      title: 'Log Mood',
      subtitle: 'Track how you\'re feeling today',
      color: 'from-purple-500 to-purple-600',
      disabled: false
    },
    {
      id: 'resources',
      title: 'Resources',
      subtitle: 'Access self-care tools and guides',
      color: 'from-teal-500 to-teal-600',
      disabled: false
    }
  ]

  return validateQuickActions(mockActions)
}

export const createMockUpcomingAppointment = (): ValidatedUpcomingAppointment => {
  const mockAppointment = {
    id: '1',
    providerId: 'provider-1',
    providerName: 'Dr. Sarah Johnson',
    providerSpecialty: 'Clinical Psychologist',
    date: 'Tomorrow',
    time: '2:00 PM',
    type: 'video' as const,
    duration: 50,
    status: 'confirmed' as const
  }

  return validateUpcomingAppointment(mockAppointment)
}

export const createMockWellnessStats = (): ValidatedWellnessStat[] => {
  const mockStats = [
    {
      id: 'mood-avg',
      label: 'Mood Average',
      value: '7.2',
      unit: '/10',
      trend: '+0.3',
      trendDirection: 'up' as const,
      color: 'text-green-600',
      description: 'Your average mood over the past week'
    },
    {
      id: 'sleep-quality',
      label: 'Sleep Quality',
      value: '6.8',
      unit: 'hrs',
      trend: '+0.5',
      trendDirection: 'up' as const,
      color: 'text-blue-600',
      description: 'Average sleep duration this week'
    },
    {
      id: 'check-ins',
      label: 'Check-ins',
      value: '12',
      unit: '/14',
      trend: '86%',
      trendDirection: 'up' as const,
      color: 'text-purple-600',
      description: 'Completed mood check-ins this week'
    }
  ]

  return validateWellnessStats(mockStats)
}