export const USER_ROLES = {
  PATIENT: 'patient',
  PROVIDER: 'provider',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

export const PERMISSIONS = {
  // Patient permissions
  READ_OWN_PROFILE: 'read:own_profile',
  UPDATE_OWN_PROFILE: 'update:own_profile',
  READ_OWN_APPOINTMENTS: 'read:own_appointments',
  BOOK_APPOINTMENTS: 'book:appointments',
  VIEW_WAITLIST_STATUS: 'view:waitlist_status',
  
  // Provider permissions
  READ_PATIENTS: 'read:patients',
  CREATE_PATIENTS: 'create:patients',
  UPDATE_PATIENTS: 'update:patients',
  READ_ALL_APPOINTMENTS: 'read:all_appointments',
  MANAGE_SCHEDULE: 'manage:schedule',
  VIEW_WAITLIST: 'view:waitlist',
  MANAGE_PATIENT_NOTES: 'manage:patient_notes',
  GENERATE_REPORTS: 'generate:reports',
  
  // Admin permissions
  MANAGE_PROVIDERS: 'manage:providers',
  MANAGE_STAFF: 'manage:staff',
  VIEW_ALL_PATIENTS: 'view:all_patients',
  MANAGE_PRACTICE_SETTINGS: 'manage:practice_settings',
  VIEW_ANALYTICS: 'view:analytics',
  MANAGE_BILLING: 'manage:billing',
  EXPORT_DATA: 'export:data',
  MANAGE_WAITLISTS: 'manage:waitlists',
  SYSTEM_ADMINISTRATION: 'system:administration'
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [USER_ROLES.PATIENT]: [
    PERMISSIONS.READ_OWN_PROFILE,
    PERMISSIONS.UPDATE_OWN_PROFILE,
    PERMISSIONS.READ_OWN_APPOINTMENTS,
    PERMISSIONS.BOOK_APPOINTMENTS,
    PERMISSIONS.VIEW_WAITLIST_STATUS
  ],
  [USER_ROLES.PROVIDER]: [
    PERMISSIONS.READ_PATIENTS,
    PERMISSIONS.CREATE_PATIENTS,
    PERMISSIONS.UPDATE_PATIENTS,
    PERMISSIONS.READ_ALL_APPOINTMENTS,
    PERMISSIONS.MANAGE_SCHEDULE,
    PERMISSIONS.VIEW_WAITLIST,
    PERMISSIONS.MANAGE_PATIENT_NOTES,
    PERMISSIONS.GENERATE_REPORTS
  ],
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_PROVIDERS,
    PERMISSIONS.MANAGE_STAFF,
    PERMISSIONS.VIEW_ALL_PATIENTS,
    PERMISSIONS.MANAGE_PRACTICE_SETTINGS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_BILLING,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.MANAGE_WAITLISTS,
    PERMISSIONS.SYSTEM_ADMINISTRATION
  ],
  [USER_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS)
}