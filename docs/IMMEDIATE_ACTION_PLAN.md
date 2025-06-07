# Immediate Action Plan - Project-H Refactoring

## Overview

This document provides the immediate next steps to begin the comprehensive refactoring of the MindfulMatch system. The plan is designed to be executed in small, manageable chunks while maintaining the current functionality.

## Phase 1: Foundation Setup (Next 2 Weeks)

### Week 1: Project Structure & Configuration

#### Day 1-2: New Folder Structure
```bash
# Create new folder structure
mkdir -p frontend/src/{features,shared,lib,config}
mkdir -p frontend/src/features/{auth,dashboard,patients,providers,appointments,waitlist,analytics}
mkdir -p frontend/src/shared/{components,hooks,services,types,utils,constants}
mkdir -p frontend/src/lib/{database,api,state,security,performance}
mkdir -p frontend/src/config/{environments,features,constants}

# Create feature-specific subfolders
for feature in auth dashboard patients providers appointments waitlist analytics; do
  mkdir -p frontend/src/features/$feature/{components,hooks,services,types,config}
done

# Create shared component categories
mkdir -p frontend/src/shared/components/{ui,domain,layout}
mkdir -p frontend/src/shared/components/ui/{primitives,compositions}
```

**Checklist:**
- [ ] Create new folder structure
- [ ] Move existing files to new locations (maintain imports temporarily)
- [ ] Update import paths gradually
- [ ] Ensure all builds still work

#### Day 3: TypeScript Configuration

```typescript
// tsconfig.json - Update with strict settings
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    
    // Path mapping for clean imports
    "baseUrl": "./src",
    "paths": {
      "@features/*": ["features/*"],
      "@shared/*": ["shared/*"],
      "@lib/*": ["lib/*"],
      "@config/*": ["config/*"],
      "@ui/*": ["shared/components/ui/*"]
    }
  }
}
```

**Checklist:**
- [ ] Update TypeScript to strict mode
- [ ] Add path mapping for clean imports
- [ ] Fix all TypeScript errors (expect 20-30 initially)
- [ ] Update Vite config for path resolution

#### Day 4-5: Configuration System

```typescript
// config/index.ts - Main configuration entry point
export interface AppConfig {
  auth: AuthConfig
  database: DatabaseConfig
  features: FeatureFlags
  demo: DemoConfig
  environment: Environment
}

export const getConfig = (): AppConfig => {
  const environment = detectEnvironment()
  
  return {
    auth: getAuthConfig(environment),
    database: getDatabaseConfig(environment),
    features: getFeatureFlags(environment),
    demo: getDemoConfig(environment),
    environment
  }
}

// config/environments/index.ts
export type Environment = 'development' | 'production' | 'github-pages' | 'test'

export const detectEnvironment = (): Environment => {
  if (process.env.NODE_ENV === 'test') return 'test'
  if (window.location.hostname.includes('github.io')) return 'github-pages'
  if (process.env.NODE_ENV === 'development') return 'development'
  return 'production'
}
```

**Checklist:**
- [ ] Create configuration system
- [ ] Implement environment detection
- [ ] Move demo credentials to config
- [ ] Create feature flags system

### Week 2: Development Infrastructure

#### Day 6-7: Testing Infrastructure

```bash
# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @playwright/test msw
npm install -D @storybook/react @storybook/addon-essentials
```

```typescript
// vitest.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true
  },
  resolve: {
    alias: {
      '@features': path.resolve(__dirname, './src/features'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@config': path.resolve(__dirname, './src/config'),
    }
  }
})
```

**Checklist:**
- [ ] Set up Vitest for unit tests
- [ ] Configure Testing Library
- [ ] Set up Playwright for E2E tests
- [ ] Configure MSW for API mocking
- [ ] Set up Storybook for component docs

#### Day 8-9: Code Quality Tools

```json
// .eslintrc.js - Enhanced rules for healthcare app
{
  "extends": [
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  "rules": {
    // Security rules for healthcare data
    "no-console": "warn",
    "no-debugger": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    
    // HIPAA compliance helpers
    "no-hardcoded-credentials": "error",
    "no-sensitive-data-in-logs": "error"
  }
}
```

**Checklist:**
- [ ] Configure ESLint with healthcare-specific rules
- [ ] Set up Prettier with team standards
- [ ] Configure Husky for pre-commit hooks
- [ ] Add conventional commits
- [ ] Set up automated code formatting

#### Day 10: Documentation Infrastructure

```bash
# Set up documentation tools
npm install -D @docusaurus/core @docusaurus/preset-classic
npm install -D typedoc typedoc-plugin-markdown
```

**Checklist:**
- [ ] Set up Docusaurus for main documentation
- [ ] Configure TypeDoc for API docs
- [ ] Create documentation templates
- [ ] Set up automated doc generation

