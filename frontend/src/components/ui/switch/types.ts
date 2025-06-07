export interface SwitchProps {
  /**
   * Whether the switch is checked
   */
  checked?: boolean;
  
  /**
   * Callback when the switch state changes
   */
  onCheckedChange?: (checked: boolean) => void;
  
  /**
   * Whether the switch is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Whether the switch is required
   * @default false
   */
  required?: boolean;
  
  /**
   * Name attribute for form submission
   */
  name?: string;
  
  /**
   * Value attribute for form submission
   */
  value?: string;
  
  /**
   * Size of the switch
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Whether the switch is in an error state
   * @default false
   */
  error?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Accessible label for the switch
   */
  'aria-label'?: string;
  
  /**
   * ID of the element that describes the switch
   */
  'aria-describedby'?: string;
  
  /**
   * ID of the element that labels the switch
   */
  'aria-labelledby'?: string;
}