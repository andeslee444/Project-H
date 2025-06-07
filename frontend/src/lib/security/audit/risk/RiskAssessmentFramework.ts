/**
 * Risk Assessment Framework
 * 
 * Comprehensive risk assessment and management framework for HIPAA compliance
 * Identifies, analyzes, and prioritizes security and privacy risks
 * 
 * @author Project-H Security Team
 * @version 1.0.0
 */

import { z } from 'zod';

// Risk Assessment Configuration
export interface RiskAssessmentConfig {
  organizationName: string;
  assessmentScope: AssessmentScope;
  riskTolerance: RiskTolerance;
  assessmentFrequency: 'monthly' | 'quarterly' | 'annual';
  includeThirdPartyRisks: boolean;
  regulatoryFrameworks: string[];
}

// Assessment Scope
export enum AssessmentScope {
  TECHNICAL_ONLY = 'technical_only',
  ADMINISTRATIVE_ONLY = 'administrative_only',
  PHYSICAL_ONLY = 'physical_only',
  COMPREHENSIVE = 'comprehensive',
  TARGETED = 'targeted'
}

// Risk Tolerance Levels
export enum RiskTolerance {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high'
}

// Risk Category Definitions
export enum RiskCategory {
  DATA_BREACH = 'data_breach',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  SYSTEM_FAILURE = 'system_failure',
  COMPLIANCE_VIOLATION = 'compliance_violation',
  BUSINESS_CONTINUITY = 'business_continuity',
  THIRD_PARTY = 'third_party',
  HUMAN_ERROR = 'human_error',
  MALICIOUS_INSIDER = 'malicious_insider',
  CYBER_ATTACK = 'cyber_attack',
  NATURAL_DISASTER = 'natural_disaster'
}

// Risk Impact Areas
export enum ImpactArea {
  PATIENT_SAFETY = 'patient_safety',
  DATA_CONFIDENTIALITY = 'data_confidentiality',
  DATA_INTEGRITY = 'data_integrity',
  DATA_AVAILABILITY = 'data_availability',
  REPUTATION = 'reputation',
  FINANCIAL = 'financial',
  REGULATORY = 'regulatory',
  OPERATIONAL = 'operational'
}

// Risk Schema
export const RiskSchema = z.object({
  riskId: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.nativeEnum(RiskCategory),
  probability: z.number().min(1).max(5), // 1-5 scale
  impact: z.number().min(1).max(5), // 1-5 scale
  riskScore: z.number().min(1).max(25), // probability × impact
  affectedAssets: z.array(z.string()),
  impactAreas: z.array(z.nativeEnum(ImpactArea)),
  threatSources: z.array(z.string()),
  vulnerabilities: z.array(z.string()),
  currentControls: z.array(z.string()),
  controlEffectiveness: z.number().min(1).max(5),
  residualRisk: z.number().min(1).max(25),
  riskOwner: z.string(),
  reviewDate: z.date(),
  status: z.enum(['open', 'accepted', 'mitigated', 'transferred', 'closed']),
  mitigationPlan: z.object({
    actions: z.array(z.object({
      action: z.string(),
      responsible: z.string(),
      dueDate: z.date(),
      status: z.enum(['pending', 'in_progress', 'completed']),
      cost: z.number().optional()
    })),
    targetRisk: z.number().min(1).max(25),
    timeline: z.string(),
    budget: z.number().optional()
  }).optional(),
  complianceReferences: z.array(z.string()).optional(),
  lastUpdated: z.date()
});

export type Risk = z.infer<typeof RiskSchema>;

// Risk Assessment Result Schema
export const RiskAssessmentResultSchema = z.object({
  assessmentId: z.string(),
  timestamp: z.date(),
  scope: z.nativeEnum(AssessmentScope),
  risks: z.array(RiskSchema),
  summary: z.object({
    totalRisks: z.number(),
    criticalRisks: z.number(),
    highRisks: z.number(),
    mediumRisks: z.number(),
    lowRisks: z.number(),
    averageRiskScore: z.number(),
    topRiskCategories: z.array(z.string()),
    unmitigatedRisks: z.number(),
    overallRiskLevel: z.enum(['low', 'medium', 'high', 'critical'])
  }),
  recommendations: z.array(z.object({
    priority: z.enum(['immediate', 'high', 'medium', 'low']),
    recommendation: z.string(),
    rationale: z.string(),
    estimatedCost: z.number().optional(),
    timeline: z.string().optional()
  })),
  nextAssessmentDate: z.date(),
  assessorInfo: z.object({
    name: z.string(),
    role: z.string(),
    organization: z.string()
  })
});

