import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { LabelProps } from './types'

/**
 * Label component with support for required indicators and various styles
 */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(({
  children,
  className,
  required = false,
  size = 'md',
  variant = 'default',
  htmlFor,
  ...props
}, ref) => {
  // Base styles
  const baseClasses = 'block font-medium'

  // Size styles
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm', 
    lg: 'text-base'
  }

  // Variant styles
  const variantClasses = {
    default: 'text-gray-700',
    muted: 'text-gray-500',
    error: 'text-red-600',
    success: 'text-green-600'
  }

  return (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        required && "after:content-['*'] after:ml-0.5 after:text-red-500",
        className
      )}
      {...props}
    >
      {children}
    </label>
  )
})

Label.displayName = 'Label'