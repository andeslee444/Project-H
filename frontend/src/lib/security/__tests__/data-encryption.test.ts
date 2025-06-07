/**
 * Data Encryption Service Tests
 * 
 * Comprehensive tests for the HIPAA data encryption functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  DataEncryptionService,
  DefaultKeyManager,
  PatientDataEncryption,
  type EncryptedData,
  type KeyManager,
  DEFAULT_ENCRYPTION_CONFIG
} from '../hipaa/DataEncryption';
import { DataClassification } from '../hipaa/HIPAACompliance';

// Mock crypto for testing
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random(),
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
    subtle: {
      digest: async (algorithm: string, data: ArrayBuffer) => {
        const result = new ArrayBuffer(32);
        new Uint8Array(result).set(new Uint8Array(data).slice(0, 32));
        return result;
      },
      importKey: async () => ({ type: 'secret', id: Math.random() }),
      deriveKey: async (algorithm: any, keyMaterial: any, derivedKeyAlgorithm: any) => ({ 
        type: 'secret', 
        id: Math.random(),
        algorithm: derivedKeyAlgorithm.name
      }),
      encrypt: async (algorithm: any, key: any, data: ArrayBuffer) => {
        const tag = new Uint8Array(16).fill(0xAB);
        const encrypted = new Uint8Array(data);
        // Simple XOR for testing
        for (let i = 0; i < encrypted.length; i++) {
          encrypted[i] ^= 0x42;
        }
        const result = new ArrayBuffer(data.byteLength + 16);
        new Uint8Array(result).set(encrypted);
        new Uint8Array(result).set(tag, data.byteLength);
        return result;
      },
      decrypt: async (algorithm: any, key: any, data: ArrayBuffer) => {
        const encryptedData = new Uint8Array(data.slice(0, -16));
        // Reverse the XOR
        for (let i = 0; i < encryptedData.length; i++) {
          encryptedData[i] ^= 0x42;
        }
        return encryptedData.buffer;
      }
    }
  }
});

// Mock environment for master key
const originalEnv = process.env;
beforeEach(() => {
  process.env = { ...originalEnv };
  process.env.HIPAA_MASTER_KEY = 'test-master-key-for-testing';
});

describe('DataEncryptionService', () => {
  let keyManager: KeyManager;
  let encryptionService: DataEncryptionService;

  beforeEach(() => {
    keyManager = new DefaultKeyManager('test-master-key');
    encryptionService = new DataEncryptionService(keyManager);
  });

  describe('Basic Encryption/Decryption', () => {
    it('should encrypt and decrypt simple text', async () => {
      const originalText = 'Hello, HIPAA World!';
      
      const encrypted = await encryptionService.encryptData(
        originalText,
        DataClassification.PHI
      );

      expect(encrypted).toMatchObject({
        data: expect.any(String),
        iv: expect.any(String),
        tag: expect.any(String),
        salt: expect.any(String),
        algorithm: 'AES-GCM',
        classification: DataClassification.PHI,
        timestamp: expect.any(String)
      });

      const decrypted = await encryptionService.decryptData(encrypted);
      expect(decrypted).toBe(originalText);
    });

    it('should handle empty strings', async () => {
      const originalText = '';
      
      const encrypted = await encryptionService.encryptData(
        originalText,
        DataClassification.PHI
      );
      
      const decrypted = await encryptionService.decryptData(encrypted);
      expect(decrypted).toBe(originalText);
    });

    it('should handle unicode characters', async () => {
      const originalText = 'Patient: José María García-Rodríguez 🏥';
      
      const encrypted = await encryptionService.encryptData(
        originalText,
        DataClassification.PHI
      );
      
      const decrypted = await encryptionService.decryptData(encrypted);
      expect(decrypted).toBe(originalText);
    });

    it('should handle large text blocks', async () => {
      const originalText = 'A'.repeat(10000); // 10KB of text
      
      const encrypted = await encryptionService.encryptData(
        originalText,
        DataClassification.PHI
      );
      
      const decrypted = await encryptionService.decryptData(encrypted);
      expect(decrypted).toBe(originalText);
    });
  });

  describe('Object Encryption', () => {
    it('should encrypt object with mixed classification levels', async () => {
      const patientData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        ssn: '123-45-6789',
        patientId: 'PAT12345',
        createdAt: '2024-01-01T00:00:00Z',
        status: 'active'
      };

      const fieldClassifications = {
        firstName: DataClassification.PHI,
        lastName: DataClassification.PHI,
        email: DataClassification.PHI,
        ssn: DataClassification.PHI,
        patientId: DataClassification.INTERNAL,
        createdAt: DataClassification.INTERNAL,
        status: DataClassification.PUBLIC
      };

      const encrypted = await encryptionService.encryptObject(
        patientData,
        fieldClassifications
      );

      // PHI fields should be encrypted
      expect(encrypted).toHaveProperty('firstName_encrypted');
      expect(encrypted).toHaveProperty('lastName_encrypted');
      expect(encrypted).toHaveProperty('email_encrypted');
      expect(encrypted).toHaveProperty('ssn_encrypted');
      expect(encrypted).toHaveProperty('firstName_is_encrypted', true);

      // Non-PHI fields should remain as-is
      expect(encrypted).toHaveProperty('patientId', 'PAT12345');
      expect(encrypted).toHaveProperty('createdAt', '2024-01-01T00:00:00Z');
      expect(encrypted).toHaveProperty('status', 'active');

      // Decrypt and verify
      const decrypted = await encryptionService.decryptObject(encrypted);
      expect(decrypted.firstName).toBe('John');
      expect(decrypted.lastName).toBe('Doe');
      expect(decrypted.email).toBe('john.doe@example.com');
      expect(decrypted.ssn).toBe('123-45-6789');
      expect(decrypted.patientId).toBe('PAT12345');
    });

    it('should handle nested objects', async () => {
      const nestedData = {
        patient: {
          name: 'John Doe',
          contact: {
            email: 'john@example.com',
            phone: '555-1234'
          }
        },
        metadata: {
          id: '123',
          version: 1
        }
      };

      // Flatten for encryption (in real use, you'd handle nesting appropriately)
      const flatData = {
        'patient.name': nestedData.patient.name,
        'patient.contact.email': nestedData.patient.contact.email,
        'patient.contact.phone': nestedData.patient.contact.phone,
        'metadata.id': nestedData.metadata.id,
        'metadata.version': nestedData.metadata.version.toString()
      };

      const fieldClassifications = {
        'patient.name': DataClassification.PHI,
        'patient.contact.email': DataClassification.PHI,
        'patient.contact.phone': DataClassification.PHI,
        'metadata.id': DataClassification.INTERNAL,
        'metadata.version': DataClassification.INTERNAL
      };

      const encrypted = await encryptionService.encryptObject(
        flatData,
        fieldClassifications
      );

      const decrypted = await encryptionService.decryptObject(encrypted);
      expect(decrypted['patient.name']).toBe('John Doe');
      expect(decrypted['patient.contact.email']).toBe('john@example.com');
    });
  });

  describe('Hash Functions', () => {
    it('should create consistent hashes for indexing', async () => {
      const data = 'john.doe@example.com';
      const salt = 'consistent-salt';

      const hash1 = await encryptionService.hashForIndex(data, salt);
      const hash2 = await encryptionService.hashForIndex(data, salt);

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[A-Za-z0-9+/]+=*$/); // Base64 pattern
    });

    it('should create different hashes for different data', async () => {
      const data1 = 'john.doe@example.com';
      const data2 = 'jane.smith@example.com';
      const salt = 'same-salt';

      const hash1 = await encryptionService.hashForIndex(data1, salt);
      const hash2 = await encryptionService.hashForIndex(data2, salt);

      expect(hash1).not.toBe(hash2);
    });

    it('should create different hashes with different salts', async () => {
      const data = 'john.doe@example.com';
      const salt1 = 'salt-one';
      const salt2 = 'salt-two';

      const hash1 = await encryptionService.hashForIndex(data, salt1);
      const hash2 = await encryptionService.hashForIndex(data, salt2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Encryption Validation', () => {
    it('should validate correct encrypted data', async () => {
      const originalText = 'Valid encrypted data';
      
      const encrypted = await encryptionService.encryptData(
        originalText,
        DataClassification.PHI
      );

      const isValid = await encryptionService.validateEncryption(encrypted);
      expect(isValid).toBe(true);
    });

    it('should detect corrupted encrypted data', async () => {
      const originalText = 'Data to be corrupted';
      
      const encrypted = await encryptionService.encryptData(
        originalText,
        DataClassification.PHI
      );

      // Corrupt the data
      encrypted.data = 'corrupted-base64-data';

      const isValid = await encryptionService.validateEncryption(encrypted);
      expect(isValid).toBe(false);
    });

    it('should detect corrupted IV', async () => {
      const originalText = 'Data with corrupted IV';
      
      const encrypted = await encryptionService.encryptData(
        originalText,
        DataClassification.PHI
      );

      // Corrupt the IV
      encrypted.iv = 'corrupted-iv';

      const isValid = await encryptionService.validateEncryption(encrypted);
      expect(isValid).toBe(false);
    });

    it('should detect corrupted authentication tag', async () => {
      const originalText = 'Data with corrupted tag';
      
      const encrypted = await encryptionService.encryptData(
        originalText,
        DataClassification.PHI
      );

      // Corrupt the tag
      encrypted.tag = 'corrupted-tag';

      const isValid = await encryptionService.validateEncryption(encrypted);
      expect(isValid).toBe(false);
    });
  });

  describe('Encryption Metadata', () => {
    it('should provide encryption metadata', async () => {
      const originalText = 'Test metadata';
      
      const encrypted = await encryptionService.encryptData(
        originalText,
        DataClassification.PHI
      );

      const metadata = encryptionService.getEncryptionMetadata(encrypted);

      expect(metadata).toMatchObject({
        algorithm: 'AES-GCM',
        classification: DataClassification.PHI,
        timestamp: expect.any(Date)
      });

      expect(metadata.timestamp.getTime()).toBeCloseTo(Date.now(), -3); // Within 1 second
    });

    it('should handle metadata with key ID', async () => {
      const originalText = 'Test with key ID';
      const keyId = 'test-key-123';
      
      const encrypted = await encryptionService.encryptData(
        originalText,
        DataClassification.PHI,
        keyId
      );

      const metadata = encryptionService.getEncryptionMetadata(encrypted);
      expect(metadata.keyId).toBe(keyId);
    });
  });

  describe('Error Handling', () => {
    it('should handle encryption errors gracefully', async () => {
      // Create a key manager that throws errors
      const faultyKeyManager: KeyManager = {
        deriveKey: vi.fn().mockRejectedValue(new Error('Key derivation failed')),
        generateSalt: vi.fn(),
        generateIV: vi.fn(),
        rotateKey: vi.fn(),
        getKey: vi.fn()
      };

      const faultyService = new DataEncryptionService(faultyKeyManager);

      await expect(
        faultyService.encryptData('test', DataClassification.PHI)
      ).rejects.toThrow('Encryption failed');
    });

    it('should handle decryption errors gracefully', async () => {
      const invalidEncryptedData: EncryptedData = {
        data: 'invalid-base64',
        iv: 'invalid-iv',
        tag: 'invalid-tag',
        salt: 'invalid-salt',
        algorithm: 'AES-GCM',
        timestamp: new Date().toISOString(),
        classification: DataClassification.PHI
      };

      await expect(
        encryptionService.decryptData(invalidEncryptedData)
      ).rejects.toThrow('Decryption failed');
    });
  });
});

describe('DefaultKeyManager', () => {
  let keyManager: DefaultKeyManager;

  beforeEach(() => {
    keyManager = new DefaultKeyManager('test-master-key');
  });

  describe('Key Generation', () => {
    it('should generate random salts', () => {
      const salt1 = keyManager.generateSalt();
      const salt2 = keyManager.generateSalt();

      expect(salt1).toHaveLength(DEFAULT_ENCRYPTION_CONFIG.saltLength);
      expect(salt2).toHaveLength(DEFAULT_ENCRYPTION_CONFIG.saltLength);
      expect(salt1).not.toEqual(salt2);
    });

    it('should generate random IVs', () => {
      const iv1 = keyManager.generateIV();
      const iv2 = keyManager.generateIV();

      expect(iv1).toHaveLength(DEFAULT_ENCRYPTION_CONFIG.ivLength);
      expect(iv2).toHaveLength(DEFAULT_ENCRYPTION_CONFIG.ivLength);
      expect(iv1).not.toEqual(iv2);
    });

    it('should derive keys consistently', async () => {
      const password = 'test-password';
      const salt = keyManager.generateSalt();

      const key1 = await keyManager.deriveKey(password, salt);
      const key2 = await keyManager.deriveKey(password, salt);

      // CryptoKey objects cannot be directly compared, but same inputs should produce equivalent keys
      expect(key1.type).toEqual(key2.type);
      expect(key1.algorithm).toEqual(key2.algorithm);
      expect(key1.usages).toEqual(key2.usages);
    });

    it('should create different keys with different salts', async () => {
      const password = 'test-password';
      const salt1 = keyManager.generateSalt();
      const salt2 = keyManager.generateSalt();

      const key1 = await keyManager.deriveKey(password, salt1);
      const key2 = await keyManager.deriveKey(password, salt2);

      expect(key1).not.toEqual(key2);
    });
  });

  describe('Key Rotation', () => {
    it('should rotate keys for different key IDs', async () => {
      const keyId1 = 'key-rotation-test-1';
      const keyId2 = 'key-rotation-test-2';

      const key1 = await keyManager.rotateKey(keyId1);
      const key2 = await keyManager.rotateKey(keyId2);

      expect(key1).not.toEqual(key2);
    });

    it('should retrieve rotated keys', async () => {
      const keyId = 'retrieval-test';

      const rotatedKey = await keyManager.rotateKey(keyId);
      const retrievedKey = await keyManager.getKey(keyId);

      expect(retrievedKey).toEqual(rotatedKey);
    });

    it('should create new keys for unknown key IDs', async () => {
      const unknownKeyId = 'unknown-key-' + Date.now();

      const key = await keyManager.getKey(unknownKeyId);
      expect(key).toBeDefined();
    });
  });
});

describe('PatientDataEncryption', () => {
  let patientEncryption: PatientDataEncryption;

  beforeEach(() => {
    const keyManager = new DefaultKeyManager('patient-test-key');
    patientEncryption = new PatientDataEncryption(keyManager);
  });

  describe('Patient Data Workflows', () => {
    it('should encrypt complete patient record', async () => {
      const patientData = {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@email.com',
        phone: '555-0123',
        address: '123 Main St, Anytown, ST 12345',
        ssn: '987-65-4321',
        dateOfBirth: '1985-03-15',
        medicalRecordNumber: 'MRN789012',
        insuranceId: 'INS345678',
        emergencyContact: 'Bob Johnson - 555-0124',
        diagnosis: 'Type 2 Diabetes',
        treatmentNotes: 'Regular monitoring required',
        medications: 'Metformin 500mg twice daily',
        // Non-sensitive fields
        patientId: 'PAT98765',
        providerId: 'PROV54321',
        appointmentStatus: 'scheduled',
        createdAt: '2024-01-01T12:00:00Z',
        updatedAt: '2024-01-02T15:30:00Z'
      };

      const encrypted = await patientEncryption.encryptPatientData(patientData);

      // Verify PHI fields are encrypted
      expect(encrypted).toHaveProperty('firstName_encrypted');
      expect(encrypted).toHaveProperty('lastName_encrypted');
      expect(encrypted).toHaveProperty('email_encrypted');
      expect(encrypted).toHaveProperty('ssn_encrypted');

      // Verify non-PHI fields are preserved
      expect(encrypted.patientId).toBe('PAT98765');
      expect(encrypted.providerId).toBe('PROV54321');

      // Decrypt and verify integrity
      const decrypted = await patientEncryption.decryptPatientData(encrypted);
      expect(decrypted.firstName).toBe('Alice');
      expect(decrypted.lastName).toBe('Johnson');
      expect(decrypted.email).toBe('alice.johnson@email.com');
      expect(decrypted.ssn).toBe('987-65-4321');
    });

    it('should create searchable patient hash', async () => {
      const firstName = 'Alice';
      const lastName = 'Johnson';
      const dateOfBirth = '1985-03-15';

      const hash1 = await patientEncryption.createPatientHash(
        firstName,
        lastName,
        dateOfBirth
      );

      const hash2 = await patientEncryption.createPatientHash(
        firstName,
        lastName,
        dateOfBirth
      );

      // Same data should produce same hash
      expect(hash1).toBe(hash2);

      // Different data should produce different hash
      const hash3 = await patientEncryption.createPatientHash(
        'Different',
        lastName,
        dateOfBirth
      );

      expect(hash1).not.toBe(hash3);
    });

    it('should handle partial patient data', async () => {
      const partialData = {
        firstName: 'Bob',
        patientId: 'PAT11111'
      };

      const encrypted = await patientEncryption.encryptPatientData(partialData);
      expect(encrypted).toHaveProperty('firstName_encrypted');
      expect(encrypted.patientId).toBe('PAT11111');

      const decrypted = await patientEncryption.decryptPatientData(encrypted);
      expect(decrypted.firstName).toBe('Bob');
      expect(decrypted.patientId).toBe('PAT11111');
    });

    it('should handle empty patient data', async () => {
      const emptyData = {};

      const encrypted = await patientEncryption.encryptPatientData(emptyData);
      const decrypted = await patientEncryption.decryptPatientData(encrypted);

      expect(decrypted).toEqual({});
    });
  });

  describe('Edge Cases', () => {
    it('should handle null and undefined values', async () => {
      const dataWithNulls = {
        firstName: 'Test',
        lastName: null,
        email: undefined,
        patientId: 'PAT00000'
      };

      const encrypted = await patientEncryption.encryptPatientData(dataWithNulls);
      const decrypted = await patientEncryption.decryptPatientData(encrypted);

      expect(decrypted.firstName).toBe('Test');
      expect(decrypted.patientId).toBe('PAT00000');
      // null/undefined handling depends on implementation
    });

    it('should handle very long field values', async () => {
      const longData = {
        firstName: 'A'.repeat(1000),
        treatmentNotes: 'B'.repeat(5000),
        patientId: 'PAT99999'
      };

      const encrypted = await patientEncryption.encryptPatientData(longData);
      const decrypted = await patientEncryption.decryptPatientData(longData);

      expect(decrypted.firstName).toBe('A'.repeat(1000));
      expect(decrypted.treatmentNotes).toBe('B'.repeat(5000));
    });

    it('should preserve data types where possible', async () => {
      const mixedTypeData = {
        firstName: 'John',
        age: 45, // Number
        isActive: true, // Boolean
        lastVisit: new Date('2024-01-01'), // Date object
        patientId: 'PAT12345'
      };

      const encrypted = await patientEncryption.encryptPatientData(mixedTypeData);
      
      // Non-string types should be preserved for non-encrypted fields
      expect(typeof encrypted.patientId).toBe('string');
      
      // The implementation should handle type conversion appropriately
      // This test verifies the system doesn't crash with mixed types
      expect(encrypted).toBeDefined();
    });
  });
});

describe('Performance Tests', () => {
  let encryptionService: DataEncryptionService;

  beforeEach(() => {
    const keyManager = new DefaultKeyManager('performance-test-key');
    encryptionService = new DataEncryptionService(keyManager);
  });

  it('should handle multiple concurrent encryptions', async () => {
    const testData = Array.from({ length: 10 }, (_, i) => 
      `Test data item ${i} - ${Math.random()}`
    );

    const startTime = Date.now();
    
    const encryptionPromises = testData.map(data =>
      encryptionService.encryptData(data, DataClassification.PHI)
    );

    const encrypted = await Promise.all(encryptionPromises);
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(encrypted).toHaveLength(10);
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds

    // Verify all encryptions are unique
    const encryptedData = encrypted.map(e => e.data);
    const uniqueEncrypted = new Set(encryptedData);
    expect(uniqueEncrypted.size).toBe(10);
  });

  it('should handle large object encryption efficiently', async () => {
    const largeObject: Record<string, any> = {};
    const fieldClassifications: Record<string, DataClassification> = {};

    // Create object with 100 fields
    for (let i = 0; i < 100; i++) {
      const fieldName = `field${i}`;
      largeObject[fieldName] = `Value for field ${i} with some longer text to make it more realistic`;
      fieldClassifications[fieldName] = i % 3 === 0 ? DataClassification.PHI : DataClassification.INTERNAL;
    }

    const startTime = Date.now();
    
    const encrypted = await encryptionService.encryptObject(largeObject, fieldClassifications);
    const decrypted = await encryptionService.decryptObject(encrypted);
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    expect(Object.keys(decrypted)).toHaveLength(100);
    
    // Verify some fields were encrypted and some weren't
    const encryptedFields = Object.keys(encrypted).filter(key => key.endsWith('_encrypted'));
    const nonEncryptedFields = Object.keys(encrypted).filter(key => 
      !key.endsWith('_encrypted') && !key.endsWith('_is_encrypted')
    );
    
    expect(encryptedFields.length).toBeGreaterThan(0);
    expect(nonEncryptedFields.length).toBeGreaterThan(0);
  });
});