export type RiskAssessmentResult = z.infer<typeof RiskAssessmentResultSchema>;

/**
 * Risk Assessment Framework Class
 */
export class RiskAssessmentFramework {
  private config: RiskAssessmentConfig;
  private riskRegistry: Risk[] = [];

  constructor(config?: Partial<RiskAssessmentConfig>) {
    this.config = {
      organizationName: 'Mental Health Practice',
      assessmentScope: AssessmentScope.COMPREHENSIVE,
      riskTolerance: RiskTolerance.LOW,
      assessmentFrequency: 'quarterly',
      includeThirdPartyRisks: true,
      regulatoryFrameworks: ['HIPAA', 'HITECH', 'State Privacy Laws'],
      ...config
    };

    this.initializeRiskRegistry();
  }

  /**
   * Run comprehensive risk assessment
   */
  async runRiskAssessment(): Promise<RiskAssessmentResult> {
    console.log('🎯 Starting risk assessment...');
    
    const assessmentId = `risk-assessment-${Date.now()}`;
    const timestamp = new Date();

    try {
      // Initialize or update risk registry
      await this.updateRiskRegistry();

      // Assess each risk
      const assessedRisks = await this.assessRisks();

      // Calculate summary metrics
      const summary = this.calculateRiskSummary(assessedRisks);

      // Generate recommendations
      const recommendations = this.generateRiskRecommendations(assessedRisks);

      const result: RiskAssessmentResult = {
        assessmentId,
        timestamp,
        scope: this.config.assessmentScope,
        risks: assessedRisks,
        summary,
        recommendations,
        nextAssessmentDate: this.calculateNextAssessmentDate(),
        assessorInfo: {
          name: 'Automated Risk Assessment System',
          role: 'Security Assessment Tool',
          organization: this.config.organizationName
        }
      };

      console.log(`✅ Risk assessment completed: ${assessedRisks.length} risks identified`);
      return result;

    } catch (error) {
      console.error('❌ Risk assessment failed:', error);
      throw new Error(`Risk assessment failed: ${error.message}`);
    }
  }

