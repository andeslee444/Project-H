import { z } from 'zod';

// Healthcare-specific validation schemas
export const healthcareValidation = {
  // Patient Information
  patient: z.object({
    firstName: z.string()
      .min(1, 'First name is required')
      .max(50, 'First name must be less than 50 characters')
      .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
    
    lastName: z.string()
      .min(1, 'Last name is required')
      .max(50, 'Last name must be less than 50 characters')
      .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
    
    dateOfBirth: z.string()
      .refine((date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 0 && age <= 150;
      }, 'Please enter a valid date of birth'),
    
    email: z.string()
      .email('Please enter a valid email address')
      .max(255, 'Email must be less than 255 characters'),
    
    phone: z.string()
      .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
      .min(10, 'Phone number must be at least 10 digits')
      .max(20, 'Phone number must be less than 20 digits'),
    
    emergencyContact: z.object({
      name: z.string().min(1, 'Emergency contact name is required'),
      phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
      relationship: z.string().min(1, 'Relationship is required')
    }),
    
    insurance: z.object({
      provider: z.string().min(1, 'Insurance provider is required'),
      policyNumber: z.string().min(1, 'Policy number is required'),
      groupNumber: z.string().optional()
    }).optional(),
    
    medicalHistory: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional()
  }),

  // Appointment Scheduling
  appointment: z.object({
    patientId: z.string().min(1, 'Patient selection is required'),
    providerId: z.string().min(1, 'Provider selection is required'),
    
    date: z.string()
      .refine((date) => {
        const appointmentDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return appointmentDate >= today;
      }, 'Appointment date cannot be in the past'),
    
    time: z.string()
      .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)'),
    
    duration: z.number()
      .min(15, 'Appointment duration must be at least 15 minutes')
      .max(480, 'Appointment duration cannot exceed 8 hours'),
    
    type: z.enum([
      'initial-consultation',
      'follow-up',
      'therapy-session',
      'medication-review',
      'crisis-intervention',
      'group-therapy',
      'family-therapy',
      'assessment'
    ]),
    
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    
    notes: z.string()
      .max(1000, 'Notes must be less than 1000 characters')
      .optional(),
    
    isVirtual: z.boolean().default(false),
    
    reminderPreferences: z.object({
      email: z.boolean().default(true),
      sms: z.boolean().default(false),
      advanceNotice: z.enum(['24h', '2h', '1h', '30m']).default('24h')
    }).optional()
  }),

  // Provider Information
  provider: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    
    credentials: z.string()
      .min(1, 'Professional credentials are required')
      .max(50, 'Credentials must be less than 50 characters'),
    
    specialties: z.array(z.string())
      .min(1, 'At least one specialty is required'),
    
    licenseNumber: z.string()
      .min(1, 'License number is required')
      .regex(/^[A-Z0-9-]+$/, 'License number format is invalid'),
    
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
    
    availability: z.object({
      monday: z.object({ start: z.string(), end: z.string() }).optional(),
      tuesday: z.object({ start: z.string(), end: z.string() }).optional(),
      wednesday: z.object({ start: z.string(), end: z.string() }).optional(),
      thursday: z.object({ start: z.string(), end: z.string() }).optional(),
      friday: z.object({ start: z.string(), end: z.string() }).optional(),
      saturday: z.object({ start: z.string(), end: z.string() }).optional(),
      sunday: z.object({ start: z.string(), end: z.string() }).optional()
    }),
    
    maxPatientsPerDay: z.number()
      .min(1, 'Must allow at least 1 patient per day')
      .max(50, 'Cannot exceed 50 patients per day'),
    
    bio: z.string()
      .max(2000, 'Bio must be less than 2000 characters')
      .optional()
  }),

  // Clinical Notes
  clinicalNote: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
    providerId: z.string().min(1, 'Provider ID is required'),
    appointmentId: z.string().optional(),
    
    date: z.string().refine((date) => new Date(date) <= new Date(), 'Note date cannot be in the future'),
    
    type: z.enum([
      'progress-note',
      'assessment',
      'treatment-plan',
      'discharge-summary',
      'crisis-note',
      'medication-note'
    ]),
    
    subjective: z.string()
      .max(2000, 'Subjective section must be less than 2000 characters')
      .optional(),
    
    objective: z.string()
      .max(2000, 'Objective section must be less than 2000 characters')
      .optional(),
    
    assessment: z.string()
      .max(2000, 'Assessment section must be less than 2000 characters')
      .optional(),
    
    plan: z.string()
      .max(2000, 'Plan section must be less than 2000 characters')
      .optional(),
    
    riskAssessment: z.object({
      suicidalIdeation: z.enum(['none', 'passive', 'active', 'plan', 'intent']),
      homicidalIdeation: z.enum(['none', 'passive', 'active', 'plan', 'intent']),
      riskFactors: z.array(z.string()).optional(),
      protectiveFactors: z.array(z.string()).optional()
    }).optional(),
    
    isConfidential: z.boolean().default(true)
  }),

  // Medication Management
  medication: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
    providerId: z.string().min(1, 'Provider ID is required'),
    
    name: z.string()
      .min(1, 'Medication name is required')
      .max(100, 'Medication name must be less than 100 characters'),
    
    dosage: z.string()
      .min(1, 'Dosage is required')
      .max(50, 'Dosage must be less than 50 characters'),
    
    frequency: z.string()
      .min(1, 'Frequency is required')
      .max(50, 'Frequency must be less than 50 characters'),
    
    startDate: z.string(),
    endDate: z.string().optional(),
    
    indications: z.array(z.string())
      .min(1, 'At least one indication is required'),
    
    contraindications: z.array(z.string()).optional(),
    sideEffects: z.array(z.string()).optional(),
    
    instructions: z.string()
      .max(500, 'Instructions must be less than 500 characters')
      .optional(),
    
    isActive: z.boolean().default(true)
  }),

  // User Authentication
  login: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['Patient', 'Provider', 'Admin', 'Staff'])
  }),

  // Password Requirements (HIPAA-compliant)
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),

  // Emergency Contact
  emergencyContact: z.object({
    name: z.string().min(1, 'Name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
    email: z.string().email().optional(),
    isPrimary: z.boolean().default(false)
  })
};

// Validation helper functions
export const validateHIPAACompliance = (data) => {
  const warnings = [];
  
  // Check for potential PHI in notes/comments
  const phiPatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card pattern
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/ // Email pattern in notes
  ];
  
  const textFields = [data.notes, data.comments, data.subjective, data.objective].filter(Boolean);
  
  textFields.forEach(text => {
    phiPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        warnings.push('Potential PHI detected in text fields. Please review before saving.');
      }
    });
  });
  
  return warnings;
};

// Sanitization functions
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/[<>]/g, '') // Remove < and > characters
    .slice(0, 10000); // Limit input length
};

export default healthcareValidation;