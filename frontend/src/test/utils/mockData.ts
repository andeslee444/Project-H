import type { PracticeData, Address, UserProfile, DemoCredentials } from '@config/index'
import { USER_ROLES, ROLE_PERMISSIONS } from '@config/constants/roles'

// Mock address data that satisfies TypeScript strict mode
export const mockAddress: Address = {
  street: '123 Test Street',
  city: 'Test City',
  state: 'TS',
  zipCode: '12345'
}

// Mock practice data that satisfies all required fields
export const mockPracticeData: PracticeData = {
  name: 'Test Practice',
  address: mockAddress,
  phone: '555-123-4567'
}

// Mock user profiles
export const mockPatientProfile: UserProfile = {
  id: 'test-patient-001',
  firstName: 'Test',
  lastName: 'Patient'
}

export const mockProviderProfile: UserProfile = {
  id: 'test-provider-001',
  firstName: 'Test',
  lastName: 'Provider'
}

export const mockAdminProfile: UserProfile = {
  id: 'test-admin-001',
  firstName: 'Test',
  lastName: 'Admin'
}

// Mock demo credentials
export const mockDemoCredentials: DemoCredentials[] = [
  {
    email: 'test-patient@example.com',
    password: 'testpassword123',
    role: USER_ROLES.PATIENT,
    profile: mockPatientProfile,
    permissions: ROLE_PERMISSIONS[USER_ROLES.PATIENT]
  },
  {
    email: 'test-provider@example.com',
    password: 'testpassword123',
    role: USER_ROLES.PROVIDER,
    profile: mockProviderProfile,
    permissions: ROLE_PERMISSIONS[USER_ROLES.PROVIDER]
  },
  {
    email: 'test-admin@example.com',
    password: 'testpassword123',
    role: USER_ROLES.ADMIN,
    profile: mockAdminProfile,
    permissions: ROLE_PERMISSIONS[USER_ROLES.ADMIN]
  }
]

// Mock session data
export const mockSession = {
  user: {
    id: 'test-user-001',
    email: 'test@example.com',
    role: USER_ROLES.PATIENT as const,
    profile: mockPatientProfile,
    permissions: ROLE_PERMISSIONS[USER_ROLES.PATIENT],
    isDemo: false,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  },
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_at: Date.now() + 3600000 // 1 hour from now
}

// Mock appointment data
export const mockAppointment = {
  id: 'test-appointment-001',
  patientId: 'test-patient-001',
  providerId: 'test-provider-001',
  dateTime: new Date().toISOString(),
  duration: 60,
  type: 'initial-consultation' as const,
  status: 'scheduled' as const,
  notes: 'Test appointment notes',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// Mock waitlist entry
export const mockWaitlistEntry = {
  id: 'test-waitlist-001',
  patientId: 'test-patient-001',
  preferences: {
    timeSlots: ['morning', 'afternoon'] as const[],
    providers: ['test-provider-001'],
    appointmentType: 'initial-consultation' as const
  },
  priority: 1,
  status: 'active' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}