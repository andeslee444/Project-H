/**
 * Penetration Testing Preparation
 * 
 * Comprehensive preparation framework for penetration testing and security assessments
 * Provides readiness assessment, scope definition, and pre-test validation
 * 
 * @author Project-H Security Team
 * @version 1.0.0
 */

import { z } from 'zod';

// Penetration Test Configuration
export interface PentestConfig {
  testType: PentestType;
  scope: PentestScope;
  methodology: PentestMethodology;
  duration: number; // days
  testEnvironment: TestEnvironment;
  complianceFrameworks: string[];
  emergencyContacts: EmergencyContact[];
  businessImpactTolerance: 'low' | 'medium' | 'high';
}

// Penetration Test Types
export enum PentestType {
  EXTERNAL = 'external',
  INTERNAL = 'internal',
  WEB_APPLICATION = 'web_application',
  MOBILE_APPLICATION = 'mobile_application',
  WIRELESS = 'wireless',
  SOCIAL_ENGINEERING = 'social_engineering',
  PHYSICAL = 'physical',
  COMPREHENSIVE = 'comprehensive'
}

// Test Scope Definition
export interface PentestScope {
  targetSystems: TargetSystem[];
  ipRanges: string[];
  domains: string[];
  applications: string[];
  excludedSystems: string[];
  testingWindows: TestingWindow[];
  maxConcurrentTests: number;
  dataClassifications: string[];
}

// Target System
export interface TargetSystem {
  id: string;
  name: string;
  type: 'web_server' | 'database' | 'api' | 'mobile_app' | 'network_device' | 'workstation';
  criticality: 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
  domain?: string;
  description: string;
  owner: string;
  lastUpdated: Date;
}

// Testing Window
export interface TestingWindow {
  startTime: string; // HH:MM format
  endTime: string;
  timezone: string;
  daysOfWeek: number[]; // 0-6, Sunday = 0
  blackoutDates: Date[];
}

// Test Methodologies
export enum PentestMethodology {
  OWASP = 'owasp',
  NIST = 'nist',
  OSSTMM = 'osstmm',
  PTES = 'ptes',
  CUSTOM = 'custom'
}

// Test Environment
export enum TestEnvironment {
  PRODUCTION = 'production',
  STAGING = 'staging',
  DEVELOPMENT = 'development',
  ISOLATED = 'isolated'
}

// Emergency Contact
export interface EmergencyContact {
  name: string;
  role: string;
  phone: string;
  email: string;
  escalationLevel: number;
  availableHours: string;
}

// Readiness Assessment Schema
export const ReadinessAssessmentSchema = z.object({
  assessmentId: z.string(),
  timestamp: z.date(),
  overallReadiness: z.number().min(0).max(100),
  categories: z.array(z.object({
    category: z.string(),
    score: z.number().min(0).max(100),
    status: z.enum(['ready', 'needs_attention', 'not_ready']),
    items: z.array(z.object({
      item: z.string(),
      status: z.enum(['complete', 'partial', 'missing']),
      criticality: z.enum(['low', 'medium', 'high', 'critical']),
      recommendation: z.string().optional()
    }))
  })),
  blockers: z.array(z.string()),
  recommendations: z.array(z.string()),
  estimatedReadinessDate: z.date().optional()
});

export type ReadinessAssessment = z.infer<typeof ReadinessAssessmentSchema>;

// Test Plan Schema
export const TestPlanSchema = z.object({
  planId: z.string(),
  testName: z.string(),
  description: z.string(),
  objectives: z.array(z.string()),
  scope: z.object({
    inScope: z.array(z.string()),
    outOfScope: z.array(z.string()),
    constraints: z.array(z.string())
  }),
  methodology: z.nativeEnum(PentestMethodology),
  timeline: z.object({
    startDate: z.date(),
    endDate: z.date(),
    phases: z.array(z.object({
      phase: z.string(),
      startDate: z.date(),
      endDate: z.date(),
      activities: z.array(z.string())
    }))
  }),
  resources: z.object({
    personnel: z.array(z.object({
      role: z.string(),
      name: z.string(),
      experience: z.string(),
      certifications: z.array(z.string())
    })),
    tools: z.array(z.string()),
    infrastructure: z.array(z.string())
  }),
  riskManagement: z.object({
    riskLevel: z.enum(['low', 'medium', 'high']),
    mitigations: z.array(z.string()),
    contingencies: z.array(z.string())
  }),
  deliverables: z.array(z.object({
    name: z.string(),
    description: z.string(),
    dueDate: z.date(),
    format: z.string()
  })),
  approvals: z.array(z.object({
    approver: z.string(),
    role: z.string(),
    approvalDate: z.date().optional(),
    status: z.enum(['pending', 'approved', 'rejected'])
  }))
});

