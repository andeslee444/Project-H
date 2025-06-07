# Demo Credentials Specification

## Overview

This document defines the demo credentials system for MindfulMatch, providing a secure and maintainable way to showcase the application with realistic sample data.

## Current Implementation Issues

1. **Hardcoded credentials** in Login.jsx component
2. **Environment detection logic** scattered across files
3. **Demo mode as workaround** rather than first-class feature
4. **Mixed authentication patterns** making it hard to maintain

## Target Implementation

### Configuration-Based Demo System

```typescript
// config/demo.config.ts
export interface DemoCredential {
  readonly email: string
  readonly password: string
  readonly role: UserRole
  readonly profile: UserProfile
  readonly permissions: Permission[]
}

export const DEMO_CREDENTIALS: readonly DemoCredential[] = [
  {
    email: 'patient@example.com',
    password: 'demopassword123',
    role: UserRole.PATIENT,
    profile: {
      id: 'demo-patient-001',
      firstName: 'Demo',
      lastName: 'Patient',
      dateOfBirth: '1990-01-15',
      phone: '(555) 123-4567',
      email: 'patient@example.com',
      address: {
        street: '123 Demo Street',
        city: 'Sample City',
        state: 'CA',
        zipCode: '90210'
      },
      emergencyContact: {
        name: 'Emergency Contact',
        phone: '(555) 987-6543',
        relationship: 'Family'
      },
      insuranceProvider: 'Demo Insurance Co.',
      preferredLanguage: 'English',
      communicationPreferences: {
        email: true,
        sms: false,
        phone: true
      }
    },
    permissions: [
      Permission.READ_OWN_PROFILE,
      Permission.UPDATE_OWN_PROFILE,
      Permission.READ_OWN_APPOINTMENTS,
      Permission.BOOK_APPOINTMENTS,
      Permission.VIEW_WAITLIST_STATUS
    ]
  },
  {
    email: 'provider@example.com',
    password: 'demopassword123',
    role: UserRole.PROVIDER,
    profile: {
      id: 'demo-provider-001',
      firstName: 'Dr. Sarah',
      lastName: 'Johnson',
      title: 'Clinical Psychologist',
      email: 'provider@example.com',
      phone: '(555) 234-5678',
      licenseNumber: 'PSY12345',
      specialties: [
        'Anxiety Disorders',
        'Depression',
        'Trauma Therapy',
        'Cognitive Behavioral Therapy'
      ],
      languages: ['English', 'Spanish'],
      education: [
        {
          degree: 'Ph.D. in Clinical Psychology',
          institution: 'Stanford University',
          year: 2015
        },
        {
          degree: 'M.A. in Psychology',
          institution: 'UC Berkeley',
          year: 2012
        }
      ],
      experience: '8 years',
      bio: 'Dr. Johnson specializes in evidence-based treatments for anxiety and mood disorders. She has extensive experience working with adults and adolescents in both individual and group therapy settings.',
      availability: {
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '15:00' }
      },
      maxPatientsPerDay: 8,
      sessionDuration: 50, // minutes
      telehealth: true
    },
    permissions: [
      Permission.READ_PATIENTS,
      Permission.CREATE_PATIENTS,
      Permission.UPDATE_PATIENTS,
      Permission.READ_ALL_APPOINTMENTS,
      Permission.MANAGE_SCHEDULE,
      Permission.VIEW_WAITLIST,
      Permission.MANAGE_PATIENT_NOTES,
      Permission.GENERATE_REPORTS
    ]
  },
  {
    email: 'admin@example.com',
    password: 'demopassword123',
    role: UserRole.ADMIN,
    profile: {
      id: 'demo-admin-001',
      firstName: 'Demo',
      lastName: 'Administrator',
      title: 'Practice Administrator',
      email: 'admin@example.com',
      phone: '(555) 345-6789',
      department: 'Administration',
      practiceId: 'demo-practice-001',
      startDate: '2020-01-15',
      responsibilities: [
        'Staff Management',
        'Billing & Insurance',
        'Compliance Oversight',
        'System Administration'
      ]
    },
    permissions: [
      Permission.MANAGE_PROVIDERS,
      Permission.MANAGE_STAFF,
      Permission.VIEW_ALL_PATIENTS,
      Permission.MANAGE_PRACTICE_SETTINGS,
      Permission.VIEW_ANALYTICS,
      Permission.MANAGE_BILLING,
      Permission.EXPORT_DATA,
      Permission.MANAGE_WAITLISTS,
      Permission.SYSTEM_ADMINISTRATION
    ]
  }
] as const

export const DEMO_PRACTICE_DATA = {
  practice: {
    id: 'demo-practice-001',
    name: 'MindfulMatch Demo Practice',
    address: {
      street: '456 Healthcare Boulevard',
      suite: 'Suite 200',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102'
    },
    phone: '(555) 123-MIND',
    email: 'info@mindfulmathdemo.com',
    website: 'https://mindfulmathdemo.com',
    established: '2018',
    description: 'A comprehensive mental health practice focused on providing accessible, high-quality care through innovative scheduling and patient management solutions.',
    services: [
      'Individual Therapy',
      'Group Therapy',
      'Family Counseling',
      'Psychiatric Evaluations',
      'Crisis Intervention',
      'Telehealth Services'
    ],
    insuranceAccepted: [
      'Blue Cross Blue Shield',
      'Aetna',
      'Cigna',
      'United Healthcare',
      'Medicare',
      'Medicaid'
    ],
    languages: ['English', 'Spanish', 'French', 'Mandarin'],
    certifications: [
      'HIPAA Compliant',
      'CARF Accredited',
      'Joint Commission Certified'
    ]
  }
} as const
```

