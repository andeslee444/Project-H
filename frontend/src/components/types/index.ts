/**
 * Shared component types and interfaces
 */

import type { ReactNode, CSSProperties } from 'react'

/**
 * Common component props
 */
export interface BaseComponentProps {
  className?: string
  style?: CSSProperties
  children?: ReactNode
  testId?: string
}

/**
 * Component size variants
 */
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Component color variants
 */
export type ComponentVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'info' 
  | 'light' 
  | 'dark'

/**
 * Component state
 */
export type ComponentState = 'default' | 'hover' | 'active' | 'disabled' | 'loading'

/**
 * Form field props
 */
export interface FormFieldProps {
  id?: string
  name: string
  label?: string
  placeholder?: string
  helpText?: string
  error?: string | string[]
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
}

/**
 * Icon props
 */
export interface IconProps extends BaseComponentProps {
  size?: number | ComponentSize
  color?: string
  strokeWidth?: number
}

/**
 * Common callback types
 */
export type VoidCallback = () => void
export type ValueCallback<T> = (value: T) => void
export type AsyncCallback = () => Promise<void>
export type AsyncValueCallback<T> = (value: T) => Promise<void>

/**
 * Layout props
 */
export interface LayoutProps extends BaseComponentProps {
  header?: ReactNode
  sidebar?: ReactNode
  footer?: ReactNode
  fullWidth?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: boolean | ComponentSize
}

/**
 * Modal/Dialog props
 */
export interface ModalProps extends BaseComponentProps {
  open: boolean
  onClose: VoidCallback
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
}

/**
 * Table props
 */
export interface TableColumn<T = any> {
  key: string
  header: string
  accessor: string | ((row: T) => any)
  sortable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: T, index: number) => ReactNode
}

export interface TableProps<T = any> extends BaseComponentProps {
  data: T[]
  columns: TableColumn<T>[]
  onRowClick?: (row: T, index: number) => void
  rowKey?: string | ((row: T, index: number) => string | number)
  loading?: boolean
  emptyMessage?: string
  sortable?: boolean
  selectable?: boolean
  onSelectionChange?: (selectedRows: T[]) => void
}

/**
 * Pagination props
 */
export interface PaginationProps extends BaseComponentProps {
  currentPage: number
  totalPages: number
  totalItems?: number
  itemsPerPage?: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  showPrevNext?: boolean
  maxVisiblePages?: number
}

/**
 * Navigation props
 */
export interface NavItem {
  id: string
  label: string
  href?: string
  icon?: ReactNode
  badge?: string | number
  children?: NavItem[]
  disabled?: boolean
}

export interface NavigationProps extends BaseComponentProps {
  items: NavItem[]
  activeId?: string
  onItemClick?: (item: NavItem) => void
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'pills' | 'underline'
}

/**
 * Card props
 */
export interface CardProps extends BaseComponentProps {
  variant?: 'elevated' | 'outlined' | 'filled'
  padding?: boolean | ComponentSize
  hoverable?: boolean
  clickable?: boolean
  onClick?: VoidCallback
}

/**
 * Alert/Notification props
 */
export interface AlertProps extends BaseComponentProps {
  type: 'success' | 'info' | 'warning' | 'error'
  title?: string
  message: string
  closable?: boolean
  onClose?: VoidCallback
  icon?: ReactNode
  action?: {
    label: string
    onClick: VoidCallback
  }
}

/**
 * Loading state props
 */
export interface LoadingProps extends BaseComponentProps {
  size?: ComponentSize
  text?: string
  overlay?: boolean
  fullScreen?: boolean
}

/**
 * Empty state props
 */
export interface EmptyStateProps extends BaseComponentProps {
  title?: string
  description?: string
  icon?: ReactNode
  action?: {
    label: string
    onClick: VoidCallback
  }
}

/**
 * Date/Time related props
 */
export interface DatePickerProps extends FormFieldProps, BaseComponentProps {
  value?: Date | string
  onChange: ValueCallback<Date | null>
  minDate?: Date
  maxDate?: Date
  format?: string
  showTime?: boolean
  disabledDates?: (date: Date) => boolean
}

export interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  available: boolean
  reason?: string
}

/**
 * Appointment specific types
 */
export interface AppointmentType {
  id: string
  patientId: string
  providerId: string
  startTime: Date
  endTime: Date
  type: 'initial_consultation' | 'follow_up' | 'therapy_session' | 'evaluation' | 'group_session'
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  modality: 'in_person' | 'telehealth' | 'phone'
  notes?: string
}

/**
 * User role types
 */
export type UserRole = 'patient' | 'provider' | 'admin' | 'staff'

/**
 * Theme types
 */
export interface Theme {
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    danger: string
    info: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  typography: {
    fontFamily: string
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
    }
    fontWeight: {
      normal: number
      medium: number
      semibold: number
      bold: number
    }
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
    full: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
  }
}