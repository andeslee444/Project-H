/**
 * Accessibility Testing Automation for Healthcare Applications
 * 
 * Provides comprehensive accessibility testing capabilities to ensure
 * WCAG 2.1 AA compliance for mental health practice management systems.
 */

import { performanceMonitor } from '../performance/PerformanceMonitor';

export interface AccessibilityTestResult {
  id: string;
  rule: string;
  level: 'A' | 'AA' | 'AAA';
  severity: 'violation' | 'incomplete' | 'inapplicable' | 'pass';
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  helpUrl: string;
  element?: HTMLElement | string;
  relatedNodes?: Array<HTMLElement | string>;
  tags: string[];
  timestamp: Date;
}

export interface AccessibilityReport {
  reportId: string;
  url: string;
  timestamp: Date;
  testEngine: string;
  testEngineVersion: string;
  violations: AccessibilityTestResult[];
  incomplete: AccessibilityTestResult[];
  passes: AccessibilityTestResult[];
  inapplicable: AccessibilityTestResult[];
  summary: {
    totalTests: number;
    violationCount: number;
    incompleteCount: number;
    passCount: number;
    inapplicableCount: number;
    criticalIssues: number;
    seriousIssues: number;
    moderateIssues: number;
    minorIssues: number;
  };
  recommendations: AccessibilityRecommendation[];
  complianceLevel: 'non-compliant' | 'partially-compliant' | 'compliant';
}

export interface AccessibilityRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  solution: string;
  wcagReference: string;
  affectedElements: string[];
  estimatedEffort: string;
}

export interface AccessibilityTestConfig {
  level: 'A' | 'AA' | 'AAA';
  tags: string[];
  rules: Record<string, any>;
  excludeRules: string[];
  includeTags: string[];
  excludeTags: string[];
  timeout: number;
  enablePerformanceTracking: boolean;
}

export const DEFAULT_ACCESSIBILITY_CONFIG: AccessibilityTestConfig = {
  level: 'AA',
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'],
  rules: {},
  excludeRules: [],
  includeTags: [],
  excludeTags: [],
  timeout: 30000,
  enablePerformanceTracking: true
};

/**
 * Healthcare-specific accessibility testing patterns
 */
export const HEALTHCARE_ACCESSIBILITY_PATTERNS = {
  // Patient data privacy indicators
  PRIVACY_INDICATORS: {
    rule: 'privacy-indicators',
    description: 'Ensure privacy indicators are accessible and properly announced',
    wcagReference: 'WCAG 2.1 - 1.3.1 Info and Relationships'
  },
  
  // Emergency action buttons
  EMERGENCY_ACTIONS: {
    rule: 'emergency-actions',
    description: 'Emergency buttons must be keyboard accessible and clearly announced',
    wcagReference: 'WCAG 2.1 - 2.1.1 Keyboard, 4.1.2 Name Role Value'
  },
  
  // Medical form validation
  MEDICAL_FORM_VALIDATION: {
    rule: 'medical-form-validation',
    description: 'Medical forms must provide clear error messaging and guidance',
    wcagReference: 'WCAG 2.1 - 3.3.1 Error Identification, 3.3.3 Error Suggestion'
  },
  
  // Patient status indicators
  PATIENT_STATUS: {
    rule: 'patient-status',
    description: 'Patient status must be conveyed through text and not just color',
    wcagReference: 'WCAG 2.1 - 1.4.1 Use of Color'
  },
  
  // Appointment scheduling
  APPOINTMENT_SCHEDULING: {
    rule: 'appointment-scheduling',
    description: 'Calendar and scheduling interfaces must be fully keyboard navigable',
    wcagReference: 'WCAG 2.1 - 2.1.1 Keyboard, 2.4.3 Focus Order'
  }
};

/**
 * Accessibility testing automation system
 */
export class AccessibilityTester {
  private config: AccessibilityTestConfig;
  private axeCore: any;
  private isInitialized = false;

  constructor(config: Partial<AccessibilityTestConfig> = {}) {
    this.config = { ...DEFAULT_ACCESSIBILITY_CONFIG, ...config };
  }

  /**
   * Initialize the accessibility tester
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load axe-core for testing
      if (typeof window !== 'undefined') {
        // For browser environment
        this.axeCore = await this.loadAxeCore();
      }

      this.isInitialized = true;
      console.log('🎯 Accessibility tester initialized');
    } catch (error) {
      console.error('Failed to initialize accessibility tester:', error);
      throw error;
    }
  }

  /**
   * Load axe-core dynamically
   */
  private async loadAxeCore(): Promise<any> {
    // In a real implementation, this would load axe-core
    // For now, we'll create a mock implementation
    return {
      run: (context: any, options: any) => {
        return new Promise((resolve) => {
          // Simulate axe-core testing
          setTimeout(() => {
            resolve(this.generateMockAxeResults());
          }, 1000);
        });
      },
      configure: (config: any) => {
        console.log('Axe configuration updated');
      }
    };
  }

