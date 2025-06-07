/**
 * Business Associate Agreement (BAA) Compliance Verifier
 * 
 * Comprehensive verification framework for HIPAA Business Associate Agreements
 * Ensures third-party vendors and partners meet BAA compliance requirements
 * 
 * @author Project-H Security Team
 * @version 1.0.0
 */

import { z } from 'zod';

// BAA Configuration
export interface BAAConfig {
  organizationName: string;
  facilityId: string;
  verificationLevel: VerificationLevel;
  assessmentFrequency: AssessmentFrequency;
  autoRenewalTracking: boolean;
  complianceThreshold: number; // percentage
  requiresAttestation: boolean;
  escalationContacts: EscalationContact[];
}

// Verification Levels
export enum VerificationLevel {
  BASIC = 'basic',
  STANDARD = 'standard',
  COMPREHENSIVE = 'comprehensive',
  ENTERPRISE = 'enterprise'
}

// Assessment Frequency
export enum AssessmentFrequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUAL = 'semi_annual',
  ANNUAL = 'annual',
  ON_DEMAND = 'on_demand'
}

// Escalation Contact
export interface EscalationContact {
  name: string;
  role: string;
  email: string;
  phone: string;
  escalationLevel: number;
  responsibilities: string[];
}

// Business Associate Schema
export const BusinessAssociateSchema = z.object({
  associateId: z.string(),
  organizationName: z.string(),
  businessType: z.enum([
    'technology_vendor',
    'cloud_provider',
    'consulting_firm',
    'healthcare_provider',
    'billing_company',
    'legal_services',
    'accounting_firm',
    'other'
  ]),
  contactInformation: z.object({
    primaryContact: z.object({
      name: z.string(),
      title: z.string(),
      email: z.string(),
      phone: z.string()
    }),
    securityContact: z.object({
      name: z.string(),
      title: z.string(),
      email: z.string(),
      phone: z.string()
    }).optional(),
    legalContact: z.object({
      name: z.string(),
      title: z.string(),
      email: z.string(),
      phone: z.string()
    }).optional()
  }),
  servicesProvided: z.array(z.string()),
  dataTypes: z.array(z.enum(['phi', 'pii', 'financial', 'operational', 'other'])),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  lastAssessment: z.date().optional(),
  status: z.enum(['active', 'inactive', 'under_review', 'non_compliant', 'terminated']),
  addedDate: z.date(),
  lastUpdated: z.date()
});

export type BusinessAssociate = z.infer<typeof BusinessAssociateSchema>;

// BAA Agreement Schema
export const BAASchema = z.object({
  baaId: z.string(),
  associateId: z.string(),
  agreementVersion: z.string(),
  effectiveDate: z.date(),
  expirationDate: z.date(),
  autoRenewal: z.boolean(),
  signedDate: z.date(),
  signatories: z.array(z.object({
    name: z.string(),
    title: z.string(),
    organization: z.string(),
    signatureDate: z.date(),
    ipAddress: z.string().optional(),
    verified: z.boolean()
  })),
  terms: z.object({
    permittedUses: z.array(z.string()),
    restrictedActivities: z.array(z.string()),
    dataRetentionPeriod: z.number(), // years
    subcontractorRequirements: z.boolean(),
    incidentNotificationTime: z.number(), // hours
    auditRights: z.boolean(),
    returnDestructionRequirements: z.boolean(),
    minimumSecurityRequirements: z.array(z.string())
  }),
  amendments: z.array(z.object({
    amendmentId: z.string(),
    date: z.date(),
    description: z.string(),
    signedBy: z.array(z.string())
  })),
  status: z.enum(['draft', 'pending', 'executed', 'expired', 'terminated', 'breached']),
  complianceStatus: z.enum(['compliant', 'non_compliant', 'pending_review', 'at_risk']),
  lastReviewed: z.date().optional(),
  nextReview: z.date(),
  metadata: z.record(z.any())
});

export type BAA = z.infer<typeof BAASchema>;

