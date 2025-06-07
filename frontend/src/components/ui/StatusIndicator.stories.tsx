import type { Meta, StoryObj } from '@storybook/react';
import { StatusIndicator } from './status/status-indicator';

const meta = {
  title: 'Design System/StatusIndicator',
  component: StatusIndicator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible status indicator component for showing system states, health checks, and activity status.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info', 'loading', 'idle'],
      description: 'The status to display',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the indicator',
    },
    showLabel: {
      control: 'boolean',
      description: 'Whether to show the status label',
    },
    pulse: {
      control: 'boolean',
      description: 'Add pulsing animation',
    },
  },
} satisfies Meta<typeof StatusIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic status indicators
export const Success: Story = {
  args: {
    status: 'success',
    label: 'Online',
  },
};

export const Error: Story = {
  args: {
    status: 'error',
    label: 'Offline',
  },
};

export const Warning: Story = {
  args: {
    status: 'warning',
    label: 'Degraded',
  },
};

export const Info: Story = {
  args: {
    status: 'info',
    label: 'Maintenance',
  },
};

export const Loading: Story = {
  args: {
    status: 'loading',
    label: 'Syncing',
  },
};

export const Idle: Story = {
  args: {
    status: 'idle',
    label: 'Idle',
  },
};

// Size variations
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <StatusIndicator status="success" size="sm" label="Small" showLabel />
      <StatusIndicator status="success" size="md" label="Medium" showLabel />
      <StatusIndicator status="success" size="lg" label="Large" showLabel />
    </div>
  ),
};

// With and without labels
export const WithLabels: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <StatusIndicator status="success" />
        <span className="text-sm text-gray-600">Without label</span>
      </div>
      <div className="flex items-center gap-4">
        <StatusIndicator status="success" label="Active" showLabel />
        <span className="text-sm text-gray-600">With label</span>
      </div>
    </div>
  ),
};

// Pulse animation
export const PulseAnimation: Story = {
  render: () => (
    <div className="space-y-4">
      <StatusIndicator status="success" label="Live" showLabel pulse />
      <StatusIndicator status="warning" label="Recording" showLabel pulse />
      <StatusIndicator status="error" label="Alert" showLabel pulse />
    </div>
  ),
};

// Healthcare-specific statuses
export const HealthcareStatuses: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-3">System Health</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>API Server</span>
            <StatusIndicator status="success" label="Operational" showLabel />
          </div>
          <div className="flex items-center justify-between">
            <span>Database</span>
            <StatusIndicator status="success" label="Healthy" showLabel />
          </div>
          <div className="flex items-center justify-between">
            <span>Queue Service</span>
            <StatusIndicator status="warning" label="High Load" showLabel />
          </div>
          <div className="flex items-center justify-between">
            <span>Email Service</span>
            <StatusIndicator status="error" label="Down" showLabel pulse />
          </div>
        </div>
      </div>

      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-3">Provider Status</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Dr. Sarah Johnson</span>
            <StatusIndicator status="success" label="Available" showLabel />
          </div>
          <div className="flex items-center justify-between">
            <span>Dr. Michael Chen</span>
            <StatusIndicator status="warning" label="In Session" showLabel />
          </div>
          <div className="flex items-center justify-between">
            <span>Dr. Emily Davis</span>
            <StatusIndicator status="idle" label="Away" showLabel />
          </div>
        </div>
      </div>

      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-3">Appointment Status</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>John Doe - 2:00 PM</span>
            <StatusIndicator status="info" label="Scheduled" showLabel />
          </div>
          <div className="flex items-center justify-between">
            <span>Jane Smith - 3:00 PM</span>
            <StatusIndicator status="success" label="Checked In" showLabel />
          </div>
          <div className="flex items-center justify-between">
            <span>Robert Johnson - 4:00 PM</span>
            <StatusIndicator status="warning" label="Running Late" showLabel pulse />
          </div>
        </div>
      </div>
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

// Custom status with content
export const CustomContent: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
        <StatusIndicator status="success" />
        <div>
          <p className="font-medium text-green-900">All Systems Operational</p>
          <p className="text-sm text-green-700">Last checked 2 minutes ago</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
        <StatusIndicator status="error" pulse />
        <div>
          <p className="font-medium text-red-900">Critical Alert</p>
          <p className="text-sm text-red-700">Database connection failed</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
        <StatusIndicator status="loading" />
        <div>
          <p className="font-medium text-blue-900">Syncing Data</p>
          <p className="text-sm text-blue-700">Processing 1,234 records...</p>
        </div>
      </div>
    </div>
  ),
};

// Interactive demo
export const InteractiveDemo: Story = {
  render: () => {
    const [status, setStatus] = React.useState<'success' | 'error' | 'warning' | 'info' | 'loading' | 'idle'>('success');
    
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setStatus('success')}
            className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            Success
          </button>
          <button
            onClick={() => setStatus('error')}
            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Error
          </button>
          <button
            onClick={() => setStatus('warning')}
            className="px-3 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200"
          >
            Warning
          </button>
          <button
            onClick={() => setStatus('loading')}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Loading
          </button>
        </div>
        
        <div className="p-8 border rounded-lg flex items-center justify-center">
          <StatusIndicator 
            status={status} 
            label={status.charAt(0).toUpperCase() + status.slice(1)}
            showLabel
            pulse={status === 'error' || status === 'loading'}
            size="lg"
          />
        </div>
      </div>
    );
  },
};

// Playground
export const Playground: Story = {
  args: {
    status: 'success',
    label: 'Status',
    showLabel: true,
    pulse: false,
    size: 'md',
  },
};

// Import React for the interactive demo
import React from 'react';