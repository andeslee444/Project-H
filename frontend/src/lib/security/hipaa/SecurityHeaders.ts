/**
 * HIPAA Security Headers Configuration
 * 
 * Implements security headers required for HIPAA compliance and general web security.
 * Provides defense against various web vulnerabilities including XSS, clickjacking,
 * and other common attacks.
 * 
 * Headers implemented:
 * - Content Security Policy (CSP)
 * - HTTP Strict Transport Security (HSTS)
 * - X-Frame-Options
 * - X-Content-Type-Options
 * - X-XSS-Protection
 * - Referrer-Policy
 * - Permissions-Policy
 */

// Security Header Configuration Types
export interface SecurityHeadersConfig {
  csp: ContentSecurityPolicyConfig;
  hsts: HSTSConfig;
  frameOptions: FrameOptionsConfig;
  contentTypeOptions: boolean;
  xssProtection: XSSProtectionConfig;
  referrerPolicy: ReferrerPolicyConfig;
  permissionsPolicy: PermissionsPolicyConfig;
  customHeaders: Record<string, string>;
}

export interface ContentSecurityPolicyConfig {
  defaultSrc: string[];
  scriptSrc: string[];
  styleSrc: string[];
  imgSrc: string[];
  fontSrc: string[];
  connectSrc: string[];
  frameSrc: string[];
  objectSrc: string[];
  mediaSrc: string[];
  childSrc: string[];
  formAction: string[];
  baseUri: string[];
  upgradeInsecureRequests: boolean;
  reportUri?: string;
  reportTo?: string;
  blockAllMixedContent?: boolean;
}

export interface HSTSConfig {
  maxAge: number;
  includeSubDomains: boolean;
  preload: boolean;
}

export interface FrameOptionsConfig {
  policy: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
  allowFrom?: string;
}

export interface XSSProtectionConfig {
  enabled: boolean;
  mode: 'filter' | 'block';
  reportUri?: string;
}

export interface ReferrerPolicyConfig {
  policy: 
    | 'no-referrer'
    | 'no-referrer-when-downgrade'
    | 'origin'
    | 'origin-when-cross-origin'
    | 'same-origin'
    | 'strict-origin'
    | 'strict-origin-when-cross-origin'
    | 'unsafe-url';
}

export interface PermissionsPolicyConfig {
  accelerometer: boolean;
  ambientLightSensor: boolean;
  autoplay: boolean;
  battery: boolean;
  camera: boolean;
  crossOriginIsolated: boolean;
  displayCapture: boolean;
  documentDomain: boolean;
  encryptedMedia: boolean;
  executionWhileNotRendered: boolean;
  executionWhileOutOfViewport: boolean;
  fullscreen: boolean;
  geolocation: boolean;
  gyroscope: boolean;
  magnetometer: boolean;
  microphone: boolean;
  midi: boolean;
  navigationOverride: boolean;
  payment: boolean;
  pictureInPicture: boolean;
  publickeyCredentialsGet: boolean;
  screenWakeLock: boolean;
  syncXhr: boolean;
  usb: boolean;
  webShare: boolean;
  xrSpatialTracking: boolean;
}