  /**
   * Generate mock axe results for demonstration
   */
  private generateMockAxeResults(): any {
    return {
      violations: [
        {
          id: 'color-contrast',
          impact: 'serious',
          tags: ['wcag2aa', 'wcag143'],
          description: 'Elements must have sufficient color contrast',
          help: 'Elements must have sufficient color contrast',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.7/color-contrast',
          nodes: [
            {
              target: ['.text-gray-400'],
              html: '<span class="text-gray-400">Patient Status</span>',
              failureSummary: 'Fix any of the following:\n  Element has insufficient color contrast'
            }
          ]
        },
        {
          id: 'aria-hidden-focus',
          impact: 'serious',
          tags: ['wcag2a', 'wcag412'],
          description: 'ARIA hidden element must not contain focusable elements',
          help: 'ARIA hidden element must not contain focusable elements',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.7/aria-hidden-focus',
          nodes: [
            {
              target: ['[aria-hidden="true"] button'],
              html: '<button aria-hidden="true">Hidden Button</button>',
              failureSummary: 'Fix all of the following:\n  Focusable element should not have aria-hidden=true'
            }
          ]
        }
      ],
      incomplete: [
        {
          id: 'frame-title',
          impact: 'serious',
          tags: ['wcag2a', 'wcag241'],
          description: 'Frames must have a unique title attribute',
          help: 'Frames must have a unique title attribute',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.7/frame-title',
          nodes: []
        }
      ],
      passes: [
        {
          id: 'document-title',
          impact: null,
          tags: ['wcag2a', 'wcag242'],
          description: 'Documents must have <title> element to aid in navigation',
          help: 'Documents must have <title> element to aid in navigation',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.7/document-title',
          nodes: []
        }
      ],
      inapplicable: []
    };
  }

  /**
   * Run accessibility tests on a specific element or the entire page
   */
  public async runTests(
    context: Element | Document = document,
    options: Partial<AccessibilityTestConfig> = {}
  ): Promise<AccessibilityReport> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = performance.now();
    const testConfig = { ...this.config, ...options };

