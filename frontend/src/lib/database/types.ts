import { z } from 'zod'

// Base types for all database entities
export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

// Common query filters
export interface FilterOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  [key: string]: any
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResult<T> {
  data: T[]
  meta: PaginationMeta
}

// Database operation results
export interface CreateResult<T> {
  data: T
  success: boolean
}

export interface UpdateResult<T> {
  data: T
  success: boolean
  updated: boolean
}

export interface DeleteResult {
  success: boolean
  deleted: boolean
}

// Patient types
export const PatientSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zip_code: z.string(),
    country: z.string()
  }).optional(),
  emergency_contact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string()
  }).optional(),
  insurance_provider: z.string().optional(),
  insurance_policy_number: z.string().optional(),
  primary_language: z.string(),
  communication_preferences: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    phone: z.boolean().default(true)
  }).optional(),
  medical_history: z.array(z.string()).optional(),
  current_medications: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'discharged']),
  created_at: z.string(),
  updated_at: z.string()
})

export type Patient = z.infer<typeof PatientSchema>

export const CreatePatientSchema = PatientSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
}).extend({
  status: z.enum(['active', 'inactive', 'discharged']).default('active'),
  primary_language: z.string().default('English'),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zip_code: z.string(),
    country: z.string().default('US')
  }).optional()
})

export type CreatePatientDto = z.infer<typeof CreatePatientSchema>

export const UpdatePatientSchema = CreatePatientSchema.partial()
export type UpdatePatientDto = z.infer<typeof UpdatePatientSchema>

// Provider types
export const ProviderSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  title: z.string(),
  email: z.string().email(),
  phone: z.string(),
  license_number: z.string(),
  license_state: z.string(),
  license_expiry: z.string().optional(),
  specialties: z.array(z.string()),
  languages: z.array(z.string()),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.number(),
    field: z.string().optional()
  })).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    year: z.number(),
    expiry: z.number().optional()
  })).optional(),
  experience_years: z.number(),
  bio: z.string().optional(),
  profile_image_url: z.string().optional(),
  availability: z.object({
    monday: z.object({ start: z.string(), end: z.string() }).optional(),
    tuesday: z.object({ start: z.string(), end: z.string() }).optional(),
    wednesday: z.object({ start: z.string(), end: z.string() }).optional(),
    thursday: z.object({ start: z.string(), end: z.string() }).optional(),
    friday: z.object({ start: z.string(), end: z.string() }).optional(),
    saturday: z.object({ start: z.string(), end: z.string() }).optional(),
    sunday: z.object({ start: z.string(), end: z.string() }).optional()
  }).optional(),
  max_patients_per_day: z.number(),
  session_duration_minutes: z.number(),
  telehealth_enabled: z.boolean(),
  in_person_enabled: z.boolean(),
  hourly_rate: z.number().optional(),
  accepts_insurance: z.boolean(),
  insurance_providers: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'on_leave']),
  created_at: z.string(),
  updated_at: z.string()
})

export type Provider = z.infer<typeof ProviderSchema>

export const CreateProviderSchema = ProviderSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
}).extend({
  status: z.enum(['active', 'inactive', 'on_leave']).default('active'),
  languages: z.array(z.string()).default(['English']),
  max_patients_per_day: z.number().default(8),
  session_duration_minutes: z.number().default(50),
  telehealth_enabled: z.boolean().default(true),
  in_person_enabled: z.boolean().default(true),
  accepts_insurance: z.boolean().default(true)
})

export type CreateProviderDto = z.infer<typeof CreateProviderSchema>

export const UpdateProviderSchema = CreateProviderSchema.partial()
export type UpdateProviderDto = z.infer<typeof UpdateProviderSchema>

// Appointment types
export const AppointmentSchema = z.object({
  id: z.string(),
  patient_id: z.string(),
  provider_id: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  type: z.enum(['initial_consultation', 'follow_up', 'therapy_session', 'evaluation', 'group_session']),
  modality: z.enum(['in_person', 'telehealth', 'phone']).default('telehealth'),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).default('scheduled'),
  reason: z.string().optional(),
  notes: z.string().optional(),
  private_notes: z.string().optional(), // Provider-only notes
  session_link: z.string().optional(), // Telehealth link
  location: z.object({
    address: z.string(),
    room: z.string().optional(),
    instructions: z.string().optional()
  }).optional(),
  billing_status: z.enum(['pending', 'submitted', 'paid', 'denied']).default('pending'),
  billing_amount: z.number().optional(),
  insurance_claim_id: z.string().optional(),
  reminder_sent: z.boolean().default(false),
  confirmation_sent: z.boolean().default(false),
  cancelled_at: z.string().optional(),
  cancelled_by: z.string().optional(),
  cancellation_reason: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string()
})

export type Appointment = z.infer<typeof AppointmentSchema>

export const CreateAppointmentSchema = AppointmentSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
})

export type CreateAppointmentDto = z.infer<typeof CreateAppointmentSchema>

export const UpdateAppointmentSchema = CreateAppointmentSchema.partial()
export type UpdateAppointmentDto = z.infer<typeof UpdateAppointmentSchema>

// Waitlist types
export const WaitlistEntrySchema = z.object({
  id: z.string(),
  patient_id: z.string(),
  provider_id: z.string().optional(), // If patient prefers specific provider
  practice_id: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  preferred_appointment_types: z.array(z.enum(['initial_consultation', 'follow_up', 'therapy_session', 'evaluation'])),
  preferred_times: z.array(z.enum(['morning', 'afternoon', 'evening'])),
  preferred_days: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])).optional(),
  preferred_modality: z.enum(['in_person', 'telehealth', 'phone', 'any']).default('any'),
  max_wait_days: z.number().default(30),
  min_notice_hours: z.number().default(24),
  flexibility_score: z.number().min(0).max(100).default(50), // How flexible the patient is
  notes: z.string().optional(),
  status: z.enum(['active', 'matched', 'cancelled', 'expired']).default('active'),
  matched_appointment_id: z.string().optional(),
  matched_at: z.string().optional(),
  expires_at: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string()
})

export type WaitlistEntry = z.infer<typeof WaitlistEntrySchema>

export const CreateWaitlistEntrySchema = WaitlistEntrySchema.omit({
  id: true,
  created_at: true,
  updated_at: true
})

export type CreateWaitlistEntryDto = z.infer<typeof CreateWaitlistEntrySchema>

export const UpdateWaitlistEntrySchema = CreateWaitlistEntrySchema.partial()
export type UpdateWaitlistEntryDto = z.infer<typeof UpdateWaitlistEntrySchema>

// Filter types for each entity
export interface PatientFilters extends FilterOptions {
  status?: Patient['status']
  provider_id?: string
  insurance_provider?: string
  created_after?: string
  created_before?: string
}

export interface ProviderFilters extends FilterOptions {
  specialty?: string
  language?: string
  status?: Provider['status']
  telehealth_enabled?: boolean
  accepts_insurance?: boolean
  min_experience?: number
}

export interface AppointmentFilters extends FilterOptions {
  patient_id?: string
  provider_id?: string
  status?: Appointment['status']
  type?: Appointment['type']
  modality?: Appointment['modality']
  date_from?: string
  date_to?: string
  billing_status?: Appointment['billing_status']
}

export interface WaitlistFilters extends FilterOptions {
  patient_id?: string
  provider_id?: string
  practice_id?: string
  priority?: WaitlistEntry['priority']
  status?: WaitlistEntry['status']
  preferred_modality?: WaitlistEntry['preferred_modality']
  max_wait_days?: number
}