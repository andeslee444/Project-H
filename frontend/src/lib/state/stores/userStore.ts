import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { User } from '@features/auth/types/auth.types'

/**
 * User Preferences and Settings State
 * Stores user-specific preferences that persist across sessions
 */
interface UserState {
  // User preferences
  preferences: UserPreferences
  
  // Recently viewed items
  recentlyViewed: {
    patients: string[]
    providers: string[]
    appointments: string[]
  }
  
  // Dashboard customization
  dashboardLayout: DashboardWidget[]
  
  // Saved filters
  savedFilters: {
    [key: string]: Record<string, any>
  }
  
  // Quick actions history
  quickActions: string[]
  
  // Actions
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  addRecentlyViewed: (type: 'patients' | 'providers' | 'appointments', id: string) => void
  clearRecentlyViewed: (type?: 'patients' | 'providers' | 'appointments') => void
  updateDashboardLayout: (layout: DashboardWidget[]) => void
  saveDashboardWidget: (widget: DashboardWidget) => void
  removeDashboardWidget: (widgetId: string) => void
  saveFilter: (filterName: string, filter: Record<string, any>) => void
  removeFilter: (filterName: string) => void
  addQuickAction: (action: string) => void
  clearQuickActions: () => void
  resetUserData: () => void
}

interface UserPreferences {
  // Display preferences
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  timeFormat: '12h' | '24h'
  timezone: string
  language: string
  
  // Table preferences
  defaultPageSize: number
  compactMode: boolean
  
  // Notification preferences
  emailNotifications: boolean
  pushNotifications: boolean
  appointmentReminders: boolean
  newPatientAlerts: boolean
  waitlistUpdates: boolean
  
  // Calendar preferences
  defaultCalendarView: 'day' | 'week' | 'month'
  workingHours: {
    start: string
    end: string
  }
  showWeekends: boolean
  
  // Privacy preferences
  showFullPatientNames: boolean
  enableAnalytics: boolean
  
  // Accessibility
  fontSize: 'small' | 'medium' | 'large'
  highContrast: boolean
  reduceMotion: boolean
}

interface DashboardWidget {
  id: string
  type: 'appointments' | 'patients' | 'analytics' | 'waitlist' | 'notifications'
  title: string
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  config: Record<string, any>
  visible: boolean
}

const defaultPreferences: UserPreferences = {
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  language: 'en',
  defaultPageSize: 25,
  compactMode: false,
  emailNotifications: true,
  pushNotifications: true,
  appointmentReminders: true,
  newPatientAlerts: true,
  waitlistUpdates: true,
  defaultCalendarView: 'week',
  workingHours: {
    start: '09:00',
    end: '17:00'
  },
  showWeekends: false,
  showFullPatientNames: true,
  enableAnalytics: true,
  fontSize: 'medium',
  highContrast: false,
  reduceMotion: false
}

const defaultDashboardLayout: DashboardWidget[] = [
  {
    id: 'upcoming-appointments',
    type: 'appointments',
    title: 'Upcoming Appointments',
    position: { x: 0, y: 0, width: 6, height: 4 },
    config: { limit: 5, showToday: true },
    visible: true
  },
  {
    id: 'recent-patients',
    type: 'patients',
    title: 'Recent Patients',
    position: { x: 6, y: 0, width: 6, height: 4 },
    config: { limit: 5 },
    visible: true
  },
  {
    id: 'waitlist-summary',
    type: 'waitlist',
    title: 'Waitlist Summary',
    position: { x: 0, y: 4, width: 4, height: 3 },
    config: { showPriority: true },
    visible: true
  },
  {
    id: 'daily-analytics',
    type: 'analytics',
    title: 'Daily Analytics',
    position: { x: 4, y: 4, width: 8, height: 3 },
    config: { period: 'today' },
    visible: true
  }
]

/**
 * User Store
 * Manages user-specific preferences and settings with persistence
 */
