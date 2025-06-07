/**
 * HIPAA Data Encryption Service
 * 
 * Provides secure encryption and decryption for PHI and PII data
 * according to HIPAA technical safeguards requirements.
 * 
 * Features:
 * - AES-256-GCM encryption for data at rest
 * - Key derivation using PBKDF2
 * - Secure key management
 * - Field-level encryption for sensitive data
 * - Encryption metadata tracking
 */

import { DataClassification, PHIDataTypes } from './HIPAACompliance';

// Encryption Configuration
export interface EncryptionConfig {
  algorithm: 'AES-GCM';
  keyLength: 256 | 128;
  ivLength: 12; // for GCM mode
  tagLength: 16; // for GCM mode
  saltLength: 32;
  iterations: 100000; // PBKDF2 iterations
}

export const DEFAULT_ENCRYPTION_CONFIG: EncryptionConfig = {
  algorithm: 'AES-GCM',
  keyLength: 256,
  ivLength: 12,
  tagLength: 16,
  saltLength: 32,
  iterations: 100000
};

// Encrypted Data Structure
export interface EncryptedData {
  data: string; // Base64 encoded encrypted data
  iv: string; // Base64 encoded initialization vector
  tag: string; // Base64 encoded authentication tag
  salt: string; // Base64 encoded salt
  algorithm: string;
  keyId?: string; // Optional key identifier for key rotation
  timestamp: string; // ISO timestamp of encryption
  classification: DataClassification;
}

// Key Management Interface
export interface KeyManager {
  deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey>;
  generateSalt(): Uint8Array;
  generateIV(): Uint8Array;
  rotateKey(keyId: string): Promise<CryptoKey>;
  getKey(keyId?: string): Promise<CryptoKey>;
}

/**
 * HIPAA-compliant Data Encryption Service
 */
export class DataEncryptionService {
  private config: EncryptionConfig;
  private keyManager: KeyManager;

  constructor(
    keyManager: KeyManager,
    config: Partial<EncryptionConfig> = {}
  ) {
    this.config = { ...DEFAULT_ENCRYPTION_CONFIG, ...config };
    this.keyManager = keyManager;
  }

  /**
   * Encrypt sensitive data with appropriate classification
   */
  async encryptData(
    data: string,
    classification: DataClassification,
    keyId?: string
  ): Promise<EncryptedData> {
    try {
      // Generate cryptographic parameters
      const salt = this.keyManager.generateSalt();
      const iv = this.keyManager.generateIV();
      
      // Derive or get encryption key
      const key = keyId 
        ? await this.keyManager.getKey(keyId)
        : await this.keyManager.deriveKey('', salt); // Use environment key

      // Encode data
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      // Encrypt data
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: this.config.algorithm,
          iv: iv,
          tagLength: this.config.tagLength * 8 // Convert to bits
        },
        key,
        dataBuffer
      );

      // Extract encrypted data and authentication tag
      const encryptedData = new Uint8Array(
        encryptedBuffer.slice(0, -this.config.tagLength)
      );
      const tag = new Uint8Array(
        encryptedBuffer.slice(-this.config.tagLength)
      );

      return {
        data: this.bufferToBase64(encryptedData),
        iv: this.bufferToBase64(iv),
        tag: this.bufferToBase64(tag),
        salt: this.bufferToBase64(salt),
        algorithm: this.config.algorithm,
        keyId,
        timestamp: new Date().toISOString(),
        classification
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt previously encrypted data
   */
  async decryptData(encryptedData: EncryptedData): Promise<string> {
    try {
      // Reconstruct key
      const salt = this.base64ToBuffer(encryptedData.salt);
      const key = encryptedData.keyId
        ? await this.keyManager.getKey(encryptedData.keyId)
        : await this.keyManager.deriveKey('', salt);

      // Reconstruct encrypted buffer with tag
      const data = this.base64ToBuffer(encryptedData.data);
      const tag = this.base64ToBuffer(encryptedData.tag);
      const iv = this.base64ToBuffer(encryptedData.iv);
      
      const encryptedBuffer = new Uint8Array(data.length + tag.length);
      encryptedBuffer.set(data);
      encryptedBuffer.set(tag, data.length);

      // Decrypt data
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: encryptedData.algorithm,
          iv: iv,
          tagLength: this.config.tagLength * 8
        },
        key,
        encryptedBuffer
      );

      // Decode to string
      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Encrypt object fields based on classification
   */
  async encryptObject<T extends Record<string, any>>(
    obj: T,
    fieldClassifications: Record<keyof T, DataClassification>
  ): Promise<Record<string, any>> {
    const result: Record<string, any> = {};

    for (const [field, value] of Object.entries(obj)) {
      const classification = fieldClassifications[field];
      
      if (classification === DataClassification.PHI || 
          classification === DataClassification.PII) {
        // Encrypt sensitive fields
        result[`${field}_encrypted`] = await this.encryptData(
          String(value),
          classification
        );
        // Mark as encrypted
        result[`${field}_is_encrypted`] = true;
      } else {
        // Keep non-sensitive fields as-is
        result[field] = value;
      }
    }

    return result;
  }

  /**
   * Decrypt object fields
   */
  async decryptObject(encryptedObj: Record<string, any>): Promise<Record<string, any>> {
    const result: Record<string, any> = {};

    for (const [field, value] of Object.entries(encryptedObj)) {
      if (field.endsWith('_encrypted')) {
        // This is an encrypted field
        const originalField = field.replace('_encrypted', '');
        const isEncrypted = encryptedObj[`${originalField}_is_encrypted`];
        
        if (isEncrypted && value && typeof value === 'object') {
          result[originalField] = await this.decryptData(value as EncryptedData);
        }
      } else if (!field.endsWith('_is_encrypted')) {
        // This is a regular field
        result[field] = value;
      }
    }

    return result;
  }

  /**
   * Hash sensitive data for indexing (one-way)
   */
  async hashForIndex(data: string, salt?: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data + (salt || ''));
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return this.bufferToBase64(new Uint8Array(hashBuffer));
  }

