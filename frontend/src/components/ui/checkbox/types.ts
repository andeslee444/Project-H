import { InputHTMLAttributes } from 'react'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Size of the checkbox */
  size?: 'sm' | 'md' | 'lg'
  
  /** Error state */
  error?: boolean
  
  /** Label for the checkbox */
  label?: string
  
  /** Description text below the label */
  description?: string
  
  /** Indeterminate state (partially checked) */
  indeterminate?: boolean
  
  /** Additional CSS classes */
  className?: string
}