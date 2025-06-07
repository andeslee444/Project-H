import { LabelHTMLAttributes, ReactNode } from 'react'

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Whether the field is required (adds asterisk) */
  required?: boolean
  
  /** Size of the label */
  size?: 'sm' | 'md' | 'lg'
  
  /** Visual variant of the label */
  variant?: 'default' | 'muted' | 'error' | 'success'
  
  /** Label content */
  children?: ReactNode
  
  /** Additional CSS classes */
  className?: string
}