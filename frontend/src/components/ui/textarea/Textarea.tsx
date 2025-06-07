import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { TextareaProps } from './types'

/**
 * Textarea component with multiple variants and states
 * Supports validation states, character counting, and accessibility features
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
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
  maxLength,
  showCharacterCount = false,
  rows = 4,
  resize = 'vertical',
  id,
  value,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
  const currentLength = typeof value === 'string' ? value.length : 0

  // Base styles
  const baseClasses = cn(
    'flex min-h-[80px] w-full rounded-md border border-input bg-background',
    'px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground',
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
    sm: 'px-2 py-1 text-xs min-h-[60px]',
    md: 'px-3 py-2 text-sm min-h-[80px]',
    lg: 'px-4 py-3 text-base min-h-[100px]'
  }

  // Resize styles
  const resizeClasses = {
    none: 'resize-none',
    horizontal: 'resize-x',
    vertical: 'resize-y',
    both: 'resize'
  }

  const textareaClasses = cn(
    baseClasses,
    variantClasses[error ? 'error' : variant],
    sizeClasses[size],
    resizeClasses[resize],
    className
  )

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={textareaId}
          className={cn(
            'block text-sm font-medium text-gray-700 mb-1',
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}
        >
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={textareaId}
        className={textareaClasses}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        value={value}
        aria-invalid={error}
        aria-describedby={
          errorMessage ? `${textareaId}-error` : 
          helperText ? `${textareaId}-helper` : undefined
        }
        {...props}
      />

      <div className="flex justify-between items-start mt-1">
        <div className="flex-1">
          {errorMessage && (
            <p id={`${textareaId}-error`} className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          )}
          
          {helperText && !errorMessage && (
            <p id={`${textareaId}-helper`} className="text-sm text-gray-600">
              {helperText}
            </p>
          )}
        </div>

        {(showCharacterCount || maxLength) && (
          <div className={cn(
            'text-xs ml-2 flex-shrink-0',
            maxLength && currentLength > maxLength * 0.9 
              ? 'text-red-600' 
              : 'text-gray-500'
          )}>
            {maxLength ? `${currentLength}/${maxLength}` : currentLength}
          </div>
        )}
      </div>
    </div>
  )
})

Textarea.displayName = 'Textarea'