import type { HTMLAttributes, ReactNode } from 'react'
import type { BaseComponentProps, ComponentSize } from '@/components/types'

export type CardVariant = 'elevated' | 'outlined' | 'filled' | 'ghost'

export interface CardProps extends 
  BaseComponentProps,
  Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style' | 'children'> {
  /**
   * Card content
   */
  children: ReactNode
  
  /**
   * Visual style variant
   * @default 'elevated'
   */
  variant?: CardVariant
  
  /**
   * Internal padding size
   * @default 'md'
   */
  padding?: boolean | ComponentSize
  
  /**
   * Whether the card is hoverable (shows hover effects)
   * @default false
   */
  hoverable?: boolean
  
  /**
   * Whether the card is clickable (shows pointer cursor)
   * @default false
   */
  clickable?: boolean
  
  /**
   * Header content
   */
  header?: ReactNode
  
  /**
   * Footer content
   */
  footer?: ReactNode
  
  /**
   * Whether to show loading state
   * @default false
   */
  loading?: boolean
}

export interface CardHeaderProps extends BaseComponentProps {
  children: ReactNode
  actions?: ReactNode
  subtitle?: string
  avatar?: ReactNode
}

export interface CardContentProps extends BaseComponentProps {
  children: ReactNode
}

export interface CardFooterProps extends BaseComponentProps {
  children: ReactNode
  divided?: boolean
}