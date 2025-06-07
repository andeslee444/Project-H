import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { InputProps } from './types'

/**
 * Input component with multiple variants and states
 * Supports icons, validation states, and accessibility features
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  variant = 'default',
  size = 'md',
  error = false,
  errorMessage,
  label,
  helperText,
  leftIcon,
  rightIcon,
  required = false,
  disabled = false,
  placeholder,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

  // Base styles
  const baseClasses = cn(
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2',
    'text-sm ring-offset-background file:border-0 file:bg-transparent',
    'file:text-sm file:font-medium placeholder:text-muted-foreground',
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

  const inputClasses = cn(
    baseClasses,
    variantClasses[error ? 'error' : variant],
    sizeClasses[size],
    leftIcon && 'pl-10',
    rightIcon && 'pr-10',
    className
  )

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId}
          className={cn(
            'block text-sm font-medium text-gray-700 mb-1',
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          aria-invalid={error}
          aria-describedby={
            errorMessage ? `${inputId}-error` : 
            helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>

      {errorMessage && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      )}
      
      {helperText && !errorMessage && (
        <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-600">
          {helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'