export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        preferences: defaultPreferences,
        recentlyViewed: {
          patients: [],
          providers: [],
          appointments: []
        },
        dashboardLayout: defaultDashboardLayout,
        savedFilters: {},
        quickActions: [],

        // Preferences actions
        updatePreferences: (newPreferences) =>
          set(
            (state) => ({
              preferences: {
                ...state.preferences,
                ...newPreferences
              }
            }),
            false,
            'updatePreferences'
          ),

        // Recently viewed actions
        addRecentlyViewed: (type, id) =>
          set(
            (state) => {
              const currentList = state.recentlyViewed[type]
              const filtered = currentList.filter(item => item !== id)
              const updated = [id, ...filtered].slice(0, 10) // Keep last 10 items

              return {
                recentlyViewed: {
                  ...state.recentlyViewed,
                  [type]: updated
                }
              }
            },
            false,
            'addRecentlyViewed'
          ),

        clearRecentlyViewed: (type) =>
          set(
            (state) => {
              if (type) {
                return {
                  recentlyViewed: {
                    ...state.recentlyViewed,
                    [type]: []
                  }
                }
              } else {
                return {
                  recentlyViewed: {
                    patients: [],
                    providers: [],
                    appointments: []
                  }
                }
              }
            },
            false,
            'clearRecentlyViewed'
          ),

        // Dashboard layout actions
        updateDashboardLayout: (layout) =>
          set({ dashboardLayout: layout }, false, 'updateDashboardLayout'),

        saveDashboardWidget: (widget) =>
          set(
            (state) => {
              const existingIndex = state.dashboardLayout.findIndex(w => w.id === widget.id)
              
              if (existingIndex >= 0) {
                const updated = [...state.dashboardLayout]
                updated[existingIndex] = widget
                return { dashboardLayout: updated }
              } else {
                return { dashboardLayout: [...state.dashboardLayout, widget] }
              }
            },
            false,
            'saveDashboardWidget'
          ),

        removeDashboardWidget: (widgetId) =>
          set(
            (state) => ({
              dashboardLayout: state.dashboardLayout.filter(w => w.id !== widgetId)
            }),
            false,
            'removeDashboardWidget'
          ),

        // Saved filters actions
        saveFilter: (filterName, filter) =>
          set(
            (state) => ({
              savedFilters: {
                ...state.savedFilters,
                [filterName]: filter
              }
            }),
            false,
            'saveFilter'
          ),

        removeFilter: (filterName) =>
          set(
            (state) => {
              const filters = { ...state.savedFilters }
              delete filters[filterName]
              return { savedFilters: filters }
            },
            false,
            'removeFilter'
          ),

        // Quick actions
        addQuickAction: (action) =>
          set(
            (state) => {
              const filtered = state.quickActions.filter(a => a !== action)
              const updated = [action, ...filtered].slice(0, 5) // Keep last 5 actions
              return { quickActions: updated }
            },
            false,
            'addQuickAction'
          ),

        clearQuickActions: () =>
          set({ quickActions: [] }, false, 'clearQuickActions'),

        // Reset user data
        resetUserData: () =>
          set(
            {
              preferences: defaultPreferences,
              recentlyViewed: {
                patients: [],
                providers: [],
                appointments: []
              },
              dashboardLayout: defaultDashboardLayout,
              savedFilters: {},
              quickActions: []
            },
            false,
            'resetUserData'
          )
      }),
      {
        name: 'user-store',
        // Only persist specific parts of the state
        partialize: (state) => ({
          preferences: state.preferences,
          recentlyViewed: state.recentlyViewed,
          dashboardLayout: state.dashboardLayout,
          savedFilters: state.savedFilters
          // Don't persist quickActions as they should be session-based
        })
      }
    ),
    {
      name: 'User Store'
    }
  )
)

// Selector hooks for specific parts of user state
export const useUserPreferences = () => useUserStore((state) => ({
  preferences: state.preferences,
  updatePreferences: state.updatePreferences
}))

export const useRecentlyViewed = (type?: 'patients' | 'providers' | 'appointments') => {
  if (type) {
    return useUserStore((state) => ({
      items: state.recentlyViewed[type],
      addItem: (id: string) => state.addRecentlyViewed(type, id),
      clearItems: () => state.clearRecentlyViewed(type)
    }))
  }
  
  return useUserStore((state) => ({
    recentlyViewed: state.recentlyViewed,
    addRecentlyViewed: state.addRecentlyViewed,
    clearRecentlyViewed: state.clearRecentlyViewed
  }))
}

export const useDashboardLayout = () => useUserStore((state) => ({
  layout: state.dashboardLayout,
  updateLayout: state.updateDashboardLayout,
  saveWidget: state.saveDashboardWidget,
  removeWidget: state.removeDashboardWidget
}))

export const useSavedFilters = () => useUserStore((state) => ({
  filters: state.savedFilters,
  saveFilter: state.saveFilter,
  removeFilter: state.removeFilter
}))

export const useQuickActions = () => useUserStore((state) => ({
  actions: state.quickActions,
  addAction: state.addQuickAction,
  clearActions: state.clearQuickActions
}))