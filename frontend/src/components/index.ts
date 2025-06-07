/**
 * Component Library Entry Point
 * 
 * Main export file for all components in the system
 */

// UI Components - explicitly export to avoid conflicts
export { Button } from './ui/button/Button'
export { Card, CardHeader, CardContent, CardFooter } from './ui/card/Card'

// UI Component Types
export type { ButtonProps, ButtonVariant, ButtonSize } from './ui/button/types'
export type { 
  CardProps as UICardProps, 
  CardHeaderProps, 
  CardContentProps, 
  CardFooterProps,
  CardVariant 
} from './ui/card/types'

// Patient Components
export { PatientDashboard } from './patient'
export type { 
  DashboardProps,
  QuickAction,
  UpcomingAppointment,
  WellnessStat,
  PatientUser
} from './patient'

// Base Types
export type { 
  BaseComponentProps,
  ComponentSize,
  ComponentVariant,
  ComponentState
} from './types'