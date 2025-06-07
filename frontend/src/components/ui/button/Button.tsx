import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import type { ButtonProps } from './types'

/**
 * Button component with multiple variants and sizes
 * Supports loading states, icons, and full width mode
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  iconOnly = false,
  ariaLabel,
  type = 'button',
  ...props
}, ref) => {
  // Base styles
  const baseClasses = cn(
    'inline-flex items-center justify-center',
    'rounded-lg font-medium',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'relative overflow-hidden',
    fullWidth && 'w-full'
  )

  // Variant styles
  const variantClasses = {
    primary: cn(
      'bg-blue-600 text-white',
      'hover:bg-blue-700',
      'focus:ring-blue-500',
      'disabled:bg-blue-300 disabled:text-white/80'
    ),
    secondary: cn(
      'bg-gray-100 text-gray-900',
      'hover:bg-gray-200',
      'focus:ring-gray-500',
      'disabled:bg-gray-50 disabled:text-gray-400'
    ),
    success: cn(
      'bg-green-600 text-white',
      'hover:bg-green-700',
      'focus:ring-green-500',
      'disabled:bg-green-300 disabled:text-white/80'
    ),
    danger: cn(
      'bg-red-600 text-white',
      'hover:bg-red-700',
      'focus:ring-red-500',
      'disabled:bg-red-300 disabled:text-white/80'
    ),
    warning: cn(
      'bg-amber-600 text-white',
      'hover:bg-amber-700',
      'focus:ring-amber-500',
      'disabled:bg-amber-300 disabled:text-white/80'
    ),
    info: cn(
      'bg-blue-500 text-white',
      'hover:bg-blue-600',
      'focus:ring-blue-400',
      'disabled:bg-blue-300 disabled:text-white/80'
    ),
    outline: cn(
      'border border-gray-300 bg-white text-gray-700',
      'hover:bg-gray-50 hover:border-gray-400',
      'focus:ring-blue-500',
      'disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200'
    ),
    ghost: cn(
      'bg-transparent text-gray-700',
      'hover:bg-gray-100',
      'focus:ring-gray-500',
      'disabled:text-gray-400'
    ),
    link: cn(
      'bg-transparent text-blue-600 underline-offset-4',
      'hover:underline hover:text-blue-700',
      'focus:ring-blue-500',
      'disabled:text-blue-400'
    )
  }

  // Size styles
  const sizeClasses = {
    xs: cn(
      iconOnly ? 'p-1' : 'px-2.5 py-1',
      'text-xs',
      'focus:ring-offset-1'
    ),
    sm: cn(
      iconOnly ? 'p-1.5' : 'px-3 py-1.5',
      'text-sm',
      'focus:ring-offset-1'
    ),
    md: cn(
      iconOnly ? 'p-2' : 'px-4 py-2',
      'text-sm',
      'focus:ring-offset-2'
    ),
    lg: cn(
      iconOnly ? 'p-3' : 'px-6 py-3',
      'text-base',
      'focus:ring-offset-2'
    ),
    xl: cn(
      iconOnly ? 'p-4' : 'px-8 py-4',
      'text-lg',
      'focus:ring-offset-2'
    )
  }

  // Icon size mapping
  const iconSizeMap = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  }

  const iconSize = iconSizeMap[size]


  // Render loading spinner
  const renderLoadingIcon = () => (
    <Loader2 className={cn(iconSize, 'animate-spin', iconOnly ? '' : 'mr-2')} />
  )

  // Render left icon
  const renderLeftIcon = () => {
    if (loading) return renderLoadingIcon()
    if (!icon) return null
    return <span className={cn(iconSize, iconOnly ? '' : 'mr-2')}>{icon}</span>
  }

  // Render right icon
  const renderRightIcon = () => {
    if (!iconRight || loading) return null
    return <span className={cn(iconSize, iconOnly ? '' : 'ml-2')}>{iconRight}</span>
  }

  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      aria-label={ariaLabel || (iconOnly ? String(children) : undefined)}
      aria-busy={loading}
      {...props}
    >
      {renderLeftIcon()}
      {!iconOnly && <span className="relative z-10">{children}</span>}
      {renderRightIcon()}
    </button>
  )
})

Button.displayName = 'Button'