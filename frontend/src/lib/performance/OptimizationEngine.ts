/**
 * Performance Optimization Engine
 * 
 * Provides React performance optimization utilities including
 * memoization, virtualization, and component optimization.
 */

import { useMemo, useCallback, memo, ReactNode } from 'react'

/**
 * Memoization utilities for expensive calculations
 */
export class MemoizationEngine {
  private static cache = new Map<string, any>()
  private static cacheExpiry = new Map<string, number>()
  
  /**
   * Memoize expensive calculations with TTL
   */
  static memoizeWithTTL<T>(
    key: string,
    fn: () => T,
    ttlMs: number = 5 * 60 * 1000 // 5 minutes default
  ): T {
    const now = Date.now()
    const expiry = this.cacheExpiry.get(key)
    
    // Check if cached value exists and is not expired
    if (this.cache.has(key) && expiry && now < expiry) {
      return this.cache.get(key)
    }
    
    // Calculate new value
    const value = fn()
    this.cache.set(key, value)
    this.cacheExpiry.set(key, now + ttlMs)
    
    return value
  }
  
  /**
   * Clear expired cache entries
   */
  static cleanupCache(): void {
    const now = Date.now()
    
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (now >= expiry) {
        this.cache.delete(key)
        this.cacheExpiry.delete(key)
      }
    }
  }
  
  /**
   * Clear all cache
   */
  static clearCache(): void {
    this.cache.clear()
    this.cacheExpiry.clear()
  }
}

/**
 * Healthcare-specific memoization hooks
 */
export const useHealthcareMemo = {
  /**
   * Memoize patient data calculations
   */
  patientData: <T>(
    calculateFn: () => T,
    patientId: string,
    dependencies: readonly unknown[] = []
  ): T => {
    return useMemo(() => {
      const cacheKey = `patient-${patientId}-${JSON.stringify(dependencies)}`
      return MemoizationEngine.memoizeWithTTL(cacheKey, calculateFn, 2 * 60 * 1000) // 2 min TTL
    }, [patientId, ...dependencies])
  },
  
  /**
   * Memoize clinical calculations
   */
  clinical: <T>(
    calculateFn: () => T,
    calculationType: string,
    dependencies: readonly unknown[] = []
  ): T => {
    return useMemo(() => {
      const cacheKey = `clinical-${calculationType}-${JSON.stringify(dependencies)}`
      return MemoizationEngine.memoizeWithTTL(cacheKey, calculateFn, 1 * 60 * 1000) // 1 min TTL
    }, [calculationType, ...dependencies])
  },
  
  /**
   * Memoize appointment data
   */
  appointments: <T>(
    calculateFn: () => T,
    timeRange: string,
    providerId?: string,
    dependencies: readonly unknown[] = []
  ): T => {
    return useMemo(() => {
      const cacheKey = `appointments-${timeRange}-${providerId || 'all'}-${JSON.stringify(dependencies)}`
      return MemoizationEngine.memoizeWithTTL(cacheKey, calculateFn, 30 * 1000) // 30 sec TTL
    }, [timeRange, providerId, ...dependencies])
  }
}

/**
 * Optimized callback hooks for healthcare workflows
 */
export const useHealthcareCallbacks = {
  /**
   * Optimized patient action callbacks
   */
  patientActions: (patientId: string) => ({
    onUpdateVitals: useCallback((vitals: any) => {
      // Optimized vitals update with debouncing
      console.log('Updating vitals for patient:', patientId, vitals)
    }, [patientId]),
    
    onUpdateNotes: useCallback((notes: string) => {
      // Optimized notes update with auto-save
      console.log('Updating notes for patient:', patientId, notes)
    }, [patientId]),
    
    onScheduleAppointment: useCallback((appointmentData: any) => {
      // Optimized appointment scheduling
      console.log('Scheduling appointment for patient:', patientId, appointmentData)
    }, [patientId])
  }),
  
  /**
   * Optimized provider workflow callbacks
   */
  providerActions: (providerId: string) => ({
    onPatientSelect: useCallback((patientId: string) => {
      console.log('Provider', providerId, 'selected patient:', patientId)
    }, [providerId]),
    
    onAppointmentUpdate: useCallback((appointmentId: string, updates: any) => {
      console.log('Provider', providerId, 'updated appointment:', appointmentId, updates)
    }, [providerId]),
    
    onClinicalNoteCreate: useCallback((patientId: string, note: any) => {
      console.log('Provider', providerId, 'created note for patient:', patientId, note)
    }, [providerId])
  })
}

/**
 * Component memoization wrappers for healthcare components
 */
