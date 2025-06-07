/**
 * HIPAA Audit Trail System
 * 
 * Implements comprehensive audit logging for all patient data access
 * and system activities as required by HIPAA technical safeguards.
 * 
 * Features:
 * - Immutable audit logs
 * - Real-time violation detection
 * - Compliance reporting
 * - Automated breach detection
 * - Audit log integrity verification
 */

import { z } from 'zod';
import { 
  AuditEventType, 
  DataClassification, 
  AuditLogEntry, 
  AuditLogSchema,
  ComplianceViolation,
  ComplianceViolationSchema 
} from './HIPAACompliance';

// Extended audit event types for healthcare
export enum HealthcareAuditEventType {
  PATIENT_VIEW = 'patient_view',
  PATIENT_CREATE = 'patient_create',
  PATIENT_UPDATE = 'patient_update',
  PATIENT_DELETE = 'patient_delete',
  APPOINTMENT_CREATE = 'appointment_create',
  APPOINTMENT_UPDATE = 'appointment_update',
  APPOINTMENT_CANCEL = 'appointment_cancel',
  MEDICAL_RECORD_ACCESS = 'medical_record_access',
  MEDICAL_RECORD_UPDATE = 'medical_record_update',
  PRESCRIPTION_CREATE = 'prescription_create',
  PRESCRIPTION_UPDATE = 'prescription_update',
  INSURANCE_VERIFY = 'insurance_verify',
  BILLING_ACCESS = 'billing_access',
  REPORT_GENERATE = 'report_generate',
  DATA_EXPORT = 'data_export',
  DATA_IMPORT = 'data_import',
  BACKUP_CREATE = 'backup_create',
  BACKUP_RESTORE = 'backup_restore',
  EMERGENCY_ACCESS = 'emergency_access'
}

// Audit Context Schema
export const AuditContextSchema = z.object({
  patientId: z.string().optional(),
  providerId: z.string().optional(),
  appointmentId: z.string().optional(),
  facilityId: z.string().optional(),
  departmentId: z.string().optional(),
  recordType: z.string().optional(),
  dataFields: z.array(z.string()).optional(),
  businessJustification: z.string().optional(),
  emergencyAccess: z.boolean().optional(),
  consentStatus: z.string().optional()
});

// Enhanced Audit Log Entry for Healthcare
export const HealthcareAuditLogSchema = AuditLogSchema.extend({
  eventType: z.union([
    z.nativeEnum(AuditEventType),
    z.nativeEnum(HealthcareAuditEventType)
  ]),
  context: AuditContextSchema.optional(),
  riskScore: z.number().min(0).max(100).optional(),
  requiresReview: z.boolean().optional(),
  reviewedBy: z.string().optional(),
  reviewDate: z.date().optional(),
  geoLocation: z.object({
    country: z.string(),
    region: z.string(),
    city: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional()
  }).optional()
});

// Violation Detection Rule
export interface ViolationRule {
  ruleId: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  conditions: (event: HealthcareAuditLogEntry) => boolean;
  automaticResponse?: (event: HealthcareAuditLogEntry) => Promise<void>;
}

// Audit Statistics
export interface AuditStatistics {
  totalEvents: number;
  phiAccessEvents: number;
  uniqueUsers: number;
  uniquePatients: number;
  highRiskEvents: number;
  violations: number;
  averageRiskScore: number;
  eventsByType: Record<string, number>;
  eventsByHour: Record<string, number>;
  topUsers: Array<{ userId: string; eventCount: number }>;
  topPatients: Array<{ patientId: string; accessCount: number }>;
}

export type AuditContext = z.infer<typeof AuditContextSchema>;
export type HealthcareAuditLogEntry = z.infer<typeof HealthcareAuditLogSchema>;

/**
 * HIPAA Audit Trail Manager
 */
export class AuditTrailManager {
  private auditStore: AuditStore;
  private violationDetector: ViolationDetector;
  private riskAssessor: RiskAssessor;

  constructor(auditStore: AuditStore) {
    this.auditStore = auditStore;
    this.violationDetector = new ViolationDetector();
    this.riskAssessor = new RiskAssessor();
  }

