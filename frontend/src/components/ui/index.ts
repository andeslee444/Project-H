/**
 * UI Component Library
 * 
 * Centralized exports for all UI components
 * These components are framework-agnostic and can be used throughout the application
 */

// Button components
export { Button } from './button/Button'
export type { ButtonProps, ButtonVariant, ButtonSize } from './button/types'

// Card components
export { Card, CardHeader, CardContent, CardFooter } from './card/Card'
export type { 
  CardProps, 
  CardHeaderProps, 
  CardContentProps, 
  CardFooterProps,
  CardVariant 
} from './card/types'

// Input components
export { Input } from './input/Input'
export type { InputProps } from './input/types'

// Select components
export { Select } from './select/Select'
export type { SelectProps, SelectOption } from './select/types'

// Textarea components
export { Textarea } from './textarea/Textarea'
export type { TextareaProps } from './textarea/types'

// Form components
export { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage, 
  FormDescription 
} from './form/Form'
export type { 
  FormProps, 
  FormFieldProps, 
  FormItemProps, 
  FormLabelProps, 
  FormControlProps, 
  FormMessageProps 
} from './form/types'

// Label components
export { Label } from './label/Label'
export type { LabelProps } from './label/types'

// Checkbox components
export { Checkbox } from './checkbox/Checkbox'
export type { CheckboxProps } from './checkbox/types'

// Radio components
export { Radio, RadioGroup } from './radio/Radio'
export type { RadioProps, RadioGroupProps } from './radio/types'

// Re-export commonly used types
export type { 
  BaseComponentProps,
  ComponentSize,
  ComponentVariant,
  ComponentState
} from '../types'