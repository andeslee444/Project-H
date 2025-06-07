# ADR-003: Session Management

## Decision
Encrypted sessions with role-based timeouts for healthcare compliance.

## Key Components

### Session Structure
```typescript
interface SessionData {
  userId: string
  userRole: UserRole  // patient, provider, admin, emergency
  sessionId: string
  maxAge: number      // Role-specific: 1-8 hours
  idleTimeout: number // Role-specific: 10-30 minutes
  deviceFingerprint: string
  emergencyAccess: boolean
}
```

### Role Configurations
```typescript
const SESSION_PRESETS = {
  PATIENT: { maxAge: 2h, idleTimeout: 15min, mfa: false },
  PROVIDER: { maxAge: 8h, idleTimeout: 30min, mfa: true },
  ADMIN: { maxAge: 1h, idleTimeout: 10min, mfa: true }
}
```

### Core Implementation
```typescript
// Session Manager in src/lib/session/SessionManager.ts
export class SessionManager {
  async createSession(credentials): Promise<SessionData>
  async validateSession(token): Promise<SessionValidationResult>
  async destroySession(sessionId): Promise<void>
}

// Emergency Access in src/lib/session/EmergencyAccess.ts
export class EmergencyAccessManager {
  async grantEmergencyAccess(request): Promise<SessionData>
}
```

## Security Features
- AES-256-GCM encryption
- Device fingerprinting
- Anomaly detection (impossible travel, concurrent sessions)
- Emergency access with enhanced audit logging
- MFA for privileged roles

## Critical Files to Maintain
- `src/lib/session/SessionManager.ts` - Core session logic
- `src/lib/session/EmergencyAccess.ts` - Breakglass procedures
- `src/lib/security/hipaa/HIPAACompliance.ts` - Audit integration

## Upgrade Points
1. **Session encryption keys**: Rotate quarterly
2. **Role timeouts**: Adjust based on workflow analysis
3. **MFA methods**: Add biometric support
4. **Emergency procedures**: Review abuse patterns

---
**Status**: Accepted | **Review**: Quarterly