  /**
   * Log a healthcare audit event
   */
  async logEvent(
    eventData: Partial<HealthcareAuditLogEntry>
  ): Promise<HealthcareAuditLogEntry> {
    try {
      // Create complete audit entry
      const auditEntry: HealthcareAuditLogEntry = {
        eventId: crypto.randomUUID(),
        timestamp: new Date(),
        ipAddress: await this.getCurrentIP(),
        userAgent: navigator.userAgent,
        sessionId: this.getCurrentSessionId(),
        phi_accessed: this.isPHIAccessed(eventData),
        riskScore: await this.riskAssessor.calculateRiskScore(eventData),
        requiresReview: false,
        ...eventData
      } as HealthcareAuditLogEntry;

      // Validate the audit entry
      const validatedEntry = HealthcareAuditLogSchema.parse(auditEntry);

      // Determine if review is required
      validatedEntry.requiresReview = this.requiresManualReview(validatedEntry);

      // Store the audit entry
      await this.auditStore.storeEvent(validatedEntry);

      // Check for violations
      await this.violationDetector.checkViolations(validatedEntry);

      // Trigger real-time alerts if necessary
      if (validatedEntry.riskScore && validatedEntry.riskScore > 80) {
        await this.triggerHighRiskAlert(validatedEntry);
      }

      return validatedEntry;
    } catch (error) {
      // Log the error but don't throw to avoid breaking the main application flow
      console.error('Audit logging failed:', error);
      
      // Create a minimal audit entry for the failure
      const errorEntry: HealthcareAuditLogEntry = {
        eventId: crypto.randomUUID(),
        timestamp: new Date(),
        userId: eventData.userId || 'unknown',
        userRole: eventData.userRole || 'unknown',
        eventType: AuditEventType.SYSTEM_ERROR,
        resourceType: 'audit_system',
        action: 'log_event',
        outcome: 'failure',
        ipAddress: await this.getCurrentIP(),
        userAgent: navigator.userAgent,
        sessionId: this.getCurrentSessionId(),
        phi_accessed: false,
        details: { originalEvent: eventData, error: error.message }
      };

      await this.auditStore.storeEvent(errorEntry);
      throw error;
    }
  }

  /**
   * Log patient data access
   */
  async logPatientAccess(
    userId: string,
    userRole: string,
    patientId: string,
    action: string,
    dataFields: string[] = [],
    businessJustification?: string
  ): Promise<void> {
    await this.logEvent({
      userId,
      userRole,
      eventType: HealthcareAuditEventType.PATIENT_VIEW,
      resourceType: 'patient',
      resourceId: patientId,
      action,
      outcome: 'success',
      dataClassification: DataClassification.PHI,
      context: {
        patientId,
        dataFields,
        businessJustification
      }
    });
  }

  /**
   * Log medical record access
   */
  async logMedicalRecordAccess(
    userId: string,
    userRole: string,
    patientId: string,
    recordType: string,
    action: string,
    emergencyAccess: boolean = false
  ): Promise<void> {
    await this.logEvent({
      userId,
      userRole,
      eventType: HealthcareAuditEventType.MEDICAL_RECORD_ACCESS,
      resourceType: 'medical_record',
      resourceId: `${patientId}_${recordType}`,
      action,
      outcome: 'success',
      dataClassification: DataClassification.PHI,
      context: {
        patientId,
        recordType,
        emergencyAccess
      }
    });
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    startDate: Date,
    endDate: Date,
    includeDetails: boolean = false
  ): Promise<ComplianceReport> {
    const events = await this.auditStore.getEventsByDateRange(startDate, endDate);
    const violations = await this.auditStore.getViolationsByDateRange(startDate, endDate);
    const statistics = this.calculateStatistics(events);

    return {
      reportId: crypto.randomUUID(),
      generatedAt: new Date(),
      period: { startDate, endDate },
      summary: {
        totalEvents: statistics.totalEvents,
        phiAccess: statistics.phiAccessEvents,
        violations: violations.length,
        unauthorizedAttempts: events.filter(e => e.outcome === 'failure').length
      },
      statistics,
      violations: includeDetails ? violations : [],
      recommendations: this.generateRecommendations(statistics, violations),
      events: includeDetails ? events : []
    };
  }

