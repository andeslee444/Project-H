import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Check, Minus } from 'lucide-react'
import type { CheckboxProps } from './types'

/**
 * Checkbox component with support for indeterminate state and accessibility
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  className,
  size = 'md',
  error = false,
  label,
  description,
  required = false,
  disabled = false,
  checked,
  indeterminate = false,
  id,
  ...props
}, ref) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`

  // Size styles
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  // Icon size mapping
  const iconSizeMap = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }

  const checkboxClasses = cn(
    'relative flex items-center justify-center',
    'border border-gray-300 rounded bg-white',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    'transition-all duration-200 cursor-pointer',
    'checked:bg-blue-600 checked:border-blue-600',
    'disabled:cursor-not-allowed disabled:opacity-50',
    error && 'border-red-500 focus:ring-red-500',
    sizeClasses[size],
    className
  )

  const iconSize = iconSizeMap[size]

  return (
    <div className="flex items-start space-x-3">
      <div className="relative flex items-center">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className="sr-only"
          checked={checked}
          disabled={disabled}
          required={required}
          aria-describedby={description ? `${checkboxId}-description` : undefined}
          {...props}
        />
        
        <div
          className={checkboxClasses}
          role="checkbox"
          aria-checked={indeterminate ? 'mixed' : checked}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault()
              const input = e.currentTarget.previousElementSibling as HTMLInputElement
              input?.click()
            }
          }}
        >
          {checked && !indeterminate && (
            <Check className={cn(iconSize, 'text-white')} strokeWidth={3} />
          )}
          {indeterminate && (
            <Minus className={cn(iconSize, 'text-white')} strokeWidth={3} />
          )}
        </div>
      </div>

      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label
              htmlFor={checkboxId}
              className={cn(
                'block text-sm font-medium text-gray-700 cursor-pointer',
                required && "after:content-['*'] after:ml-0.5 after:text-red-500",
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              {label}
            </label>
          )}
          
          {description && (
            <p
              id={`${checkboxId}-description`}
              className={cn(
                'mt-1 text-sm text-gray-600',
                disabled && 'opacity-50'
              )}
            >
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  )
})

Checkbox.displayName = 'Checkbox'