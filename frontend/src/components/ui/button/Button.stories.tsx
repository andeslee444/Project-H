import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { CheckCircle, Download, Heart, Mail, Plus, Search, Settings, Trash } from 'lucide-react';

const meta = {
  title: 'Design System/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants, sizes, and states. Supports icons, loading states, and full-width layouts.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      description: 'Visual style variant of the button',
    },
    size: {
      control: 'select',
      description: 'Size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Make button full width',
    },
    iconOnly: {
      control: 'boolean',
      description: 'Show only icon without text',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic button variants
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Success: Story = {
  args: {
    children: 'Success Button',
    variant: 'success',
  },
};

export const Danger: Story = {
  args: {
    children: 'Danger Button',
    variant: 'danger',
  },
};

export const Warning: Story = {
  args: {
    children: 'Warning Button',
    variant: 'warning',
  },
};

export const Info: Story = {
  args: {
    children: 'Info Button',
    variant: 'info',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
};

export const Link: Story = {
  args: {
    children: 'Link Button',
    variant: 'link',
  },
};

// Size variations
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  ),
};

// With icons
export const WithLeftIcon: Story = {
  args: {
    children: 'Download',
    icon: <Download className="w-4 h-4" />,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: 'Next',
    iconRight: <Search className="w-4 h-4" />,
  },
};

export const WithBothIcons: Story = {
  args: {
    children: 'Settings',
    icon: <Settings className="w-4 h-4" />,
    iconRight: <CheckCircle className="w-4 h-4" />,
  },
};

// Icon only buttons
export const IconOnly: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button iconOnly size="xs" ariaLabel="Add">
        <Plus className="w-3 h-3" />
      </Button>
      <Button iconOnly size="sm" ariaLabel="Search">
        <Search className="w-4 h-4" />
      </Button>
      <Button iconOnly size="md" ariaLabel="Settings">
        <Settings className="w-4 h-4" />
      </Button>
      <Button iconOnly size="lg" variant="danger" ariaLabel="Delete">
        <Trash className="w-5 h-5" />
      </Button>
      <Button iconOnly size="xl" variant="success" ariaLabel="Favorite">
        <Heart className="w-6 h-6" />
      </Button>
    </div>
  ),
};

// States
export const Loading: Story = {
  args: {
    children: 'Processing...',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

export const LoadingWithIcon: Story = {
  args: {
    children: 'Saving',
    loading: true,
    icon: <CheckCircle className="w-4 h-4" />,
  },
};

// Full width
export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

// Healthcare-specific examples
export const HealthcareActions: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
          Schedule Appointment
        </Button>
        <Button variant="secondary" icon={<Mail className="w-4 h-4" />}>
          Send Message
        </Button>
      </div>
      <div className="flex gap-2">
        <Button variant="success" icon={<CheckCircle className="w-4 h-4" />}>
          Confirm Booking
        </Button>
        <Button variant="danger" icon={<Trash className="w-4 h-4" />}>
          Cancel Appointment
        </Button>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" icon={<Download className="w-4 h-4" />}>
          Download Records
        </Button>
        <Button variant="ghost" icon={<Settings className="w-4 h-4" />}>
          Settings
        </Button>
      </div>
    </div>
  ),
};

// Button group example
export const ButtonGroup: Story = {
  render: () => (
    <div className="inline-flex rounded-lg shadow-sm" role="group">
      <Button className="rounded-r-none">Previous</Button>
      <Button variant="secondary" className="rounded-none border-x-0">
        Current
      </Button>
      <Button className="rounded-l-none">Next</Button>
    </div>
  ),
};

// Interactive playground
export const Playground: Story = {
  args: {
    children: 'Click Me!',
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    fullWidth: false,
    iconOnly: false,
  },
};