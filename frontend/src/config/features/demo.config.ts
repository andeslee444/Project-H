import type { DemoConfig, DemoCredentials, PracticeData, Environment } from '../index'
import { USER_ROLES, PERMISSIONS, ROLE_PERMISSIONS } from '../constants/roles'

export const DEMO_CREDENTIALS: readonly DemoCredentials[] = [
  {
    email: 'patient@example.com',
    password: 'demopassword123',
    role: USER_ROLES.PATIENT,
    profile: {
      id: 'demo-patient-001',
      firstName: 'Demo',
      lastName: 'Patient'
    },
    permissions: ROLE_PERMISSIONS[USER_ROLES.PATIENT]
  },
  {
    email: 'provider@example.com',
    password: 'demopassword123',
    role: USER_ROLES.PROVIDER,
    profile: {
      id: 'demo-provider-001',
      firstName: 'Dr. Sarah',
      lastName: 'Johnson'
    },
    permissions: ROLE_PERMISSIONS[USER_ROLES.PROVIDER]
  },
  {
    email: 'admin@example.com',
    password: 'demopassword123',
    role: USER_ROLES.ADMIN,
    profile: {
      id: 'demo-admin-001',
      firstName: 'Demo',
      lastName: 'Administrator'
    },
    permissions: ROLE_PERMISSIONS[USER_ROLES.ADMIN]
  }
] as const

export const DEMO_PRACTICE_DATA: PracticeData = {
  name: 'MindfulMatch Demo Practice',
  address: {
    street: '456 Healthcare Boulevard, Suite 200',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102'
  },
  phone: '(555) 123-MIND'
} as const

export function getDemoConfig(environment: Environment): DemoConfig {
  if (environment === 'development' || environment === 'github-pages' || environment === 'test') {
    return {
      credentials: DEMO_CREDENTIALS as any,
      practiceData: DEMO_PRACTICE_DATA
    }
  }
  
  // Return empty config for production
  return {
    credentials: [],
    practiceData: {} as PracticeData
  }
}