// Compliance Assessment Schema
export const ComplianceAssessmentSchema = z.object({
  assessmentId: z.string(),
  associateId: z.string(),
  baaId: z.string(),
  assessmentDate: z.date(),
  assessor: z.object({
    name: z.string(),
    organization: z.string(),
    credentials: z.array(z.string())
  }),
  scope: z.array(z.enum([
    'technical_safeguards',
    'administrative_safeguards',
    'physical_safeguards',
    'breach_notification',
    'subcontractor_management',
    'incident_response',
    'data_handling',
    'audit_compliance'
  ])),
  findings: z.array(z.object({
    findingId: z.string(),
    category: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    title: z.string(),
    description: z.string(),
    requirement: z.string(),
    evidence: z.array(z.string()),
    recommendation: z.string(),
    dueDate: z.date().optional(),
    status: z.enum(['open', 'in_progress', 'resolved', 'accepted_risk'])
  })),
  overallScore: z.number().min(0).max(100),
  complianceLevel: z.enum(['fully_compliant', 'mostly_compliant', 'partially_compliant', 'non_compliant']),
  riskAssessment: z.object({
    dataRisk: z.enum(['low', 'medium', 'high', 'critical']),
    operationalRisk: z.enum(['low', 'medium', 'high', 'critical']),
    reputationalRisk: z.enum(['low', 'medium', 'high', 'critical']),
    overallRisk: z.enum(['low', 'medium', 'high', 'critical'])
  }),
  recommendations: z.array(z.string()),
  actionPlan: z.array(z.object({
    action: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    responsible: z.string(),
    dueDate: z.date(),
    status: z.enum(['pending', 'in_progress', 'completed'])
  })),
  nextAssessment: z.date(),
  attestation: z.object({
    attestedBy: z.string(),
    attestationDate: z.date(),
    statement: z.string(),
    supporting_documents: z.array(z.string())
  }).optional()
});

export type ComplianceAssessment = z.infer<typeof ComplianceAssessmentSchema>;

// BAA Verification Result
export interface BAAVerificationResult {
  verificationId: string;
  timestamp: Date;
  totalAssociates: number;
  compliantAssociates: number;
  nonCompliantAssociates: number;
  atRiskAssociates: number;
  expiringBAAs: BAA[];
  criticalFindings: any[];
  overallCompliance: number;
  riskSummary: {
    totalRisk: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: string[];
    mitigation: string[];
  };
  recommendations: string[];
  actionItems: any[];
}

/**
 * BAA Compliance Verifier Class
 */
export class BAAComplianceVerifier {
  private config: BAAConfig;
  private businessAssociates: BusinessAssociate[] = [];
  private baaAgreements: BAA[] = [];
  private assessments: ComplianceAssessment[] = [];

  constructor(config?: Partial<BAAConfig>) {
    this.config = {
      organizationName: 'Mental Health Practice',
      facilityId: 'MHP-001',
      verificationLevel: VerificationLevel.STANDARD,
      assessmentFrequency: AssessmentFrequency.QUARTERLY,
      autoRenewalTracking: true,
      complianceThreshold: 85,
      requiresAttestation: true,
      escalationContacts: [],
      ...config
    };

    this.initializeSampleData();
  }

  /**
   * Verify BAA compliance across all business associates
   */
  async verifyBAACompliance(): Promise<BAAVerificationResult> {
    console.log('📋 Starting BAA compliance verification...');

    const verificationId = `baa-verification-${Date.now()}`;
    const timestamp = new Date();

    try {
      // Update business associate statuses
      await this.updateBusinessAssociateStatuses();

      // Check BAA agreement statuses
      await this.checkBAAStatuses();

      // Run compliance assessments
      await this.runComplianceAssessments();

      // Calculate metrics
      const metrics = this.calculateComplianceMetrics();

      // Identify risks and issues
      const riskAnalysis = this.analyzeRisks();

      // Generate recommendations
      const recommendations = this.generateRecommendations();

      // Create action items
      const actionItems = this.createActionItems();

      const result: BAAVerificationResult = {
        verificationId,
        timestamp,
        totalAssociates: this.businessAssociates.length,
        compliantAssociates: metrics.compliantCount,
        nonCompliantAssociates: metrics.nonCompliantCount,
        atRiskAssociates: metrics.atRiskCount,
        expiringBAAs: this.getExpiringBAAs(),
        criticalFindings: this.getCriticalFindings(),
        overallCompliance: metrics.overallCompliance,
        riskSummary: riskAnalysis,
        recommendations,
        actionItems
      };

      console.log(`✅ BAA compliance verification completed. Overall compliance: ${metrics.overallCompliance}%`);
      return result;

    } catch (error) {
      console.error('❌ BAA compliance verification failed:', error);
      throw new Error(`BAA compliance verification failed: ${error.message}`);
    }
  }

