import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { useNotifications } from './stores/uiStore'

/**
 * Custom error handler for queries and mutations
 */
function handleError(error: Error, query?: any) {
  console.error('Query error:', error)
  
  // Add notification for user-facing errors
  if (typeof window !== 'undefined') {
    const { addNotification } = require('./stores/uiStore').useNotifications.getState()
    
    // Don't show notifications for background refetches or certain error types
    if (query?.meta?.silent) {
      return
    }
    
    let title = 'An error occurred'
    let message = 'Please try again later'
    
    if (error.message.includes('fetch')) {
      title = 'Connection Error'
      message = 'Please check your internet connection'
    } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
      title = 'Authentication Required'
      message = 'Please log in to continue'
    } else if (error.message.includes('403') || error.message.includes('forbidden')) {
      title = 'Access Denied'
      message = 'You do not have permission to perform this action'
    } else if (error.message.includes('404') || error.message.includes('not found')) {
      title = 'Not Found'
      message = 'The requested resource was not found'
    } else if (error.message.includes('validation')) {
      title = 'Validation Error'
      message = error.message
    }
    
    addNotification({
      type: 'error',
      title,
      message,
      duration: 5000
    })
  }
}

/**
 * Create and configure QueryClient with custom defaults
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: handleError
    }),
    mutationCache: new MutationCache({
      onError: handleError
    }),
    defaultOptions: {
      queries: {
        // Stale time: How long data is considered fresh
        staleTime: 5 * 60 * 1000, // 5 minutes
        
        // Cache time: How long inactive data stays in cache
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        
        // Retry configuration
        retry: (failureCount, error: any) => {
          // Don't retry on certain error types
          if (error?.status === 404 || error?.status === 401 || error?.status === 403) {
            return false
          }
          // Retry up to 3 times for other errors
          return failureCount < 3
        },
        
        // Retry delay with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Background refetch configuration
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: true,
        
        // Network mode
        networkMode: 'online',
        
        // Error handling
        throwOnError: false
      },
      mutations: {
        // Retry configuration for mutations
        retry: (failureCount, error: any) => {
          // Don't retry mutations by default to avoid duplicate operations
          // Only retry on network errors
          if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
            return failureCount < 2
          }
          return false
        },
        
        // Retry delay for mutations
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        
        // Network mode
        networkMode: 'online',
        
        // Error handling
        throwOnError: false
      }
    }
  })
}

/**
 * Query keys factory for consistent key management
 */
export const queryKeys = {
  // Auth
  auth: ['auth'] as const,
  authUser: () => [...queryKeys.auth, 'user'] as const,
  
  // Patients
  patients: ['patients'] as const,
  patientsList: (filters?: any) => [...queryKeys.patients, 'list', filters] as const,
  patientsDetail: (id: string) => [...queryKeys.patients, 'detail', id] as const,
  patientsSearch: (query: string) => [...queryKeys.patients, 'search', query] as const,
  patientsStats: () => [...queryKeys.patients, 'stats'] as const,
  
  // Providers
  providers: ['providers'] as const,
  providersList: (filters?: any) => [...queryKeys.providers, 'list', filters] as const,
  providersDetail: (id: string) => [...queryKeys.providers, 'detail', id] as const,
  providersSearch: (query: string) => [...queryKeys.providers, 'search', query] as const,
  providersStats: () => [...queryKeys.providers, 'stats'] as const,
  providersAvailability: (id: string, date?: string) => [...queryKeys.providers, 'availability', id, date] as const,
  
  // Appointments
  appointments: ['appointments'] as const,
  appointmentsList: (filters?: any) => [...queryKeys.appointments, 'list', filters] as const,
  appointmentsDetail: (id: string) => [...queryKeys.appointments, 'detail', id] as const,
  appointmentsUpcoming: (userId: string) => [...queryKeys.appointments, 'upcoming', userId] as const,
  appointmentsCalendar: (start: string, end: string) => [...queryKeys.appointments, 'calendar', start, end] as const,
  
  // Waitlist
  waitlist: ['waitlist'] as const,
  waitlistEntries: (filters?: any) => [...queryKeys.waitlist, 'entries', filters] as const,
  waitlistDetail: (id: string) => [...queryKeys.waitlist, 'detail', id] as const,
  waitlistStats: () => [...queryKeys.waitlist, 'stats'] as const,
  
  // Analytics
  analytics: ['analytics'] as const,
  analyticsOverview: (period: string) => [...queryKeys.analytics, 'overview', period] as const,
  analyticsPatients: (period: string) => [...queryKeys.analytics, 'patients', period] as const,
  analyticsAppointments: (period: string) => [...queryKeys.analytics, 'appointments', period] as const,
  analyticsProviders: (period: string) => [...queryKeys.analytics, 'providers', period] as const
} as const

/**
 * Mutation keys for consistent mutation management
 */
export const mutationKeys = {
  // Auth mutations
  signIn: ['auth', 'signIn'] as const,
  signOut: ['auth', 'signOut'] as const,
  updateProfile: ['auth', 'updateProfile'] as const,
  
  // Patient mutations
  createPatient: ['patients', 'create'] as const,
  updatePatient: ['patients', 'update'] as const,
  deletePatient: ['patients', 'delete'] as const,
  
  // Provider mutations
  createProvider: ['providers', 'create'] as const,
  updateProvider: ['providers', 'update'] as const,
  deleteProvider: ['providers', 'delete'] as const,
  
  // Appointment mutations
  createAppointment: ['appointments', 'create'] as const,
  updateAppointment: ['appointments', 'update'] as const,
  deleteAppointment: ['appointments', 'delete'] as const,
  cancelAppointment: ['appointments', 'cancel'] as const,
  
  // Waitlist mutations
  addToWaitlist: ['waitlist', 'add'] as const,
  updateWaitlistEntry: ['waitlist', 'update'] as const,
  removeFromWaitlist: ['waitlist', 'remove'] as const,
  matchWaitlistEntry: ['waitlist', 'match'] as const
} as const

/**
 * Cache invalidation helpers
 */
export const invalidateQueries = {
  // Invalidate all data for a specific entity
  allPatients: (queryClient: QueryClient) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.patients }),
  
  allProviders: (queryClient: QueryClient) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.providers }),
  
  allAppointments: (queryClient: QueryClient) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.appointments }),
  
  allWaitlist: (queryClient: QueryClient) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.waitlist }),
  
  // Invalidate specific item and related queries
  patient: (queryClient: QueryClient, patientId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.patientsDetail(patientId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.patients })
    queryClient.invalidateQueries({ queryKey: queryKeys.appointments })
  },
  
  provider: (queryClient: QueryClient, providerId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.providersDetail(providerId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.providers })
    queryClient.invalidateQueries({ queryKey: queryKeys.appointments })
  },
  
  appointment: (queryClient: QueryClient, appointmentId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.appointmentsDetail(appointmentId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.appointments })
    queryClient.invalidateQueries({ queryKey: queryKeys.waitlist })
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics })
  }
}

/**
 * Pre-configured query client instance
 */
export const queryClient = createQueryClient()