### Demo Authentication Service

```typescript
// features/auth/services/DemoAuthService.ts
export class DemoAuthService implements AuthService {
  private currentUser: User | null = null
  private listeners: AuthCallback[] = []

  async signIn(email: string, password: string): Promise<AuthResult> {
    const credential = DEMO_CREDENTIALS.find(
      cred => cred.email === email && cred.password === password
    )

    if (!credential) {
      throw new AuthenticationError('Invalid demo credentials')
    }

    const user = this.createUserFromCredential(credential)
    this.setCurrentUser(user)

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500))

    return {
      success: true,
      user,
      session: this.createDemoSession(user)
    }
  }

  async signOut(): Promise<void> {
    this.setCurrentUser(null)
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser
  }

  onAuthStateChange(callback: AuthCallback): Unsubscribe {
    this.listeners.push(callback)
    
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private createUserFromCredential(credential: DemoCredential): User {
    return {
      id: credential.profile.id,
      email: credential.email,
      role: credential.role,
      profile: credential.profile,
      permissions: credential.permissions,
      isDemo: true, // Flag to identify demo users
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }
  }

  private createDemoSession(user: User): Session {
    return {
      accessToken: `demo-token-${user.id}`,
      refreshToken: `demo-refresh-${user.id}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      user
    }
  }

  private setCurrentUser(user: User | null): void {
    this.currentUser = user
    this.notifyListeners(user)
  }

  private notifyListeners(user: User | null): void {
    this.listeners.forEach(callback => {
      callback(user ? 'SIGNED_IN' : 'SIGNED_OUT', { user })
    })
  }
}
```

### Environment-Aware Auth Provider

```typescript
// features/auth/providers/AuthProvider.tsx
interface AuthProviderProps {
  children: React.ReactNode
  config?: AuthConfig
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  config = getAuthConfig() 
}) => {
  // Select appropriate auth service based on environment
  const authService = useMemo(() => {
    switch (config.mode) {
      case 'demo':
        return new DemoAuthService()
      case 'production':
        return new SupabaseAuthService(config.supabase)
      case 'mock':
        return new MockAuthService()
      default:
        throw new Error(`Unsupported auth mode: ${config.mode}`)
    }
  }, [config])

  const [state, dispatch] = useReducer(authReducer, initialAuthState)

  useEffect(() => {
    // Initialize auth state
    authService.getCurrentUser().then(user => {
      dispatch({ type: 'SET_USER', payload: user })
    })

    // Listen for auth state changes
    const unsubscribe = authService.onAuthStateChange((event, data) => {
      switch (event) {
        case 'SIGNED_IN':
          dispatch({ type: 'SET_USER', payload: data.user })
          break
        case 'SIGNED_OUT':
          dispatch({ type: 'CLEAR_USER' })
          break
        case 'SESSION_EXPIRED':
          dispatch({ type: 'SESSION_EXPIRED' })
          break
      }
    })

    return unsubscribe
  }, [authService])

  const contextValue = useMemo(() => ({
    ...state,
    authService,
    signIn: authService.signIn.bind(authService),
    signOut: authService.signOut.bind(authService),
    isDemo: config.mode === 'demo'
  }), [state, authService, config.mode])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
```

### Configuration Detection

```typescript
// config/auth.config.ts
export interface AuthConfig {
  mode: 'demo' | 'production' | 'mock'
  supabase?: SupabaseConfig
  demo?: DemoConfig
}

export function getAuthConfig(): AuthConfig {
  // Environment-based configuration
  if (process.env.NODE_ENV === 'test') {
    return { mode: 'mock' }
  }

  // Demo mode for development and GitHub Pages
  if (
    process.env.NODE_ENV === 'development' ||
    window.location.hostname.includes('github.io') ||
    window.location.search.includes('demo=true')
  ) {
    return {
      mode: 'demo',
      demo: {
        credentials: DEMO_CREDENTIALS,
        practiceData: DEMO_PRACTICE_DATA
      }
    }
  }

  // Production mode with Supabase
  return {
    mode: 'production',
    supabase: {
      url: process.env.VITE_SUPABASE_URL!,
      anonKey: process.env.VITE_SUPABASE_ANON_KEY!
    }
  }
}
```

## Demo Data Management

### Sample Data Generation

```typescript
// config/demo-data.ts
export const generateDemoAppointments = (): Appointment[] => [
  {
    id: 'demo-apt-001',
    patientId: 'demo-patient-001',
    providerId: 'demo-provider-001',
    startTime: '2024-06-10T14:00:00Z',
    endTime: '2024-06-10T14:50:00Z',
    type: 'individual',
    status: 'scheduled',
    modality: 'in-person',
    notes: 'Follow-up session for anxiety management',
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2024-06-01T10:00:00Z'
  },
  // ... more sample appointments
]

export const generateDemoWaitlist = (): WaitlistEntry[] => [
  {
    id: 'demo-wait-001',
    patientId: 'demo-patient-002',
    waitlistId: 'demo-waitlist-001',
    priority: 'high',
    preferredTimes: ['morning', 'afternoon'],
    maxWaitDays: 14,
    createdAt: '2024-06-01T09:00:00Z',
    estimatedWaitTime: '5-7 days'
  },
  // ... more waitlist entries
]
```

### Demo Mode Indicators

```typescript
// shared/components/ui/DemoModeIndicator.tsx
export const DemoModeIndicator: React.FC = () => {
  const { isDemo } = useAuth()

  if (!isDemo) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium z-50">
      <span className="inline-flex items-center gap-2">
        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
        Demo Mode - Using sample data for demonstration purposes
        <button 
          onClick={() => window.location.search = ''}
          className="underline hover:no-underline"
        >
          Exit Demo
        </button>
      </span>
    </div>
  )
}
```

## Security Considerations

### Demo Data Isolation

```typescript
// lib/security/demo-isolation.ts
export class DemoDataIsolation {
  static validateDemoAccess(user: User): void {
    if (user.isDemo && !this.isInDemoMode()) {
      throw new SecurityError('Demo users cannot access production data')
    }
  }