export type TestPlan = z.infer<typeof TestPlanSchema>;

/**
 * Penetration Testing Preparation Class
 */
export class PenetrationTestPrep {
  private config: PentestConfig;

  constructor(config?: Partial<PentestConfig>) {
    this.config = {
      testType: PentestType.WEB_APPLICATION,
      scope: {
        targetSystems: [],
        ipRanges: [],
        domains: [],
        applications: [],
        excludedSystems: [],
        testingWindows: [],
        maxConcurrentTests: 3,
        dataClassifications: ['PHI', 'PII']
      },
      methodology: PentestMethodology.OWASP,
      duration: 5,
      testEnvironment: TestEnvironment.STAGING,
      complianceFrameworks: ['HIPAA', 'SOC2'],
      emergencyContacts: [],
      businessImpactTolerance: 'low',
      ...config
    };
  }

  /**
   * Prepare for penetration testing
   */
  async preparePenetrationTest(): Promise<{
    readiness: ReadinessAssessment;
    testPlan: TestPlan;
    preTestChecklist: any;
    recommendations: string[];
  }> {
    console.log('🎯 Preparing for penetration testing...');

    try {
      // Assess readiness
      const readiness = await this.assessReadiness();

      // Generate test plan
      const testPlan = await this.generateTestPlan();

      // Create pre-test checklist
      const preTestChecklist = await this.createPreTestChecklist();

      // Generate recommendations
      const recommendations = this.generatePentestRecommendations(readiness);

      console.log(`✅ Penetration test preparation completed. Readiness: ${readiness.overallReadiness}%`);

      return {
        readiness,
        testPlan,
        preTestChecklist,
        recommendations
      };

    } catch (error) {
      console.error('❌ Penetration test preparation failed:', error);
      throw new Error(`Penetration test preparation failed: ${error.message}`);
    }
  }

