import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { Search, User, Mail, Lock, Calendar, DollarSign, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const meta = {
  title: 'Design System/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible input component with support for labels, icons, validation states, and helper text.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      description: 'Visual style variant',
    },
    size: {
      control: 'select', 
      description: 'Input size',
    },
    error: {
      control: 'boolean',
      description: 'Show error state',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the input',
    },
    required: {
      control: 'boolean',
      description: 'Mark input as required',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic input
export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

// With label
export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'user@example.com',
    type: 'email',
  },
};

// Required field
export const Required: Story = {
  args: {
    label: 'Full Name',
    placeholder: 'John Doe',
    required: true,
  },
};

// With helper text
export const WithHelperText: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    helperText: 'Must be at least 8 characters long',
  },
};

// Error state
export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'user@example.com',
    error: true,
    errorMessage: 'Please enter a valid email address',
    defaultValue: 'invalid-email',
  },
};

// Success state
export const WithSuccess: Story = {
  args: {
    label: 'Username',
    placeholder: 'johndoe',
    variant: 'success',
    helperText: 'Username is available',
    defaultValue: 'johndoe123',
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'Cannot edit',
    disabled: true,
    defaultValue: 'Read only value',
  },
};

// Size variations
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Input size="sm" placeholder="Small input" />
      <Input size="md" placeholder="Medium input (default)" />
      <Input size="lg" placeholder="Large input" />
    </div>
  ),
};

// With left icon
export const WithLeftIcon: Story = {
  args: {
    placeholder: 'Search...',
    leftIcon: <Search className="w-4 h-4" />,
  },
};

// With right icon
export const WithRightIcon: Story = {
  args: {
    label: 'Email',
    placeholder: 'user@example.com',
    type: 'email',
    rightIcon: <Mail className="w-4 h-4" />,
  },
};

// Password input with toggle
export const PasswordToggle: Story = {
  render: () => {
    const [showPassword, setShowPassword] = useState(false);
    
    return (
      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Enter password"
        leftIcon={<Lock className="w-4 h-4" />}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />
    );
  },
};

// Healthcare-specific examples
export const PatientForm: Story = {
  render: () => (
    <div className="space-y-4">
      <Input
        label="Patient Name"
        placeholder="Full name"
        leftIcon={<User className="w-4 h-4" />}
        required
      />
      <Input
        label="Date of Birth"
        type="date"
        leftIcon={<Calendar className="w-4 h-4" />}
        required
      />
      <Input
        label="Insurance ID"
        placeholder="INS-123456"
        helperText="Enter your insurance member ID"
      />
      <Input
        label="Co-pay Amount"
        type="number"
        placeholder="25.00"
        leftIcon={<DollarSign className="w-4 h-4" />}
        min="0"
        step="0.01"
      />
    </div>
  ),
};

// Different input types
export const InputTypes: Story = {
  render: () => (
    <div className="space-y-4">
      <Input label="Text" type="text" placeholder="Regular text" />
      <Input label="Email" type="email" placeholder="user@example.com" />
      <Input label="Password" type="password" placeholder="••••••••" />
      <Input label="Number" type="number" placeholder="123" />
      <Input label="Date" type="date" />
      <Input label="Time" type="time" />
      <Input label="Tel" type="tel" placeholder="+1 (555) 123-4567" />
      <Input label="URL" type="url" placeholder="https://example.com" />
    </div>
  ),
};

// Validation states
export const ValidationStates: Story = {
  render: () => (
    <div className="space-y-4">
      <Input
        label="Default State"
        placeholder="No validation"
      />
      <Input
        label="Error State"
        placeholder="Invalid input"
        error
        errorMessage="This field is required"
      />
      <Input
        label="Success State"
        placeholder="Valid input"
        variant="success"
        helperText="Looks good!"
        defaultValue="Valid data"
      />
    </div>
  ),
};

// Interactive playground
export const Playground: Story = {
  args: {
    label: 'Input Label',
    placeholder: 'Enter something...',
    helperText: 'This is helper text',
    variant: 'default',
    size: 'md',
    error: false,
    disabled: false,
    required: false,
  },
};