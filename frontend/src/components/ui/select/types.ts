import { SelectHTMLAttributes, ReactNode } from 'react'

export interface SelectOption {
  /** The value of the option */
  value: string
  
  /** The label to display for the option */
  label: string
  
  /** Whether the option is disabled */
  disabled?: boolean
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Visual variant of the select */
  variant?: 'default' | 'error' | 'success'
  
  /** Size of the select */
  size?: 'sm' | 'md' | 'lg'
  
  /** Error state */
  error?: boolean
  
  /** Error message to display */
  errorMessage?: string
  
  /** Label for the select */
  label?: string
  
  /** Helper text displayed below the select */
  helperText?: string
  
  /** Placeholder text */
  placeholder?: string
  
  /** Options to render */
  options?: SelectOption[]
  
  /** Additional CSS classes */
  className?: string
  
  /** Child option elements (alternative to options prop) */
  children?: ReactNode
}