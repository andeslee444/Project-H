import { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import type { 
  BaseEntity, 
  FilterOptions, 
  PaginatedResult, 
  CreateResult, 
  UpdateResult, 
  DeleteResult 
} from '../types'

/**
 * Database error types
 */
export abstract class DatabaseError extends Error {
  abstract readonly code: string
  abstract readonly statusCode: number

  constructor(message: string, public readonly context?: Record<string, any>) {
    super(message)
    this.name = this.constructor.name
  }
}

export class NotFoundError extends DatabaseError {
  readonly code = 'NOT_FOUND'
  readonly statusCode = 404
}

export class ValidationError extends DatabaseError {
  readonly code = 'VALIDATION_ERROR'
  readonly statusCode = 400
}

export class ConflictError extends DatabaseError {
  readonly code = 'CONFLICT'
  readonly statusCode = 409
}

export class DatabaseConnectionError extends DatabaseError {
  readonly code = 'CONNECTION_ERROR'
  readonly statusCode = 500
}

/**
 * Base repository class providing common CRUD operations
 * All entity repositories should extend this class
 */
export abstract class BaseRepository<T extends BaseEntity, CreateDto, UpdateDto> {
  protected supabase: SupabaseClient
  protected tableName: string
  protected schema: z.ZodType<any>

  constructor(
    supabase: SupabaseClient,
    tableName: string,
    schema: z.ZodType<any>
  ) {
    this.supabase = supabase
    this.tableName = tableName
    this.schema = schema
  }

  /**
   * Find entity by ID
   */
  async findById(id: string): Promise<T> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError(`${this.tableName} with id ${id} not found`)
        }
        throw new DatabaseConnectionError(error.message, { error })
      }

      return this.validateAndTransform(data)
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error
      }
      throw new DatabaseConnectionError('Failed to find entity by ID', { error, id })
    }
  }

  /**
   * Find all entities with optional filtering and pagination
   */
  async findAll(filters: FilterOptions = {}): Promise<PaginatedResult<T>> {
    try {
      const { 
        page = 1, 
        limit = 50, 
        sortBy = 'created_at', 
        sortOrder = 'desc',
        search,
        ...otherFilters 
      } = filters

      let query = this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })

      // Apply filters
      query = this.applyFilters(query, otherFilters)

      // Apply search if provided
      if (search) {
        query = this.applySearch(query, search)
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Apply pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        throw new DatabaseConnectionError(error.message, { error, filters })
      }

      const validatedData = data.map(item => this.validateAndTransform(item))
      const total = count || 0
      const totalPages = Math.ceil(total / limit)

      return {
        data: validatedData,
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error
      }
      throw new DatabaseConnectionError('Failed to find entities', { error, filters })
    }
  }

  /**
   * Create new entity
   */
  async create(data: CreateDto): Promise<CreateResult<T>> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert(data as any)
        .select()
        .single()

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new ConflictError('Entity already exists', { error, data })
        }
        throw new DatabaseConnectionError(error.message, { error, data })
      }

      const validatedResult = this.validateAndTransform(result)

      return {
        data: validatedResult,
        success: true
      }
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error
      }
      throw new DatabaseConnectionError('Failed to create entity', { error, data })
    }
  }

  /**
   * Update entity by ID
   */
  async update(id: string, data: UpdateDto): Promise<UpdateResult<T>> {
    try {
      // First check if entity exists
      await this.findById(id)

      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update({
          ...data as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new DatabaseConnectionError(error.message, { error, id, data })
      }

      const validatedResult = this.validateAndTransform(result)

      return {
        data: validatedResult,
        success: true,
        updated: true
      }
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error
      }
      throw new DatabaseConnectionError('Failed to update entity', { error, id, data })
    }
  }

  /**
   * Delete entity by ID
   */
  async delete(id: string): Promise<DeleteResult> {
    try {
      // First check if entity exists
      await this.findById(id)

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)

      if (error) {
        throw new DatabaseConnectionError(error.message, { error, id })
      }

      return {
        success: true,
        deleted: true
      }
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error
      }
      throw new DatabaseConnectionError('Failed to delete entity', { error, id })
    }
  }

  /**
   * Count entities with optional filters
   */
  async count(filters: Omit<FilterOptions, 'page' | 'limit' | 'sortBy' | 'sortOrder'> = {}): Promise<number> {
    try {
      const { search, ...otherFilters } = filters

      let query = this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })

      // Apply filters
      query = this.applyFilters(query, otherFilters)

      // Apply search if provided
      if (search) {
        query = this.applySearch(query, search)
      }

      const { count, error } = await query

      if (error) {
        throw new DatabaseConnectionError(error.message, { error, filters })
      }

      return count || 0
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error
      }
      throw new DatabaseConnectionError('Failed to count entities', { error, filters })
    }
  }

  /**
   * Check if entity exists by ID
   */
  async exists(id: string): Promise<boolean> {
    try {
      const { count, error } = await this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('id', id)

      if (error) {
        throw new DatabaseConnectionError(error.message, { error, id })
      }

      return (count || 0) > 0
    } catch (error) {
      throw new DatabaseConnectionError('Failed to check entity existence', { error, id })
    }
  }

  /**
   * Validate and transform raw database data using Zod schema
   */
  protected validateAndTransform(data: any): T {
    try {
      return this.schema.parse(data)
    } catch (error) {
      throw new ValidationError('Invalid data format', { error, data })
    }
  }

  /**
   * Apply filters to query - should be overridden by child classes
   */
  protected applyFilters(query: any, filters: Record<string, any>): any {
    // Default implementation - apply simple equality filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value)
      }
    })
    return query
  }

  /**
   * Apply search to query - should be overridden by child classes
   */
  protected applySearch(query: any, search: string): any {
    // Default implementation - no search applied
    // Child classes should override this for entity-specific search
    return query
  }

  /**
   * Transaction support - execute multiple operations in a transaction
   */
  async executeTransaction<R>(
    operations: (client: SupabaseClient) => Promise<R>
  ): Promise<R> {
    try {
      // Note: Supabase doesn't support transactions in the same way as traditional SQL databases
      // This is a placeholder for when transaction support is added
      // For now, we just execute the operations with the current client
      return await operations(this.supabase)
    } catch (error) {
      throw new DatabaseConnectionError('Transaction failed', { error })
    }
  }
}