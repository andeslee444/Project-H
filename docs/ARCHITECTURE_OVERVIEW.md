# MindfulMatch System Architecture Overview

## System Overview

MindfulMatch is a comprehensive mental health practice scheduling and waitlist management system designed with HIPAA compliance, scalability, and maintainability in mind.

## Architecture Principles

### 1. Feature-First Organization
- Code organized by business features, not technical layers
- Each feature is self-contained with its own components, hooks, services, and types
- Promotes team ownership and reduces coupling

### 2. Clean Architecture Layers
```
┌─────────────────────────────────────┐
│         Presentation Layer          │  ← Components, Pages, UI
├─────────────────────────────────────┤
│        Business Logic Layer        │  ← Hooks, Services, State
├─────────────────────────────────────┤
│           Data Layer               │  ← Repositories, API, Cache
├─────────────────────────────────────┤
│        Infrastructure Layer        │  ← Supabase, External APIs
└─────────────────────────────────────┘
```

### 3. Dependency Inversion
- Higher-level modules don't depend on lower-level modules
- Both depend on abstractions (interfaces)
- Enables easy testing and swapping of implementations

## Core Systems

### Authentication System

```typescript
// Authentication Strategy Pattern
interface AuthService {
  signIn(email: string, password: string): Promise<AuthResult>
  signOut(): Promise<void>
  getCurrentUser(): Promise<User | null>
  onAuthStateChange(callback: AuthCallback): Unsubscribe
}

// Multiple implementations for different environments
class SupabaseAuthService implements AuthService { /* Production */ }
class DemoAuthService implements AuthService { /* Demo/Development */ }
class MockAuthService implements AuthService { /* Testing */ }
```

**Benefits:**
- Environment-appropriate authentication
- Easy to test and mock
- Demo mode as first-class feature
- Type-safe role-based access control

### Data Access Layer

```typescript
// Repository Pattern for type-safe database operations
interface PatientRepository {
  findById(id: string): Promise<Patient>
  findAll(filters?: PatientFilters): Promise<Patient[]>
  create(patient: CreatePatientDto): Promise<Patient>
  update(id: string, updates: UpdatePatientDto): Promise<Patient>
  delete(id: string): Promise<void>
}

// Implementation with Supabase
class SupabasePatientRepository implements PatientRepository {
  async findById(id: string): Promise<Patient> {
    const { data, error } = await this.supabase
      .from('patients')
      .select('*')
      .eq('patient_id', id)
      .single()
    
    if (error) throw new DatabaseError(error.message)
    return PatientSchema.parse(data) // Zod validation
  }
}
```

**Benefits:**
- Database-agnostic business logic
- Type safety with runtime validation
- Consistent error handling
- Easy to test and mock
- Centralized query optimization

### State Management Architecture

```typescript
// Client State (Zustand)
interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
}

// Server State (TanStack Query)
const usePatients = (filters?: PatientFilters) => {
  return useQuery({
    queryKey: ['patients', filters],
    queryFn: () => patientRepository.findAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// UI State (Component State)
const [isModalOpen, setIsModalOpen] = useState(false)
```

**Benefits:**
- Clear separation of concerns
- Optimistic updates
- Background refetching
- Intelligent caching
- DevTools integration

## Security Architecture

### HIPAA Compliance

```typescript
// Data encryption for sensitive fields
interface EncryptedPatientData {
  id: string
  encryptedSSN: string
  encryptedDOB: string
  encryptedPhone: string
  // ... other encrypted fields
}

// Audit logging for all data access
interface AuditLog {
  userId: string
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'
  resource: string
  resourceId: string
  timestamp: Date
  ipAddress: string
}
```

### Role-Based Access Control

