import { FormHTMLAttributes, LabelHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  /** Whether the entire form is disabled */
  disabled?: boolean
  
  /** Additional CSS classes */
  className?: string
  
  /** Form content */
  children?: ReactNode
}

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  /** Field content */
  children?: ReactNode
  
  /** Additional CSS classes */
  className?: string
}

export interface FormItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Item content */
  children?: ReactNode
  
  /** Additional CSS classes */
  className?: string
}

export interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Whether the field is required (adds asterisk) */
  required?: boolean
  
  /** Label content */
  children?: ReactNode
  
  /** Additional CSS classes */
  className?: string
}

export interface FormControlProps extends HTMLAttributes<HTMLDivElement> {
  /** Control content (input, select, etc.) */
  children?: ReactNode
  
  /** Additional CSS classes */
  className?: string
}

export interface FormMessageProps extends HTMLAttributes<HTMLParagraphElement> {
  /** Message variant */
  variant?: 'error' | 'success' | 'warning' | 'info' | 'default'
  
  /** Message content */
  children?: ReactNode
  
  /** Additional CSS classes */
  className?: string
}