  static sanitizeDemoData<T>(data: T[]): T[] {
    // Remove any sensitive demo data before returning
    return data.filter(item => this.isDemoSafe(item))
  }

  private static isInDemoMode(): boolean {
    return getAuthConfig().mode === 'demo'
  }

  private static isDemoSafe(data: any): boolean {
    // Validate that data is safe for demo display
    return !data.containsRealPatientData
  }
}
```

### Demo User Permissions

```typescript
// lib/security/demo-permissions.ts
export const DEMO_PERMISSION_RESTRICTIONS = {
  // Demo users cannot perform these actions
  RESTRICTED_ACTIONS: [
    'DELETE_PATIENT_DATA',
    'EXPORT_PATIENT_DATA',
    'MODIFY_BILLING_INFO',
    'ACCESS_REAL_PATIENT_DATA'
  ],

  // Demo users have limited data access
  DATA_LIMITS: {
    maxPatients: 50,
    maxAppointments: 200,
    maxWaitlistEntries: 25,
    dataRetentionDays: 0 // No persistent storage
  }
} as const
```

## Testing Strategy

### Demo Credentials Testing

```typescript
// features/auth/__tests__/demo-auth.test.ts
describe('Demo Authentication', () => {
  let demoAuthService: DemoAuthService

  beforeEach(() => {
    demoAuthService = new DemoAuthService()
  })

  describe('valid demo credentials', () => {
    test.each(DEMO_CREDENTIALS)(
      'should authenticate %s successfully',
      async (credential) => {
        const result = await demoAuthService.signIn(
          credential.email,
          credential.password
        )

        expect(result.success).toBe(true)
        expect(result.user.role).toBe(credential.role)
        expect(result.user.isDemo).toBe(true)
      }
    )
  })

  it('should reject invalid credentials', async () => {
    await expect(
      demoAuthService.signIn('invalid@example.com', 'wrongpassword')
    ).rejects.toThrow(AuthenticationError)
  })

  it('should maintain user session', async () => {
    await demoAuthService.signIn('patient@example.com', 'demopassword123')
    
    const currentUser = await demoAuthService.getCurrentUser()
    expect(currentUser).not.toBeNull()
    expect(currentUser?.email).toBe('patient@example.com')
  })
})
```

## Documentation Updates

### User Guide Updates

```markdown
# Demo Credentials