  /**
   * Initialize risk registry with common healthcare risks
   */
  private initializeRiskRegistry(): void {
    this.riskRegistry = [
      {
        riskId: 'RISK-001',
        title: 'Unauthorized Access to PHI',
        description: 'Risk of unauthorized individuals accessing protected health information through weak authentication or authorization controls',
        category: RiskCategory.UNAUTHORIZED_ACCESS,
        probability: 3,
        impact: 5,
        riskScore: 15,
        affectedAssets: ['Patient Database', 'EMR System', 'API Endpoints'],
        impactAreas: [ImpactArea.DATA_CONFIDENTIALITY, ImpactArea.REGULATORY, ImpactArea.REPUTATION],
        threatSources: ['External Attackers', 'Malicious Insiders', 'Compromised Accounts'],
        vulnerabilities: ['Weak Passwords', 'Missing MFA', 'Excessive Privileges'],
        currentControls: ['Password Policy', 'Role-Based Access Control', 'Audit Logging'],
        controlEffectiveness: 3,
        residualRisk: 12,
        riskOwner: 'IT Security Manager',
        reviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'open',
        complianceReferences: ['HIPAA 164.312(a)(1)', 'HIPAA 164.308(a)(4)'],
        lastUpdated: new Date()
      },
      {
        riskId: 'RISK-002',
        title: 'Data Breach Through Insecure Transmission',
        description: 'Risk of PHI exposure during transmission over insecure channels',
        category: RiskCategory.DATA_BREACH,
        probability: 2,
        impact: 5,
        riskScore: 10,
        affectedAssets: ['Web Application', 'Mobile App', 'Email Communications'],
        impactAreas: [ImpactArea.DATA_CONFIDENTIALITY, ImpactArea.REGULATORY, ImpactArea.FINANCIAL],
        threatSources: ['Network Eavesdropping', 'Man-in-the-Middle Attacks'],
        vulnerabilities: ['Unencrypted Channels', 'Weak Encryption', 'Missing TLS'],
        currentControls: ['HTTPS Enforcement', 'TLS 1.2+', 'Certificate Management'],
        controlEffectiveness: 4,
        residualRisk: 6,
        riskOwner: 'IT Security Manager',
        reviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'mitigated',
        complianceReferences: ['HIPAA 164.312(e)(1)'],
        lastUpdated: new Date()
      },
      {
        riskId: 'RISK-003',
        title: 'System Downtime and Data Unavailability',
        description: 'Risk of system failures causing interruption to patient care and data access',
        category: RiskCategory.SYSTEM_FAILURE,
        probability: 3,
        impact: 4,
        riskScore: 12,
        affectedAssets: ['Primary Database', 'Web Servers', 'Network Infrastructure'],
        impactAreas: [ImpactArea.DATA_AVAILABILITY, ImpactArea.PATIENT_SAFETY, ImpactArea.OPERATIONAL],
        threatSources: ['Hardware Failures', 'Software Bugs', 'Network Outages', 'Cyber Attacks'],
        vulnerabilities: ['Single Points of Failure', 'Insufficient Backups', 'Poor Monitoring'],
        currentControls: ['Daily Backups', 'Monitoring Alerts', 'Redundant Systems'],
        controlEffectiveness: 3,
        residualRisk: 9,
        riskOwner: 'Infrastructure Manager',
        reviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'open',
        complianceReferences: ['HIPAA 164.308(a)(7)', 'HIPAA 164.310(a)(2)'],
        lastUpdated: new Date()
      },
      {
        riskId: 'RISK-004',
        title: 'Malicious Insider Threat',
        description: 'Risk of authorized users misusing their access to steal or compromise PHI',
        category: RiskCategory.MALICIOUS_INSIDER,
        probability: 2,
        impact: 5,
        riskScore: 10,
        affectedAssets: ['Patient Database', 'File Systems', 'Backup Systems'],
        impactAreas: [ImpactArea.DATA_CONFIDENTIALITY, ImpactArea.DATA_INTEGRITY, ImpactArea.REPUTATION],
        threatSources: ['Disgruntled Employees', 'Compromised Accounts', 'Social Engineering'],
        vulnerabilities: ['Excessive Access Rights', 'Weak Monitoring', 'Lack of Segregation'],
        currentControls: ['Background Checks', 'Access Reviews', 'Activity Monitoring'],
        controlEffectiveness: 3,
        residualRisk: 8,
        riskOwner: 'CISO',
        reviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'open',
        complianceReferences: ['HIPAA 164.308(a)(3)', 'HIPAA 164.312(b)'],
        lastUpdated: new Date()
      },
      {
        riskId: 'RISK-005',
        title: 'Third-Party Vendor Security Breach',
        description: 'Risk of data compromise through third-party vendors with access to PHI',
        category: RiskCategory.THIRD_PARTY,
        probability: 3,
        impact: 4,
        riskScore: 12,
        affectedAssets: ['Cloud Storage', 'SaaS Applications', 'Vendor Systems'],
        impactAreas: [ImpactArea.DATA_CONFIDENTIALITY, ImpactArea.REGULATORY, ImpactArea.REPUTATION],
        threatSources: ['Vendor Security Failures', 'Supply Chain Attacks', 'Inadequate Controls'],
        vulnerabilities: ['Weak Vendor Security', 'Missing BAAs', 'Poor Oversight'],
        currentControls: ['Vendor Risk Assessments', 'BAA Requirements', 'Regular Audits'],
        controlEffectiveness: 3,
        residualRisk: 9,
        riskOwner: 'Vendor Management',
        reviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'open',
        complianceReferences: ['HIPAA 164.308(b)', 'HIPAA 164.314(a)'],
        lastUpdated: new Date()
      },
      {
        riskId: 'RISK-006',
        title: 'Human Error in Data Handling',
        description: 'Risk of accidental data exposure or loss due to human mistakes',
        category: RiskCategory.HUMAN_ERROR,
        probability: 4,
        impact: 3,
        riskScore: 12,
        affectedAssets: ['Patient Records', 'Email Systems', 'Mobile Devices'],
        impactAreas: [ImpactArea.DATA_CONFIDENTIALITY, ImpactArea.DATA_INTEGRITY, ImpactArea.REGULATORY],
        threatSources: ['Accidental Disclosure', 'Misdirected Communications', 'Lost Devices'],
        vulnerabilities: ['Lack of Training', 'Poor Procedures', 'Inadequate Controls'],
        currentControls: ['Staff Training', 'Data Handling Procedures', 'Device Encryption'],
        controlEffectiveness: 3,
        residualRisk: 9,
        riskOwner: 'Privacy Officer',
        reviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'open',
        complianceReferences: ['HIPAA 164.308(a)(5)', 'HIPAA 164.530(j)'],
        lastUpdated: new Date()
      },
      {
        riskId: 'RISK-007',
        title: 'Ransomware Attack',
        description: 'Risk of ransomware compromising system availability and data integrity',
        category: RiskCategory.CYBER_ATTACK,
        probability: 3,
        impact: 5,
        riskScore: 15,
        affectedAssets: ['All Systems', 'Databases', 'Backup Systems'],
        impactAreas: [ImpactArea.DATA_AVAILABILITY, ImpactArea.DATA_INTEGRITY, ImpactArea.OPERATIONAL, ImpactArea.FINANCIAL],
        threatSources: ['Cybercriminal Groups', 'Phishing Attacks', 'Exploited Vulnerabilities'],
        vulnerabilities: ['Unpatched Systems', 'Email Security Gaps', 'Insufficient Backups'],
        currentControls: ['Antivirus Software', 'Email Filtering', 'Regular Backups', 'Patch Management'],
        controlEffectiveness: 3,
        residualRisk: 12,
        riskOwner: 'CISO',
        reviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'open',
        complianceReferences: ['HIPAA 164.308(a)(5)', 'HIPAA 164.308(a)(7)'],
        lastUpdated: new Date()
      },
      {
        riskId: 'RISK-008',
        title: 'Mobile Device Security Risks',
        description: 'Risk of PHI exposure through lost, stolen, or compromised mobile devices',
        category: RiskCategory.DATA_BREACH,
        probability: 3,
        impact: 4,
        riskScore: 12,
        affectedAssets: ['Mobile Devices', 'Mobile Applications', 'Cached Data'],
        impactAreas: [ImpactArea.DATA_CONFIDENTIALITY, ImpactArea.REGULATORY, ImpactArea.REPUTATION],
        threatSources: ['Device Theft', 'Malware', 'Unsecured Wi-Fi', 'Lost Devices'],
        vulnerabilities: ['Weak Device Passwords', 'Unencrypted Storage', 'Outdated Software'],
        currentControls: ['Device Encryption', 'Mobile Device Management', 'Remote Wipe Capability'],
        controlEffectiveness: 3,
        residualRisk: 9,
        riskOwner: 'IT Security Manager',
        reviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'open',
        complianceReferences: ['HIPAA 164.310(d)', 'HIPAA 164.312(a)(2)'],
        lastUpdated: new Date()
      }
    ];
  }

