import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { CardProps, CardHeaderProps, CardContentProps, CardFooterProps } from './types'

/**
 * Card component with multiple variants and customization options
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  className,
  variant = 'elevated',
  padding = 'md',
  hoverable = false,
  clickable = false,
  header,
  footer,
  loading = false,
  onClick,
  ...props
}, ref) => {
  // Base styles
  const baseClasses = cn(
    'rounded-lg',
    'transition-all duration-200',
    'relative overflow-hidden',
    clickable && 'cursor-pointer',
    hoverable && 'hover:shadow-lg hover:-translate-y-0.5'
  )

  // Variant styles
  const variantClasses = {
    elevated: cn(
      'bg-white shadow-md',
      'border border-gray-200/50'
    ),
    outlined: cn(
      'bg-white',
      'border border-gray-300'
    ),
    filled: cn(
      'bg-gray-50',
      'border border-gray-200'
    ),
    ghost: cn(
      'bg-transparent',
      'border-0'
    )
  }

  // Padding styles
  const paddingClasses = {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  }

  const paddingClass = typeof padding === 'boolean' 
    ? (padding ? paddingClasses.md : '')
    : paddingClasses[padding] || ''

  return (
    <div
      ref={ref}
      className={cn(
        baseClasses,
        variantClasses[variant],
        !header && !footer && paddingClass,
        className
      )}
      onClick={clickable ? onClick : undefined}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {header && (
        <div className={cn('border-b border-gray-200', paddingClass, 'pb-3 mb-3')}>
          {header}
        </div>
      )}
      
      <div className={cn(header || footer ? paddingClass : '')}>
        {children}
      </div>
      
      {footer && (
        <div className={cn('border-t border-gray-200', paddingClass, 'pt-3 mt-3')}>
          {footer}
        </div>
      )}
    </div>
  )
})

Card.displayName = 'Card'

/**
 * Card Header component
 */
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(({
  children,
  className,
  actions,
  subtitle,
  avatar,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-between', className)}
    {...props}
  >
    <div className="flex items-center space-x-3">
      {avatar && (
        <div className="flex-shrink-0">
          {avatar}
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          {children}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {actions && (
      <div className="flex items-center space-x-2">
        {actions}
      </div>
    )}
  </div>
))

CardHeader.displayName = 'CardHeader'

/**
 * Card Content component
 */
export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(({
  children,
  className,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn('text-gray-700', className)}
    {...props}
  >
    {children}
  </div>
))

CardContent.displayName = 'CardContent'

/**
 * Card Footer component
 */
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(({
  children,
  className,
  divided = false,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-between',
      divided && 'border-t border-gray-200 pt-3',
      className
    )}
    {...props}
  >
    {children}
  </div>
))

CardFooter.displayName = 'CardFooter'