  /**
   * Add a new business associate
   */
  async addBusinessAssociate(associateData: Omit<BusinessAssociate, 'associateId' | 'addedDate' | 'lastUpdated'>): Promise<string> {
    const associateId = `ba-${Date.now()}-${crypto.randomUUID()}`;
    const timestamp = new Date();

    const businessAssociate: BusinessAssociate = {
      ...associateData,
      associateId,
      addedDate: timestamp,
      lastUpdated: timestamp
    };

    this.businessAssociates.push(businessAssociate);
    console.log(`✅ Added business associate: ${associateData.organizationName}`);
    
    return associateId;
  }

  /**
   * Create a new BAA agreement
   */
  async createBAAgreement(baaData: Omit<BAA, 'baaId' | 'nextReview'>): Promise<string> {
    const baaId = `baa-${Date.now()}-${crypto.randomUUID()}`;
    
    // Calculate next review date
    const nextReview = new Date(baaData.effectiveDate);
    nextReview.setFullYear(nextReview.getFullYear() + 1); // Annual review

    const baa: BAA = {
      ...baaData,
      baaId,
      nextReview
    };

    this.baaAgreements.push(baa);
    console.log(`✅ Created BAA agreement: ${baaId}`);
    
    return baaId;
  }

  /**
   * Conduct compliance assessment for a business associate
   */
  async conductComplianceAssessment(associateId: string, scope?: ComplianceAssessment['scope']): Promise<string> {
    const associate = this.businessAssociates.find(ba => ba.associateId === associateId);
    if (!associate) {
      throw new Error(`Business associate not found: ${associateId}`);
    }

    const baa = this.baaAgreements.find(b => b.associateId === associateId && b.status === 'executed');
    if (!baa) {
      throw new Error(`No executed BAA found for associate: ${associateId}`);
    }

    const assessmentId = `assess-${Date.now()}-${crypto.randomUUID()}`;
    
    const assessment: ComplianceAssessment = {
      assessmentId,
      associateId,
      baaId: baa.baaId,
      assessmentDate: new Date(),
      assessor: {
        name: 'BAA Compliance Verifier',
        organization: this.config.organizationName,
        credentials: ['HIPAA Compliance Assessment']
      },
      scope: scope || [
        'technical_safeguards',
        'administrative_safeguards',
        'physical_safeguards',
        'breach_notification',
        'data_handling'
      ],
      findings: await this.generateAssessmentFindings(associate, baa),
      overallScore: 0, // Will be calculated
      complianceLevel: 'partially_compliant', // Will be determined
      riskAssessment: {
        dataRisk: 'medium',
        operationalRisk: 'medium',
        reputationalRisk: 'medium',
        overallRisk: 'medium'
      },
      recommendations: [],
      actionPlan: [],
      nextAssessment: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
    };

    // Calculate score and compliance level
    this.calculateAssessmentScore(assessment);

    // Generate recommendations
    assessment.recommendations = this.generateAssessmentRecommendations(assessment);

    // Create action plan
    assessment.actionPlan = this.createAssessmentActionPlan(assessment);

    // Add attestation if required
    if (this.config.requiresAttestation) {
      assessment.attestation = {
        attestedBy: associate.contactInformation.primaryContact.name,
        attestationDate: new Date(),
        statement: 'We attest that we maintain appropriate safeguards and comply with BAA requirements',
        supporting_documents: ['security_policies.pdf', 'compliance_certificate.pdf']
      };
    }

    this.assessments.push(assessment);
    
    // Update associate's last assessment date
    associate.lastAssessment = new Date();
    associate.lastUpdated = new Date();

    console.log(`✅ Completed compliance assessment for: ${associate.organizationName}`);
    return assessmentId;
  }

  /**
   * Get business associate by ID
   */
  getBusinessAssociate(associateId: string): BusinessAssociate | null {
    return this.businessAssociates.find(ba => ba.associateId === associateId) || null;
  }