  /**
   * Validate encryption integrity
   */
  async validateEncryption(encryptedData: EncryptedData): Promise<boolean> {
    try {
      // Attempt to decrypt without returning the result
      await this.decryptData(encryptedData);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get encryption metadata
   */
  getEncryptionMetadata(encryptedData: EncryptedData): {
    algorithm: string;
    classification: DataClassification;
    timestamp: Date;
    keyId?: string;
  } {
    return {
      algorithm: encryptedData.algorithm,
      classification: encryptedData.classification,
      timestamp: new Date(encryptedData.timestamp),
      keyId: encryptedData.keyId
    };
  }

  // Utility methods
  private bufferToBase64(buffer: Uint8Array): string {
    return btoa(String.fromCharCode(...buffer));
  }

  private base64ToBuffer(base64: string): Uint8Array {
    return new Uint8Array(
      atob(base64).split('').map(char => char.charCodeAt(0))
    );
  }
}

/**
 * Default Key Manager Implementation
 */
export class DefaultKeyManager implements KeyManager {
  private keys: Map<string, CryptoKey> = new Map();
  private masterKey: string;

  constructor(masterKey?: string) {
    this.masterKey = masterKey || this.generateMasterKey();
  }

  async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password || this.masterKey),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: DEFAULT_ENCRYPTION_CONFIG.iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      {
        name: 'AES-GCM',
        length: DEFAULT_ENCRYPTION_CONFIG.keyLength
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(DEFAULT_ENCRYPTION_CONFIG.saltLength));
  }

  generateIV(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(DEFAULT_ENCRYPTION_CONFIG.ivLength));
  }

  async rotateKey(keyId: string): Promise<CryptoKey> {
    const salt = this.generateSalt();
    const newKey = await this.deriveKey(this.masterKey + keyId + Date.now(), salt);
    this.keys.set(keyId, newKey);
    return newKey;
  }

  async getKey(keyId?: string): Promise<CryptoKey> {
    if (!keyId) {
      const salt = this.generateSalt();
      return this.deriveKey(this.masterKey, salt);
    }

    if (!this.keys.has(keyId)) {
      await this.rotateKey(keyId);
    }

    return this.keys.get(keyId)!;
  }

  private generateMasterKey(): string {
    // In production, this should come from secure environment variables
    return process.env.HIPAA_MASTER_KEY || 'default-master-key-change-in-production';
  }
}

/**
 * Field-level encryption decorator for patient data
 */
export class PatientDataEncryption {
  private encryptionService: DataEncryptionService;

  // Define which patient fields require encryption
  private static readonly FIELD_CLASSIFICATIONS: Record<string, DataClassification> = {
    firstName: DataClassification.PHI,
    lastName: DataClassification.PHI,
    email: DataClassification.PHI,
    phone: DataClassification.PHI,
    address: DataClassification.PHI,
    ssn: DataClassification.PHI,
    dateOfBirth: DataClassification.PHI,
    medicalRecordNumber: DataClassification.PHI,
    insuranceId: DataClassification.PHI,
    emergencyContact: DataClassification.PHI,
    diagnosis: DataClassification.PHI,
    treatmentNotes: DataClassification.PHI,
    medications: DataClassification.PHI,
    // Non-sensitive fields
    patientId: DataClassification.INTERNAL,
    providerId: DataClassification.INTERNAL,
    appointmentStatus: DataClassification.INTERNAL,
    createdAt: DataClassification.INTERNAL,
    updatedAt: DataClassification.INTERNAL
  };

  constructor(keyManager: KeyManager) {
    this.encryptionService = new DataEncryptionService(keyManager);
  }

  /**
   * Encrypt patient data for storage
   */
  async encryptPatientData(patientData: Record<string, any>): Promise<Record<string, any>> {
    return this.encryptionService.encryptObject(
      patientData,
      PatientDataEncryption.FIELD_CLASSIFICATIONS
    );
  }

  /**
   * Decrypt patient data for use
   */
  async decryptPatientData(encryptedPatientData: Record<string, any>): Promise<Record<string, any>> {
    return this.encryptionService.decryptObject(encryptedPatientData);
  }

  /**
   * Create searchable hash for patient identification
   */
  async createPatientHash(
    firstName: string,
    lastName: string,
    dateOfBirth: string
  ): Promise<string> {
    const searchableData = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${dateOfBirth}`;
    return this.encryptionService.hashForIndex(searchableData);
  }
}

// Export the main encryption service
export const keyManager = new DefaultKeyManager();
export const dataEncryption = new DataEncryptionService(keyManager);
export const patientDataEncryption = new PatientDataEncryption(keyManager);