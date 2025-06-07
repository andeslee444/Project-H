import { InputHTMLAttributes, ReactNode } from 'react'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visual variant of the input */
  variant?: 'default' | 'error' | 'success'
  
  /** Size of the input */
  size?: 'sm' | 'md' | 'lg'
  
  /** Error state */
  error?: boolean
  
  /** Error message to display */
  errorMessage?: string
  
  /** Label for the input */
  label?: string
  
  /** Helper text displayed below the input */
  helperText?: string
  
  /** Icon to display on the left side */
  leftIcon?: ReactNode
  
  /** Icon to display on the right side */
  rightIcon?: ReactNode
  
  /** Additional CSS classes */
  className?: string
}