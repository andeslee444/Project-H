import { TextareaHTMLAttributes } from 'react'

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /** Visual variant of the textarea */
  variant?: 'default' | 'error' | 'success'
  
  /** Size of the textarea */
  size?: 'sm' | 'md' | 'lg'
  
  /** Error state */
  error?: boolean
  
  /** Error message to display */
  errorMessage?: string
  
  /** Label for the textarea */
  label?: string
  
  /** Helper text displayed below the textarea */
  helperText?: string
  
  /** Show character count */
  showCharacterCount?: boolean
  
  /** Resize behavior */
  resize?: 'none' | 'horizontal' | 'vertical' | 'both'
  
  /** Additional CSS classes */
  className?: string
}