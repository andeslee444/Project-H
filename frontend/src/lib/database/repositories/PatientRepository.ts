import { SupabaseClient } from '@supabase/supabase-js'
import { BaseRepository, NotFoundError, DatabaseConnectionError } from './BaseRepository'
import type { 
  Patient, 
  CreatePatientDto, 
  UpdatePatientDto, 
  PatientFilters,
  PaginatedResult 
} from '../types'
import { PatientSchema } from '../types'

/**
 * Repository for Patient entity operations
 * Extends BaseRepository with patient-specific methods
 */
export class PatientRepository extends BaseRepository<Patient, CreatePatientDto, UpdatePatientDto> {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'patients', PatientSchema)
  }

  /**
   * Find patient by email address
   */
  async findByEmail(email: string): Promise<Patient | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('email', email)
        .maybeSingle()

      if (error) {
        throw new DatabaseConnectionError(error.message, { error, email })
      }

      return data ? this.validateAndTransform(data) : null
    } catch (error) {
      if (error instanceof DatabaseConnectionError) {
        throw error
      }
      throw new DatabaseConnectionError('Failed to find patient by email', { error, email })
    }
  }

  /**
   * Find patient by user ID (from auth)
   */
  async findByUserId(userId: string): Promise<Patient | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        throw new DatabaseConnectionError(error.message, { error, userId })
      }

      return data ? this.validateAndTransform(data) : null
    } catch (error) {
      if (error instanceof DatabaseConnectionError) {
        throw error
      }
      throw new DatabaseConnectionError('Failed to find patient by user ID', { error, userId })
    }
  }

  /**
   * Find patients by provider ID (assigned patients)
   */
  async findByProviderId(providerId: string, filters: PatientFilters = {}): Promise<PaginatedResult<Patient>> {
    try {
      // This would require a join with appointments or provider_patients table
      // For now, we'll filter by a hypothetical assigned_provider_id field
      const updatedFilters = {
        ...filters,
        assigned_provider_id: providerId
      }

      return await this.findAll(updatedFilters)
    } catch (error) {
      throw new DatabaseConnectionError('Failed to find patients by provider', { error, providerId })
    }
  }

  /**
   * Search patients by name, email, or phone
   */
  async searchPatients(searchTerm: string, filters: PatientFilters = {}): Promise<PaginatedResult<Patient>> {
    try {
      const updatedFilters = {
        ...filters,
        search: searchTerm
      }

      return await this.findAll(updatedFilters)
    } catch (error) {
      throw new DatabaseConnectionError('Failed to search patients', { error, searchTerm })
    }
  }

  /**
   * Get patients with upcoming appointments
   */
  async findWithUpcomingAppointments(days: number = 7): Promise<Patient[]> {
    try {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + days)

      const { data, error } = await this.supabase
        .from('patients')
        .select(`
          *,
          appointments!inner(
            id,
            start_time,
            status
          )
        `)
        .eq('appointments.status', 'scheduled')
        .gte('appointments.start_time', new Date().toISOString())
        .lte('appointments.start_time', futureDate.toISOString())

      if (error) {
        throw new DatabaseConnectionError(error.message, { error, days })
      }

      return data.map(item => this.validateAndTransform(item))
    } catch (error) {
      if (error instanceof DatabaseConnectionError) {
        throw error
      }
      throw new DatabaseConnectionError('Failed to find patients with upcoming appointments', { error, days })
    }
  }

  /**
   * Get patient statistics
   */
  async getPatientStats(): Promise<{
    total: number
    active: number
    inactive: number
    newThisMonth: number
  }> {
    try {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const [total, active, inactive, newThisMonth] = await Promise.all([
        this.count(),
        this.count({ status: 'active' }),
        this.count({ status: 'inactive' }),
        this.count({ 
          created_after: startOfMonth.toISOString() 
        })
      ])

      return {
        total,
        active,
        inactive,
        newThisMonth
      }
    } catch (error) {
      throw new DatabaseConnectionError('Failed to get patient statistics', { error })
    }
  }

  /**
   * Update patient emergency contact
   */
  async updateEmergencyContact(
    patientId: string, 
    emergencyContact: Patient['emergency_contact']
  ): Promise<Patient> {
    try {
      const updateData: UpdatePatientDto = {
        emergency_contact: emergencyContact
      }

      const result = await this.update(patientId, updateData)
      return result.data
    } catch (error) {
      throw new DatabaseConnectionError('Failed to update emergency contact', { error, patientId })
    }
  }

  /**
   * Update patient communication preferences
   */
  async updateCommunicationPreferences(
    patientId: string,
    preferences: Patient['communication_preferences']
  ): Promise<Patient> {
    try {
      const updateData: UpdatePatientDto = {
        communication_preferences: preferences
      }

      const result = await this.update(patientId, updateData)
      return result.data
    } catch (error) {
      throw new DatabaseConnectionError('Failed to update communication preferences', { error, patientId })
    }
  }

  /**
   * Apply patient-specific filters
   */
  protected override applyFilters(query: any, filters: Record<string, any>): any {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        switch (key) {
          case 'status':
            query = query.eq('status', value)
            break
          case 'provider_id':
            query = query.eq('assigned_provider_id', value)
            break
          case 'insurance_provider':
            query = query.eq('insurance_provider', value)
            break
          case 'created_after':
            query = query.gte('created_at', value)
            break
          case 'created_before':
            query = query.lte('created_at', value)
            break
          default:
            query = query.eq(key, value)
        }
      }
    })
    return query
  }

  /**
   * Apply search to patient fields
   */
  protected override applySearch(query: any, search: string): any {
    return query.or(
      `first_name.ilike.%${search}%,` +
      `last_name.ilike.%${search}%,` +
      `email.ilike.%${search}%,` +
      `phone.ilike.%${search}%`
    )
  }
}