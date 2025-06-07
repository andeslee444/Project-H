# ADR-006: Data Encryption

## Decision
Field-level encryption for PHI with transparent key management and HIPAA compliance.

## Encryption Strategy
```typescript
// Core encryption patterns
interface EncryptionConfig {
  algorithm: 'AES-256-GCM'          // FIPS 140-2 approved
  keyRotation: 'quarterly'          // Automated key rotation
  fieldLevel: boolean               // PHI fields individually encrypted
  transitEncryption: 'TLS 1.3'      // All network communications
  atRestEncryption: 'AES-256'       // Database and file storage
}

// PHI field encryption
const PHI_FIELDS = [
  'patientName', 'ssn', 'dateOfBirth', 'address', 'phoneNumber',
  'email', 'medicalRecordNumber', 'clinicalNotes', 'diagnosis',
  'treatmentPlan', 'medicationList', 'emergencyContacts'
]
```

## Implementation
```typescript
// Data Encryption Service in src/lib/security/encryption/DataEncryption.ts
export class DataEncryptionService {
  async encryptPHI(data: PHIData): Promise<EncryptedPHIData>
  async decryptPHI(encryptedData: EncryptedPHIData): Promise<PHIData>
  async rotateEncryptionKeys(): Promise<KeyRotationResult>
}

// Key Management in src/lib/security/encryption/KeyManager.ts
export class KeyManager {
  async generateNewKey(): Promise<EncryptionKey>
  async rotateKeys(): Promise<KeyRotationResult>
  async getActiveKey(): Promise<EncryptionKey>
}
```

## Key Management
- **Key Generation**: Hardware Security Module (HSM) or secure key derivation
- **Key Rotation**: Automated quarterly rotation with backward compatibility
- **Key Storage**: Separate from encrypted data, environment-specific
- **Access Control**: Role-based key access with audit logging

## Performance Considerations
- **Lazy Decryption**: Decrypt only when displayed to user
- **Caching**: Temporary decrypted cache with TTL for active sessions
- **Batch Operations**: Encrypt/decrypt multiple fields efficiently
- **Indexing**: Searchable encryption for critical fields

## Critical Files to Maintain
- `src/lib/security/encryption/DataEncryption.ts` - Core encryption logic
- `src/lib/security/encryption/KeyManager.ts` - Key lifecycle management
- `src/lib/security/encryption/PHIEncryption.ts` - PHI-specific encryption patterns

## Upgrade Points
1. **Post-Quantum Cryptography**: Monitor NIST standards for quantum-resistant algorithms
2. **Key Management**: Evaluate dedicated HSM or cloud key management services
3. **Performance**: Optimize encryption performance as data volume grows
4. **Compliance**: Track encryption requirements in healthcare regulations

---
**Status**: Accepted | **Review**: Quarterly