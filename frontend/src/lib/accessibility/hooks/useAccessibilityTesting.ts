/**
 * React Hooks for Accessibility Testing
 * 
 * Provides React integration for accessibility testing
 * in healthcare applications.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { accessibilityTester, AccessibilityReport, AccessibilityTestResult } from '../AccessibilityTester';

/**
 * Hook for running accessibility tests on components
 */
export function useAccessibilityTest(elementRef?: React.RefObject<HTMLElement>) {
  const [report, setReport] = useState<AccessibilityReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = useCallback(async () => {
    setIsRunning(true);
    setError(null);

    try {
      await accessibilityTester.initialize();
      
      const context = elementRef?.current || document;
      const testReport = await accessibilityTester.generateReport(context);
      
      setReport(testReport);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Accessibility test failed:', err);
    } finally {
      setIsRunning(false);
    }
  }, [elementRef]);

  return {
    report,
    isRunning,
    error,
    runTest
  };
}

/**
 * Hook for real-time accessibility monitoring
 */
export function useAccessibilityMonitoring(
  elementRef?: React.RefObject<HTMLElement>,
  options: {
    autoRun?: boolean;
    interval?: number;
    onViolation?: (violations: AccessibilityTestResult[]) => void;
  } = {}
) {
  const { autoRun = false, interval = 30000, onViolation } = options;
  const [violations, setViolations] = useState<AccessibilityTestResult[]>([]);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const checkAccessibility = useCallback(async () => {
    try {
      await accessibilityTester.initialize();
      
      const context = elementRef?.current || document;
      const report = await accessibilityTester.generateReport(context);
      
      setViolations(report.violations);
      setLastCheck(new Date());
      
      if (onViolation && report.violations.length > 0) {
        onViolation(report.violations);
      }
    } catch (error) {
      console.error('Accessibility monitoring check failed:', error);
    }
  }, [elementRef, onViolation]);

  useEffect(() => {
    if (autoRun) {
      // Initial check
      checkAccessibility();
      
      // Set up interval
      intervalRef.current = setInterval(checkAccessibility, interval);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRun, interval, checkAccessibility]);

  const startMonitoring = useCallback(() => {
    if (!intervalRef.current) {
      checkAccessibility();
      intervalRef.current = setInterval(checkAccessibility, interval);
    }
  }, [checkAccessibility, interval]);

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  return {
    violations,
    lastCheck,
    isMonitoring: !!intervalRef.current,
    startMonitoring,
    stopMonitoring,
    checkNow: checkAccessibility
  };
}

/**
 * Hook for accessibility compliance tracking
 */
export function useAccessibilityCompliance() {
  const [complianceHistory, setComplianceHistory] = useState<Array<{
    timestamp: Date;
    level: 'non-compliant' | 'partially-compliant' | 'compliant';
    violationCount: number;
    criticalIssues: number;
  }>>([]);

  const recordCompliance = useCallback((report: AccessibilityReport) => {
    const record = {
      timestamp: report.timestamp,
      level: report.complianceLevel,
      violationCount: report.summary.violationCount,
      criticalIssues: report.summary.criticalIssues
    };

    setComplianceHistory(prev => [...prev, record].slice(-50)); // Keep last 50 records
  }, []);

  const getComplianceTrend = useCallback(() => {
    if (complianceHistory.length < 2) return 'stable';
    
    const recent = complianceHistory.slice(-5);
    const older = complianceHistory.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, r) => sum + r.violationCount, 0) / recent.length;
    const olderAvg = older.length > 0 
      ? older.reduce((sum, r) => sum + r.violationCount, 0) / older.length 
      : recentAvg;
    
    if (recentAvg < olderAvg * 0.8) return 'improving';
    if (recentAvg > olderAvg * 1.2) return 'degrading';
    return 'stable';
  }, [complianceHistory]);

  const getCurrentCompliance = useCallback(() => {
    return complianceHistory[complianceHistory.length - 1] || null;
  }, [complianceHistory]);

  return {
    complianceHistory,
    recordCompliance,
    getComplianceTrend,
    getCurrentCompliance
  };
}

/**
 * Hook for keyboard navigation testing
 */
