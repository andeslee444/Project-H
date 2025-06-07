import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'

/**
 * UI State Interface
 * Manages global UI state like modals, sidebar, notifications, etc.
 */
interface UIState {
  // Sidebar state
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  
  // Modal state
  modals: {
    [key: string]: {
      open: boolean
      data?: any
    }
  }
  
  // Loading states
  loading: {
    [key: string]: boolean
  }
  
  // Notifications
  notifications: Notification[]
  
  // Theme
  theme: 'light' | 'dark' | 'system'
  
  // Mobile view detection
  isMobile: boolean
  
  // Actions
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  toggleSidebarCollapsed: () => void
  
  openModal: (modalId: string, data?: any) => void
  closeModal: (modalId: string) => void
  closeAllModals: () => void
  
  setLoading: (key: string, loading: boolean) => void
  clearAllLoading: () => void
  
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setIsMobile: (isMobile: boolean) => void
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number // Auto-dismiss after milliseconds
  persistent?: boolean // Don't auto-dismiss
  actions?: NotificationAction[]
  timestamp: Date
}

interface NotificationAction {
  label: string
  action: () => void
  variant?: 'primary' | 'secondary'
}

/**
 * UI Store
 * Centralized state management for UI-related state
 */
export const useUIStore = create<UIState>()(
  devtools(
    subscribeWithSelector(
      (set, get) => ({
        // Initial state
        sidebarOpen: true,
        sidebarCollapsed: false,
        modals: {},
        loading: {},
        notifications: [],
        theme: 'system',
        isMobile: false,

        // Sidebar actions
        setSidebarOpen: (open) => 
          set({ sidebarOpen: open }, false, 'setSidebarOpen'),

        setSidebarCollapsed: (collapsed) => 
          set({ sidebarCollapsed: collapsed }, false, 'setSidebarCollapsed'),

        toggleSidebar: () => 
          set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'toggleSidebar'),

        toggleSidebarCollapsed: () => 
          set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }), false, 'toggleSidebarCollapsed'),

        // Modal actions
        openModal: (modalId, data) =>
          set(
            (state) => ({
              modals: {
                ...state.modals,
                [modalId]: { open: true, data }
              }
            }),
            false,
            'openModal'
          ),

        closeModal: (modalId) =>
          set(
            (state) => ({
              modals: {
                ...state.modals,
                [modalId]: { ...state.modals[modalId], open: false }
              }
            }),
            false,
            'closeModal'
          ),

        closeAllModals: () =>
          set(
            (state) => {
              const modals = { ...state.modals }
              Object.keys(modals).forEach(key => {
                modals[key] = { ...modals[key], open: false }
              })
              return { modals }
            },
            false,
            'closeAllModals'
          ),

        // Loading actions
        setLoading: (key, loading) =>
          set(
            (state) => ({
              loading: {
                ...state.loading,
                [key]: loading
              }
            }),
            false,
            'setLoading'
          ),

        clearAllLoading: () =>
          set({ loading: {} }, false, 'clearAllLoading'),

        // Notification actions
        addNotification: (notification) =>
          set(
            (state) => {
              const newNotification: Notification = {
                ...notification,
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date()
              }

              return {
                notifications: [newNotification, ...state.notifications]
              }
            },
            false,
            'addNotification'
          ),

        removeNotification: (id) =>
          set(
            (state) => ({
              notifications: state.notifications.filter(n => n.id !== id)
            }),
            false,
            'removeNotification'
          ),

        clearNotifications: () =>
          set({ notifications: [] }, false, 'clearNotifications'),

        // Theme actions
        setTheme: (theme) =>
          set({ theme }, false, 'setTheme'),

        // Mobile actions
        setIsMobile: (isMobile) =>
          set({ isMobile }, false, 'setIsMobile')
      }),
    ),
    {
      name: 'UI Store'
    }
  )
)

// Selector hooks for specific parts of UI state
export const useSidebar = () => useUIStore((state) => ({
  sidebarOpen: state.sidebarOpen,
  sidebarCollapsed: state.sidebarCollapsed,
  setSidebarOpen: state.setSidebarOpen,
  setSidebarCollapsed: state.setSidebarCollapsed,
  toggleSidebar: state.toggleSidebar,
  toggleSidebarCollapsed: state.toggleSidebarCollapsed
}))

export const useModal = (modalId: string) => useUIStore((state) => ({
  isOpen: state.modals[modalId]?.open || false,
  data: state.modals[modalId]?.data,
  openModal: (data?: any) => state.openModal(modalId, data),
  closeModal: () => state.closeModal(modalId)
}))

export const useLoading = (key?: string) => {
  if (key) {
    return useUIStore((state) => ({
      isLoading: state.loading[key] || false,
      setLoading: (loading: boolean) => state.setLoading(key, loading)
    }))
  }
  
  return useUIStore((state) => ({
    loading: state.loading,
    setLoading: state.setLoading,
    clearAllLoading: state.clearAllLoading
  }))
}

export const useNotifications = () => useUIStore((state) => ({
  notifications: state.notifications,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications
}))

export const useTheme = () => useUIStore((state) => ({
  theme: state.theme,
  setTheme: state.setTheme
}))

// Auto-dismiss notifications
if (typeof window !== 'undefined') {
  useUIStore.subscribe(
    (state) => state.notifications,
    (notifications) => {
      notifications.forEach((notification) => {
        if (!notification.persistent && notification.duration) {
          setTimeout(() => {
            useUIStore.getState().removeNotification(notification.id)
          }, notification.duration)
        }
      })
    },
    {
      fireImmediately: false
    }
  )
}