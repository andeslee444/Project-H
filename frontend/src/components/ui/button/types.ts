import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { BaseComponentProps, ComponentSize } from '@/components/types'

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'danger' 
  | 'warning'
  | 'info'
  | 'outline' 
  | 'ghost'
  | 'link'

export type ButtonSize = ComponentSize

export interface ButtonProps extends 
  BaseComponentProps,
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style' | 'children'> {
  /**
   * Button content
   */
  children: ReactNode
  
  /**
   * Visual style variant
   * @default 'primary'
   */
  variant?: ButtonVariant
  
  /**
   * Button size
   * @default 'md'
   */
  size?: ButtonSize
  
  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean
  
  /**
   * Whether the button is in a loading state
   * @default false
   */
  loading?: boolean
  
  /**
   * Icon to display before the button text
   */
  icon?: ReactNode
  
  /**
   * Icon to display after the button text
   */
  iconRight?: ReactNode
  
  /**
   * Whether the button should take full width of its container
   * @default false
   */
  fullWidth?: boolean
  
  /**
   * Whether to show only icon (compact mode)
   * @default false
   */
  iconOnly?: boolean
  
  /**
   * Accessible label for icon-only buttons
   */
  ariaLabel?: string
}