export function useKeyboardNavigationTest(containerRef?: React.RefObject<HTMLElement>) {
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);
  const [currentFocusIndex, setCurrentFocusIndex] = useState(-1);
  const [navigationIssues, setNavigationIssues] = useState<Array<{
    element: HTMLElement;
    issue: string;
    severity: 'error' | 'warning';
  }>>([]);

  const analyzeKeyboardNavigation = useCallback(() => {
    const container = containerRef?.current || document;
    
    // Find all focusable elements
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];
    
    const elements = Array.from(
      container.querySelectorAll(focusableSelectors.join(', '))
    ) as HTMLElement[];
    
    setFocusableElements(elements);
    
    // Analyze for issues
    const issues: Array<{ element: HTMLElement; issue: string; severity: 'error' | 'warning' }> = [];
    
    elements.forEach((element, index) => {
      // Check for missing focus indicators
      const computedStyle = window.getComputedStyle(element, ':focus');
      const hasVisibleFocus = computedStyle.outline !== 'none' || 
                            computedStyle.boxShadow !== 'none' ||
                            computedStyle.border !== computedStyle.border; // Simplified check
      
      if (!hasVisibleFocus) {
        issues.push({
          element,
          issue: 'Missing visible focus indicator',
          severity: 'error'
        });
      }
      
      // Check tab order
      const tabIndex = parseInt(element.getAttribute('tabindex') || '0');
      if (tabIndex > 0) {
        issues.push({
          element,
          issue: 'Positive tabindex may disrupt natural tab order',
          severity: 'warning'
        });
      }
      
      // Check for accessible names
      const hasAccessibleName = element.getAttribute('aria-label') ||
                              element.getAttribute('aria-labelledby') ||
                              element.getAttribute('title') ||
                              element.textContent?.trim();
      
      if (!hasAccessibleName) {
        issues.push({
          element,
          issue: 'Missing accessible name',
          severity: 'error'
        });
      }
    });
    
    setNavigationIssues(issues);
  }, [containerRef]);

  const simulateTabNavigation = useCallback((direction: 'forward' | 'backward' = 'forward') => {
    const increment = direction === 'forward' ? 1 : -1;
    const newIndex = Math.max(0, Math.min(focusableElements.length - 1, currentFocusIndex + increment));
    
    setCurrentFocusIndex(newIndex);
    
    if (focusableElements[newIndex]) {
      focusableElements[newIndex].focus();
    }
  }, [focusableElements, currentFocusIndex]);

  const resetNavigation = useCallback(() => {
    setCurrentFocusIndex(-1);
    if (document.activeElement && document.activeElement !== document.body) {
      (document.activeElement as HTMLElement).blur();
    }
  }, []);

  useEffect(() => {
    analyzeKeyboardNavigation();
  }, [analyzeKeyboardNavigation]);

  return {
    focusableElements,
    currentFocusIndex,
    navigationIssues,
    analyzeKeyboardNavigation,
    simulateTabNavigation,
    resetNavigation
  };
}

/**
 * Hook for screen reader testing utilities
 */
export function useScreenReaderTest() {
  const [announcements, setAnnouncements] = useState<Array<{
    id: string;
    message: string;
    timestamp: Date;
    priority: 'polite' | 'assertive';
  }>>([]);

  const announce = useCallback((
    message: string, 
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    const announcement = {
      id: `announcement-${Date.now()}`,
      message,
      timestamp: new Date(),
      priority
    };
    
    setAnnouncements(prev => [...prev, announcement]);
    
    // Create live region for actual announcement
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.setAttribute('class', 'sr-only');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    
    document.body.appendChild(liveRegion);
    
    // Slight delay to ensure screen readers pick up the change
    setTimeout(() => {
      liveRegion.textContent = message;
    }, 100);
    
    // Clean up after 5 seconds
    setTimeout(() => {
      if (document.body.contains(liveRegion)) {
        document.body.removeChild(liveRegion);
      }
    }, 5000);
  }, []);

  const clearAnnouncements = useCallback(() => {
    setAnnouncements([]);
  }, []);

  const testAriaLabel = useCallback((element: HTMLElement) => {
    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    const title = element.getAttribute('title');
    const textContent = element.textContent?.trim();
    
    if (ariaLabel) {
      announce(`Element has aria-label: ${ariaLabel}`);
    } else if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy);
      const labelText = labelElement?.textContent?.trim();
      announce(`Element labeled by: ${labelText || 'element not found'}`);
    } else if (title) {
      announce(`Element has title: ${title}`);
    } else if (textContent) {
      announce(`Element text content: ${textContent}`);
    } else {
      announce('Element has no accessible name', 'assertive');
    }
  }, [announce]);

  return {
    announcements,
    announce,
    clearAnnouncements,
    testAriaLabel
  };
}

/**
 * Hook for accessibility testing integration with components
 */
export function useAccessibilityIntegration(componentName: string) {
  const componentRef = useRef<HTMLElement>(null);
  const { report, isRunning, runTest } = useAccessibilityTest(componentRef);
  const { violations, startMonitoring, stopMonitoring } = useAccessibilityMonitoring(componentRef);
  const { recordCompliance } = useAccessibilityCompliance();

  useEffect(() => {
    if (report) {
      recordCompliance(report);
    }
  }, [report, recordCompliance]);

  const runComponentTest = useCallback(async () => {
    console.log(`🎯 Running accessibility test for ${componentName}`);
    await runTest();
  }, [componentName, runTest]);

  return {
    componentRef,
    report,
    violations,
    isRunning,
    runComponentTest,
    startMonitoring,
    stopMonitoring
  };
}