  /**
   * Get all business associates
   */
  getAllBusinessAssociates(): BusinessAssociate[] {
    return [...this.businessAssociates];
  }

  /**
   * Get BAA agreement by ID
   */
  getBAAgreement(baaId: string): BAA | null {
    return this.baaAgreements.find(baa => baa.baaId === baaId) || null;
  }

  /**
   * Get all BAA agreements
   */
  getAllBAAgreements(): BAA[] {
    return [...this.baaAgreements];
  }

  /**
   * Get compliance assessment by ID
   */
  getComplianceAssessment(assessmentId: string): ComplianceAssessment | null {
    return this.assessments.find(a => a.assessmentId === assessmentId) || null;
  }

  /**
   * Get all compliance assessments
   */
  getAllComplianceAssessments(): ComplianceAssessment[] {
    return [...this.assessments];
  }

  /**
   * Get expiring BAAs
   */
  getExpiringBAAs(daysAhead: number = 90): BAA[] {
    const cutoffDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
    return this.baaAgreements.filter(baa => 
      baa.status === 'executed' && 
      baa.expirationDate <= cutoffDate
    );
  }

  /**
   * Get non-compliant associates
   */
  getNonCompliantAssociates(): BusinessAssociate[] {
    return this.businessAssociates.filter(ba => ba.status === 'non_compliant');
  }

  /**
   * Generate BAA compliance report
   */
  async generateComplianceReport(): Promise<any> {
    const verificationResult = await this.verifyBAACompliance();
    
    return {
      reportId: `baa-report-${Date.now()}`,
      generatedDate: new Date(),
      organization: this.config.organizationName,
      summary: {
        totalAssociates: verificationResult.totalAssociates,
        compliantAssociates: verificationResult.compliantAssociates,
        nonCompliantAssociates: verificationResult.nonCompliantAssociates,
        overallCompliance: verificationResult.overallCompliance,
        expiringBAAs: verificationResult.expiringBAAs.length
      },
      detailedFindings: verificationResult.criticalFindings,
      riskAssessment: verificationResult.riskSummary,
      recommendations: verificationResult.recommendations,
      actionPlan: verificationResult.actionItems,
      nextReviewDate: this.calculateNextReviewDate()
    };
  }

  // Private Methods

  /**
   * Initialize sample data for demonstration
   */
  private initializeSampleData(): void {
    // Add sample business associates
    const sampleAssociates: Omit<BusinessAssociate, 'associateId' | 'addedDate' | 'lastUpdated'>[] = [
      {
        organizationName: 'CloudHealth Technologies',
        businessType: 'cloud_provider',
        contactInformation: {
          primaryContact: {
            name: 'John Smith',
            title: 'Account Manager',
            email: 'john.smith@cloudhealth.com',
            phone: '+1-555-0101'
          },
          securityContact: {
            name: 'Sarah Johnson',
            title: 'Security Officer',
            email: 'security@cloudhealth.com',
            phone: '+1-555-0102'
          }
        },
        servicesProvided: ['Cloud Infrastructure', 'Data Storage', 'Backup Services'],
        dataTypes: ['phi', 'pii'],
        riskLevel: 'high',
        status: 'active'
      },
      {
        organizationName: 'MedBilling Solutions',
        businessType: 'billing_company',
        contactInformation: {
          primaryContact: {
            name: 'Emily Davis',
            title: 'Client Relations Manager',
            email: 'emily.davis@medbilling.com',
            phone: '+1-555-0201'
          }
        },
        servicesProvided: ['Medical Billing', 'Claims Processing', 'Revenue Cycle Management'],
        dataTypes: ['phi', 'financial'],
        riskLevel: 'medium',
        status: 'active'
      },
      {
        organizationName: 'SecureComms Inc',
        businessType: 'technology_vendor',
        contactInformation: {
          primaryContact: {
            name: 'Michael Wilson',
            title: 'Sales Director',
            email: 'michael.wilson@securecomms.com',
            phone: '+1-555-0301'
          },
          securityContact: {
            name: 'Lisa Chen',
            title: 'Chief Security Officer',
            email: 'cso@securecomms.com',
            phone: '+1-555-0302'
          }
        },
        servicesProvided: ['Encrypted Communications', 'Secure Messaging', 'VoIP Services'],
        dataTypes: ['phi'],
        riskLevel: 'medium',
        status: 'active'
      }
    ];

    sampleAssociates.forEach(async (associate) => {
      await this.addBusinessAssociate(associate);
    });

    // Create sample BAA agreements
    this.createSampleBAAgreements();
  }