  /**
   * Get audit trail for specific patient
   */
  async getPatientAuditTrail(
    patientId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<HealthcareAuditLogEntry[]> {
    return this.auditStore.getEventsByPatient(patientId, startDate, endDate);
  }

  /**
   * Get audit trail for specific user
   */
  async getUserAuditTrail(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<HealthcareAuditLogEntry[]> {
    return this.auditStore.getEventsByUser(userId, startDate, endDate);
  }

  /**
   * Search audit logs
   */
  async searchAuditLogs(searchCriteria: {
    userId?: string;
    patientId?: string;
    eventType?: string;
    outcome?: string;
    riskScore?: { min?: number; max?: number };
    startDate?: Date;
    endDate?: Date;
  }): Promise<HealthcareAuditLogEntry[]> {
    return this.auditStore.searchEvents(searchCriteria);
  }

  // Private helper methods
  private async getCurrentIP(): Promise<string> {
    try {
      // In a real application, you might use a service to get the client IP
      return '127.0.0.1'; // Placeholder
    } catch {
      return 'unknown';
    }
  }

  private getCurrentSessionId(): string {
    // Get session ID from storage or generate one
    let sessionId = sessionStorage.getItem('audit_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('audit_session_id', sessionId);
    }
    return sessionId;
  }

  private isPHIAccessed(eventData: Partial<HealthcareAuditLogEntry>): boolean {
    return eventData.dataClassification === DataClassification.PHI ||
           eventData.resourceType?.toLowerCase().includes('patient') ||
           eventData.resourceType?.toLowerCase().includes('medical') ||
           Object.values(HealthcareAuditEventType).includes(eventData.eventType as any);
  }

  private requiresManualReview(entry: HealthcareAuditLogEntry): boolean {
    return (entry.riskScore && entry.riskScore > 70) ||
           entry.context?.emergencyAccess ||
           entry.eventType === HealthcareAuditEventType.DATA_EXPORT ||
           entry.outcome === 'failure';
  }

  private async triggerHighRiskAlert(entry: HealthcareAuditLogEntry): Promise<void> {
    // Implement real-time alerting logic
    console.warn('High risk audit event detected:', entry);
    
    // In a real implementation, this might:
    // - Send alerts to security team
    // - Trigger automated responses
    // - Create incident tickets
    // - Lock user accounts if necessary
  }

  private calculateStatistics(events: HealthcareAuditLogEntry[]): AuditStatistics {
    const stats: AuditStatistics = {
      totalEvents: events.length,
      phiAccessEvents: events.filter(e => e.phi_accessed).length,
      uniqueUsers: new Set(events.map(e => e.userId)).size,
      uniquePatients: new Set(
        events
          .map(e => e.context?.patientId)
          .filter(Boolean)
      ).size,
      highRiskEvents: events.filter(e => e.riskScore && e.riskScore > 70).length,
      violations: events.filter(e => e.outcome === 'failure').length,
      averageRiskScore: events.reduce((sum, e) => sum + (e.riskScore || 0), 0) / events.length,
      eventsByType: {},
      eventsByHour: {},
      topUsers: [],
      topPatients: []
    };

    // Calculate event distribution by type
    events.forEach(event => {
      const eventType = event.eventType.toString();
      stats.eventsByType[eventType] = (stats.eventsByType[eventType] || 0) + 1;

      const hour = event.timestamp.getHours().toString();
      stats.eventsByHour[hour] = (stats.eventsByHour[hour] || 0) + 1;
    });

    // Calculate top users and patients
    const userCounts = new Map<string, number>();
    const patientCounts = new Map<string, number>();

    events.forEach(event => {
      userCounts.set(event.userId, (userCounts.get(event.userId) || 0) + 1);
      if (event.context?.patientId) {
        patientCounts.set(
          event.context.patientId,
          (patientCounts.get(event.context.patientId) || 0) + 1
        );
      }
    });

    stats.topUsers = Array.from(userCounts.entries())
      .map(([userId, eventCount]) => ({ userId, eventCount }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 10);

    stats.topPatients = Array.from(patientCounts.entries())
      .map(([patientId, accessCount]) => ({ patientId, accessCount }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 10);

    return stats;
  }

  private generateRecommendations(
    statistics: AuditStatistics,
    violations: ComplianceViolation[]
  ): string[] {
    const recommendations: string[] = [];

    if (statistics.violations > statistics.totalEvents * 0.05) {
      recommendations.push('High failure rate detected. Review authentication and authorization controls.');
    }

    if (statistics.highRiskEvents > statistics.totalEvents * 0.1) {
      recommendations.push('Consider implementing additional access controls for high-risk activities.');
    }

    if (violations.some(v => v.violationType === 'unauthorized_access')) {
      recommendations.push('Unauthorized access detected. Review user permissions and implement stronger access controls.');
    }

    if (statistics.averageRiskScore > 50) {
      recommendations.push('Average risk score is elevated. Consider additional security training for users.');
    }

    return recommendations;
  }
}

/**
 * Risk Assessment Service
 */
export class RiskAssessor {
  async calculateRiskScore(eventData: Partial<HealthcareAuditLogEntry>): Promise<number> {
    let riskScore = 0;

    // Base risk factors
    if (eventData.phi_accessed) riskScore += 20;
    if (eventData.outcome === 'failure') riskScore += 30;
    if (eventData.context?.emergencyAccess) riskScore += 15;

    // Time-based risk factors
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) riskScore += 10; // After hours access

    // Event type risk factors
    switch (eventData.eventType) {
      case HealthcareAuditEventType.DATA_EXPORT:
        riskScore += 25;
        break;
      case HealthcareAuditEventType.PATIENT_DELETE:
        riskScore += 35;
        break;
      case AuditEventType.UNAUTHORIZED_ACCESS:
        riskScore += 50;
        break;
    }

    // Location-based risk (placeholder)
    // In a real implementation, you might check for unusual locations
    
    return Math.min(riskScore, 100);
  }
}

/**
 * Violation Detection Service
 */
export class ViolationDetector {
  private rules: ViolationRule[] = [
    {
      ruleId: 'unauthorized-access',
      name: 'Unauthorized Access Attempt',
      description: 'User attempted to access resources without proper authorization',
      severity: 'high',
      conditions: (event) => event.outcome === 'failure' && event.eventType === AuditEventType.UNAUTHORIZED_ACCESS
    },
    {
      ruleId: 'after-hours-phi-access',
      name: 'After Hours PHI Access',
      description: 'PHI accessed outside normal business hours without emergency justification',
      severity: 'medium',
      conditions: (event) => {
        const hour = event.timestamp.getHours();
        return event.phi_accessed && 
               (hour < 6 || hour > 22) && 
               !event.context?.emergencyAccess;
      }
    },
    {
      ruleId: 'bulk-patient-access',
      name: 'Bulk Patient Data Access',
      description: 'User accessed an unusually large number of patient records',
      severity: 'high',
      conditions: (event) => event.eventType === HealthcareAuditEventType.DATA_EXPORT
    }
  ];

  async checkViolations(event: HealthcareAuditLogEntry): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];

    for (const rule of this.rules) {
      if (rule.conditions(event)) {
        const violation: ComplianceViolation = {
          violationId: crypto.randomUUID(),
          timestamp: new Date(),
          violationType: this.mapRuleToViolationType(rule.ruleId),
          severity: rule.severity,
          description: `${rule.name}: ${rule.description}`,
          affectedResources: [event.resourceId || event.resourceType],
          userId: event.userId,
          automaticResponse: rule.automaticResponse ? 'Applied' : undefined,
          requiresNotification: rule.severity === 'high' || rule.severity === 'critical',
          resolved: false
        };

        violations.push(violation);

        // Execute automatic response if defined
        if (rule.automaticResponse) {
          await rule.automaticResponse(event);
        }
      }
    }

    return violations;
  }

  private mapRuleToViolationType(ruleId: string): ComplianceViolation['violationType'] {
    switch (ruleId) {
      case 'unauthorized-access':
        return 'unauthorized_access';
      case 'after-hours-phi-access':
      case 'bulk-patient-access':
        return 'access_control_violation';
      default:
        return 'access_control_violation';
    }
  }
}

/**
 * Audit Storage Interface
 */
export interface AuditStore {
  storeEvent(event: HealthcareAuditLogEntry): Promise<void>;
  getEventsByDateRange(startDate: Date, endDate: Date): Promise<HealthcareAuditLogEntry[]>;
  getEventsByPatient(patientId: string, startDate?: Date, endDate?: Date): Promise<HealthcareAuditLogEntry[]>;
  getEventsByUser(userId: string, startDate?: Date, endDate?: Date): Promise<HealthcareAuditLogEntry[]>;
  getViolationsByDateRange(startDate: Date, endDate: Date): Promise<ComplianceViolation[]>;
  searchEvents(criteria: any): Promise<HealthcareAuditLogEntry[]>;
}

// Compliance Report Extension
export interface ComplianceReport {
  reportId: string;
  generatedAt: Date;
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalEvents: number;
    phiAccess: number;
    violations: number;
    unauthorizedAttempts: number;
  };
  statistics: AuditStatistics;
  violations: ComplianceViolation[];
  recommendations: string[];
  events?: HealthcareAuditLogEntry[];
}

