/**
 * Audit Trail System Tests
 * 
 * Comprehensive tests for healthcare audit logging and compliance monitoring
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { 
  AuditTrailManager,
  HealthcareAuditEventType,
  RiskAssessor,
  ViolationDetector,
  InMemoryAuditStore,
  type HealthcareAuditLogEntry,
  type AuditContext,
  type AuditStore
} from '../hipaa/AuditTrail';
import { AuditEventType, DataClassification } from '../hipaa/HIPAACompliance';

// Mock crypto for testing
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'audit-test-uuid-' + Math.random().toString(36).substr(2, 9)
  }
});

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'test-audit-user-agent'
  }
});

// Mock sessionStorage
const mockSessionStorage = {
  items: new Map(),
  getItem: vi.fn((key: string) => mockSessionStorage.items.get(key) || null),
  setItem: vi.fn((key: string, value: string) => mockSessionStorage.items.set(key, value)),
  removeItem: vi.fn((key: string) => mockSessionStorage.items.delete(key)),
  clear: vi.fn(() => mockSessionStorage.items.clear())
};

Object.defineProperty(global, 'sessionStorage', {
  value: mockSessionStorage
});

describe('AuditTrailManager', () => {
  let auditStore: AuditStore;
  let auditManager: AuditTrailManager;

  beforeEach(() => {
    auditStore = new InMemoryAuditStore();
    auditManager = new AuditTrailManager(auditStore);
    mockSessionStorage.clear();
    vi.clearAllMocks();
  });

  describe('Event Logging', () => {
    it('should log basic audit events', async () => {
      const eventData = {
        userId: 'user123',
        userRole: 'nurse',
        eventType: AuditEventType.LOGIN,
        resourceType: 'authentication',
        action: 'user_login',
        outcome: 'success' as const
      };

      const loggedEvent = await auditManager.logEvent(eventData);

      expect(loggedEvent).toMatchObject({
        eventId: expect.any(String),
        timestamp: expect.any(Date),
        userId: 'user123',
        userRole: 'nurse',
        eventType: AuditEventType.LOGIN,
        resourceType: 'authentication',
        action: 'user_login',
        outcome: 'success',
        ipAddress: expect.any(String),
        userAgent: 'test-audit-user-agent',
        sessionId: expect.any(String),
        phi_accessed: false,
        riskScore: expect.any(Number)
      });
    });

    it('should log healthcare-specific events', async () => {
      const patientAccessEvent = {
        userId: 'doctor456',
        userRole: 'physician',
        eventType: HealthcareAuditEventType.PATIENT_VIEW,
        resourceType: 'patient',
        resourceId: 'PAT123456',
        action: 'view_patient_record',
        outcome: 'success' as const,
        dataClassification: DataClassification.PHI,
        context: {
          patientId: 'PAT123456',
          dataFields: ['firstName', 'lastName', 'diagnosis'],
          businessJustification: 'Scheduled appointment review'
        }
      };

      const loggedEvent = await auditManager.logEvent(patientAccessEvent);

      expect(loggedEvent.phi_accessed).toBe(true);
      expect(loggedEvent.context?.patientId).toBe('PAT123456');
      expect(loggedEvent.context?.dataFields).toContain('firstName');
      expect(loggedEvent.riskScore).toBeGreaterThanOrEqual(0);
    });

    it('should generate unique event IDs', async () => {
      const events = await Promise.all([
        auditManager.logEvent({
          userId: 'user1',
          userRole: 'admin',
          eventType: AuditEventType.DATA_ACCESS,
          resourceType: 'patient',
          action: 'view',
          outcome: 'success'
        }),
        auditManager.logEvent({
          userId: 'user2', 
          userRole: 'nurse',
          eventType: AuditEventType.DATA_ACCESS,
          resourceType: 'patient',
          action: 'view',
          outcome: 'success'
        })
      ]);

      expect(events[0].eventId).not.toBe(events[1].eventId);
      expect(events[0].eventId).toMatch(/^audit-test-uuid-/);
      expect(events[1].eventId).toMatch(/^audit-test-uuid-/);
    });

    it('should handle concurrent event logging', async () => {
      const concurrentEvents = Array.from({ length: 10 }, (_, i) => 
        auditManager.logEvent({
          userId: `user${i}`,
          userRole: 'staff',
          eventType: AuditEventType.DATA_ACCESS,
          resourceType: 'patient',
          resourceId: `PAT${i}`,
          action: 'view',
          outcome: 'success'
        })
      );

      const results = await Promise.all(concurrentEvents);

      expect(results).toHaveLength(10);
      
      // All events should have unique IDs
      const eventIds = results.map(r => r.eventId);
      const uniqueIds = new Set(eventIds);
      expect(uniqueIds.size).toBe(10);

      // All events should be timestamped
      results.forEach(event => {
        expect(event.timestamp).toBeInstanceOf(Date);
      });
    });
  });

  describe('Patient Data Access Logging', () => {
    it('should log patient data access with required context', async () => {
      await auditManager.logPatientAccess(
        'doctor789',
        'physician',
        'PAT654321',
        'view_medical_history',
        ['medicalHistory', 'medications', 'allergies'],
        'Pre-operative assessment'
      );

      const events = await auditStore.getEventsByPatient('PAT654321');
      
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        userId: 'doctor789',
        userRole: 'physician',
        eventType: HealthcareAuditEventType.PATIENT_VIEW,
        resourceType: 'patient',
        resourceId: 'PAT654321',
        action: 'view_medical_history',
        outcome: 'success',
        dataClassification: DataClassification.PHI
      });

      expect(events[0].context?.patientId).toBe('PAT654321');
      expect(events[0].context?.dataFields).toEqual(['medicalHistory', 'medications', 'allergies']);
      expect(events[0].context?.businessJustification).toBe('Pre-operative assessment');
    });

    it('should log medical record access', async () => {
      await auditManager.logMedicalRecordAccess(
        'nurse456',
        'registered_nurse', 
        'PAT789012',
        'lab_results',
        'update_lab_values',
        false
      );

      const events = await auditStore.getEventsByPatient('PAT789012');
      
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        eventType: HealthcareAuditEventType.MEDICAL_RECORD_ACCESS,
        resourceType: 'medical_record',
        resourceId: 'PAT789012_lab_results',
        context: {
          patientId: 'PAT789012',
          recordType: 'lab_results',
          emergencyAccess: false
        }
      });
    });

    it('should log emergency access with higher risk score', async () => {
      await auditManager.logMedicalRecordAccess(
        'emergency_doc',
        'emergency_physician',
        'PAT999999',
        'full_record',
        'emergency_treatment',
        true // Emergency access
      );

      const events = await auditStore.getEventsByPatient('PAT999999');
      
      expect(events).toHaveLength(1);
      expect(events[0].context?.emergencyAccess).toBe(true);
      expect(events[0].riskScore).toBeGreaterThanOrEqual(0); // Should have a risk score
      expect(events[0].requiresReview).toBe(true);
    });
  });

  describe('Compliance Reporting', () => {
    beforeEach(async () => {
      // Create test audit data
      const testEvents = [
        {
          userId: 'user1',
          userRole: 'physician',
          eventType: HealthcareAuditEventType.PATIENT_VIEW,
          resourceType: 'patient',
          resourceId: 'PAT001',
          action: 'view',
          outcome: 'success' as const,
          dataClassification: DataClassification.PHI
        },
        {
          userId: 'user2',
          userRole: 'nurse',
          eventType: HealthcareAuditEventType.PATIENT_UPDATE,
          resourceType: 'patient', 
          resourceId: 'PAT002',
          action: 'update',
          outcome: 'success' as const,
          dataClassification: DataClassification.PHI
        },
        {
          userId: 'user3',
          userRole: 'admin',
          eventType: AuditEventType.UNAUTHORIZED_ACCESS,
          resourceType: 'patient',
          resourceId: 'PAT003',
          action: 'unauthorized_view',
          outcome: 'failure' as const
        }
      ];

      for (const event of testEvents) {
        await auditManager.logEvent(event);
      }
    });

    it('should generate compliance report with statistics', async () => {
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      const endDate = new Date();

      const report = await auditManager.generateComplianceReport(startDate, endDate, true);

      expect(report).toMatchObject({
        reportId: expect.any(String),
        generatedAt: expect.any(Date),
        period: {
          startDate,
          endDate
        },
        summary: {
          totalEvents: 3,
          phiAccess: expect.any(Number),
          violations: expect.any(Number),
          unauthorizedAttempts: 1
        },
        statistics: {
          totalEvents: 3,
          phiAccessEvents: expect.any(Number),
          uniqueUsers: 3,
          highRiskEvents: expect.any(Number),
          violations: expect.any(Number)
        }
      });

      expect(report.events).toHaveLength(3);
      expect(report.recommendations).toBeInstanceOf(Array);
    });

    it('should track unique users and patients in statistics', async () => {
      // Add more test data with overlapping users/patients
      await auditManager.logPatientAccess('user1', 'physician', 'PAT001', 'view');
      await auditManager.logPatientAccess('user1', 'physician', 'PAT004', 'view');
      await auditManager.logPatientAccess('user4', 'specialist', 'PAT001', 'view');

      const startDate = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      const endDate = new Date();

      const report = await auditManager.generateComplianceReport(startDate, endDate);

      expect(report.statistics.uniqueUsers).toBeGreaterThan(1);
      expect(report.statistics.uniquePatients).toBeGreaterThan(1);
    });

    it('should provide event distribution by type', async () => {
      const startDate = new Date(Date.now() - 60 * 60 * 1000);
      const endDate = new Date();

      const report = await auditManager.generateComplianceReport(startDate, endDate);

      expect(report.statistics.eventsByType).toHaveProperty(HealthcareAuditEventType.PATIENT_VIEW);
      expect(report.statistics.eventsByType).toHaveProperty(HealthcareAuditEventType.PATIENT_UPDATE);
      expect(report.statistics.eventsByType).toHaveProperty(AuditEventType.UNAUTHORIZED_ACCESS);
    });

    it('should provide recommendations based on violations', async () => {
      // Create scenario with high failure rate
      for (let i = 0; i < 10; i++) {
        await auditManager.logEvent({
          userId: `user${i}`,
          userRole: 'test',
          eventType: AuditEventType.UNAUTHORIZED_ACCESS,
          resourceType: 'patient',
          action: 'failed_access',
          outcome: 'failure'
        });
      }

      const report = await auditManager.generateComplianceReport(
        new Date(Date.now() - 60 * 60 * 1000),
        new Date()
      );

      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(report.recommendations.some(rec => 
        rec.includes('failure rate') || rec.includes('unauthorized')
      )).toBe(true);
    });
  });

  describe('Audit Trail Queries', () => {
    beforeEach(async () => {
      // Create test data with different time periods
      const baseTime = Date.now();
      
      const events = [
        {
          userId: 'user1',
          userRole: 'physician',
          eventType: HealthcareAuditEventType.PATIENT_VIEW,
          resourceType: 'patient',
          resourceId: 'PAT001',
          action: 'view',
          outcome: 'success' as const,
          timestamp: new Date(baseTime - 3600000), // 1 hour ago
          context: { patientId: 'PAT001' }
        },
        {
          userId: 'user1',
          userRole: 'physician', 
          eventType: HealthcareAuditEventType.PATIENT_UPDATE,
          resourceType: 'patient',
          resourceId: 'PAT002',
          action: 'update',
          outcome: 'success' as const,
          timestamp: new Date(baseTime - 1800000) // 30 minutes ago
        },
        {
          userId: 'user2',
          userRole: 'nurse',
          eventType: HealthcareAuditEventType.PATIENT_VIEW,
          resourceType: 'patient',
          resourceId: 'PAT001',
          action: 'view',
          outcome: 'success' as const,
          timestamp: new Date(baseTime - 900000), // 15 minutes ago
          context: { patientId: 'PAT001' }
        }
      ];

      for (const event of events) {
        await auditManager.logEvent(event);
      }
    });

    it('should get patient audit trail', async () => {
      const trail = await auditManager.getPatientAuditTrail('PAT001');

      expect(trail).toHaveLength(2); // Two events for PAT001
      expect(trail.every(event => 
        event.resourceId === 'PAT001' || event.context?.patientId === 'PAT001'
      )).toBe(true);
    });

    it('should get user audit trail', async () => {
      const trail = await auditManager.getUserAuditTrail('user1');

      expect(trail).toHaveLength(2); // Two events for user1
      expect(trail.every(event => event.userId === 'user1')).toBe(true);
    });

    it('should filter audit trail by date range', async () => {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const now = new Date();

      const recentTrail = await auditManager.getPatientAuditTrail('PAT001', thirtyMinutesAgo, now);
      
      expect(recentTrail).toHaveLength(1); // Only one event in last 30 minutes
      expect(recentTrail[0].timestamp.getTime()).toBeGreaterThan(thirtyMinutesAgo.getTime());
    });

    it('should search audit logs with criteria', async () => {
      const searchResults = await auditManager.searchAuditLogs({
        userId: 'user1',
        eventType: HealthcareAuditEventType.PATIENT_VIEW
      });

      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].userId).toBe('user1');
      expect(searchResults[0].eventType).toBe(HealthcareAuditEventType.PATIENT_VIEW);
    });

    it('should search by risk score range', async () => {
      const highRiskResults = await auditManager.searchAuditLogs({
        riskScore: { min: 70, max: 100 }
      });

      highRiskResults.forEach(event => {
        expect(event.riskScore).toBeGreaterThanOrEqual(70);
        expect(event.riskScore).toBeLessThanOrEqual(100);
      });
    });
  });
});

describe('RiskAssessor', () => {
  let riskAssessor: RiskAssessor;

  beforeEach(() => {
    riskAssessor = new RiskAssessor();
  });

  describe('Risk Score Calculation', () => {
    it('should assign higher risk to PHI access', async () => {
      const phiEvent = {
        phi_accessed: true,
        outcome: 'success' as const,
        eventType: HealthcareAuditEventType.PATIENT_VIEW
      };

      const nonPhiEvent = {
        phi_accessed: false,
        outcome: 'success' as const,
        eventType: AuditEventType.LOGIN
      };

      const phiRisk = await riskAssessor.calculateRiskScore(phiEvent);
      const nonPhiRisk = await riskAssessor.calculateRiskScore(nonPhiEvent);

      expect(phiRisk).toBeGreaterThan(nonPhiRisk);
    });

    it('should assign higher risk to failed operations', async () => {
      const successEvent = {
        outcome: 'success' as const,
        eventType: AuditEventType.DATA_ACCESS
      };

      const failureEvent = {
        outcome: 'failure' as const,
        eventType: AuditEventType.DATA_ACCESS
      };

      const successRisk = await riskAssessor.calculateRiskScore(successEvent);
      const failureRisk = await riskAssessor.calculateRiskScore(failureEvent);

      expect(failureRisk).toBeGreaterThan(successRisk);
    });

    it('should assign higher risk to emergency access', async () => {
      const normalEvent = {
        context: { emergencyAccess: false }
      };

      const emergencyEvent = {
        context: { emergencyAccess: true }
      };

      const normalRisk = await riskAssessor.calculateRiskScore(normalEvent);
      const emergencyRisk = await riskAssessor.calculateRiskScore(emergencyEvent);

      expect(emergencyRisk).toBeGreaterThan(normalRisk);
    });

    it('should assign higher risk to after-hours access', async () => {
      // Mock current time to be after hours (e.g., 2 AM)
      const originalDate = Date;
      global.Date = class extends Date {
        constructor() {
          super();
          return new originalDate('2024-01-01T02:00:00Z'); // 2 AM
        }
        static now() {
          return new originalDate('2024-01-01T02:00:00Z').getTime();
        }
      } as any;

      const testEvent = {
        eventType: HealthcareAuditEventType.PATIENT_ACCESS,
        phi_accessed: true
      };
      
      const afterHoursRisk = await riskAssessor.calculateRiskScore(testEvent);

      // Restore original Date
      global.Date = originalDate;

      const normalHoursRisk = await riskAssessor.calculateRiskScore(testEvent);

      expect(afterHoursRisk).toBeGreaterThan(normalHoursRisk);
    });

    it('should assign risk based on event type', async () => {
      const testCases = [
        { eventType: HealthcareAuditEventType.DATA_EXPORT, expectedHighRisk: true },
        { eventType: HealthcareAuditEventType.PATIENT_DELETE, expectedHighRisk: true },
        { eventType: AuditEventType.UNAUTHORIZED_ACCESS, expectedHighRisk: true },
        { eventType: HealthcareAuditEventType.PATIENT_VIEW, expectedHighRisk: false },
        { eventType: AuditEventType.LOGIN, expectedHighRisk: false }
      ];

      const scores = await Promise.all(
        testCases.map(async ({ eventType }) => ({
          eventType,
          score: await riskAssessor.calculateRiskScore({ eventType })
        }))
      );

      testCases.forEach(({ eventType, expectedHighRisk }, index) => {
        const score = scores[index].score;
        if (expectedHighRisk) {
          expect(score).toBeGreaterThan(20);
        } else {
          expect(score).toBeLessThanOrEqual(20);
        }
      });
    });

    it('should cap risk score at 100', async () => {
      const highRiskEvent = {
        phi_accessed: true,
        outcome: 'failure' as const,
        eventType: AuditEventType.UNAUTHORIZED_ACCESS,
        context: { emergencyAccess: true }
      };

      const riskScore = await riskAssessor.calculateRiskScore(highRiskEvent);

      expect(riskScore).toBeLessThanOrEqual(100);
      expect(riskScore).toBeGreaterThan(80); // Should be very high but not exceed 100
    });
  });
});

describe('ViolationDetector', () => {
  let violationDetector: ViolationDetector;

  beforeEach(() => {
    violationDetector = new ViolationDetector();
  });

  describe('Violation Detection Rules', () => {
    it('should detect unauthorized access attempts', async () => {
      const unauthorizedEvent: HealthcareAuditLogEntry = {
        eventId: 'test-event',
        timestamp: new Date(),
        userId: 'user123',
        userRole: 'test',
        eventType: AuditEventType.UNAUTHORIZED_ACCESS,
        resourceType: 'patient',
        action: 'unauthorized_view',
        outcome: 'failure',
        ipAddress: '127.0.0.1',
        userAgent: 'test',
        sessionId: 'test-session',
        phi_accessed: false
      };

      const violations = await violationDetector.checkViolations(unauthorizedEvent);

      expect(violations).toHaveLength(1);
      expect(violations[0].violationType).toBe('unauthorized_access');
      expect(violations[0].severity).toBe('high');
    });

    it('should detect after-hours PHI access without emergency justification', async () => {
      const afterHoursEvent: HealthcareAuditLogEntry = {
        eventId: 'test-event',
        timestamp: new Date('2024-01-01T02:00:00'), // 2 AM local time
        userId: 'user123',
        userRole: 'nurse',
        eventType: HealthcareAuditEventType.PATIENT_VIEW,
        resourceType: 'patient',
        action: 'view',
        outcome: 'success',
        ipAddress: '127.0.0.1',
        userAgent: 'test',
        sessionId: 'test-session',
        phi_accessed: true,
        context: {
          emergencyAccess: false // No emergency justification
        }
      };

      const violations = await violationDetector.checkViolations(afterHoursEvent);

      expect(violations).toHaveLength(1);
      expect(violations[0].violationType).toBe('access_control_violation');
      expect(violations[0].severity).toBe('medium');
      expect(violations[0].description).toContain('after hours');
    });

    it('should detect bulk data export', async () => {
      const bulkExportEvent: HealthcareAuditLogEntry = {
        eventId: 'test-event',
        timestamp: new Date(),
        userId: 'user123',
        userRole: 'admin',
        eventType: HealthcareAuditEventType.DATA_EXPORT,
        resourceType: 'patient',
        action: 'bulk_export',
        outcome: 'success',
        ipAddress: '127.0.0.1',
        userAgent: 'test',
        sessionId: 'test-session',
        phi_accessed: true
      };

      const violations = await violationDetector.checkViolations(bulkExportEvent);

      expect(violations).toHaveLength(1);
      expect(violations[0].violationType).toBe('access_control_violation');
      expect(violations[0].severity).toBe('high');
    });

    it('should not flag legitimate emergency access', async () => {
      const emergencyEvent: HealthcareAuditLogEntry = {
        eventId: 'test-event',
        timestamp: new Date('2024-01-01T02:00:00Z'), // 2 AM
        userId: 'emergency_doc',
        userRole: 'emergency_physician',
        eventType: HealthcareAuditEventType.PATIENT_VIEW,
        resourceType: 'patient',
        action: 'emergency_view',
        outcome: 'success',
        ipAddress: '127.0.0.1',
        userAgent: 'test',
        sessionId: 'test-session',
        phi_accessed: true,
        context: {
          emergencyAccess: true // Legitimate emergency
        }
      };

      const violations = await violationDetector.checkViolations(emergencyEvent);

      // Should not flag emergency access as violation
      expect(violations.filter(v => v.violationType === 'access_control_violation')).toHaveLength(0);
    });

    it('should not flag normal business hours access', async () => {
      const normalEvent: HealthcareAuditLogEntry = {
        eventId: 'test-event',
        timestamp: new Date('2024-01-01T14:00:00Z'), // 2 PM
        userId: 'doctor123',
        userRole: 'physician',
        eventType: HealthcareAuditEventType.PATIENT_VIEW,
        resourceType: 'patient',
        action: 'view',
        outcome: 'success',
        ipAddress: '127.0.0.1',
        userAgent: 'test',
        sessionId: 'test-session',
        phi_accessed: true,
        context: {
          emergencyAccess: false
        }
      };

      const violations = await violationDetector.checkViolations(normalEvent);

      // Should not flag normal business hours access
      expect(violations).toHaveLength(0);
    });
  });

  describe('Violation Metadata', () => {
    it('should generate complete violation records', async () => {
      const unauthorizedEvent: HealthcareAuditLogEntry = {
        eventId: 'test-event',
        timestamp: new Date(),
        userId: 'user123',
        userRole: 'test',
        eventType: AuditEventType.UNAUTHORIZED_ACCESS,
        resourceType: 'patient',
        resourceId: 'PAT123',
        action: 'unauthorized_view',
        outcome: 'failure',
        ipAddress: '127.0.0.1',
        userAgent: 'test',
        sessionId: 'test-session',
        phi_accessed: true
      };

      const violations = await violationDetector.checkViolations(unauthorizedEvent);

      expect(violations[0]).toMatchObject({
        violationId: expect.any(String),
        timestamp: expect.any(Date),
        violationType: 'unauthorized_access',
        severity: 'high',
        description: expect.any(String),
        affectedResources: ['PAT123'],
        userId: 'user123',
        requiresNotification: true,
        resolved: false
      });
    });

    it('should mark high severity violations for notification', async () => {
      const criticalEvent: HealthcareAuditLogEntry = {
        eventId: 'test-event',
        timestamp: new Date(),
        userId: 'user123',
        userRole: 'test',
        eventType: AuditEventType.UNAUTHORIZED_ACCESS,
        resourceType: 'patient',
        action: 'unauthorized_access',
        outcome: 'failure',
        ipAddress: '127.0.0.1',
        userAgent: 'test',
        sessionId: 'test-session',
        phi_accessed: true
      };

      const violations = await violationDetector.checkViolations(criticalEvent);

      expect(violations[0].severity).toBe('high');
      expect(violations[0].requiresNotification).toBe(true);
    });
  });
});

describe('InMemoryAuditStore', () => {
  let auditStore: InMemoryAuditStore;

  beforeEach(() => {
    auditStore = new InMemoryAuditStore();
  });

  describe('Event Storage and Retrieval', () => {
    it('should store and retrieve events', async () => {
      const testEvent: HealthcareAuditLogEntry = {
        eventId: 'test-event-1',
        timestamp: new Date(),
        userId: 'user123',
        userRole: 'physician',
        eventType: HealthcareAuditEventType.PATIENT_VIEW,
        resourceType: 'patient',
        resourceId: 'PAT123',
        action: 'view',
        outcome: 'success',
        ipAddress: '127.0.0.1',
        userAgent: 'test',
        sessionId: 'session-1',
        phi_accessed: true
      };

      await auditStore.storeEvent(testEvent);

      const events = await auditStore.getEventsByDateRange(
        new Date(Date.now() - 60000),
        new Date(Date.now() + 60000)
      );

      expect(events).toHaveLength(1);
      expect(events[0]).toEqual(testEvent);
    });

    it('should filter events by date range', async () => {
      const baseTime = Date.now();
      
      const events = [
        {
          eventId: 'old-event',
          timestamp: new Date(baseTime - 3600000), // 1 hour ago
          userId: 'user1',
          userRole: 'physician',
          eventType: HealthcareAuditEventType.PATIENT_VIEW,
          resourceType: 'patient',
          action: 'view',
          outcome: 'success' as const,
          ipAddress: '127.0.0.1',
          userAgent: 'test',
          sessionId: 'session-1',
          phi_accessed: true
        },
        {
          eventId: 'recent-event',
          timestamp: new Date(baseTime - 600000), // 10 minutes ago
          userId: 'user2',
          userRole: 'nurse',
          eventType: HealthcareAuditEventType.PATIENT_UPDATE,
          resourceType: 'patient',
          action: 'update',
          outcome: 'success' as const,
          ipAddress: '127.0.0.1',
          userAgent: 'test',
          sessionId: 'session-2',
          phi_accessed: true
        }
      ];

      for (const event of events) {
        await auditStore.storeEvent(event);
      }

      // Get events from last 30 minutes
      const recentEvents = await auditStore.getEventsByDateRange(
        new Date(baseTime - 1800000), // 30 minutes ago
        new Date()
      );

      expect(recentEvents).toHaveLength(1);
      expect(recentEvents[0].eventId).toBe('recent-event');
    });

    it('should filter events by patient', async () => {
      const events = [
        {
          eventId: 'patient1-event',
          timestamp: new Date(),
          userId: 'user1',
          userRole: 'physician',
          eventType: HealthcareAuditEventType.PATIENT_VIEW,
          resourceType: 'patient',
          action: 'view',
          outcome: 'success' as const,
          ipAddress: '127.0.0.1',
          userAgent: 'test',
          sessionId: 'session-1',
          phi_accessed: true,
          context: { patientId: 'PAT001' }
        },
        {
          eventId: 'patient2-event',
          timestamp: new Date(),
          userId: 'user2',
          userRole: 'nurse',
          eventType: HealthcareAuditEventType.PATIENT_VIEW,
          resourceType: 'patient',
          action: 'view',
          outcome: 'success' as const,
          ipAddress: '127.0.0.1',
          userAgent: 'test',
          sessionId: 'session-2',
          phi_accessed: true,
          context: { patientId: 'PAT002' }
        }
      ];

      for (const event of events) {
        await auditStore.storeEvent(event);
      }

      const patient1Events = await auditStore.getEventsByPatient('PAT001');
      
      expect(patient1Events).toHaveLength(1);
      expect(patient1Events[0].eventId).toBe('patient1-event');
    });

    it('should filter events by user', async () => {
      const events = [
        {
          eventId: 'user1-event1',
          timestamp: new Date(),
          userId: 'user1',
          userRole: 'physician',
          eventType: HealthcareAuditEventType.PATIENT_VIEW,
          resourceType: 'patient',
          action: 'view',
          outcome: 'success' as const,
          ipAddress: '127.0.0.1',
          userAgent: 'test',
          sessionId: 'session-1',
          phi_accessed: true
        },
        {
          eventId: 'user1-event2',
          timestamp: new Date(),
          userId: 'user1',
          userRole: 'physician',
          eventType: HealthcareAuditEventType.PATIENT_UPDATE,
          resourceType: 'patient',
          action: 'update',
          outcome: 'success' as const,
          ipAddress: '127.0.0.1',
          userAgent: 'test',
          sessionId: 'session-1',
          phi_accessed: true
        },
        {
          eventId: 'user2-event',
          timestamp: new Date(),
          userId: 'user2',
          userRole: 'nurse',
          eventType: HealthcareAuditEventType.PATIENT_VIEW,
          resourceType: 'patient',
          action: 'view',
          outcome: 'success' as const,
          ipAddress: '127.0.0.1',
          userAgent: 'test',
          sessionId: 'session-2',
          phi_accessed: true
        }
      ];

      for (const event of events) {
        await auditStore.storeEvent(event);
      }

      const user1Events = await auditStore.getEventsByUser('user1');
      
      expect(user1Events).toHaveLength(2);
      expect(user1Events.every(e => e.userId === 'user1')).toBe(true);
    });
  });

  describe('Search Functionality', () => {
    beforeEach(async () => {
      // Setup test data for search tests
      const testEvents = [
        {
          eventId: 'search-test-1',
          timestamp: new Date(),
          userId: 'doctor1',
          userRole: 'physician',
          eventType: HealthcareAuditEventType.PATIENT_VIEW,
          resourceType: 'patient',
          action: 'view',
          outcome: 'success' as const,
          ipAddress: '127.0.0.1',
          userAgent: 'test',
          sessionId: 'session-1',
          phi_accessed: true,
          riskScore: 25,
          context: { patientId: 'PAT001' }
        },
        {
          eventId: 'search-test-2',
          timestamp: new Date(),
          userId: 'nurse1',
          userRole: 'nurse',
          eventType: HealthcareAuditEventType.PATIENT_UPDATE,
          resourceType: 'patient',
          action: 'update',
          outcome: 'failure' as const,
          ipAddress: '127.0.0.1',
          userAgent: 'test',
          sessionId: 'session-2',
          phi_accessed: true,
          riskScore: 85,
          context: { patientId: 'PAT002' }
        },
        {
          eventId: 'search-test-3',
          timestamp: new Date(),
          userId: 'admin1',
          userRole: 'admin',
          eventType: AuditEventType.LOGIN,
          resourceType: 'authentication',
          action: 'login',
          outcome: 'success' as const,
          ipAddress: '127.0.0.1',
          userAgent: 'test',
          sessionId: 'session-3',
          phi_accessed: false,
          riskScore: 10
        }
      ];

      for (const event of testEvents) {
        await auditStore.storeEvent(event);
      }
    });

    it('should search by user ID', async () => {
      const results = await auditStore.searchEvents({ userId: 'doctor1' });
      
      expect(results).toHaveLength(1);
      expect(results[0].userId).toBe('doctor1');
    });

    it('should search by patient ID', async () => {
      const results = await auditStore.searchEvents({ patientId: 'PAT002' });
      
      expect(results).toHaveLength(1);
      expect(results[0].context?.patientId).toBe('PAT002');
    });

    it('should search by event type', async () => {
      const results = await auditStore.searchEvents({ 
        eventType: HealthcareAuditEventType.PATIENT_VIEW 
      });
      
      expect(results).toHaveLength(1);
      expect(results[0].eventType).toBe(HealthcareAuditEventType.PATIENT_VIEW);
    });

    it('should search by outcome', async () => {
      const results = await auditStore.searchEvents({ outcome: 'failure' });
      
      expect(results).toHaveLength(1);
      expect(results[0].outcome).toBe('failure');
    });

    it('should search by risk score range', async () => {
      const highRiskResults = await auditStore.searchEvents({ 
        riskScore: { min: 50, max: 100 } 
      });
      
      expect(highRiskResults).toHaveLength(1);
      expect(highRiskResults[0].riskScore).toBe(85);

      const lowRiskResults = await auditStore.searchEvents({ 
        riskScore: { min: 0, max: 50 } 
      });
      
      expect(lowRiskResults).toHaveLength(2);
      expect(lowRiskResults.every(r => r.riskScore! <= 50)).toBe(true);
    });

    it('should handle complex search criteria', async () => {
      const results = await auditStore.searchEvents({
        outcome: 'success',
        riskScore: { min: 20, max: 50 }
      });
      
      expect(results).toHaveLength(1);
      expect(results[0].outcome).toBe('success');
      expect(results[0].riskScore).toBe(25);
    });

    it('should return empty results for non-matching criteria', async () => {
      const results = await auditStore.searchEvents({ userId: 'nonexistent-user' });
      
      expect(results).toHaveLength(0);
    });
  });
});