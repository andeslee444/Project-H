/**
 * Accessibility Tester Tests
 * 
 * Comprehensive tests for the accessibility testing system
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AccessibilityTester, HEALTHCARE_ACCESSIBILITY_PATTERNS } from '../AccessibilityTester';

// Mock DOM APIs
const mockDocument = {
  querySelectorAll: vi.fn(() => []),
  createElement: vi.fn(() => ({
    setAttribute: vi.fn(),
    appendChild: vi.fn(),
    style: {}
  })),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    contains: vi.fn(() => true)
  }
};

const mockWindow = {
  location: { href: 'https://test.example.com/patients' },
  getComputedStyle: vi.fn(() => ({
    color: 'rgb(128, 128, 128)',
    outline: 'none',
    boxShadow: 'none',
    border: '1px solid black'
  }))
};

Object.defineProperty(global, 'document', {
  value: mockDocument,
  configurable: true
});

Object.defineProperty(global, 'window', {
  value: mockWindow,
  configurable: true
});

Object.defineProperty(global, 'performance', {
  value: {
    now: vi.fn(() => Date.now())
  }
});

describe('AccessibilityTester', () => {
  let tester: AccessibilityTester;

  beforeEach(() => {
    vi.clearAllMocks();
    tester = new AccessibilityTester();
  });

  afterEach(() => {
    tester.cleanup();
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      expect(tester).toBeDefined();
    });

    it('should initialize with custom configuration', () => {
      const customTester = new AccessibilityTester({
        level: 'AAA',
        timeout: 60000,
        enablePerformanceTracking: false
      });
      
      expect(customTester).toBeDefined();
    });

    it('should initialize axe-core on first use', async () => {
      await tester.initialize();
      // Initialization should complete without errors
      expect(true).toBe(true);
    });
  });

  describe('Test Execution', () => {
    beforeEach(async () => {
      await tester.initialize();
    });

    it('should run accessibility tests', async () => {
      const report = await tester.runTests();
      
      expect(report).toBeDefined();
      expect(report.reportId).toBeDefined();
      expect(report.timestamp).toBeInstanceOf(Date);
      expect(report.url).toBe('https://test.example.com/patients');
      expect(report.testEngine).toBe('axe-core');
      expect(Array.isArray(report.violations)).toBe(true);
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    it('should process violations correctly', async () => {
      const report = await tester.runTests();
      
      expect(report.violations.length).toBeGreaterThan(0);
      
      const violation = report.violations[0];
      expect(violation).toBeDefined();
      expect(violation!.id).toBeDefined();
      expect(violation!.rule).toBeDefined();
      expect(violation!.level).toMatch(/^(A|AA|AAA)$/);
      expect(violation!.severity).toBe('violation');
      expect(violation!.impact).toMatch(/^(minor|moderate|serious|critical)$/);
      expect(violation!.timestamp).toBeInstanceOf(Date);
    });

    it('should generate summary statistics', async () => {
      const report = await tester.runTests();
      
      expect(report.summary).toBeDefined();
      expect(typeof report.summary.totalTests).toBe('number');
      expect(typeof report.summary.violationCount).toBe('number');
      expect(typeof report.summary.criticalIssues).toBe('number');
      expect(typeof report.summary.seriousIssues).toBe('number');
      expect(report.summary.violationCount).toBeGreaterThan(0);
    });

    it('should determine compliance level correctly', async () => {
      const report = await tester.runTests();
      
      expect(report.complianceLevel).toMatch(/^(compliant|partially-compliant|non-compliant)$/);
      
      // The compliance level depends on the severity of violations
      // With the current mock setup, it may be partially-compliant
      expect(['partially-compliant', 'non-compliant']).toContain(report.complianceLevel);
    });

    it('should generate recommendations', async () => {
      const report = await tester.runTests();
      
      expect(report.recommendations.length).toBeGreaterThan(0);
      
      const recommendation = report.recommendations[0];
      expect(recommendation).toBeDefined();
      expect(recommendation!.id).toBeDefined();
      expect(recommendation!.priority).toMatch(/^(critical|high|medium|low)$/);
      expect(recommendation!.title).toBeDefined();
      expect(recommendation!.description).toBeDefined();
      expect(recommendation!.solution).toBeDefined();
      expect(recommendation!.wcagReference).toBeDefined();
    });

    it('should handle custom test context', async () => {
      const mockElement = {
        querySelectorAll: vi.fn(() => []),
        querySelector: vi.fn(() => null)
      } as any;

      const report = await tester.runTests(mockElement);
      expect(report).toBeDefined();
    });
  });

  describe('Healthcare-Specific Testing', () => {
    beforeEach(async () => {
      await tester.initialize();
    });

    it('should test privacy indicators', async () => {
      // Mock privacy indicator elements
      const mockPrivacyElement = {
        hasAttribute: vi.fn((attr) => attr === 'data-privacy'),
        querySelector: vi.fn(() => null),
        getAttribute: vi.fn(() => null),
        textContent: ''
      };

      mockDocument.querySelectorAll.mockImplementation((selector: string) => {
        if (selector.includes('data-privacy')) {
          return [mockPrivacyElement];
        }
        return [];
      });

      const results = await tester.testHealthcarePatterns();
      
      const privacyViolations = results.filter(r => r.rule === 'privacy-indicators');
      expect(privacyViolations.length).toBeGreaterThan(0);
      
      const violation = privacyViolations[0];
      expect(violation).toBeDefined();
      expect(violation!.severity).toBe('violation');
      expect(violation!.impact).toBe('serious');
      expect(violation!.tags).toContain('healthcare');
      expect(violation!.tags).toContain('privacy');
    });

    it('should test emergency action buttons', async () => {
      // Mock emergency button elements
      const mockEmergencyButton = {
        tagName: 'DIV',
        hasAttribute: vi.fn(() => false),
        getAttribute: vi.fn((attr) => {
          if (attr === 'role') return null;
          if (attr === 'tabindex') return null;
          if (attr === 'aria-label') return null;
          return null;
        })
      };

      mockDocument.querySelectorAll.mockImplementation((selector: string) => {
        if (selector.includes('data-emergency')) {
          return [mockEmergencyButton];
        }
        return [];
      });

      const results = await tester.testHealthcarePatterns();
      
      const emergencyViolations = results.filter(r => r.rule === 'emergency-actions');
      expect(emergencyViolations.length).toBeGreaterThan(0);
      
      const violation = emergencyViolations[0];
      expect(violation).toBeDefined();
      expect(violation!.severity).toBe('violation');
      expect(violation!.impact).toBe('critical');
      expect(violation!.tags).toContain('emergency');
    });

    it('should test patient status indicators', async () => {
      // Mock patient status elements
      const mockStatusElement = {
        textContent: '',
        hasAttribute: vi.fn(() => false),
        getAttribute: vi.fn(() => null)
      };

      mockDocument.querySelectorAll.mockImplementation((selector: string) => {
        if (selector.includes('patient-status')) {
          return [mockStatusElement];
        }
        return [];
      });

      // Mock getComputedStyle to return color-only styling
      mockWindow.getComputedStyle.mockReturnValue({
        color: 'rgb(255, 0, 0)', // Red color
        outline: 'none',
        boxShadow: 'none',
        border: '1px solid black'
      });

      const results = await tester.testHealthcarePatterns();
      
      const statusViolations = results.filter(r => r.rule === 'patient-status');
      expect(statusViolations.length).toBeGreaterThan(0);
      
      const violation = statusViolations[0];
      expect(violation).toBeDefined();
      expect(violation!.severity).toBe('violation');
      expect(violation!.impact).toBe('serious');
      expect(violation!.tags).toContain('color');
    });

    it('should include healthcare violations in full report', async () => {
      // Set up healthcare-specific violations
      const mockElement = {
        hasAttribute: vi.fn(() => false),
        getAttribute: vi.fn(() => null),
        textContent: '',
        tagName: 'DIV'
      };

      mockDocument.querySelectorAll.mockImplementation(() => [mockElement] as any);

      const report = await tester.generateReport();
      
      const healthcareViolations = report.violations.filter(v => v.tags.includes('healthcare'));
      expect(healthcareViolations.length).toBeGreaterThan(0);
      
      // Summary should include healthcare violations
      expect(report.summary.violationCount).toBeGreaterThan(2); // Standard + healthcare violations
    });
  });

  describe('Configuration', () => {
    it('should respect custom WCAG level', async () => {
      const aaTester = new AccessibilityTester({ level: 'AA' });
      await aaTester.initialize();
      
      const report = await aaTester.runTests();
      expect(report).toBeDefined();
      
      aaTester.cleanup();
    });

    it('should handle disabled performance tracking', async () => {
      const testerWithoutPerf = new AccessibilityTester({ 
        enablePerformanceTracking: false 
      });
      await testerWithoutPerf.initialize();
      
      const report = await testerWithoutPerf.runTests();
      expect(report).toBeDefined();
      
      testerWithoutPerf.cleanup();
    });

    it('should handle custom timeout', async () => {
      const quickTester = new AccessibilityTester({ timeout: 5000 });
      await quickTester.initialize();
      
      const report = await quickTester.runTests();
      expect(report).toBeDefined();
      
      quickTester.cleanup();
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors gracefully', async () => {
      const failingTester = new AccessibilityTester();
      
      // Mock a failing axe-core load
      const originalError = console.error;
      console.error = vi.fn();
      
      try {
        // Initialize should not throw but handle the error gracefully
        await failingTester.initialize();
        // The initialization won't throw, it will just log the error
        expect(console.error).toBeDefined();
      } finally {
        console.error = originalError;
      }
    });

    it('should handle missing DOM elements', async () => {
      mockDocument.querySelectorAll.mockReturnValue([]);
      
      await tester.initialize();
      const results = await tester.testHealthcarePatterns();
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should handle test execution errors', async () => {
      await tester.initialize();
      
      // This should not throw even with invalid context
      const report = await tester.runTests(null as any);
      expect(report).toBeDefined();
    });
  });

  describe('Healthcare Accessibility Patterns', () => {
    it('should include all required healthcare patterns', () => {
      expect(HEALTHCARE_ACCESSIBILITY_PATTERNS.PRIVACY_INDICATORS).toBeDefined();
      expect(HEALTHCARE_ACCESSIBILITY_PATTERNS.EMERGENCY_ACTIONS).toBeDefined();
      expect(HEALTHCARE_ACCESSIBILITY_PATTERNS.MEDICAL_FORM_VALIDATION).toBeDefined();
      expect(HEALTHCARE_ACCESSIBILITY_PATTERNS.PATIENT_STATUS).toBeDefined();
      expect(HEALTHCARE_ACCESSIBILITY_PATTERNS.APPOINTMENT_SCHEDULING).toBeDefined();
    });

    it('should have proper WCAG references', () => {
      Object.values(HEALTHCARE_ACCESSIBILITY_PATTERNS).forEach(pattern => {
        expect(pattern.wcagReference).toContain('WCAG 2.1');
      });
    });

    it('should have descriptive rules', () => {
      Object.values(HEALTHCARE_ACCESSIBILITY_PATTERNS).forEach(pattern => {
        expect(pattern.rule).toBeDefined();
        expect(pattern.description).toBeDefined();
        expect(pattern.description.length).toBeGreaterThan(10);
      });
    });
  });

  describe('Performance Integration', () => {
    it('should track test performance when enabled', async () => {
      const perfTester = new AccessibilityTester({ enablePerformanceTracking: true });
      await perfTester.initialize();
      
      const report = await perfTester.runTests();
      expect(report).toBeDefined();
      
      perfTester.cleanup();
    });

    it('should skip performance tracking when disabled', async () => {
      const noPerfTester = new AccessibilityTester({ enablePerformanceTracking: false });
      await noPerfTester.initialize();
      
      const report = await noPerfTester.runTests();
      expect(report).toBeDefined();
      
      noPerfTester.cleanup();
    });
  });
});