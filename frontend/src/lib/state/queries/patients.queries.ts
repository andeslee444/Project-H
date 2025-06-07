import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys, mutationKeys, invalidateQueries } from '../query-client'
import { PatientRepository } from '@lib/database/repositories/PatientRepository'
import { createClient } from '@supabase/supabase-js'
import { getDatabaseConfig } from '@config/features/database.config'
import { detectEnvironment } from '@config/environments'
import type { 
  Patient, 
  CreatePatientDto, 
  UpdatePatientDto, 
  PatientFilters,
  PaginatedResult 
} from '@lib/database/types'

/**
 * Get Supabase client and patient repository
 */
function getPatientRepository() {
  const dbConfig = getDatabaseConfig(detectEnvironment())
  const supabase = createClient(dbConfig.supabaseUrl, dbConfig.supabaseAnonKey)
  return new PatientRepository(supabase)
}

/**
 * Query hooks for patient data
 */

// Get paginated list of patients
export function usePatients(filters?: PatientFilters) {
  return useQuery({
    queryKey: queryKeys.patientsList(filters),
    queryFn: async (): Promise<PaginatedResult<Patient>> => {
      const repository = getPatientRepository()
      return await repository.findAll(filters || {})
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    meta: {
      errorMessage: 'Failed to load patients'
    }
  })
}

// Get single patient by ID
export function usePatient(patientId: string) {
  return useQuery({
    queryKey: queryKeys.patientsDetail(patientId),
    queryFn: async (): Promise<Patient> => {
      const repository = getPatientRepository()
      return await repository.findById(patientId)
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      errorMessage: 'Failed to load patient details'
    }
  })
}

// Search patients
export function usePatientSearch(searchQuery: string, filters?: PatientFilters) {
  return useQuery({
    queryKey: queryKeys.patientsSearch(searchQuery),
    queryFn: async (): Promise<PaginatedResult<Patient>> => {
      const repository = getPatientRepository()
      return await repository.searchPatients(searchQuery, filters)
    },
    enabled: searchQuery.length >= 2, // Only search with 2+ characters
    staleTime: 1 * 60 * 1000, // 1 minute
    meta: {
      errorMessage: 'Failed to search patients'
    }
  })
}

// Get patient by email
export function usePatientByEmail(email: string) {
  return useQuery({
    queryKey: [...queryKeys.patients, 'by-email', email],
    queryFn: async (): Promise<Patient | null> => {
      const repository = getPatientRepository()
      return await repository.findByEmail(email)
    },
    enabled: !!email,
    staleTime: 5 * 60 * 1000,
    meta: {
      errorMessage: 'Failed to find patient by email'
    }
  })
}

// Get patient by user ID (from auth)
export function usePatientByUserId(userId: string) {
  return useQuery({
    queryKey: [...queryKeys.patients, 'by-user-id', userId],
    queryFn: async (): Promise<Patient | null> => {
      const repository = getPatientRepository()
      return await repository.findByUserId(userId)
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes - user profile doesn't change often
    meta: {
      errorMessage: 'Failed to load patient profile'
    }
  })
}

// Get patients by provider
export function usePatientsByProvider(providerId: string, filters?: PatientFilters) {
  return useQuery({
    queryKey: [...queryKeys.patients, 'by-provider', providerId, filters],
    queryFn: async (): Promise<PaginatedResult<Patient>> => {
      const repository = getPatientRepository()
      return await repository.findByProviderId(providerId, filters)
    },
    enabled: !!providerId,
    staleTime: 3 * 60 * 1000,
    meta: {
      errorMessage: 'Failed to load provider patients'
    }
  })
}

// Get patients with upcoming appointments
export function usePatientsWithUpcomingAppointments(days: number = 7) {
  return useQuery({
    queryKey: [...queryKeys.patients, 'upcoming-appointments', days],
    queryFn: async (): Promise<Patient[]> => {
      const repository = getPatientRepository()
      return await repository.findWithUpcomingAppointments(days)
    },
    staleTime: 5 * 60 * 1000,
    meta: {
      errorMessage: 'Failed to load patients with upcoming appointments'
    }
  })
}

// Get patient statistics
export function usePatientStats() {
  return useQuery({
    queryKey: queryKeys.patientsStats(),
    queryFn: async () => {
      const repository = getPatientRepository()
      return await repository.getPatientStats()
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - stats don't change frequently
    meta: {
      errorMessage: 'Failed to load patient statistics'
    }
  })
}

/**
 * Mutation hooks for patient operations
 */

// Create new patient
export function useCreatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.createPatient,
    mutationFn: async (data: CreatePatientDto): Promise<Patient> => {
      const repository = getPatientRepository()
      const result = await repository.create(data)
      return result.data
    },
    onSuccess: (newPatient) => {
      // Invalidate and refetch relevant queries
      invalidateQueries.allPatients(queryClient)
      
      // Add the new patient to the cache
      queryClient.setQueryData(
        queryKeys.patientsDetail(newPatient.id),
        newPatient
      )

      // Show success notification
      if (typeof window !== 'undefined') {
        const { addNotification } = require('../stores/uiStore').useNotifications.getState()
        addNotification({
          type: 'success',
          title: 'Patient Created',
          message: `${newPatient.first_name} ${newPatient.last_name} has been added successfully`,
          duration: 3000
        })
      }
    },
    meta: {
      errorMessage: 'Failed to create patient'
    }
  })
}