// Default HIPAA-compliant security configuration
export const DEFAULT_HIPAA_SECURITY_CONFIG: SecurityHeadersConfig = {
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Adjusted for React development
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    imgSrc: ["'self'", "data:", "https:"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    connectSrc: ["'self'", "https://api.openai.com", "wss:", "https:"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    childSrc: ["'none'"],
    formAction: ["'self'"],
    baseUri: ["'self'"],
    upgradeInsecureRequests: true,
    blockAllMixedContent: true,
    reportUri: "/api/csp-report"
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  frameOptions: {
    policy: 'DENY'
  },
  contentTypeOptions: true,
  xssProtection: {
    enabled: true,
    mode: 'block'
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  permissionsPolicy: {
    accelerometer: false,
    ambientLightSensor: false,
    autoplay: false,
    battery: false,
    camera: false,
    crossOriginIsolated: false,
    displayCapture: false,
    documentDomain: false,
    encryptedMedia: false,
    executionWhileNotRendered: false,
    executionWhileOutOfViewport: false,
    fullscreen: true, // May be needed for medical imaging
    geolocation: false,
    gyroscope: false,
    magnetometer: false,
    microphone: false, // May need to enable for telemedicine
    midi: false,
    navigationOverride: false,
    payment: false,
    pictureInPicture: false,
    publickeyCredentialsGet: true, // For secure authentication
    screenWakeLock: false,
    syncXhr: false,
    usb: false,
    webShare: false,
    xrSpatialTracking: false
  },
  customHeaders: {
    'X-Permitted-Cross-Domain-Policies': 'none',
    'X-Download-Options': 'noopen',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin'
  }
};

/**
 * Security Headers Manager
 */
export class SecurityHeadersManager {
  private config: SecurityHeadersConfig;

  constructor(config: Partial<SecurityHeadersConfig> = {}) {
    this.config = this.mergeConfig(DEFAULT_HIPAA_SECURITY_CONFIG, config);
  }

  /**
   * Generate all security headers as a Record
   */
  generateHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    // Content Security Policy
    headers['Content-Security-Policy'] = this.generateCSPHeader();

    // HTTP Strict Transport Security
    headers['Strict-Transport-Security'] = this.generateHSTSHeader();

    // X-Frame-Options
    headers['X-Frame-Options'] = this.generateFrameOptionsHeader();

    // X-Content-Type-Options
    if (this.config.contentTypeOptions) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }

    // X-XSS-Protection
    headers['X-XSS-Protection'] = this.generateXSSProtectionHeader();

    // Referrer Policy
    headers['Referrer-Policy'] = this.config.referrerPolicy.policy;

    // Permissions Policy
    headers['Permissions-Policy'] = this.generatePermissionsPolicyHeader();

    // Custom headers
    Object.assign(headers, this.config.customHeaders);

    return headers;
  }

  /**
   * Apply headers to a fetch request
   */
  applyToFetchRequest(init: RequestInit = {}): RequestInit {
    const headers = this.generateHeaders();
    
    return {
      ...init,
      headers: {
        ...headers,
        ...init.headers
      }
    };
  }

  /**
   * Get CSP nonce for inline scripts (if using nonces)
   */
  generateCSPNonce(): string {
    return btoa(crypto.randomUUID());
  }

  /**
   * Validate current page against CSP rules
   */
  validateCSPCompliance(): {
    isCompliant: boolean;
    violations: string[];
    recommendations: string[];
  } {
    const violations: string[] = [];
    const recommendations: string[] = [];

    // Check for inline scripts without nonces
    const inlineScripts = document.querySelectorAll('script:not([src]):not([nonce])');
    if (inlineScripts.length > 0) {
      violations.push(`Found ${inlineScripts.length} inline scripts without nonces`);
      recommendations.push('Add nonces to inline scripts or move to external files');
    }

    // Check for inline styles without nonces
    const inlineStyles = document.querySelectorAll('style:not([nonce])');
    if (inlineStyles.length > 0) {
      violations.push(`Found ${inlineStyles.length} inline styles without nonces`);
      recommendations.push('Add nonces to inline styles or move to external files');
    }

    // Check for mixed content
    const insecureResources = document.querySelectorAll('[src^="http://"], [href^="http://"]');
    if (insecureResources.length > 0 && location.protocol === 'https:') {
      violations.push(`Found ${insecureResources.length} insecure resources on HTTPS page`);
      recommendations.push('Update all resources to use HTTPS');
    }

    // Check for eval usage (this would need runtime detection)
    if (typeof window !== 'undefined' && window.eval.toString().includes('[native code]')) {
      recommendations.push('Avoid using eval() and similar functions for better security');
    }

    return {
      isCompliant: violations.length === 0,
      violations,
      recommendations
    };
  }

  /**
   * Generate report for security headers compliance
   */
  generateSecurityReport(): {
    headers: Record<string, string>;
    compliance: {
      isCompliant: boolean;
      violations: string[];
      recommendations: string[];
    };
    score: number;
  } {
    const headers = this.generateHeaders();
    const compliance = this.validateCSPCompliance();
    
    // Calculate security score based on implemented headers
    let score = 0;
    const maxScore = 100;
    
    // CSP (30 points)
    if (headers['Content-Security-Policy']) score += 30;
    
    // HSTS (20 points)
    if (headers['Strict-Transport-Security']) score += 20;
    
    // Frame Options (15 points)
    if (headers['X-Frame-Options']) score += 15;
    
    // Content Type Options (10 points)
    if (headers['X-Content-Type-Options']) score += 10;
    
    // XSS Protection (10 points)
    if (headers['X-XSS-Protection']) score += 10;
    
    // Referrer Policy (10 points)
    if (headers['Referrer-Policy']) score += 10;
    
    // Permissions Policy (5 points)
    if (headers['Permissions-Policy']) score += 5;

    // Reduce score for violations
    score -= compliance.violations.length * 5;
    score = Math.max(0, Math.min(maxScore, score));

    return {
      headers,
      compliance,
      score
    };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SecurityHeadersConfig>): void {
    this.config = this.mergeConfig(this.config, updates);
  }

  // Private helper methods
  private generateCSPHeader(): string {
    const csp = this.config.csp;
    const directives: string[] = [];

    if (csp.defaultSrc.length > 0) {
      directives.push(`default-src ${csp.defaultSrc.join(' ')}`);
    }
    
    if (csp.scriptSrc.length > 0) {
      directives.push(`script-src ${csp.scriptSrc.join(' ')}`);
    }
    
    if (csp.styleSrc.length > 0) {
      directives.push(`style-src ${csp.styleSrc.join(' ')}`);
    }
    
    if (csp.imgSrc.length > 0) {
      directives.push(`img-src ${csp.imgSrc.join(' ')}`);
    }
    
    if (csp.fontSrc.length > 0) {
      directives.push(`font-src ${csp.fontSrc.join(' ')}`);
    }
    
    if (csp.connectSrc.length > 0) {
      directives.push(`connect-src ${csp.connectSrc.join(' ')}`);
    }
    
    if (csp.frameSrc.length > 0) {
      directives.push(`frame-src ${csp.frameSrc.join(' ')}`);
    }
    
    if (csp.objectSrc.length > 0) {
      directives.push(`object-src ${csp.objectSrc.join(' ')}`);
    }
    
    if (csp.mediaSrc.length > 0) {
      directives.push(`media-src ${csp.mediaSrc.join(' ')}`);
    }
    
    if (csp.childSrc.length > 0) {
      directives.push(`child-src ${csp.childSrc.join(' ')}`);
    }
    
    if (csp.formAction.length > 0) {
      directives.push(`form-action ${csp.formAction.join(' ')}`);
    }
    
    if (csp.baseUri.length > 0) {
      directives.push(`base-uri ${csp.baseUri.join(' ')}`);
    }

    if (csp.upgradeInsecureRequests) {
      directives.push('upgrade-insecure-requests');
    }

    if (csp.blockAllMixedContent) {
      directives.push('block-all-mixed-content');
    }

    if (csp.reportUri) {
      directives.push(`report-uri ${csp.reportUri}`);
    }

    if (csp.reportTo) {
      directives.push(`report-to ${csp.reportTo}`);
    }

    return directives.join('; ');
  }

  private generateHSTSHeader(): string {
    const hsts = this.config.hsts;
    let header = `max-age=${hsts.maxAge}`;
    
    if (hsts.includeSubDomains) {
      header += '; includeSubDomains';
    }
    
    if (hsts.preload) {
      header += '; preload';
    }
    
    return header;
  }

  private generateFrameOptionsHeader(): string {
    const frameOptions = this.config.frameOptions;
    
    if (frameOptions.policy === 'ALLOW-FROM' && frameOptions.allowFrom) {
      return `${frameOptions.policy} ${frameOptions.allowFrom}`;
    }
    
    return frameOptions.policy;
  }

  private generateXSSProtectionHeader(): string {
    const xss = this.config.xssProtection;
    
    if (!xss.enabled) {
      return '0';
    }
    
    let header = '1';
    
    if (xss.mode === 'block') {
      header += '; mode=block';
    }
    
    if (xss.reportUri) {
      header += `; report=${xss.reportUri}`;
    }
    
    return header;
  }

  private generatePermissionsPolicyHeader(): string {
    const permissions = this.config.permissionsPolicy;
    const directives: string[] = [];

    Object.entries(permissions).forEach(([permission, allowed]) => {
      // Convert camelCase to kebab-case
      const kebabPermission = permission.replace(/([A-Z])/g, '-$1').toLowerCase();
      
      if (allowed) {
        directives.push(`${kebabPermission}=self`);
      } else {
        directives.push(`${kebabPermission}=()`);
      }
    });

    return directives.join(', ');
  }

  private mergeConfig(
    defaultConfig: SecurityHeadersConfig,
    userConfig: Partial<SecurityHeadersConfig>
  ): SecurityHeadersConfig {
    return {
      ...defaultConfig,
      ...userConfig,
      csp: { ...defaultConfig.csp, ...userConfig.csp },
      hsts: { ...defaultConfig.hsts, ...userConfig.hsts },
      frameOptions: { ...defaultConfig.frameOptions, ...userConfig.frameOptions },
      xssProtection: { ...defaultConfig.xssProtection, ...userConfig.xssProtection },
      referrerPolicy: { ...defaultConfig.referrerPolicy, ...userConfig.referrerPolicy },
      permissionsPolicy: { ...defaultConfig.permissionsPolicy, ...userConfig.permissionsPolicy },
      customHeaders: { ...defaultConfig.customHeaders, ...userConfig.customHeaders }
    };
  }
}

/**
 * HIPAA-specific security headers for healthcare applications
 */
export class HIPAASecurityHeaders extends SecurityHeadersManager {
  constructor() {
    // Enhanced configuration for healthcare compliance
    const hipaaConfig: Partial<SecurityHeadersConfig> = {
      csp: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // May need for CSS-in-JS
        imgSrc: ["'self'", "data:"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        childSrc: ["'none'"],
        formAction: ["'self'"],
        baseUri: ["'self'"],
        upgradeInsecureRequests: true,
        blockAllMixedContent: true,
        reportUri: "/api/security/csp-violations"
      },
      frameOptions: {
        policy: 'DENY' // Prevent clickjacking
      },
      permissionsPolicy: {
        // Disable all non-essential browser features for maximum security
        accelerometer: false,
        ambientLightSensor: false,
        autoplay: false,
        battery: false,
        camera: false,
        crossOriginIsolated: false,
        displayCapture: false,
        documentDomain: false,
        encryptedMedia: false,
        executionWhileNotRendered: false,
        executionWhileOutOfViewport: false,
        fullscreen: false,
        geolocation: false,
        gyroscope: false,
        magnetometer: false,
        microphone: false,
        midi: false,
        navigationOverride: false,
        payment: false,
        pictureInPicture: false,
        publickeyCredentialsGet: true, // Enable for secure authentication
        screenWakeLock: false,
        syncXhr: false,
        usb: false,
        webShare: false,
        xrSpatialTracking: false
      },
      customHeaders: {
        'X-Permitted-Cross-Domain-Policies': 'none',
        'X-Download-Options': 'noopen',
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Resource-Policy': 'same-origin',
        'X-Healthcare-App': 'true',
        'X-HIPAA-Compliant': 'true'
      }
    };

    super(hipaaConfig);
  }

  /**
   * Generate meta tags for HTML head
   */
  generateMetaTags(): string[] {
    const headers = this.generateHeaders();
    const metaTags: string[] = [];

    Object.entries(headers).forEach(([name, content]) => {
      metaTags.push(`<meta http-equiv="${name}" content="${content}">`);
    });

    return metaTags;
  }

  /**
   * Validate HIPAA-specific security requirements
   */
  validateHIPAACompliance(): {
    isHIPAACompliant: boolean;
    violations: string[];
    recommendations: string[];
    score: number;
  } {
    const baseReport = this.generateSecurityReport();
    const hipaaViolations: string[] = [...baseReport.compliance.violations];
    const hipaaRecommendations: string[] = [...baseReport.compliance.recommendations];

    // Check HIPAA-specific requirements
    const headers = baseReport.headers;

    // Ensure HTTPS enforcement
    if (!headers['Strict-Transport-Security']) {
      hipaaViolations.push('HSTS header missing - HTTPS enforcement required for PHI');
      hipaaRecommendations.push('Implement HSTS to enforce HTTPS connections');
    }

    // Ensure frame protection
    if (!headers['X-Frame-Options'] || headers['X-Frame-Options'] !== 'DENY') {
      hipaaViolations.push('Frame protection insufficient for PHI display');
      hipaaRecommendations.push('Set X-Frame-Options to DENY to prevent clickjacking');
    }

    // Check for content type sniffing protection
    if (!headers['X-Content-Type-Options']) {
      hipaaViolations.push('Content type sniffing protection missing');
      hipaaRecommendations.push('Enable X-Content-Type-Options: nosniff');
    }

    // Verify referrer policy for privacy
    if (!headers['Referrer-Policy'] || 
        !['strict-origin', 'strict-origin-when-cross-origin', 'no-referrer'].includes(headers['Referrer-Policy'])) {
      hipaaViolations.push('Referrer policy not privacy-preserving');
      hipaaRecommendations.push('Use strict referrer policy to protect patient privacy');
    }

    // Calculate HIPAA compliance score
    let hipaaScore = baseReport.score;
    
    // Additional scoring for HIPAA-specific features
    if (headers['X-HIPAA-Compliant']) hipaaScore += 5;
    if (headers['Cross-Origin-Embedder-Policy']) hipaaScore += 5;
    if (headers['Cross-Origin-Opener-Policy']) hipaaScore += 5;

    // Penalize for HIPAA violations
    hipaaScore -= hipaaViolations.length * 10;
    hipaaScore = Math.max(0, Math.min(100, hipaaScore));

    return {
      isHIPAACompliant: hipaaViolations.length === 0,
      violations: hipaaViolations,
      recommendations: hipaaRecommendations,
      score: hipaaScore
    };
  }
}

// Export instances and utilities
export const securityHeaders = new SecurityHeadersManager();
export const hipaaSecurityHeaders = new HIPAASecurityHeaders();

// Utility function to apply security headers to all fetch requests
export function configureSecureFetch(): void {
  const originalFetch = window.fetch;
  
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    const secureInit = hipaaSecurityHeaders.applyToFetchRequest(init);
    return originalFetch(input, secureInit);
  };
}

// Utility function to inject security headers as meta tags
export function injectSecurityMetaTags(): void {
  const metaTags = hipaaSecurityHeaders.generateMetaTags();
  const head = document.head;
  
  metaTags.forEach(tag => {
    const meta = document.createElement('meta');
    const parser = new DOMParser();
    const parsed = parser.parseFromString(tag, 'text/html');
    const metaElement = parsed.querySelector('meta');
    
    if (metaElement) {
      Array.from(metaElement.attributes).forEach(attr => {
        meta.setAttribute(attr.name, attr.value);
      });
      head.appendChild(meta);
    }
  });
}