## Phase 2: Core Systems (Week 3-4)

### Week 3: Authentication System

#### Day 11-12: Auth Interface & Service Pattern

```typescript
// features/auth/types/auth.types.ts
export interface AuthService {
  signIn(email: string, password: string): Promise<AuthResult>
  signOut(): Promise<void>
  getCurrentUser(): Promise<User | null>
  onAuthStateChange(callback: AuthCallback): Unsubscribe
}

export interface User {
  id: string
  email: string
  role: UserRole
  profile: UserProfile
  permissions: Permission[]
  isDemo?: boolean
  createdAt: string
  lastLoginAt: string
}

// features/auth/services/AuthService.ts
export class AuthServiceFactory {
  static create(config: AuthConfig): AuthService {
    switch (config.mode) {
      case 'demo':
        return new DemoAuthService(config.demo)
      case 'production':
        return new SupabaseAuthService(config.supabase)
      case 'mock':
        return new MockAuthService()
      default:
        throw new Error(`Unsupported auth mode: ${config.mode}`)
    }
  }
}
```

**Checklist:**
- [ ] Define AuthService interface
- [ ] Implement DemoAuthService
- [ ] Refactor existing SupabaseAuthService
- [ ] Create MockAuthService for testing
- [ ] Add comprehensive auth types

#### Day 13-14: Auth Provider & Hooks

```typescript
// features/auth/providers/AuthProvider.tsx
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const config = useConfig()
  const authService = useMemo(() => 
    AuthServiceFactory.create(config.auth), [config.auth]
  )
  
  const [state, dispatch] = useReducer(authReducer, initialState)
  
  // ... implementation
}

// features/auth/hooks/useAuth.ts
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

**Checklist:**
- [ ] Create new AuthProvider with service injection
- [ ] Implement useAuth hook with proper typing
- [ ] Add useAuthState for fine-grained updates
- [ ] Create usePermissions hook for RBAC

#### Day 15: ProtectedRoute Refactor

```typescript
// features/auth/components/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: Permission[]
  requiredRoles?: UserRole[]
  fallback?: React.ComponentType
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  fallback: Fallback = UnauthorizedFallback
}) => {
  const { user, isAuthenticated, loading } = useAuth()
  const hasPermission = usePermissions(requiredPermissions)
  const hasRole = useMemo(() => 
    requiredRoles.length === 0 || requiredRoles.includes(user?.role),
    [user?.role, requiredRoles]
  )
  
  if (loading) return <LoadingSpinner />
  if (!isAuthenticated) return <Navigate to="/login" />
  if (!hasPermission || !hasRole) return <Fallback />
  
  return <>{children}</>
}
```

**Checklist:**
- [ ] Refactor ProtectedRoute with permission-based access
- [ ] Remove environment detection logic
- [ ] Add proper error boundaries
- [ ] Create role-based route guards

### Week 4: Data Layer

#### Day 16-17: Repository Pattern

```typescript
// lib/database/repositories/BaseRepository.ts
export abstract class BaseRepository<T, CreateDto, UpdateDto> {
  constructor(
    protected supabase: SupabaseClient,
    protected tableName: string,
    protected schema: z.ZodSchema<T>
  ) {}

  async findById(id: string): Promise<T> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw new DatabaseError(error.message)
    return this.schema.parse(data)
  }

  async findAll(filters?: FilterOptions): Promise<T[]> {
    let query = this.supabase.from(this.tableName).select('*')
    
    if (filters) {
      query = this.applyFilters(query, filters)
    }
    
    const { data, error } = await query
    if (error) throw new DatabaseError(error.message)
    
    return data.map(item => this.schema.parse(item))
  }

  // ... other CRUD operations
}

// lib/database/repositories/PatientRepository.ts
export class PatientRepository extends BaseRepository<Patient, CreatePatientDto, UpdatePatientDto> {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'patients', PatientSchema)
  }

  async findByEmail(email: string): Promise<Patient | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .maybeSingle()
    
    if (error) throw new DatabaseError(error.message)
    return data ? this.schema.parse(data) : null
  }
}
```

**Checklist:**
- [ ] Create BaseRepository with common CRUD operations
- [ ] Implement PatientRepository
- [ ] Implement ProviderRepository
- [ ] Implement AppointmentRepository
- [ ] Add proper error handling and validation

#### Day 18-19: State Management

```bash
# Install state management dependencies
npm install zustand @tanstack/react-query @tanstack/react-query-devtools
npm install zod # for runtime validation
```

```typescript
// lib/state/stores/authStore.ts
interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  
  signIn: async (email: string, password: string) => {
    try {
      const authService = getAuthService()
      const result = await authService.signIn(email, password)
      set({ user: result.user, isAuthenticated: true, loading: false })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },
  
  signOut: async () => {
    const authService = getAuthService()
    await authService.signOut()
    set({ user: null, isAuthenticated: false })
  },
  
  setUser: (user) => set({ user, isAuthenticated: !!user, loading: false })
}))