// Update existing patient
export function useUpdatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.updatePatient,
    mutationFn: async ({ 
      patientId, 
      data 
    }: { 
      patientId: string; 
      data: UpdatePatientDto 
    }): Promise<Patient> => {
      const repository = getPatientRepository()
      const result = await repository.update(patientId, data)
      return result.data
    },
    onSuccess: (updatedPatient) => {
      // Update specific patient in cache
      queryClient.setQueryData(
        queryKeys.patientsDetail(updatedPatient.id),
        updatedPatient
      )

      // Invalidate related queries
      invalidateQueries.patient(queryClient, updatedPatient.id)

      // Show success notification
      if (typeof window !== 'undefined') {
        const { addNotification } = require('../stores/uiStore').useNotifications.getState()
        addNotification({
          type: 'success',
          title: 'Patient Updated',
          message: `${updatedPatient.first_name} ${updatedPatient.last_name}'s information has been updated`,
          duration: 3000
        })
      }
    },
    meta: {
      errorMessage: 'Failed to update patient'
    }
  })
}

// Delete patient
export function useDeletePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.deletePatient,
    mutationFn: async (patientId: string): Promise<void> => {
      const repository = getPatientRepository()
      await repository.delete(patientId)
    },
    onSuccess: (_, patientId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: queryKeys.patientsDetail(patientId)
      })

      // Invalidate list queries
      invalidateQueries.allPatients(queryClient)

      // Show success notification
      if (typeof window !== 'undefined') {
        const { addNotification } = require('../stores/uiStore').useNotifications.getState()
        addNotification({
          type: 'success',
          title: 'Patient Deleted',
          message: 'Patient has been successfully removed',
          duration: 3000
        })
      }
    },
    meta: {
      errorMessage: 'Failed to delete patient'
    }
  })
}

// Update patient emergency contact
export function useUpdatePatientEmergencyContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      patientId,
      emergencyContact
    }: {
      patientId: string
      emergencyContact: Patient['emergency_contact']
    }): Promise<Patient> => {
      const repository = getPatientRepository()
      return await repository.updateEmergencyContact(patientId, emergencyContact)
    },
    onSuccess: (updatedPatient) => {
      // Update patient in cache
      queryClient.setQueryData(
        queryKeys.patientsDetail(updatedPatient.id),
        updatedPatient
      )

      // Show success notification
      if (typeof window !== 'undefined') {
        const { addNotification } = require('../stores/uiStore').useNotifications.getState()
        addNotification({
          type: 'success',
          title: 'Emergency Contact Updated',
          message: 'Emergency contact information has been updated',
          duration: 3000
        })
      }
    },
    meta: {
      errorMessage: 'Failed to update emergency contact'
    }
  })
}

// Update patient communication preferences
export function useUpdatePatientCommunicationPreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      patientId,
      preferences
    }: {
      patientId: string
      preferences: Patient['communication_preferences']
    }): Promise<Patient> => {
      const repository = getPatientRepository()
      return await repository.updateCommunicationPreferences(patientId, preferences)
    },
    onSuccess: (updatedPatient) => {
      // Update patient in cache
      queryClient.setQueryData(
        queryKeys.patientsDetail(updatedPatient.id),
        updatedPatient
      )

      // Show success notification
      if (typeof window !== 'undefined') {
        const { addNotification } = require('../stores/uiStore').useNotifications.getState()
        addNotification({
          type: 'success',
          title: 'Preferences Updated',
          message: 'Communication preferences have been updated',
          duration: 3000
        })
      }
    },
    meta: {
      errorMessage: 'Failed to update communication preferences'
    }
  })
}

// Import useNotifications from UI store
import { useNotifications } from '../stores/uiStore'