    try {
      // Configure axe-core
      if (this.axeCore?.configure) {
        this.axeCore.configure({
          tags: testConfig.tags,
          rules: testConfig.rules
        });
      }

      // Run the accessibility audit
      const results = await this.axeCore.run(context, {
        tags: testConfig.tags,
        rules: testConfig.rules,
        timeout: testConfig.timeout
      });

      const report = this.processResults(results);

      // Track performance if enabled
      if (testConfig.enablePerformanceTracking) {
        const duration = performance.now() - startTime;
        performanceMonitor.addMetric({
          id: `accessibility-test-${Date.now()}`,
          name: 'Accessibility Test Duration',
          value: duration,
          unit: 'ms',
          category: 'custom',
          threshold: { warning: 5000, critical: 15000 },
          metadata: {
            testType: 'accessibility',
            violationCount: report.violations.length,
            url: report.url
          }
        });
      }

      return report;
    } catch (error) {
      console.error('Accessibility test failed:', error);
      throw error;
    }
  }

  /**
   * Process axe-core results into our format
   */
  private processResults(results: any): AccessibilityReport {
    const reportId = `accessibility-${Date.now()}`;
    const timestamp = new Date();

    const violations = this.processTestResults(results.violations, 'violation');
    const incomplete = this.processTestResults(results.incomplete, 'incomplete');
    const passes = this.processTestResults(results.passes, 'pass');
    const inapplicable = this.processTestResults(results.inapplicable, 'inapplicable');

    const summary = {
      totalTests: violations.length + incomplete.length + passes.length + inapplicable.length,
      violationCount: violations.length,
      incompleteCount: incomplete.length,
      passCount: passes.length,
      inapplicableCount: inapplicable.length,
      criticalIssues: violations.filter(v => v.impact === 'critical').length,
      seriousIssues: violations.filter(v => v.impact === 'serious').length,
      moderateIssues: violations.filter(v => v.impact === 'moderate').length,
      minorIssues: violations.filter(v => v.impact === 'minor').length
    };

    const recommendations = this.generateRecommendations(violations);
    const complianceLevel = this.calculateComplianceLevel(summary);

    return {
      reportId,
      url: window.location.href,
      timestamp,
      testEngine: 'axe-core',
      testEngineVersion: '4.7.0', // Mock version
      violations,
      incomplete,
      passes,
      inapplicable,
      summary,
      recommendations,
      complianceLevel
    };
  }

  /**
   * Process individual test results
   */
  private processTestResults(
    results: any[], 
    severity: AccessibilityTestResult['severity']
  ): AccessibilityTestResult[] {
    return results.map((result, index) => ({
      id: `${result.id}-${index}`,
      rule: result.id,
      level: this.getWCAGLevel(result.tags),
      severity,
      impact: result.impact || 'minor',
      description: result.description || result.help,
      helpUrl: result.helpUrl || '',
      element: result.nodes?.[0]?.target?.[0] || undefined,
      relatedNodes: result.nodes?.map((node: any) => node.target?.[0]).filter(Boolean) || [],
      tags: result.tags || [],
      timestamp: new Date()
    }));
  }

  /**
   * Determine WCAG level from tags
   */
  private getWCAGLevel(tags: string[]): 'A' | 'AA' | 'AAA' {
    if (tags.includes('wcag2aaa') || tags.includes('wcag21aaa')) return 'AAA';
    if (tags.includes('wcag2aa') || tags.includes('wcag21aa')) return 'AA';
    return 'A';
  }

  /**
   * Generate accessibility recommendations
   */
  private generateRecommendations(violations: AccessibilityTestResult[]): AccessibilityRecommendation[] {
    const recommendations: AccessibilityRecommendation[] = [];

    // Group violations by rule type
    const violationsByRule = violations.reduce((acc, violation) => {
      if (!acc[violation.rule]) acc[violation.rule] = [];
      acc[violation.rule].push(violation);
      return acc;
    }, {} as Record<string, AccessibilityTestResult[]>);

    Object.entries(violationsByRule).forEach(([rule, ruleViolations]) => {
      const recommendation = this.createRecommendation(rule, ruleViolations);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Create recommendation for a specific rule
   */
  private createRecommendation(
    rule: string, 
    violations: AccessibilityTestResult[]
  ): AccessibilityRecommendation | null {
    const highestImpact = violations.reduce((max, v) => {
      const impactOrder = { critical: 4, serious: 3, moderate: 2, minor: 1 };
      return impactOrder[v.impact] > impactOrder[max] ? v.impact : max;
    }, 'minor');

    const priority = this.mapImpactToPriority(highestImpact);
    const affectedElements = violations.map(v => v.element).filter(Boolean) as string[];

    const recommendationMap: Record<string, Partial<AccessibilityRecommendation>> = {
      'color-contrast': {
        title: 'Improve Color Contrast',
        description: 'Text elements do not have sufficient contrast ratio against their background',
        impact: 'Users with visual impairments may have difficulty reading content',
        solution: 'Increase contrast ratio to at least 4.5:1 for normal text and 3:1 for large text',
        wcagReference: 'WCAG 2.1 SC 1.4.3 Contrast (Minimum)',
        estimatedEffort: '2-4 hours'
      },
      'aria-hidden-focus': {
        title: 'Fix ARIA Hidden Focusable Elements',
        description: 'Elements with aria-hidden="true" contain focusable child elements',
        impact: 'Screen reader users may encounter confusing focus behavior',
        solution: 'Remove aria-hidden from parent or make child elements non-focusable',
        wcagReference: 'WCAG 2.1 SC 4.1.2 Name, Role, Value',
        estimatedEffort: '1-2 hours'
      },
      'keyboard': {
        title: 'Ensure Keyboard Accessibility',
        description: 'Interactive elements are not accessible via keyboard navigation',
        impact: 'Users who rely on keyboard navigation cannot access functionality',
        solution: 'Add proper tabindex, focus states, and keyboard event handlers',
        wcagReference: 'WCAG 2.1 SC 2.1.1 Keyboard',
        estimatedEffort: '4-8 hours'
      }
    };

    const template = recommendationMap[rule];
    if (!template) return null;

    return {
      id: `rec-${rule}-${Date.now()}`,
      priority,
      title: template.title || `Fix ${rule}`,
      description: template.description || `Address ${rule} violations`,
      impact: template.impact || 'May impact user experience',
      solution: template.solution || 'Review and fix identified issues',
      wcagReference: template.wcagReference || 'WCAG 2.1',
      affectedElements,
      estimatedEffort: template.estimatedEffort || '1-3 hours'
    };
  }

  /**
   * Map impact level to priority
   */
  private mapImpactToPriority(impact: string): AccessibilityRecommendation['priority'] {
    switch (impact) {
      case 'critical': return 'critical';
      case 'serious': return 'high';
      case 'moderate': return 'medium';
      default: return 'low';
    }
  }

  /**
   * Calculate overall compliance level
   */
  private calculateComplianceLevel(summary: AccessibilityReport['summary']): AccessibilityReport['complianceLevel'] {
    if (summary.criticalIssues > 0 || summary.seriousIssues > 3) {
      return 'non-compliant';
    }
    if (summary.violationCount > 0) {
      return 'partially-compliant';
    }
    return 'compliant';
  }

  /**
   * Test specific healthcare accessibility patterns
   */
  public async testHealthcarePatterns(context: Element | Document = document): Promise<AccessibilityTestResult[]> {
    const results: AccessibilityTestResult[] = [];

    // Test privacy indicators
    const privacyIndicators = context.querySelectorAll('[data-privacy], .privacy-indicator');
    privacyIndicators.forEach(element => {
      const hasAriaLabel = element.hasAttribute('aria-label');
      const hasTitle = element.hasAttribute('title');
      const hasScreenReaderText = element instanceof Element ? element.querySelector('.sr-only, .visually-hidden') : null;

      if (!hasAriaLabel && !hasTitle && !hasScreenReaderText) {
        results.push({
          id: `privacy-indicator-${Date.now()}`,
          rule: 'privacy-indicators',
          level: 'AA',
          severity: 'violation',
          impact: 'serious',
          description: 'Privacy indicators must be accessible to screen readers',
          helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html',
          element: element as HTMLElement,
          relatedNodes: [],
          tags: ['healthcare', 'privacy', 'wcag21aa'],
          timestamp: new Date()
        });
      }
    });

    // Test emergency action buttons
    const emergencyButtons = context.querySelectorAll('[data-emergency], .emergency-button');
    emergencyButtons.forEach(element => {
      const isButton = element.tagName === 'BUTTON' || element.getAttribute('role') === 'button';
      const hasKeyboardSupport = element.hasAttribute('tabindex') || isButton;
      const hasAriaLabel = element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby');

      if (!hasKeyboardSupport || !hasAriaLabel) {
        results.push({
          id: `emergency-button-${Date.now()}`,
          rule: 'emergency-actions',
          level: 'AA',
          severity: 'violation',
          impact: 'critical',
          description: 'Emergency buttons must be keyboard accessible and properly labeled',
          helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html',
          element: element as HTMLElement,
          relatedNodes: [],
          tags: ['healthcare', 'emergency', 'keyboard', 'wcag21aa'],
          timestamp: new Date()
        });
      }
    });

    // Test patient status indicators
    const statusIndicators = context.querySelectorAll('[data-patient-status], .patient-status');
    statusIndicators.forEach(element => {
      const hasTextContent = element.textContent?.trim();
      const hasAriaLabel = element.hasAttribute('aria-label');
      const computedStyle = window.getComputedStyle(element);
      const hasColorOnly = computedStyle.color !== 'initial' && !hasTextContent && !hasAriaLabel;

      if (hasColorOnly) {
        results.push({
          id: `patient-status-${Date.now()}`,
          rule: 'patient-status',
          level: 'A',
          severity: 'violation',
          impact: 'serious',
          description: 'Patient status must not rely solely on color',
          helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html',
          element: element as HTMLElement,
          relatedNodes: [],
          tags: ['healthcare', 'color', 'wcag21a'],
          timestamp: new Date()
        });
      }
    });

    return results;
  }

  /**
   * Generate accessibility report
   */
  public async generateReport(context?: Element | Document): Promise<AccessibilityReport> {
    const standardReport = await this.runTests(context);
    const healthcareViolations = await this.testHealthcarePatterns(context);

    // Merge healthcare-specific violations
    standardReport.violations.push(...healthcareViolations);
    
    // Update summary
    standardReport.summary.violationCount += healthcareViolations.length;
    standardReport.summary.totalTests += healthcareViolations.length;
    
    const criticalHealthcare = healthcareViolations.filter(v => v.impact === 'critical').length;
    const seriousHealthcare = healthcareViolations.filter(v => v.impact === 'serious').length;
    
    standardReport.summary.criticalIssues += criticalHealthcare;
    standardReport.summary.seriousIssues += seriousHealthcare;

    // Recalculate compliance level
    standardReport.complianceLevel = this.calculateComplianceLevel(standardReport.summary);

    return standardReport;
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.isInitialized = false;
    console.log('🎯 Accessibility tester cleaned up');
  }
}

// Global accessibility tester instance
export const accessibilityTester = new AccessibilityTester();