// lib/state/queries/patients.queries.ts
export const usePatients = (filters?: PatientFilters) => {
  const patientRepository = usePatientRepository()
  
  return useQuery({
    queryKey: ['patients', filters],
    queryFn: () => patientRepository.findAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
}

export const useCreatePatient = () => {
  const queryClient = useQueryClient()
  const patientRepository = usePatientRepository()
  
  return useMutation({
    mutationFn: (data: CreatePatientDto) => patientRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    }
  })
}
```

**Checklist:**
- [ ] Set up Zustand for client state
- [ ] Configure TanStack Query for server state
- [ ] Create query hooks for all entities
- [ ] Implement mutation hooks with optimistic updates
- [ ] Add error handling and retry logic

#### Day 20: Error Handling & Validation

```typescript
// lib/errors/AppError.ts
export abstract class AppError extends Error {
  abstract readonly code: string
  abstract readonly statusCode: number
  
  constructor(message: string, public readonly context?: Record<string, any>) {
    super(message)
    this.name = this.constructor.name
  }
}

export class ValidationError extends AppError {
  code = 'VALIDATION_ERROR' as const
  statusCode = 400
}

export class DatabaseError extends AppError {
  code = 'DATABASE_ERROR' as const
  statusCode = 500
}

// shared/components/ErrorBoundary.tsx
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorLogger.log(error, errorInfo)
    
    if (error instanceof AppError) {
      this.handleAppError(error)
    } else {
      this.handleUnknownError(error)
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback?.(this.state.error) ?? <DefaultErrorFallback />
    }

    return this.props.children
  }
}
```

**Checklist:**
- [ ] Create error class hierarchy
- [ ] Implement error boundaries
- [ ] Add validation with Zod schemas
- [ ] Set up error logging
- [ ] Create user-friendly error messages

## Immediate Deliverables (End of Phase 1-2)

### Week 1 Deliverables
- ✅ New folder structure implemented
- ✅ TypeScript strict mode enabled
- ✅ Configuration system working
- ✅ Demo credentials moved to config
- ✅ Environment detection centralized

### Week 2 Deliverables
- ✅ Testing infrastructure ready
- ✅ Code quality tools configured
- ✅ Documentation system set up
- ✅ CI/CD pipeline updated
- ✅ Development workflow improved

### Week 3 Deliverables
- ✅ Unified authentication system
- ✅ Demo mode as first-class feature
- ✅ Role-based access control
- ✅ Type-safe auth interfaces
- ✅ All auth tests passing

### Week 4 Deliverables
- ✅ Repository pattern implemented
- ✅ State management modernized
- ✅ Error handling system
- ✅ Type-safe database operations
- ✅ Query caching optimized

## Success Metrics

### Technical Metrics
- **Build Time**: <2 minutes (currently ~3 minutes)
- **TypeScript Errors**: 0 (currently ~15)
- **Test Coverage**: >80% (currently ~30%)
- **Bundle Size**: <600KB (currently ~800KB)
- **Performance Score**: >85 (currently ~75)

### Code Quality Metrics
- **ESLint Errors**: 0
- **Prettier Issues**: 0  
- **Security Vulnerabilities**: 0
- **Accessibility Issues**: <5
- **Code Duplication**: <10%

### User Experience Metrics
- **Demo Credentials**: All working
- **Page Load Time**: <2 seconds
- **Error Rate**: <1%
- **Mobile Compatibility**: 100%
- **Browser Support**: 95%+

## Risk Mitigation

### Technical Risks
1. **Breaking Changes**: 
   - Maintain backward compatibility during migration
   - Use feature flags for gradual rollout
   - Comprehensive test coverage

2. **Performance Regression**:
   - Automated performance testing
   - Bundle size monitoring
   - Real user monitoring

3. **Demo Mode Issues**:
   - Dedicated demo testing environment
   - User acceptance testing
   - Fallback to previous implementation

### Project Risks
1. **Timeline Slippage**:
   - Daily progress tracking
   - Weekly milestone reviews
   - Adjust scope if needed

2. **Resource Constraints**:
   - Focus on highest impact items first
   - Document everything for future work
   - Automate repetitive tasks

## Next Steps

1. **Start immediately** with folder structure creation
2. **Prioritize** TypeScript strict mode fixes
3. **Set up** configuration system
4. **Begin** auth system refactoring
5. **Document** progress daily

**Ready to begin? Let's start with creating the new folder structure and moving files systematically while maintaining functionality.**