  /**
   * Assess readiness for penetration testing
   */
  async assessReadiness(): Promise<ReadinessAssessment> {
    const assessmentId = `readiness-${Date.now()}`;
    const timestamp = new Date();

    // Define readiness categories and items
    const categories = [
      {
        category: 'Documentation and Authorization',
        items: [
          { item: 'Written authorization from management', criticality: 'critical' as const },
          { item: 'Scope of work document', criticality: 'critical' as const },
          { item: 'Rules of engagement defined', criticality: 'critical' as const },
          { item: 'Emergency contact list prepared', criticality: 'high' as const },
          { item: 'Data handling procedures documented', criticality: 'high' as const },
          { item: 'Legal agreements signed', criticality: 'critical' as const }
        ]
      },
      {
        category: 'Technical Infrastructure',
        items: [
          { item: 'Test environment prepared', criticality: 'critical' as const },
          { item: 'Backup systems verified', criticality: 'high' as const },
          { item: 'Monitoring systems configured', criticality: 'medium' as const },
          { item: 'Network segmentation validated', criticality: 'high' as const },
          { item: 'Logging mechanisms enabled', criticality: 'medium' as const },
          { item: 'Rollback procedures tested', criticality: 'high' as const }
        ]
      },
      {
        category: 'Security Baseline',
        items: [
          { item: 'Current vulnerability scan completed', criticality: 'high' as const },
          { item: 'System inventory updated', criticality: 'medium' as const },
          { item: 'Security controls documented', criticality: 'medium' as const },
          { item: 'Incident response plan ready', criticality: 'high' as const },
          { item: 'Staff notification procedures', criticality: 'medium' as const }
        ]
      },
      {
        category: 'Compliance and Risk Management',
        items: [
          { item: 'Risk assessment completed', criticality: 'high' as const },
          { item: 'Compliance requirements identified', criticality: 'high' as const },
          { item: 'Business impact analysis done', criticality: 'medium' as const },
          { item: 'Insurance coverage verified', criticality: 'medium' as const },
          { item: 'Regulatory notification plan', criticality: 'high' as const }
        ]
      },
      {
        category: 'Communication and Coordination',
        items: [
          { item: 'Stakeholder communication plan', criticality: 'medium' as const },
          { item: 'Change control process defined', criticality: 'medium' as const },
          { item: 'Status reporting procedures', criticality: 'low' as const },
          { item: 'Escalation procedures documented', criticality: 'high' as const },
          { item: 'Post-test review process planned', criticality: 'low' as const }
        ]
      }
    ];

    // Simulate readiness assessment
    const assessedCategories = categories.map(category => {
      const assessedItems = category.items.map(item => {
        // Simulate assessment based on item criticality
        let status: 'complete' | 'partial' | 'missing';
        const random = Math.random();
        
        if (item.criticality === 'critical') {
          status = random > 0.2 ? 'complete' : random > 0.1 ? 'partial' : 'missing';
        } else if (item.criticality === 'high') {
          status = random > 0.3 ? 'complete' : random > 0.15 ? 'partial' : 'missing';
        } else {
          status = random > 0.4 ? 'complete' : random > 0.2 ? 'partial' : 'missing';
        }

        let recommendation: string | undefined;
        if (status === 'missing') {
          recommendation = `Complete ${item.item.toLowerCase()} before proceeding`;
        } else if (status === 'partial') {
          recommendation = `Finalize ${item.item.toLowerCase()} documentation`;
        }

        return {
          item: item.item,
          status,
          criticality: item.criticality,
          recommendation
        };
      });

      // Calculate category score
      const completeCount = assessedItems.filter(i => i.status === 'complete').length;
      const partialCount = assessedItems.filter(i => i.status === 'partial').length;
      const score = ((completeCount + partialCount * 0.5) / assessedItems.length) * 100;

      let categoryStatus: 'ready' | 'needs_attention' | 'not_ready';
      if (score >= 90) {
        categoryStatus = 'ready';
      } else if (score >= 70) {
        categoryStatus = 'needs_attention';
      } else {
        categoryStatus = 'not_ready';
      }

      return {
        category: category.category,
        score: Math.round(score),
        status: categoryStatus,
        items: assessedItems
      };
    });

    // Calculate overall readiness
    const overallReadiness = Math.round(
      assessedCategories.reduce((sum, cat) => sum + cat.score, 0) / assessedCategories.length
    );

    // Identify blockers
    const blockers: string[] = [];
    assessedCategories.forEach(category => {
      category.items.forEach(item => {
        if (item.status === 'missing' && (item.criticality === 'critical' || item.criticality === 'high')) {
          blockers.push(`${category.category}: ${item.item}`);
        }
      });
    });

    // Generate recommendations
    const recommendations = this.generateReadinessRecommendations(assessedCategories, blockers);

    // Estimate readiness date
    const estimatedReadinessDate = blockers.length > 0 
      ? new Date(Date.now() + blockers.length * 7 * 24 * 60 * 60 * 1000) // 1 week per blocker
      : undefined;

    return {
      assessmentId,
      timestamp,
      overallReadiness,
      categories: assessedCategories,
      blockers,
      recommendations,
      estimatedReadinessDate
    };
  }