MindfulMatch provides three demo accounts for exploring different user roles:

## Patient Account
- **Email**: patient@example.com
- **Password**: demopassword123
- **Features**: Book appointments, view medical history, manage profile

## Healthcare Provider Account  
- **Email**: provider@example.com
- **Password**: demopassword123
- **Features**: Manage patient schedules, view appointments, access analytics

## Practice Administrator Account
- **Email**: admin@example.com  
- **Password**: demopassword123
- **Features**: Full system access, user management, practice settings

All demo accounts use sample data that resets periodically. No real patient information is stored or accessed in demo mode.
```

## Migration Plan

### Phase 1: Configuration Setup
1. Create demo configuration files
2. Implement AuthService interface
3. Create DemoAuthService implementation

### Phase 2: Integration
1. Update AuthProvider to use new service
2. Migrate ProtectedRoute to use config-based detection
3. Remove hardcoded credentials from components

### Phase 3: Enhancement
1. Add demo mode indicators
2. Implement sample data generation
3. Add demo-specific restrictions

### Phase 4: Testing & Documentation
1. Comprehensive testing of demo flows
2. Update user documentation
3. Security audit of demo implementation

## Benefits of New Implementation

1. **Maintainability**: Centralized credential management
2. **Security**: Proper isolation and validation
3. **Flexibility**: Easy to add new demo users or modify existing ones
4. **Testability**: Clean interfaces enable comprehensive testing
5. **Documentation**: Self-documenting configuration
6. **User Experience**: Clear demo mode indicators and restrictions

This approach transforms demo mode from a workaround into a first-class feature that enhances the application's ability to showcase its capabilities while maintaining security and code quality standards.