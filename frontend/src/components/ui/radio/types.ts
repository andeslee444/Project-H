import { InputHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Size of the radio button */
  size?: 'sm' | 'md' | 'lg'
  
  /** Error state */
  error?: boolean
  
  /** Label for the radio button */
  label?: string
  
  /** Description text below the label */
  description?: string
  
  /** Additional CSS classes */
  className?: string
}

export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Group label */
  label?: string
  
  /** Group description */
  description?: string
  
  /** Error state */
  error?: boolean
  
  /** Error message to display */
  errorMessage?: string
  
  /** Whether the group is required */
  required?: boolean
  
  /** Layout orientation */
  orientation?: 'vertical' | 'horizontal'
  
  /** Size to apply to all radio buttons */
  size?: 'sm' | 'md' | 'lg'
  
  /** Radio button children */
  children?: ReactNode
  
  /** Additional CSS classes */
  className?: string
}