  /**
   * Generate comprehensive test plan
   */
  async generateTestPlan(): Promise<TestPlan> {
    const planId = `testplan-${Date.now()}`;
    const startDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 2 weeks from now
    const endDate = new Date(startDate.getTime() + this.config.duration * 24 * 60 * 60 * 1000);

    const testPlan: TestPlan = {
      planId,
      testName: `${this.config.testType.toUpperCase()} Penetration Test - Mental Health Practice`,
      description: `Comprehensive security assessment of the mental health practice management system focusing on ${this.config.testType} security controls and HIPAA compliance validation.`,
      objectives: [
        'Identify security vulnerabilities in the application and infrastructure',
        'Validate HIPAA compliance controls and safeguards',
        'Assess the effectiveness of current security measures',
        'Test incident response and monitoring capabilities',
        'Provide actionable recommendations for security improvements',
        'Verify data protection and privacy controls'
      ],
      scope: {
        inScope: [
          'Web application security testing',
          'API endpoint security assessment',
          'Authentication and authorization mechanisms',
          'Data encryption and transmission security',
          'Session management testing',
          'Input validation and sanitization'
        ],
        outOfScope: [
          'Production database direct access',
          'Physical security testing',
          'Social engineering attacks',
          'Denial of service attacks',
          'Testing during business hours',
          'Destructive testing methods'
        ],
        constraints: [
          'Testing limited to staging environment',
          'Maximum 3 concurrent test sessions',
          'No testing during backup windows',
          'Emergency stop procedures must be followed',
          'All testing activities must be logged'
        ]
      },
      methodology: this.config.methodology,
      timeline: {
        startDate,
        endDate,
        phases: [
          {
            phase: 'Pre-engagement and Reconnaissance',
            startDate: new Date(startDate.getTime()),
            endDate: new Date(startDate.getTime() + 1 * 24 * 60 * 60 * 1000),
            activities: [
              'Scope verification and rules of engagement review',
              'Information gathering and reconnaissance',
              'Target system identification and mapping',
              'Initial vulnerability scanning'
            ]
          },
          {
            phase: 'Vulnerability Assessment',
            startDate: new Date(startDate.getTime() + 1 * 24 * 60 * 60 * 1000),
            endDate: new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000),
            activities: [
              'Automated vulnerability scanning',
              'Manual security testing',
              'Configuration review',
              'Weakness identification and validation'
            ]
          },
          {
            phase: 'Exploitation and Post-Exploitation',
            startDate: new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000),
            endDate: new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000),
            activities: [
              'Controlled exploitation of identified vulnerabilities',
              'Privilege escalation testing',
              'Lateral movement assessment',
              'Data access validation'
            ]
          },
          {
            phase: 'Reporting and Documentation',
            startDate: new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000),
            endDate: new Date(startDate.getTime() + 4 * 24 * 60 * 60 * 1000),
            activities: [
              'Findings documentation and validation',
              'Risk assessment and prioritization',
              'Report preparation and review',
              'Executive summary creation'
            ]
          },
          {
            phase: 'Presentation and Remediation Planning',
            startDate: new Date(startDate.getTime() + 4 * 24 * 60 * 60 * 1000),
            endDate: endDate,
            activities: [
              'Findings presentation to stakeholders',
              'Remediation planning and prioritization',
              'Knowledge transfer and training',
              'Re-testing schedule planning'
            ]
          }
        ]
      },
      resources: {
        personnel: [
          {
            role: 'Lead Penetration Tester',
            name: 'Senior Security Consultant',
            experience: '8+ years',
            certifications: ['OSCP', 'CISSP', 'CEH']
          },
          {
            role: 'Security Analyst',
            name: 'Junior Security Consultant',
            experience: '3+ years',
            certifications: ['Security+', 'GCIH']
          },
          {
            role: 'Technical Specialist',
            name: 'Application Security Expert',
            experience: '5+ years',
            certifications: ['GWEB', 'CSSLP']
          }
        ],
        tools: [
          'Burp Suite Professional',
          'OWASP ZAP',
          'Nmap',
          'Metasploit',
          'Nessus',
          'Custom security scripts',
          'SQLMap',
          'Nikto',
          'Dirb/Dirbuster'
        ],
        infrastructure: [
          'Isolated testing network',
          'Dedicated testing workstations',
          'Secure communication channels',
          'Encrypted storage for findings',
          'Backup and recovery systems'
        ]
      },
      riskManagement: {
        riskLevel: 'medium',
        mitigations: [
          'Testing performed in isolated staging environment',
          'Real-time monitoring during testing',
          'Emergency stop procedures in place',
          'Backup systems verified before testing',
          'Limited scope to prevent business disruption'
        ],
        contingencies: [
          'Immediate test suspension if critical issues detected',
          'Emergency contact escalation procedures',
          'System restoration from backup if needed',
          'Alternative testing approaches if primary methods fail',
          'Business continuity plan activation if required'
        ]
      },
      deliverables: [
        {
          name: 'Executive Summary Report',
          description: 'High-level overview of findings and recommendations for executive leadership',
          dueDate: new Date(endDate.getTime() + 3 * 24 * 60 * 60 * 1000),
          format: 'PDF, PowerPoint presentation'
        },
        {
          name: 'Technical Report',
          description: 'Detailed technical findings with evidence and step-by-step remediation guidance',
          dueDate: new Date(endDate.getTime() + 5 * 24 * 60 * 60 * 1000),
          format: 'PDF with appendices'
        },
        {
          name: 'Remediation Matrix',
          description: 'Prioritized action plan with timelines and resource requirements',
          dueDate: new Date(endDate.getTime() + 7 * 24 * 60 * 60 * 1000),
          format: 'Excel spreadsheet'
        },
        {
          name: 'Re-test Plan',
          description: 'Schedule and scope for validation testing of remediated issues',
          dueDate: new Date(endDate.getTime() + 7 * 24 * 60 * 60 * 1000),
          format: 'Word document'
        }
      ],
      approvals: [
        {
          approver: 'Chief Information Security Officer',
          role: 'CISO',
          status: 'pending'
        },
        {
          approver: 'Chief Technology Officer',
          role: 'CTO',
          status: 'pending'
        },
        {
          approver: 'Privacy Officer',
          role: 'Privacy Officer',
          status: 'pending'
        },
        {
          approver: 'Practice Manager',
          role: 'Business Owner',
          status: 'pending'
        }
      ]
    };

    return testPlan;
  }

  /**
   * Create pre-test checklist
   */
  async createPreTestChecklist(): Promise<any> {
    return {
      checklistId: `checklist-${Date.now()}`,
      categories: [
        {
          category: 'Environment Preparation',
          items: [
            { task: 'Staging environment fully deployed and configured', completed: false },
            { task: 'Test data populated (anonymized PHI)', completed: false },
            { task: 'System backups created and verified', completed: false },
            { task: 'Monitoring and logging systems active', completed: false },
            { task: 'Network isolation confirmed', completed: false },
            { task: 'Emergency procedures tested', completed: false }
          ]
        },
        {
          category: 'Documentation and Authorization',
          items: [
            { task: 'Penetration testing agreement signed', completed: false },
            { task: 'Scope of work finalized and approved', completed: false },
            { task: 'Rules of engagement documented', completed: false },
            { task: 'Emergency contact list distributed', completed: false },
            { task: 'Data handling procedures reviewed', completed: false },
            { task: 'Legal and compliance approvals obtained', completed: false }
          ]
        },
        {
          category: 'Technical Prerequisites',
          items: [
            { task: 'Baseline vulnerability scan completed', completed: false },
            { task: 'System inventory updated', completed: false },
            { task: 'Security controls documented', completed: false },
            { task: 'Testing tools installed and configured', completed: false },
            { task: 'Secure communication channels established', completed: false },
            { task: 'Evidence collection procedures defined', completed: false }
          ]
        },
        {
          category: 'Team Coordination',
          items: [
            { task: 'Testing team roles and responsibilities assigned', completed: false },
            { task: 'Communication protocols established', completed: false },
            { task: 'Status reporting schedule confirmed', completed: false },
            { task: 'Escalation procedures communicated', completed: false },
            { task: 'Post-test review meeting scheduled', completed: false }
          ]
        },
        {
          category: 'Risk Management',
          items: [
            { task: 'Risk assessment completed and reviewed', completed: false },
            { task: 'Business impact analysis finalized', completed: false },
            { task: 'Insurance coverage verified', completed: false },
            { task: 'Incident response plan activated', completed: false },
            { task: 'Regulatory notification procedures ready', completed: false }
          ]
        }
      ],
      completionCriteria: {
        minimumCompletion: 90,
        criticalItemsRequired: true,
        signOffRequired: ['CISO', 'CTO', 'Privacy Officer']
      }
    };
  }

  /**
   * Generate readiness recommendations
   */
  private generateReadinessRecommendations(
    categories: ReadinessAssessment['categories'], 
    blockers: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (blockers.length > 0) {
      recommendations.push(`CRITICAL: Address ${blockers.length} blocking issue(s) before proceeding with testing`);
    }

    const notReadyCategories = categories.filter(cat => cat.status === 'not_ready');
    if (notReadyCategories.length > 0) {
      recommendations.push(`Complete preparation for ${notReadyCategories.map(c => c.category).join(', ')}`);
    }

    const needsAttentionCategories = categories.filter(cat => cat.status === 'needs_attention');
    if (needsAttentionCategories.length > 0) {
      recommendations.push(`Review and finalize ${needsAttentionCategories.map(c => c.category).join(', ')}`);
    }

    // General recommendations
    recommendations.push('Conduct a final readiness review 48 hours before testing');
    recommendations.push('Ensure all stakeholders are notified of testing schedule');
    recommendations.push('Verify emergency procedures with all team members');
    recommendations.push('Confirm backup and recovery procedures are tested');

    return recommendations;
  }

  /**
   * Generate penetration testing recommendations
   */
  private generatePentestRecommendations(readiness: ReadinessAssessment): string[] {
    const recommendations: string[] = [];

    if (readiness.overallReadiness < 70) {
      recommendations.push('DELAY: Penetration testing should be postponed until readiness improves');
      recommendations.push('Focus on addressing critical blockers first');
      recommendations.push('Schedule readiness review in 2 weeks');
    } else if (readiness.overallReadiness < 85) {
      recommendations.push('PROCEED WITH CAUTION: Address remaining gaps during testing preparation');
      recommendations.push('Implement additional monitoring during testing');
      recommendations.push('Have emergency procedures readily available');
    } else {
      recommendations.push('READY: Proceed with penetration testing as planned');
      recommendations.push('Maintain current preparation level until testing begins');
    }

    // Specific recommendations based on methodology
    if (this.config.methodology === PentestMethodology.OWASP) {
      recommendations.push('Ensure OWASP Top 10 testing scenarios are prepared');
      recommendations.push('Validate web application security controls');
    }

    if (this.config.testType === PentestType.WEB_APPLICATION) {
      recommendations.push('Focus on application-layer security controls');
      recommendations.push('Prepare API endpoint documentation for testing');
    }

    if (this.config.complianceFrameworks.includes('HIPAA')) {
      recommendations.push('Include HIPAA-specific control testing in scope');
      recommendations.push('Prepare PHI handling procedures for test data');
    }

    return recommendations;
  }

  /**
   * Update test configuration
   */
  updateConfig(newConfig: Partial<PentestConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): PentestConfig {
    return { ...this.config };
  }

  /**
   * Export test plan
   */
  async exportTestPlan(testPlan: TestPlan, format: 'json' | 'pdf' | 'docx' = 'json'): Promise<string> {
    switch (format) {
      case 'json':
        return JSON.stringify(testPlan, null, 2);
      case 'pdf':
        return this.generateTestPlanPDF(testPlan);
      case 'docx':
        return this.generateTestPlanDocument(testPlan);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Generate test plan PDF content
   */
  private generateTestPlanPDF(testPlan: TestPlan): string {
    // In a real implementation, this would generate actual PDF content
    return `
PENETRATION TEST PLAN
====================

Test Name: ${testPlan.testName}
Plan ID: ${testPlan.planId}
Methodology: ${testPlan.methodology}

OBJECTIVES
----------
${testPlan.objectives.map(obj => `• ${obj}`).join('\n')}

SCOPE
-----
In Scope:
${testPlan.scope.inScope.map(item => `• ${item}`).join('\n')}

Out of Scope:
${testPlan.scope.outOfScope.map(item => `• ${item}`).join('\n')}

TIMELINE
--------
Start Date: ${testPlan.timeline.startDate.toISOString().split('T')[0]}
End Date: ${testPlan.timeline.endDate.toISOString().split('T')[0]}

PHASES
------
${testPlan.timeline.phases.map(phase => `
${phase.phase}
${phase.startDate.toISOString().split('T')[0]} - ${phase.endDate.toISOString().split('T')[0]}
Activities:
${phase.activities.map(activity => `  • ${activity}`).join('\n')}
`).join('\n')}

DELIVERABLES
-----------
${testPlan.deliverables.map(del => `
• ${del.name}
  Description: ${del.description}
  Due Date: ${del.dueDate.toISOString().split('T')[0]}
  Format: ${del.format}
`).join('\n')}
    `.trim();
  }

  /**
   * Generate test plan document content
   */
  private generateTestPlanDocument(testPlan: TestPlan): string {
    // In a real implementation, this would generate DOCX content
    return this.generateTestPlanPDF(testPlan); // For now, use same content as PDF
  }
}