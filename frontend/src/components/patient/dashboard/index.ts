export { PatientDashboard } from './PatientDashboard'
export type { 
  DashboardProps,
  QuickAction,
  UpcomingAppointment,
  WellnessStat,
  PatientUser,
  DashboardSectionProps
} from './types'

// Validation exports
export {
  validateQuickActions,
  validateUpcomingAppointment,
  validateWellnessStats,
  validatePatientUser,
  createMockQuickActions,
  createMockUpcomingAppointment,
  createMockWellnessStats
} from './validation'

export type {
  ValidatedQuickAction,
  ValidatedUpcomingAppointment,
  ValidatedWellnessStat,
  ValidatedPatientUser,
  ValidatedDashboardProps
} from './validation'