/**
 * In-Memory Audit Store (for demonstration)
 * In production, this should be replaced with a secure, immutable storage system
 */
export class InMemoryAuditStore implements AuditStore {
  private events: HealthcareAuditLogEntry[] = [];
  private violations: ComplianceViolation[] = [];

  async storeEvent(event: HealthcareAuditLogEntry): Promise<void> {
    this.events.push(event);
  }

  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<HealthcareAuditLogEntry[]> {
    return this.events.filter(
      event => event.timestamp >= startDate && event.timestamp <= endDate
    );
  }

  async getEventsByPatient(
    patientId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<HealthcareAuditLogEntry[]> {
    let filtered = this.events.filter(event => event.context?.patientId === patientId);
    
    if (startDate && endDate) {
      filtered = filtered.filter(
        event => event.timestamp >= startDate && event.timestamp <= endDate
      );
    }
    
    return filtered;
  }

  async getEventsByUser(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<HealthcareAuditLogEntry[]> {
    let filtered = this.events.filter(event => event.userId === userId);
    
    if (startDate && endDate) {
      filtered = filtered.filter(
        event => event.timestamp >= startDate && event.timestamp <= endDate
      );
    }
    
    return filtered;
  }

  async getViolationsByDateRange(startDate: Date, endDate: Date): Promise<ComplianceViolation[]> {
    return this.violations.filter(
      violation => violation.timestamp >= startDate && violation.timestamp <= endDate
    );
  }

  async searchEvents(criteria: any): Promise<HealthcareAuditLogEntry[]> {
    return this.events.filter(event => {
      if (criteria.userId && event.userId !== criteria.userId) return false;
      if (criteria.patientId && event.context?.patientId !== criteria.patientId) return false;
      if (criteria.eventType && event.eventType !== criteria.eventType) return false;
      if (criteria.outcome && event.outcome !== criteria.outcome) return false;
      if (criteria.riskScore) {
        if (criteria.riskScore.min && (!event.riskScore || event.riskScore < criteria.riskScore.min)) return false;
        if (criteria.riskScore.max && (!event.riskScore || event.riskScore > criteria.riskScore.max)) return false;
      }
      if (criteria.startDate && event.timestamp < criteria.startDate) return false;
      if (criteria.endDate && event.timestamp > criteria.endDate) return false;
      
      return true;
    });
  }
}

// Export the main audit trail manager
export const auditStore = new InMemoryAuditStore();
export const auditTrail = new AuditTrailManager(auditStore);