  /**
   * Update risk registry with current threat intelligence
   */
  private async updateRiskRegistry(): Promise<void> {
    // In a real implementation, this would:
    // - Update risk probabilities based on current threat landscape
    // - Add new emerging risks
    // - Update control effectiveness based on recent assessments
    // - Integrate with threat intelligence feeds
    
    console.log('📊 Updating risk registry with current threat intelligence...');
    
    // Simulate dynamic risk updates
    this.riskRegistry.forEach(risk => {
      // Update review dates for overdue risks
      if (risk.reviewDate < new Date()) {
        risk.reviewDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        risk.lastUpdated = new Date();
      }
      
      // Recalculate residual risk based on control effectiveness
      const controlReduction = (risk.controlEffectiveness / 5) * 0.5; // 0-50% reduction
      risk.residualRisk = Math.max(1, Math.round(risk.riskScore * (1 - controlReduction)));
    });
  }

  /**
   * Assess all risks in registry
   */
  private async assessRisks(): Promise<Risk[]> {
    const assessedRisks: Risk[] = [];

    for (const risk of this.riskRegistry) {
      const assessedRisk = await this.assessIndividualRisk(risk);
      assessedRisks.push(assessedRisk);
    }

    return assessedRisks.sort((a, b) => b.residualRisk - a.residualRisk);
  }

