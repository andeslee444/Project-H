import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { RadioProps, RadioGroupProps } from './types'

/**
 * Radio button component with accessibility support
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(({
  className,
  size = 'md',
  error = false,
  label,
  description,
  required = false,
  disabled = false,
  id,
  ...props
}, ref) => {
  const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`

  // Size styles
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const radioClasses = cn(
    'relative flex items-center justify-center',
    'border border-gray-300 rounded-full bg-white',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    'transition-all duration-200 cursor-pointer',
    'checked:bg-blue-600 checked:border-blue-600',
    'disabled:cursor-not-allowed disabled:opacity-50',
    error && 'border-red-500 focus:ring-red-500',
    sizeClasses[size],
    className
  )

  return (
    <div className="flex items-start space-x-3">
      <div className="relative flex items-center">
        <input
          ref={ref}
          type="radio"
          id={radioId}
          className="sr-only"
          disabled={disabled}
          required={required}
          aria-describedby={description ? `${radioId}-description` : undefined}
          {...props}
        />
        
        <div
          className={radioClasses}
          role="radio"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault()
              const input = e.currentTarget.previousElementSibling as HTMLInputElement
              input?.click()
            }
          }}
        >
          <div className={cn(
            'rounded-full bg-white transition-all duration-200',
            size === 'sm' && 'w-2 h-2',
            size === 'md' && 'w-2.5 h-2.5', 
            size === 'lg' && 'w-3 h-3',
            'scale-0 peer-checked:scale-100'
          )} />
        </div>
      </div>

      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label
              htmlFor={radioId}
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
              id={`${radioId}-description`}
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

/**
 * Radio group component for grouping related radio options
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(({
  children,
  className,
  label,
  description,
  error = false,
  errorMessage,
  required = false,
  orientation = 'vertical',
  size = 'md',
  ...props
}, ref) => {
  const groupId = `radio-group-${Math.random().toString(36).substr(2, 9)}`

  const groupClasses = cn(
    'space-y-2',
    orientation === 'horizontal' && 'flex space-x-4 space-y-0',
    className
  )

  return (
    <div ref={ref} {...props}>
      {label && (
        <label
          className={cn(
            'block text-sm font-medium text-gray-700 mb-2',
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}
        >
          {label}
        </label>
      )}

      {description && (
        <p className="text-sm text-gray-600 mb-2">
          {description}
        </p>
      )}

      <div
        className={groupClasses}
        role="radiogroup"
        aria-labelledby={label ? `${groupId}-label` : undefined}
        aria-describedby={description ? `${groupId}-description` : undefined}
        aria-invalid={error}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === Radio) {
            return React.cloneElement(child as React.ReactElement<any>, {
              size,
              error,
              ...(child.props as any)
            })
          }
          return child
        })}
      </div>

      {errorMessage && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  )
})

Radio.displayName = 'Radio'
RadioGroup.displayName = 'RadioGroup'