  /**
   * Create sample BAA agreements
   */
  private async createSampleBAAgreements(): Promise<void> {
    // Wait for associates to be added
    setTimeout(async () => {
      const cloudHealthAssociate = this.businessAssociates.find(ba => 
        ba.organizationName === 'CloudHealth Technologies'
      );
      
      if (cloudHealthAssociate) {
        await this.createBAAgreement({
          associateId: cloudHealthAssociate.associateId,
          agreementVersion: '2024.1',
          effectiveDate: new Date('2024-01-01'),
          expirationDate: new Date('2025-12-31'),
          autoRenewal: true,
          signedDate: new Date('2023-12-15'),
          signatories: [
            {
              name: 'Dr. Jane Smith',
              title: 'Privacy Officer',
              organization: this.config.organizationName,
              signatureDate: new Date('2023-12-15'),
              verified: true
            },
            {
              name: 'Robert Johnson',
              title: 'VP Legal',
              organization: 'CloudHealth Technologies',
              signatureDate: new Date('2023-12-15'),
              verified: true
            }
          ],
          terms: {
            permittedUses: [
              'Data storage and backup',
              'System hosting and maintenance',
              'Technical support services'
            ],
            restrictedActivities: [
              'Data mining or analytics',
              'Marketing use of PHI',
              'Unauthorized data sharing'
            ],
            dataRetentionPeriod: 7,
            subcontractorRequirements: true,
            incidentNotificationTime: 24,
            auditRights: true,
            returnDestructionRequirements: true,
            minimumSecurityRequirements: [
              'AES-256 encryption',
              'Multi-factor authentication',
              'Regular security assessments',
              'Incident response plan'
            ]
          },
          amendments: [],
          status: 'executed',
          complianceStatus: 'compliant',
          lastReviewed: new Date('2024-01-15'),
          metadata: {
            contractValue: 120000,
            renewalNotificationDays: 90
          }
        });
      }
    }, 100);
  }

  /**
   * Update business associate statuses
   */
  private async updateBusinessAssociateStatuses(): Promise<void> {
    for (const associate of this.businessAssociates) {
      // Check if associate has valid BAA
      const activeBaa = this.baaAgreements.find(baa => 
        baa.associateId === associate.associateId && 
        baa.status === 'executed' &&
        baa.expirationDate > new Date()
      );

      if (!activeBaa) {
        associate.status = 'non_compliant';
        continue;
      }

      // Check recent assessment
      const recentAssessment = this.assessments
        .filter(a => a.associateId === associate.associateId)
        .sort((a, b) => b.assessmentDate.getTime() - a.assessmentDate.getTime())[0];

      if (recentAssessment) {
        if (recentAssessment.complianceLevel === 'non_compliant') {
          associate.status = 'non_compliant';
        } else if (recentAssessment.complianceLevel === 'partially_compliant') {
          associate.status = 'under_review';
        } else {
          associate.status = 'active';
        }
      }

      associate.lastUpdated = new Date();
    }
  }

  /**
   * Check BAA agreement statuses
   */
  private async checkBAAStatuses(): Promise<void> {
    const now = new Date();
    
    for (const baa of this.baaAgreements) {
      // Check if BAA has expired
      if (baa.expirationDate <= now && baa.status === 'executed') {
        baa.status = 'expired';
        baa.complianceStatus = 'non_compliant';
      }

      // Check if BAA is expiring soon
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      if (baa.expirationDate <= thirtyDaysFromNow && baa.status === 'executed') {
        baa.complianceStatus = 'at_risk';
      }
    }
  }