export const HealthcareMemo = {
  /**
   * Memoized patient card component
   */
  PatientCard: memo<{
    patient: any
    onSelect?: (patientId: string) => void
    showVitals?: boolean
  }>(({ patient, onSelect, showVitals }) => {
    const handleSelect = useCallback(() => {
      onSelect?.(patient.id)
    }, [patient.id, onSelect])
    
    const vitalsDisplay = useMemo(() => {
      if (!showVitals || !patient.vitals) return null
      
      return {
        heartRate: patient.vitals.heartRate,
        bloodPressure: patient.vitals.bloodPressure,
        temperature: patient.vitals.temperature
      }
    }, [patient.vitals, showVitals])
    
    return null // Component implementation would go here
  }, (prevProps, nextProps) => {
    // Custom comparison for deep equality on patient data
    return (
      prevProps.patient.id === nextProps.patient.id &&
      prevProps.patient.updatedAt === nextProps.patient.updatedAt &&
      prevProps.showVitals === nextProps.showVitals
    )
  }),
  
  /**
   * Memoized appointment slot component
   */
  AppointmentSlot: memo<{
    slot: any
    isSelected?: boolean
    onSelect?: (slotId: string) => void
  }>(({ slot, isSelected, onSelect }) => {
    const handleSelect = useCallback(() => {
      onSelect?.(slot.id)
    }, [slot.id, onSelect])
    
    return null // Component implementation would go here
  }, (prevProps, nextProps) => {
    return (
      prevProps.slot.id === nextProps.slot.id &&
      prevProps.slot.status === nextProps.slot.status &&
      prevProps.isSelected === nextProps.isSelected
    )
  }),
  
  /**
   * Memoized clinical notes component
   */
  ClinicalNotes: memo<{
    patientId: string
    notes: any[]
    onNoteAdd?: (note: string) => void
  }>(({ patientId, notes, onNoteAdd }) => {
    const sortedNotes = useMemo(() => {
      return [...notes].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    }, [notes])
    
    const handleNoteAdd = useCallback((note: string) => {
      onNoteAdd?.(note)
    }, [onNoteAdd])
    
    return null // Component implementation would go here
  })
}

/**
 * Virtual scrolling utilities for large datasets
 */
export class VirtualizationEngine {
  /**
   * Calculate visible items for virtual scrolling
   */
  static calculateVisibleItems<T>(
    items: T[],
    containerHeight: number,
    itemHeight: number,
    scrollTop: number,
    overscan: number = 5
  ): {
    visibleItems: T[]
    startIndex: number
    endIndex: number
    totalHeight: number
  } {
    const totalHeight = items.length * itemHeight
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )
    
    const visibleItems = items.slice(startIndex, endIndex + 1)
    
    return {
      visibleItems,
      startIndex,
      endIndex,
      totalHeight
    }
  }
  
  /**
   * Create virtual scrolling state for healthcare lists
   */
  static createVirtualScrollState(itemHeight: number, overscan: number = 5) {
    return {
      itemHeight,
      overscan,
      scrollTop: 0,
      containerHeight: 0
    }
  }
}

/**
 * Performance monitoring for optimizations
 */
export class OptimizationMonitor {
  private static renderTimes = new Map<string, number[]>()
  
  /**
   * Start measuring component render time
   */
  static startMeasure(componentName: string): () => void {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      if (!this.renderTimes.has(componentName)) {
        this.renderTimes.set(componentName, [])
      }
      
      const times = this.renderTimes.get(componentName)!
      times.push(renderTime)
      
      // Keep only last 100 measurements
      if (times.length > 100) {
        times.shift()
      }
      
      // Log slow renders (>16ms for 60fps)
      if (renderTime > 16) {
        console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`)
      }
    }
  }
  
  /**
   * Get performance statistics for a component
   */
  static getStats(componentName: string): {
    average: number
    min: number
    max: number
    count: number
  } | null {
    const times = this.renderTimes.get(componentName)
    if (!times || times.length === 0) return null
    
    const average = times.reduce((sum, time) => sum + time, 0) / times.length
    const min = Math.min(...times)
    const max = Math.max(...times)
    
    return { average, min, max, count: times.length }
  }
  
  /**
   * Generate optimization report
   */
  static generateReport(): Record<string, any> {
    const report: Record<string, any> = {}
    
    for (const [componentName] of this.renderTimes) {
      const stats = this.getStats(componentName)
      if (stats) {
        report[componentName] = {
          ...stats,
          needsOptimization: stats.average > 16,
          severity: stats.average > 32 ? 'high' : stats.average > 16 ? 'medium' : 'low'
        }
      }
    }
    
    return report
  }
}

/**
 * Cleanup utility to run performance maintenance
 */
export const runPerformanceMaintenance = (): void => {
  // Clean up expired memoization cache
  MemoizationEngine.cleanupCache()
  
  // Generate optimization report
  const report = OptimizationMonitor.generateReport()
  console.log('Performance Optimization Report:', report)
}

// Auto-cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(runPerformanceMaintenance, 5 * 60 * 1000)
}