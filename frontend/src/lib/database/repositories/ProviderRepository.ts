import { SupabaseClient } from '@supabase/supabase-js'
import { BaseRepository, NotFoundError, DatabaseConnectionError } from './BaseRepository'
import type { 
  Provider, 
  CreateProviderDto, 
  UpdateProviderDto, 
  ProviderFilters,
  PaginatedResult 
} from '../types'
import { ProviderSchema } from '../types'

/**
 * Repository for Provider entity operations
 * Extends BaseRepository with provider-specific methods
 */
export class ProviderRepository extends BaseRepository<Provider, CreateProviderDto, UpdateProviderDto> {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'providers', ProviderSchema)
  }

  /**
   * Find provider by email address
   */
  async findByEmail(email: string): Promise<Provider | null> {
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
      throw new DatabaseConnectionError('Failed to find provider by email', { error, email })
    }
  }

  /**
   * Find provider by user ID (from auth)
   */
  async findByUserId(userId: string): Promise<Provider | null> {
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
      throw new DatabaseConnectionError('Failed to find provider by user ID', { error, userId })
    }
  }

  /**
   * Find provider by license number
   */
  async findByLicenseNumber(licenseNumber: string, state?: string): Promise<Provider | null> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .eq('license_number', licenseNumber)

      if (state) {
        query = query.eq('license_state', state)
      }

      const { data, error } = await query.maybeSingle()

      if (error) {
        throw new DatabaseConnectionError(error.message, { error, licenseNumber, state })
      }

      return data ? this.validateAndTransform(data) : null
    } catch (error) {
      if (error instanceof DatabaseConnectionError) {
        throw error
      }
      throw new DatabaseConnectionError('Failed to find provider by license', { error, licenseNumber })
    }
  }

  /**
   * Find providers by specialty
   */
  async findBySpecialty(specialty: string, filters: ProviderFilters = {}): Promise<PaginatedResult<Provider>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .contains('specialties', [specialty])
        .eq('status', 'active')

      if (error) {
        throw new DatabaseConnectionError(error.message, { error, specialty })
      }

      // Apply additional filters
      let filteredData = data
      if (filters.telehealth_enabled !== undefined) {
        filteredData = filteredData.filter(p => p.telehealth_enabled === filters.telehealth_enabled)
      }
      if (filters.accepts_insurance !== undefined) {
        filteredData = filteredData.filter(p => p.accepts_insurance === filters.accepts_insurance)
      }
      if (filters.min_experience) {
        filteredData = filteredData.filter(p => p.experience_years >= filters.min_experience!)
      }

      const validatedData = filteredData.map(item => this.validateAndTransform(item))

      return {
        data: validatedData,
        meta: {
          page: 1,
          limit: validatedData.length,
          total: validatedData.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      }
    } catch (error) {
      throw new DatabaseConnectionError('Failed to find providers by specialty', { error, specialty })
    }
  }

  /**
   * Find providers by language
   */
  async findByLanguage(language: string, filters: ProviderFilters = {}): Promise<PaginatedResult<Provider>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .contains('languages', [language])
        .eq('status', 'active')

      if (error) {
        throw new DatabaseConnectionError(error.message, { error, language })
      }

      const validatedData = data.map(item => this.validateAndTransform(item))

      return {
        data: validatedData,
        meta: {
          page: 1,
          limit: validatedData.length,
          total: validatedData.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      }
    } catch (error) {
      throw new DatabaseConnectionError('Failed to find providers by language', { error, language })
    }
  }

  /**
   * Find available providers for a specific time slot
   */
  async findAvailableProviders(
    startTime: string,
    endTime: string,
    filters: ProviderFilters = {}
  ): Promise<Provider[]> {
    try {
      // This would require complex logic to check availability
      // For now, return active providers and let the appointment system handle conflicts
      const result = await this.findAll({
        ...filters,
        status: 'active'
      })

      return result.data
    } catch (error) {
      throw new DatabaseConnectionError('Failed to find available providers', { error, startTime, endTime })
    }
  }

  /**
   * Get provider statistics
   */
  async getProviderStats(): Promise<{
    total: number
    active: number
    inactive: number
    onLeave: number
    averageExperience: number
    telehealthEnabled: number
  }> {
    try {
      const [total, active, inactive, onLeave] = await Promise.all([
        this.count(),
        this.count({ status: 'active' }),
        this.count({ status: 'inactive' }),
        this.count({ status: 'on_leave' })
      ])

      // Get telehealth enabled count
      const { count: telehealthEnabled, error } = await this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('telehealth_enabled', true)

      if (error) {
        throw new DatabaseConnectionError(error.message, { error })
      }

      // Calculate average experience
      const { data: experienceData, error: expError } = await this.supabase
        .from(this.tableName)
        .select('experience_years')
        .eq('status', 'active')

      if (expError) {
        throw new DatabaseConnectionError(expError.message, { error: expError })
      }

      const averageExperience = experienceData.length > 0 
        ? experienceData.reduce((sum, p) => sum + p.experience_years, 0) / experienceData.length
        : 0

      return {
        total,
        active,
        inactive,
        onLeave,
        averageExperience: Math.round(averageExperience * 10) / 10, // Round to 1 decimal
        telehealthEnabled: telehealthEnabled || 0
      }
    } catch (error) {
      throw new DatabaseConnectionError('Failed to get provider statistics', { error })
    }
  }

  /**
   * Update provider availability
   */
  async updateAvailability(
    providerId: string,
    availability: Provider['availability']
  ): Promise<Provider> {
    try {
      const updateData: UpdateProviderDto = {
        availability
      }

      const result = await this.update(providerId, updateData)
      return result.data
    } catch (error) {
      throw new DatabaseConnectionError('Failed to update provider availability', { error, providerId })
    }
  }

  /**
   * Update provider specialties
   */
  async updateSpecialties(
    providerId: string,
    specialties: string[]
  ): Promise<Provider> {
    try {
      const updateData: UpdateProviderDto = {
        specialties
      }

      const result = await this.update(providerId, updateData)
      return result.data
    } catch (error) {
      throw new DatabaseConnectionError('Failed to update provider specialties', { error, providerId })
    }
  }

  /**
   * Get provider workload (upcoming appointments)
   */
  async getProviderWorkload(providerId: string, days: number = 7): Promise<{
    upcomingAppointments: number
    availableSlots: number
    utilizationRate: number
  }> {
    try {
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + days)

      const { count, error } = await this.supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', providerId)
        .eq('status', 'scheduled')
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())

      if (error) {
        throw new DatabaseConnectionError(error.message, { error, providerId })
      }

      const upcomingAppointments = count || 0

      // This is simplified - in reality you'd calculate based on provider availability
      const provider = await this.findById(providerId)
      const maxDailyAppointments = provider.max_patients_per_day
      const workingDays = Math.min(days, 5) // Assume 5 working days per week
      const totalPossibleSlots = maxDailyAppointments * workingDays
      const availableSlots = Math.max(0, totalPossibleSlots - upcomingAppointments)
      const utilizationRate = totalPossibleSlots > 0 
        ? (upcomingAppointments / totalPossibleSlots) * 100 
        : 0

      return {
        upcomingAppointments,
        availableSlots,
        utilizationRate: Math.round(utilizationRate * 10) / 10
      }
    } catch (error) {
      throw new DatabaseConnectionError('Failed to get provider workload', { error, providerId })
    }
  }

  /**
   * Apply provider-specific filters
   */
  protected override applyFilters(query: any, filters: Record<string, any>): any {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        switch (key) {
          case 'specialty':
            query = query.contains('specialties', [value])
            break
          case 'language':
            query = query.contains('languages', [value])
            break
          case 'status':
            query = query.eq('status', value)
            break
          case 'telehealth_enabled':
            query = query.eq('telehealth_enabled', value)
            break
          case 'accepts_insurance':
            query = query.eq('accepts_insurance', value)
            break
          case 'min_experience':
            query = query.gte('experience_years', value)
            break
          default:
            query = query.eq(key, value)
        }
      }
    })
    return query
  }

  /**
   * Apply search to provider fields
   */
  protected override applySearch(query: any, search: string): any {
    return query.or(
      `first_name.ilike.%${search}%,` +
      `last_name.ilike.%${search}%,` +
      `title.ilike.%${search}%,` +
      `email.ilike.%${search}%,` +
      `license_number.ilike.%${search}%,` +
      `specialties.cs.{${search}}`
    )
  }
}