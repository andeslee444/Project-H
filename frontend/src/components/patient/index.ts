/**
 * Patient Components
 * 
 * Components specific to patient functionality
 */

// Dashboard components
export { PatientDashboard } from './dashboard'
export type { 
  DashboardProps,
  QuickAction,
  UpcomingAppointment,
  WellnessStat,
  PatientUser
} from './dashboard'

// Dashboard validation (for data integrity)
export {
  validateQuickActions,
  validateUpcomingAppointment,
  validateWellnessStats,
  validatePatientUser,
  createMockQuickActions,
  createMockUpcomingAppointment,
  createMockWellnessStats
} from './dashboard/validation'

export type {
  ValidatedQuickAction,
  ValidatedUpcomingAppointment,
  ValidatedWellnessStat,
  ValidatedPatientUser,
  ValidatedDashboardProps
} from './dashboard/validation'

// Note: Other patient components will be migrated here as they are refactored