```typescript
enum UserRole {
  PATIENT = 'patient',
  PROVIDER = 'provider',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

enum Permission {
  READ_PATIENTS = 'read:patients',
  WRITE_PATIENTS = 'write:patients',
  READ_ALL_APPOINTMENTS = 'read:all_appointments',
  MANAGE_PROVIDERS = 'manage:providers'
}

const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.PATIENT]: [
    Permission.READ_OWN_APPOINTMENTS,
    Permission.UPDATE_OWN_PROFILE
  ],
  [UserRole.PROVIDER]: [
    Permission.READ_PATIENTS,
    Permission.READ_ALL_APPOINTMENTS,
    Permission.MANAGE_SCHEDULE
  ],
  // ... other roles
}
```

## Performance Architecture

### Code Splitting Strategy

```typescript
// Route-based splitting
const Dashboard = lazy(() => import('../features/dashboard'))
const Patients = lazy(() => import('../features/patients'))
const Appointments = lazy(() => import('../features/appointments'))

// Component-based splitting for large features
const PatientForm = lazy(() => import('./PatientForm'))
const AppointmentCalendar = lazy(() => import('./AppointmentCalendar'))
```

### Caching Strategy

```typescript
// Multi-level caching
interface CacheStrategy {
  // L1: Component-level cache (React state)
  componentCache: Map<string, any>
  
  // L2: Application cache (TanStack Query)
  queryCache: QueryCache
  
  // L3: Browser cache (Service Worker)
  browserCache: Cache
  
  // L4: CDN cache (GitHub Pages)
  cdnCache: EdgeCache
}
```

## Component Architecture

### Design System Hierarchy

```
UI Components (Primitive)
├── Button, Input, Card, Modal
├── Accessible by default
├── Theme-aware
└── Consistent API

Composition Components (Complex)
├── DataTable, Form, SearchBox
├── Built from primitives
├── Configurable behavior
└── Business logic abstractions

Domain Components (Feature-specific)
├── PatientCard, AppointmentSlot
├── Business context aware
├── Feature-specific logic
└── Integration with services
```

### Component Communication

```typescript
// Props down, events up
interface PatientCardProps {
  patient: Patient
  onEdit: (patient: Patient) => void
  onDelete: (patientId: string) => void
  onViewDetails: (patientId: string) => void
}

// Context for deeply nested data
const PatientContext = createContext<{
  currentPatient: Patient | null
  updatePatient: (updates: Partial<Patient>) => void
}>()

// Global state for app-wide data
const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  signIn: async (email, password) => {
    const user = await authService.signIn(email, password)
    set({ user, isAuthenticated: true })
  }
}))
```

## Error Handling Architecture

### Error Boundary System

```typescript
// Global error boundary
class GlobalErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to monitoring service
    errorLogger.log(error, errorInfo)
    
    // Show user-friendly error
    this.setState({ hasError: true })
  }
}

// Feature-specific error boundaries
const PatientFeatureErrorBoundary = ({ children }) => (
  <ErrorBoundary fallback={<PatientErrorFallback />}>
    {children}
  </ErrorBoundary>
)
```

### Error Types

```typescript
// Hierarchical error types
abstract class AppError extends Error {
  abstract readonly code: string
  abstract readonly statusCode: number
}

class ValidationError extends AppError {
  code = 'VALIDATION_ERROR'
  statusCode = 400
}

class DatabaseError extends AppError {
  code = 'DATABASE_ERROR'
  statusCode = 500
}

class AuthenticationError extends AppError {
  code = 'AUTHENTICATION_ERROR'
  statusCode = 401
}
```

## Demo Mode Architecture

### Demo as Configuration

```typescript
// Environment-based demo configuration
interface DemoConfig {
  enabled: boolean
  credentials: DemoCredentials[]
  sampleData: SampleDataSets
  features: FeatureFlags
}

const demoConfig: DemoConfig = {
  enabled: process.env.NODE_ENV !== 'production',
  credentials: [
    {
      role: 'patient',
      email: 'patient@example.com',
      password: 'demopassword123',
      profile: { /* ... */ }
    }
    // ... other demo users
  ],
  sampleData: {
    patients: generateSamplePatients(),
    appointments: generateSampleAppointments(),
    // ... other sample data
  },
  features: {
    patientMatching: true,
    waitlistAnalytics: true,
    // ... feature flags
  }
}
```

