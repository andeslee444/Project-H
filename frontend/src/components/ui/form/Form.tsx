import React, { createContext, useContext, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { FormProps, FormFieldProps, FormItemProps, FormLabelProps, FormControlProps, FormMessageProps } from './types'

// Form context for passing form state
const FormContext = createContext<{ disabled?: boolean }>({})

/**
 * Form component that provides context for form fields
 */
export const Form = forwardRef<HTMLFormElement, FormProps>(({
  children,
  className,
  disabled = false,
  onSubmit,
  ...props
}, ref) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (disabled) {
      event.preventDefault()
      return
    }
    onSubmit?.(event)
  }

  return (
    <FormContext.Provider value={{ disabled }}>
      <form
        ref={ref}
        className={cn('space-y-6', className)}
        onSubmit={handleSubmit}
        {...props}
      >
        {children}
      </form>
    </FormContext.Provider>
  )
})

/**
 * Form field wrapper that provides spacing and structure
 */
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('space-y-2', className)}
      {...props}
    >
      {children}
    </div>
  )
})

/**
 * Form item container for grouping label, control, and message
 */
export const FormItem = forwardRef<HTMLDivElement, FormItemProps>(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('space-y-2', className)}
      {...props}
    >
      {children}
    </div>
  )
})

/**
 * Form label component with required indicator support
 */
export const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(({
  children,
  className,
  required = false,
  htmlFor,
  ...props
}, ref) => {
  return (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={cn(
        'block text-sm font-medium text-gray-700',
        required && "after:content-['*'] after:ml-0.5 after:text-red-500",
        className
      )}
      {...props}
    >
      {children}
    </label>
  )
})

/**
 * Form control wrapper that inherits form context
 */
export const FormControl = forwardRef<HTMLDivElement, FormControlProps>(({
  children,
  className,
  ...props
}, ref) => {
  const { disabled: formDisabled } = useContext(FormContext)
  
  return (
    <div
      ref={ref}
      className={cn('relative', className)}
      {...props}
    >
      {React.isValidElement(children) 
        ? React.cloneElement(children as React.ReactElement<any>, { 
            disabled: (children.props as any)?.disabled ?? formDisabled,
            ...(children.props as any)
          })
        : children
      }
    </div>
  )
})

/**
 * Form message component for displaying validation messages
 */
export const FormMessage = forwardRef<HTMLParagraphElement, FormMessageProps>(({
  children,
  className,
  variant = 'error',
  ...props
}, ref) => {
  if (!children) return null

  const variantClasses = {
    error: 'text-red-600',
    success: 'text-green-600',
    warning: 'text-amber-600',
    info: 'text-blue-600',
    default: 'text-gray-600'
  }

  return (
    <p
      ref={ref}
      className={cn(
        'text-sm',
        variantClasses[variant],
        className
      )}
      role={variant === 'error' ? 'alert' : undefined}
      {...props}
    >
      {children}
    </p>
  )
})

/**
 * Form description component for helper text
 */
export const FormDescription = forwardRef<HTMLParagraphElement, FormMessageProps>(({
  children,
  className,
  ...props
}, ref) => {
  if (!children) return null

  return (
    <p
      ref={ref}
      className={cn('text-sm text-gray-600', className)}
      {...props}
    >
      {children}
    </p>
  )
})

// Set display names
Form.displayName = 'Form'
FormField.displayName = 'FormField'
FormItem.displayName = 'FormItem'
FormLabel.displayName = 'FormLabel'
FormControl.displayName = 'FormControl'
FormMessage.displayName = 'FormMessage'
FormDescription.displayName = 'FormDescription'