  /**
   * Run compliance assessments
   */
  private async runComplianceAssessments(): Promise<void> {
    // Only run assessments for associates that need them
    for (const associate of this.businessAssociates) {
      if (associate.status === 'active' && this.needsAssessment(associate)) {
        try {
          await this.conductComplianceAssessment(associate.associateId);
        } catch (error) {
          console.error(`Failed to assess ${associate.organizationName}:`, error);
        }
      }
    }
  }

  /**
   * Check if associate needs assessment
   */
  private needsAssessment(associate: BusinessAssociate): boolean {
    if (!associate.lastAssessment) return true;
    
    const assessmentInterval = this.getAssessmentInterval();
    const nextAssessmentDue = new Date(associate.lastAssessment.getTime() + assessmentInterval);
    
    return new Date() >= nextAssessmentDue;
  }

  /**
   * Get assessment interval in milliseconds
   */
  private getAssessmentInterval(): number {
    const intervals = {
      [AssessmentFrequency.MONTHLY]: 30 * 24 * 60 * 60 * 1000,
      [AssessmentFrequency.QUARTERLY]: 90 * 24 * 60 * 60 * 1000,
      [AssessmentFrequency.SEMI_ANNUAL]: 180 * 24 * 60 * 60 * 1000,
      [AssessmentFrequency.ANNUAL]: 365 * 24 * 60 * 60 * 1000,
      [AssessmentFrequency.ON_DEMAND]: 0
    };
    
    return intervals[this.config.assessmentFrequency];
  }

  /**
   * Generate assessment findings
   */
  private async generateAssessmentFindings(
    associate: BusinessAssociate, 
    baa: BAA
  ): Promise<ComplianceAssessment['findings']> {
    const findings: ComplianceAssessment['findings'] = [];

    // Simulate findings based on business type and risk level
    const baseFindings = [
      {
        category: 'Technical Safeguards',
        title: 'Encryption Implementation',
        description: 'Verify implementation of encryption for data at rest and in transit',
        requirement: 'HIPAA 164.312(a)(2)(iv) - Encryption and Decryption',
        severity: 'medium' as const
      },
      {
        category: 'Administrative Safeguards',
        title: 'Security Awareness Training',
        description: 'Verify staff receive regular HIPAA security training',
        requirement: 'HIPAA 164.308(a)(5) - Security Awareness and Training',
        severity: 'medium' as const
      },
      {
        category: 'Breach Notification',
        title: 'Incident Response Plan',
        description: 'Verify existence and testing of incident response procedures',
        requirement: 'HITECH Breach Notification Rule',
        severity: 'high' as const
      }
    ];

    // Add risk-specific findings
    if (associate.riskLevel === 'high' || associate.riskLevel === 'critical') {
      baseFindings.push({
        category: 'Audit Compliance',
        title: 'Third-Party Audit',
        description: 'High-risk associates require independent security audit',
        requirement: 'BAA Terms - Audit Rights',
        severity: 'high' as const
      });
    }

    // Generate actual findings
    baseFindings.forEach((baseFinding, index) => {
      const findingId = `finding-${Date.now()}-${index}`;
      
      // Simulate finding status based on associate risk level
      let status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk' = 'resolved';
      if (associate.riskLevel === 'high' && Math.random() > 0.7) {
        status = 'open';
      } else if (associate.riskLevel === 'medium' && Math.random() > 0.8) {
        status = 'in_progress';
      }

      findings.push({
        findingId,
        category: baseFinding.category,
        severity: baseFinding.severity,
        title: baseFinding.title,
        description: baseFinding.description,
        requirement: baseFinding.requirement,
        evidence: status === 'resolved' ? ['policy_document.pdf', 'audit_report.pdf'] : [],
        recommendation: status === 'resolved' ? 'Maintain current practices' : 'Implement required controls',
        status,
        dueDate: status !== 'resolved' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined
      });
    });

    return findings;
  }

