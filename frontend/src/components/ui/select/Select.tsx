import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import type { SelectProps } from './types'

/**
 * Select component with multiple variants and states
 * Supports validation states and accessibility features
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  className,
  variant = 'default',
  size = 'md',
  error = false,
  errorMessage,
  label,
  helperText,
  required = false,
  disabled = false,
  placeholder,
  options = [],
  id,
  children,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`

  // Base styles
  const baseClasses = cn(
    'flex h-10 w-full appearance-none rounded-md border border-input bg-background',
    'px-3 py-2 text-sm ring-offset-background cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
  )

  // Variant styles
  const variantClasses = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-500 focus:border-green-500 focus:ring-green-500'
  }

  // Size styles
  const sizeClasses = {
    sm: 'h-8 px-2 text-xs',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base'
  }

  const selectClasses = cn(
    baseClasses,
    variantClasses[error ? 'error' : variant],
    sizeClasses[size],
    'pr-10', // Space for chevron icon
    className
  )

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={selectId}
          className={cn(
            'block text-sm font-medium text-gray-700 mb-1',
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={selectClasses}
          disabled={disabled}
          required={required}
          aria-invalid={error}
          aria-describedby={
            errorMessage ? `${selectId}-error` : 
            helperText ? `${selectId}-helper` : undefined
          }
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
          
          {children}
        </select>
        
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {errorMessage && (
        <p id={`${selectId}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      )}
      
      {helperText && !errorMessage && (
        <p id={`${selectId}-helper`} className="mt-1 text-sm text-gray-600">
          {helperText}
        </p>
      )}
    </div>
  )
})

Select.displayName = 'Select'