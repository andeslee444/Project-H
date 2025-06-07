/**
 * Accessibility Testing Module
 * 
 * Exports all accessibility testing utilities and components
 * for healthcare applications.
 */

// Core testing functionality
export {
  AccessibilityTester,
  accessibilityTester,
  HEALTHCARE_ACCESSIBILITY_PATTERNS,
  DEFAULT_ACCESSIBILITY_CONFIG
} from './AccessibilityTester';

export type {
  AccessibilityTestResult,
  AccessibilityReport,
  AccessibilityRecommendation,
  AccessibilityTestConfig
} from './AccessibilityTester';

// React hooks
export {
  useAccessibilityTest,
  useAccessibilityMonitoring,
  useAccessibilityCompliance,
  useKeyboardNavigationTest,
  useScreenReaderTest,
  useAccessibilityIntegration
} from './hooks/useAccessibilityTesting';

// Dashboard component
export { AccessibilityDashboard } from './components/AccessibilityDashboard';

/**
 * Healthcare-specific accessibility utilities
 */
export const AccessibilityUtils = {
  /**
   * Check if element has adequate color contrast
   */
  checkColorContrast: (element: HTMLElement, backgroundColor?: string): boolean => {
    const computedStyle = window.getComputedStyle(element);
    const color = computedStyle.color;
    const bgColor = backgroundColor || computedStyle.backgroundColor;
    
    // This is a simplified check - in practice, you'd use a proper contrast ratio calculation
    return color !== bgColor;
  },

  /**
   * Verify emergency button accessibility
   */
  checkEmergencyButton: (button: HTMLElement): { isAccessible: boolean; issues: string[] } => {
    const issues: string[] = [];
    
    if (!button.hasAttribute('aria-label') && !button.textContent?.trim()) {
      issues.push('Missing accessible name');
    }
    
    if (button.getAttribute('tabindex') === '-1') {
      issues.push('Not keyboard accessible');
    }
    
    if (!button.hasAttribute('role') && button.tagName !== 'BUTTON') {
      issues.push('Missing button role');
    }
    
    return {
      isAccessible: issues.length === 0,
      issues
    };
  },

  /**
   * Validate form accessibility for medical forms
   */
  checkMedicalFormAccessibility: (form: HTMLFormElement): { 
    isAccessible: boolean; 
    fieldIssues: Array<{ field: HTMLElement; issues: string[] }> 
  } => {
    const fieldIssues: Array<{ field: HTMLElement; issues: string[] }> = [];
    
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach((input) => {
      const issues: string[] = [];
      const element = input as HTMLInputElement;
      
      // Check for labels
      const hasLabel = element.labels?.length > 0 || 
                     element.hasAttribute('aria-label') ||
                     element.hasAttribute('aria-labelledby');
      
      if (!hasLabel) {
        issues.push('Missing label');
      }
      
      // Check for required field indication
      if (element.hasAttribute('required') && !element.hasAttribute('aria-required')) {
        issues.push('Required field not properly indicated');
      }
      
      // Check for error messaging
      if (element.hasAttribute('aria-invalid') && !element.hasAttribute('aria-describedby')) {
        issues.push('Invalid field missing error description');
      }
      
      if (issues.length > 0) {
        fieldIssues.push({ field: element, issues });
      }
    });
    
    return {
      isAccessible: fieldIssues.length === 0,
      fieldIssues
    };
  },

  /**
   * Check patient privacy indicators
   */
  checkPrivacyIndicators: (container: HTMLElement): { isAccessible: boolean; issues: string[] } => {
    const issues: string[] = [];
    const privacyElements = container.querySelectorAll('[data-privacy], .privacy-indicator');
    
    privacyElements.forEach((element) => {
      const hasScreenReaderText = element.querySelector('.sr-only, .visually-hidden') ||
                                 element.hasAttribute('aria-label') ||
                                 element.hasAttribute('title');
      
      if (!hasScreenReaderText) {
        issues.push(`Privacy indicator missing screen reader text: ${element.tagName}`);
      }
    });
    
    return {
      isAccessible: issues.length === 0,
      issues
    };
  },

  /**
   * Generate accessible announcement for healthcare events
   */
  announceHealthcareEvent: (eventType: string, details?: Record<string, any>): string => {
    const announcements = {
      'patient-loaded': `Patient record loaded. ${details?.patientName ? `Viewing ${details.patientName}` : 'Ready for review'}.`,
      'appointment-scheduled': `Appointment scheduled successfully. ${details?.date ? `Scheduled for ${details.date}` : ''}.`,
      'emergency-activated': 'Emergency protocol activated. Emergency contacts have been notified.',
      'mood-logged': `Mood entry recorded. ${details?.moodLevel ? `Level ${details.moodLevel} out of 10` : ''}.`,
      'form-error': `Form validation error. ${details?.errorCount ? `${details.errorCount} fields need attention` : 'Please review and correct errors'}.`,
      'session-timeout': 'Session will expire soon. Please save your work and refresh to continue.',
      'hipaa-violation': 'Potential HIPAA compliance issue detected. Please review your actions.'
    };
    
    return announcements[eventType as keyof typeof announcements] || `Healthcare event: ${eventType}`;
  }
};

