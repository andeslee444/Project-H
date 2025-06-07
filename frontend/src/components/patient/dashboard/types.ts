import type { ReactNode } from 'react'

export interface QuickAction {
  id: string
  title: string
  subtitle: string
  icon: ReactNode
  color: string
  action: () => void
  disabled?: boolean
}

export interface UpcomingAppointment {
  id: string
  providerId: string
  providerName: string
  providerSpecialty: string
  date: string
  time: string
  type: 'video' | 'phone' | 'in_person'
  duration: number // in minutes
  status: 'scheduled' | 'confirmed' | 'cancelled'
  location?: string
}

export interface WellnessStat {
  id: string
  label: string
  value: string | number
  unit?: string
  trend?: string
  trendDirection?: 'up' | 'down' | 'neutral'
  color?: string
  description?: string
}

export interface PatientUser {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  preferences: {
    theme: 'light' | 'dark'
    notifications: boolean
    language: string
  }
}

export interface DashboardProps {
  className?: string
}

export interface DashboardSectionProps {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
  loading?: boolean
}