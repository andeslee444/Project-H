export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Patient routes
  PATIENT_DASHBOARD: '/patient/dashboard',
  PATIENT_APPOINTMENTS: '/patient/appointments',
  PATIENT_PROFILE: '/patient/profile',
  PATIENT_MESSAGES: '/patient/messages',
  PATIENT_BOOKING: '/patient/booking',
  
  // Provider routes
  PROVIDER_DASHBOARD: '/provider/dashboard',
  PROVIDER_SCHEDULE: '/provider/schedule',
  PROVIDER_PATIENTS: '/provider/patients',
  PROVIDER_ANALYTICS: '/provider/analytics',
  
  // Admin routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PROVIDERS: '/admin/providers',
  ADMIN_PATIENTS: '/admin/patients',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_WAITLIST: '/admin/waitlist',
  
  // Shared routes
  DASHBOARD: '/dashboard',
  PATIENTS: '/patients',
  PROVIDERS: '/providers',
  APPOINTMENTS: '/appointments',
  SCHEDULE: '/schedule',
  ANALYTICS: '/analytics',
  WAITLIST: '/waitlist',
  SETTINGS: '/settings'
} as const

export type Route = typeof ROUTES[keyof typeof ROUTES]

// Route permissions mapping
export const ROUTE_PERMISSIONS = {
  [ROUTES.PATIENT_DASHBOARD]: ['read:own_profile'],
  [ROUTES.PATIENT_APPOINTMENTS]: ['read:own_appointments'],
  [ROUTES.PATIENT_PROFILE]: ['read:own_profile'],
  [ROUTES.PATIENT_MESSAGES]: ['read:own_profile'],
  [ROUTES.PATIENT_BOOKING]: ['book:appointments'],
  
  [ROUTES.PROVIDER_DASHBOARD]: ['read:patients'],
  [ROUTES.PROVIDER_SCHEDULE]: ['manage:schedule'],
  [ROUTES.PROVIDER_PATIENTS]: ['read:patients'],
  [ROUTES.PROVIDER_ANALYTICS]: ['generate:reports'],
  
  [ROUTES.ADMIN_DASHBOARD]: ['system:administration'],
  [ROUTES.ADMIN_PROVIDERS]: ['manage:providers'],
  [ROUTES.ADMIN_PATIENTS]: ['view:all_patients'],
  [ROUTES.ADMIN_SETTINGS]: ['manage:practice_settings'],
  [ROUTES.ADMIN_ANALYTICS]: ['view:analytics'],
  [ROUTES.ADMIN_WAITLIST]: ['manage:waitlists']
} as const