/**
 * WCAG 2.1 compliance levels and criteria
 */
export const WCAG_CRITERIA = {
  A: {
    '1.1.1': 'Non-text Content',
    '1.2.1': 'Audio-only and Video-only (Prerecorded)',
    '1.2.2': 'Captions (Prerecorded)',
    '1.2.3': 'Audio Description or Media Alternative (Prerecorded)',
    '1.3.1': 'Info and Relationships',
    '1.3.2': 'Meaningful Sequence',
    '1.3.3': 'Sensory Characteristics',
    '1.4.1': 'Use of Color',
    '1.4.2': 'Audio Control',
    '2.1.1': 'Keyboard',
    '2.1.2': 'No Keyboard Trap',
    '2.1.4': 'Character Key Shortcuts',
    '2.2.1': 'Timing Adjustable',
    '2.2.2': 'Pause, Stop, Hide',
    '2.3.1': 'Three Flashes or Below Threshold',
    '2.4.1': 'Bypass Blocks',
    '2.4.2': 'Page Titled',
    '2.4.3': 'Focus Order',
    '2.4.4': 'Link Purpose (In Context)',
    '2.5.1': 'Pointer Gestures',
    '2.5.2': 'Pointer Cancellation',
    '2.5.3': 'Label in Name',
    '2.5.4': 'Motion Actuation',
    '3.1.1': 'Language of Page',
    '3.2.1': 'On Focus',
    '3.2.2': 'On Input',
    '3.3.1': 'Error Identification',
    '3.3.2': 'Labels or Instructions',
    '4.1.1': 'Parsing',
    '4.1.2': 'Name, Role, Value'
  },
  AA: {
    '1.2.4': 'Captions (Live)',
    '1.2.5': 'Audio Description (Prerecorded)',
    '1.3.4': 'Orientation',
    '1.3.5': 'Identify Input Purpose',
    '1.4.3': 'Contrast (Minimum)',
    '1.4.4': 'Resize text',
    '1.4.5': 'Images of Text',
    '1.4.10': 'Reflow',
    '1.4.11': 'Non-text Contrast',
    '1.4.12': 'Text Spacing',
    '1.4.13': 'Content on Hover or Focus',
    '2.4.5': 'Multiple Ways',
    '2.4.6': 'Headings and Labels',
    '2.4.7': 'Focus Visible',
    '2.5.5': 'Target Size',
    '3.1.2': 'Language of Parts',
    '3.2.3': 'Consistent Navigation',
    '3.2.4': 'Consistent Identification',
    '3.3.3': 'Error Suggestion',
    '3.3.4': 'Error Prevention (Legal, Financial, Data)',
    '4.1.3': 'Status Messages'
  },
  AAA: {
    '1.2.6': 'Sign Language (Prerecorded)',
    '1.2.7': 'Extended Audio Description (Prerecorded)',
    '1.2.8': 'Media Alternative (Prerecorded)',
    '1.2.9': 'Audio-only (Live)',
    '1.4.6': 'Contrast (Enhanced)',
    '1.4.7': 'Low or No Background Audio',
    '1.4.8': 'Visual Presentation',
    '1.4.9': 'Images of Text (No Exception)',
    '2.1.3': 'Keyboard (No Exception)',
    '2.2.3': 'No Timing',
    '2.2.4': 'Interruptions',
    '2.2.5': 'Re-authenticating',
    '2.2.6': 'Timeouts',
    '2.3.2': 'Three Flashes',
    '2.3.3': 'Animation from Interactions',
    '2.4.8': 'Location',
    '2.4.9': 'Link Purpose (Link Only)',
    '2.4.10': 'Section Headings',
    '2.5.6': 'Concurrent Input Mechanisms',
    '3.1.3': 'Unusual Words',
    '3.1.4': 'Abbreviations',
    '3.1.5': 'Reading Level',
    '3.1.6': 'Pronunciation',
    '3.2.5': 'Change on Request',
    '3.3.5': 'Help',
    '3.3.6': 'Error Prevention (All)'
  }
};