  /**
   * Calculate assessment score
   */
  private calculateAssessmentScore(assessment: ComplianceAssessment): void {
    const totalFindings = assessment.findings.length;
    const resolvedFindings = assessment.findings.filter(f => f.status === 'resolved').length;
    const criticalFindings = assessment.findings.filter(f => f.severity === 'critical').length;
    const highFindings = assessment.findings.filter(f => f.severity === 'high').length;

    // Base score from resolved findings
    let score = totalFindings > 0 ? (resolvedFindings / totalFindings) * 100 : 100;

    // Penalize for critical and high findings
    score -= (criticalFindings * 25);
    score -= (highFindings * 15);

    // Ensure score is between 0 and 100
    assessment.overallScore = Math.max(0, Math.min(100, score));

    // Determine compliance level
    if (assessment.overallScore >= 95) {
      assessment.complianceLevel = 'fully_compliant';
    } else if (assessment.overallScore >= 85) {
      assessment.complianceLevel = 'mostly_compliant';
    } else if (assessment.overallScore >= 70) {
      assessment.complianceLevel = 'partially_compliant';
    } else {
      assessment.complianceLevel = 'non_compliant';
    }

    // Update risk assessment based on score
    const riskLevel = assessment.overallScore >= 80 ? 'low' : 
                     assessment.overallScore >= 60 ? 'medium' : 'high';
    
    assessment.riskAssessment = {
      dataRisk: riskLevel,
      operationalRisk: riskLevel,
      reputationalRisk: riskLevel,
      overallRisk: riskLevel
    };
  }

  /**
   * Generate assessment recommendations
   */
  private generateAssessmentRecommendations(assessment: ComplianceAssessment): string[] {
    const recommendations: string[] = [];
    
    const openFindings = assessment.findings.filter(f => f.status === 'open');
    const criticalFindings = assessment.findings.filter(f => f.severity === 'critical');
    const highFindings = assessment.findings.filter(f => f.severity === 'high');

    if (criticalFindings.length > 0) {
      recommendations.push('URGENT: Address all critical findings immediately');
      recommendations.push('Consider suspending data sharing until critical issues resolved');
    }

    if (highFindings.length > 0) {
      recommendations.push('Prioritize resolution of high-severity findings');
      recommendations.push('Implement additional monitoring controls');
    }

    if (assessment.overallScore < 70) {
      recommendations.push('Conduct comprehensive security review');
      recommendations.push('Consider engaging third-party security consultant');
    }

    if (openFindings.length > 5) {
      recommendations.push('Develop systematic remediation plan');
      recommendations.push('Assign dedicated compliance resources');
    }

    // General recommendations
    recommendations.push('Schedule quarterly compliance reviews');
    recommendations.push('Maintain current security documentation');
    recommendations.push('Provide regular HIPAA training updates');

    return recommendations;
  }

  /**
   * Create assessment action plan
   */
  private createAssessmentActionPlan(assessment: ComplianceAssessment): ComplianceAssessment['actionPlan'] {
    const actionPlan: ComplianceAssessment['actionPlan'] = [];
    
    const openFindings = assessment.findings.filter(f => f.status === 'open' || f.status === 'in_progress');
    
    openFindings.forEach(finding => {
      const priority = finding.severity === 'critical' ? 'critical' :
                      finding.severity === 'high' ? 'high' : 'medium';
      
      const dueDate = finding.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      actionPlan.push({
        action: `Resolve: ${finding.title}`,
        priority,
        responsible: 'Business Associate',
        dueDate,
        status: finding.status === 'in_progress' ? 'in_progress' : 'pending'
      });
    });

    return actionPlan;
  }

  /**
   * Calculate compliance metrics
   */
  private calculateComplianceMetrics(): any {
    const total = this.businessAssociates.length;
    const compliant = this.businessAssociates.filter(ba => ba.status === 'active').length;
    const nonCompliant = this.businessAssociates.filter(ba => ba.status === 'non_compliant').length;
    const atRisk = this.businessAssociates.filter(ba => ba.status === 'under_review').length;
    
    const overallCompliance = total > 0 ? (compliant / total) * 100 : 100;

    return {
      compliantCount: compliant,
      nonCompliantCount: nonCompliant,
      atRiskCount: atRisk,
      overallCompliance: Math.round(overallCompliance * 10) / 10
    };
  }