  /**
   * Assess individual risk
   */
  private async assessIndividualRisk(risk: Risk): Promise<Risk> {
    // In a real implementation, this would:
    // - Check current control status
    // - Validate vulnerability existence
    // - Update probability based on recent incidents
    // - Reassess impact based on current asset value
    
    const assessedRisk = { ...risk };
    
    // Simulate risk assessment updates
    const currentDate = new Date();
    const daysSinceUpdate = Math.floor((currentDate.getTime() - risk.lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
    
    // Increase probability slightly for older assessments
    if (daysSinceUpdate > 90) {
      assessedRisk.probability = Math.min(5, risk.probability + 0.5);
      assessedRisk.riskScore = assessedRisk.probability * assessedRisk.impact;
    }

    // Update last assessment date
    assessedRisk.lastUpdated = currentDate;

    return assessedRisk;
  }

  /**
   * Calculate risk summary metrics
   */
  private calculateRiskSummary(risks: Risk[]): RiskAssessmentResult['summary'] {
    const totalRisks = risks.length;
    const criticalRisks = risks.filter(r => r.residualRisk >= 20).length;
    const highRisks = risks.filter(r => r.residualRisk >= 15 && r.residualRisk < 20).length;
    const mediumRisks = risks.filter(r => r.residualRisk >= 10 && r.residualRisk < 15).length;
    const lowRisks = risks.filter(r => r.residualRisk < 10).length;
    
    const averageRiskScore = risks.reduce((sum, r) => sum + r.residualRisk, 0) / totalRisks;
    
    const categoryMap = new Map<string, number>();
    risks.forEach(risk => {
      const count = categoryMap.get(risk.category) || 0;
      categoryMap.set(risk.category, count + 1);
    });
    
    const topRiskCategories = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
    
    const unmitigatedRisks = risks.filter(r => r.status === 'open').length;
    
    let overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (criticalRisks > 0) {
      overallRiskLevel = 'critical';
    } else if (highRisks > 2) {
      overallRiskLevel = 'high';
    } else if (mediumRisks > 5) {
      overallRiskLevel = 'medium';
    } else {
      overallRiskLevel = 'low';
    }

    return {
      totalRisks,
      criticalRisks,
      highRisks,
      mediumRisks,
      lowRisks,
      averageRiskScore: Math.round(averageRiskScore * 10) / 10,
      topRiskCategories,
      unmitigatedRisks,
      overallRiskLevel
    };
  }

  /**
   * Generate risk-based recommendations
   */
  private generateRiskRecommendations(risks: Risk[]): RiskAssessmentResult['recommendations'] {
    const recommendations: RiskAssessmentResult['recommendations'] = [];
    
    // Critical risk recommendations
    const criticalRisks = risks.filter(r => r.residualRisk >= 20);
    if (criticalRisks.length > 0) {
      recommendations.push({
        priority: 'immediate',
        recommendation: `Address ${criticalRisks.length} critical risk(s) immediately`,
        rationale: 'Critical risks pose immediate threat to organization and HIPAA compliance',
        estimatedCost: 50000,
        timeline: '30 days'
      });
    }

    // High risk recommendations
    const highRisks = risks.filter(r => r.residualRisk >= 15 && r.residualRisk < 20);
    if (highRisks.length > 0) {
      recommendations.push({
        priority: 'high',
        recommendation: `Implement mitigation plans for ${highRisks.length} high-severity risk(s)`,
        rationale: 'High risks require prompt attention to prevent escalation',
        estimatedCost: 25000,
        timeline: '60 days'
      });
    }

    // Category-specific recommendations
    const categoryRisks = this.groupRisksByCategory(risks);
    
    if (categoryRisks[RiskCategory.UNAUTHORIZED_ACCESS]?.length > 0) {
      recommendations.push({
        priority: 'high',
        recommendation: 'Strengthen access controls and implement multi-factor authentication',
        rationale: 'Multiple unauthorized access risks identified',
        estimatedCost: 15000,
        timeline: '45 days'
      });
    }

    if (categoryRisks[RiskCategory.DATA_BREACH]?.length > 0) {
      recommendations.push({
        priority: 'high',
        recommendation: 'Enhance data protection measures and encryption',
        rationale: 'Data breach risks pose significant HIPAA compliance threats',
        estimatedCost: 20000,
        timeline: '60 days'
      });
    }

    if (categoryRisks[RiskCategory.THIRD_PARTY]?.length > 0) {
      recommendations.push({
        priority: 'medium',
        recommendation: 'Conduct comprehensive third-party risk assessments',
        rationale: 'Third-party risks require ongoing vendor management',
        estimatedCost: 10000,
        timeline: '90 days'
      });
    }

    // General recommendations
    recommendations.push({
      priority: 'medium',
      recommendation: 'Implement continuous security monitoring and alerting',
      rationale: 'Proactive monitoring helps detect and respond to threats quickly',
      estimatedCost: 30000,
      timeline: '120 days'
    });

    recommendations.push({
      priority: 'low',
      recommendation: 'Conduct regular security awareness training for all staff',
      rationale: 'Human error risks can be reduced through proper training',
      estimatedCost: 5000,
      timeline: '90 days'
    });

    return recommendations;
  }

  /**
   * Group risks by category
   */
  private groupRisksByCategory(risks: Risk[]): Record<string, Risk[]> {
    return risks.reduce((groups, risk) => {
      const category = risk.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(risk);
      return groups;
    }, {} as Record<string, Risk[]>);
  }

  /**
   * Calculate next assessment date
   */
  private calculateNextAssessmentDate(): Date {
    const intervals = {
      monthly: 30,
      quarterly: 90,
      annual: 365
    };
    
    const days = intervals[this.config.assessmentFrequency];
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  /**
   * Add new risk to registry
   */
  addRisk(risk: Omit<Risk, 'riskId' | 'lastUpdated'>): string {
    const riskId = `RISK-${Date.now()}`;
    const newRisk: Risk = {
      ...risk,
      riskId,
      lastUpdated: new Date()
    };
    
    this.riskRegistry.push(newRisk);
    return riskId;
  }

  /**
   * Update existing risk
   */
  updateRisk(riskId: string, updates: Partial<Risk>): boolean {
    const riskIndex = this.riskRegistry.findIndex(r => r.riskId === riskId);
    if (riskIndex === -1) return false;
    
    this.riskRegistry[riskIndex] = {
      ...this.riskRegistry[riskIndex],
      ...updates,
      lastUpdated: new Date()
    };
    
    return true;
  }

  /**
   * Get risk by ID
   */
  getRisk(riskId: string): Risk | null {
    return this.riskRegistry.find(r => r.riskId === riskId) || null;
  }

  /**
   * Get all risks
   */
  getAllRisks(): Risk[] {
    return [...this.riskRegistry];
  }

  /**
   * Get risks by category
   */
  getRisksByCategory(category: RiskCategory): Risk[] {
    return this.riskRegistry.filter(r => r.category === category);
  }

  /**
   * Get high-priority risks
   */
  getHighPriorityRisks(threshold: number = 15): Risk[] {
    return this.riskRegistry
      .filter(r => r.residualRisk >= threshold)
      .sort((a, b) => b.residualRisk - a.residualRisk);
  }

  /**
   * Export risk assessment results
   */
  async exportRiskAssessment(result: RiskAssessmentResult, format: 'json' | 'csv' | 'pdf' = 'json'): Promise<string> {
    switch (format) {
      case 'json':
        return JSON.stringify(result, null, 2);
      case 'csv':
        return this.convertRisksToCSV(result.risks);
      case 'pdf':
        return this.generateRiskReportPDF(result);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Convert risks to CSV format
   */
  private convertRisksToCSV(risks: Risk[]): string {
    const headers = [
      'Risk ID', 'Title', 'Category', 'Probability', 'Impact', 'Risk Score',
      'Residual Risk', 'Status', 'Risk Owner', 'Review Date'
    ];
    
    const rows = risks.map(risk => [
      risk.riskId,
      risk.title,
      risk.category,
      risk.probability.toString(),
      risk.impact.toString(),
      risk.riskScore.toString(),
      risk.residualRisk.toString(),
      risk.status,
      risk.riskOwner,
      risk.reviewDate.toISOString().split('T')[0]
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  /**
   * Generate risk report PDF content (simplified)
   */
  private generateRiskReportPDF(result: RiskAssessmentResult): string {
    // In a real implementation, this would generate actual PDF content
    // For now, return formatted text that could be converted to PDF
    return `
RISK ASSESSMENT REPORT
=====================

Assessment ID: ${result.assessmentId}
Date: ${result.timestamp.toISOString()}
Scope: ${result.scope}

SUMMARY
-------
Total Risks: ${result.summary.totalRisks}
Critical Risks: ${result.summary.criticalRisks}
High Risks: ${result.summary.highRisks}
Medium Risks: ${result.summary.mediumRisks}
Low Risks: ${result.summary.lowRisks}
Overall Risk Level: ${result.summary.overallRiskLevel.toUpperCase()}

TOP RISK CATEGORIES
------------------
${result.summary.topRiskCategories.join(', ')}

CRITICAL RECOMMENDATIONS
-----------------------
${result.recommendations
  .filter(r => r.priority === 'immediate' || r.priority === 'high')
  .map(r => `• ${r.recommendation}`)
  .join('\n')}

DETAILED RISKS
--------------
${result.risks
  .filter(r => r.residualRisk >= 15)
  .map(r => `${r.riskId}: ${r.title} (Risk Score: ${r.residualRisk})`)
  .join('\n')}

Next Assessment: ${result.nextAssessmentDate.toISOString().split('T')[0]}
    `.trim();
  }
}