## Testing Architecture

### Testing Strategy

```typescript
// Unit tests for business logic
describe('PatientService', () => {
  it('should create patient with valid data', async () => {
    const mockRepo = createMockPatientRepository()
    const service = new PatientService(mockRepo)
    
    const patient = await service.createPatient(validPatientData)
    
    expect(patient).toMatchObject(expectedPatient)
  })
})

// Integration tests for features
describe('Patient Management Feature', () => {
  it('should allow provider to create and edit patients', async () => {
    await userEvent.click(screen.getByRole('button', { name: /add patient/i }))
    
    // Fill form and submit
    await userEvent.type(screen.getByLabelText(/first name/i), 'John')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    
    expect(screen.getByText('John')).toBeInTheDocument()
  })
})

// E2E tests for critical workflows
test('Provider can schedule appointment for patient', async ({ page }) => {
  await page.goto('/dashboard')
  await page.click('[data-testid="schedule-appointment"]')
  
  // Select patient and time slot
  await page.selectOption('[data-testid="patient-select"]', 'patient-123')
  await page.click('[data-testid="time-slot-2pm"]')
  await page.click('[data-testid="confirm-appointment"]')
  
  await expect(page.getByText('Appointment scheduled')).toBeVisible()
})
```

## Deployment Architecture

### Multi-Environment Strategy

```typescript
// Environment-specific configurations
const environments = {
  development: {
    supabaseUrl: 'http://localhost:54321',
    enableDemo: true,
    logLevel: 'debug'
  },
  staging: {
    supabaseUrl: 'https://staging-project.supabase.co',
    enableDemo: true,
    logLevel: 'info'
  },
  production: {
    supabaseUrl: 'https://qjsktpjgfwtgpnmsonrq.supabase.co',
    enableDemo: false,
    logLevel: 'error'
  },
  'github-pages': {
    supabaseUrl: 'https://qjsktpjgfwtgpnmsonrq.supabase.co',
    enableDemo: true, // Demo mode for public showcase
    logLevel: 'warn'
  }
}
```

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
      - name: Install dependencies
        run: npm ci
      - name: Type check
        run: npm run type-check
      - name: Lint
        run: npm run lint
      - name: Unit tests
        run: npm run test:unit
      - name: Integration tests
        run: npm run test:integration
      - name: E2E tests
        run: npm run test:e2e
      - name: Security audit
        run: npm audit
      - name: Performance audit
        run: npm run lighthouse-ci

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Build and deploy
        run: npm run build && npm run deploy
```

## Monitoring & Observability

### Performance Monitoring

```typescript
// Real User Monitoring
const performanceMonitor = {
  trackPageLoad: (page: string, loadTime: number) => {
    analytics.track('Page Load', { page, loadTime })
  },
  
  trackUserInteraction: (action: string, element: string) => {
    analytics.track('User Interaction', { action, element })
  },
  
  trackError: (error: Error, context: string) => {
    errorLogger.log(error, { context, userId: getCurrentUserId() })
  }
}

// Core Web Vitals tracking
const reportWebVitals = (metric: Metric) => {
  switch (metric.name) {
    case 'CLS':
    case 'FID':
    case 'FCP':
    case 'LCP':
    case 'TTFB':
      performanceMonitor.trackWebVital(metric.name, metric.value)
      break
  }
}
```

## Conclusion

This architecture provides:

1. **Maintainability**: Clear separation of concerns and feature-based organization
2. **Scalability**: Modular design that grows with the application
3. **Security**: HIPAA-compliant by design with comprehensive audit trails
4. **Performance**: Optimized loading and caching strategies
5. **Testability**: Comprehensive testing strategy at all levels
6. **Developer Experience**: Type safety, clear APIs, and excellent tooling
7. **Demo Mode**: First-class support for showcasing the application

The modular architecture enables easy interface upgrades and database changes while maintaining security and compliance standards required for healthcare applications.

**Next Steps**: Begin implementation following the phases outlined in the refactoring plan.