  /**
   * Analyze risks across all business associates
   */
  private analyzeRisks(): BAAVerificationResult['riskSummary'] {
    const highRiskAssociates = this.businessAssociates.filter(ba => 
      ba.riskLevel === 'high' || ba.riskLevel === 'critical'
    );
    
    const criticalAssessments = this.assessments.filter(a => 
      a.riskAssessment.overallRisk === 'critical'
    );

    const riskFactors: string[] = [];
    const mitigation: string[] = [];

    if (highRiskAssociates.length > 0) {
      riskFactors.push(`${highRiskAssociates.length} high-risk business associates`);
      mitigation.push('Increase monitoring frequency for high-risk associates');
    }

    if (criticalAssessments.length > 0) {
      riskFactors.push(`${criticalAssessments.length} associates with critical risk assessments`);
      mitigation.push('Implement immediate remediation plans');
    }

    const expiringBAAs = this.getExpiringBAAs();
    if (expiringBAAs.length > 0) {
      riskFactors.push(`${expiringBAAs.length} BAAs expiring within 90 days`);
      mitigation.push('Initiate BAA renewal process immediately');
    }

    // Determine overall risk level
    let totalRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (criticalAssessments.length > 0 || this.getNonCompliantAssociates().length > 0) {
      totalRisk = 'critical';
    } else if (highRiskAssociates.length > 2 || expiringBAAs.length > 1) {
      totalRisk = 'high';
    } else if (riskFactors.length > 0) {
      totalRisk = 'medium';
    }

    return {
      totalRisk,
      riskFactors,
      mitigation
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    const nonCompliant = this.getNonCompliantAssociates();
    const expiring = this.getExpiringBAAs();
    const criticalFindings = this.getCriticalFindings();

    if (nonCompliant.length > 0) {
      recommendations.push(`Address compliance issues with ${nonCompliant.length} business associate(s)`);
    }

    if (expiring.length > 0) {
      recommendations.push(`Renew ${expiring.length} expiring BAA agreement(s)`);
    }

    if (criticalFindings.length > 0) {
      recommendations.push('Resolve critical compliance findings immediately');
    }

    // General recommendations
    recommendations.push('Implement automated BAA renewal tracking');
    recommendations.push('Conduct quarterly compliance reviews');
    recommendations.push('Maintain updated business associate inventory');
    recommendations.push('Establish escalation procedures for non-compliance');

    return recommendations;
  }

  /**
   * Create action items
   */
  private createActionItems(): any[] {
    const actionItems: any[] = [];
    
    // Action items for non-compliant associates
    this.getNonCompliantAssociates().forEach(associate => {
      actionItems.push({
        type: 'compliance_issue',
        priority: 'high',
        title: `Address compliance for ${associate.organizationName}`,
        description: 'Business associate has compliance issues that need immediate attention',
        assignee: 'Privacy Officer',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        associateId: associate.associateId
      });
    });

    // Action items for expiring BAAs
    this.getExpiringBAAs(30).forEach(baa => {
      const associate = this.getBusinessAssociate(baa.associateId);
      actionItems.push({
        type: 'baa_renewal',
        priority: 'medium',
        title: `Renew BAA for ${associate?.organizationName}`,
        description: 'BAA agreement expiring within 30 days',
        assignee: 'Legal Team',
        dueDate: new Date(baa.expirationDate.getTime() - 7 * 24 * 60 * 60 * 1000),
        baaId: baa.baaId
      });
    });

    return actionItems;
  }

  /**
   * Get critical findings across all assessments
   */
  private getCriticalFindings(): any[] {
    const criticalFindings: any[] = [];
    
    this.assessments.forEach(assessment => {
      const critical = assessment.findings.filter(f => 
        f.severity === 'critical' && f.status !== 'resolved'
      );
      
      critical.forEach(finding => {
        const associate = this.getBusinessAssociate(assessment.associateId);
        criticalFindings.push({
          ...finding,
          associateName: associate?.organizationName,
          assessmentId: assessment.assessmentId
        });
      });
    });

    return criticalFindings;
  }

  /**
   * Calculate next review date
   */
  private calculateNextReviewDate(): Date {
    const intervals = {
      [AssessmentFrequency.MONTHLY]: 30,
      [AssessmentFrequency.QUARTERLY]: 90,
      [AssessmentFrequency.SEMI_ANNUAL]: 180,
      [AssessmentFrequency.ANNUAL]: 365,
      [AssessmentFrequency.ON_DEMAND]: 90 // Default to quarterly
    };
    
    const days = intervals[this.config.assessmentFrequency];
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }
}