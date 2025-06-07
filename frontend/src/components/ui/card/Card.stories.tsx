import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardContent, CardFooter } from './Card';
import { Button } from '../button/Button';
import { MoreVertical, Calendar, Clock, User, Heart, MessageSquare, Share2 } from 'lucide-react';

const meta = {
  title: 'Design System/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile card component for grouping related content. Supports headers, footers, and various visual styles.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      description: 'Visual style variant',
    },
    padding: {
      control: 'select',
      description: 'Padding size',
    },
    hoverable: {
      control: 'boolean',
      description: 'Add hover effects',
    },
    clickable: {
      control: 'boolean',
      description: 'Make card clickable',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic card
export const Default: Story = {
  args: {
    children: (
      <>
        <h3 className="text-lg font-semibold mb-2">Card Title</h3>
        <p className="text-gray-600">
          This is a basic card component with some content inside it.
        </p>
      </>
    ),
  },
};

// Card variants
export const Variants: Story = {
  render: () => (
    <div className="space-y-4">
      <Card variant="elevated">
        <h4 className="font-semibold mb-1">Elevated Card</h4>
        <p className="text-sm text-gray-600">Default card with shadow</p>
      </Card>
      <Card variant="outlined">
        <h4 className="font-semibold mb-1">Outlined Card</h4>
        <p className="text-sm text-gray-600">Card with border only</p>
      </Card>
      <Card variant="filled">
        <h4 className="font-semibold mb-1">Filled Card</h4>
        <p className="text-sm text-gray-600">Card with background fill</p>
      </Card>
      <Card variant="ghost">
        <h4 className="font-semibold mb-1">Ghost Card</h4>
        <p className="text-sm text-gray-600">Minimal card style</p>
      </Card>
    </div>
  ),
};

// Padding sizes
export const PaddingSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Card padding="xs">Extra small padding</Card>
      <Card padding="sm">Small padding</Card>
      <Card padding="md">Medium padding (default)</Card>
      <Card padding="lg">Large padding</Card>
      <Card padding="xl">Extra large padding</Card>
    </div>
  ),
};

// With header and footer
export const WithHeaderFooter: Story = {
  args: {
    header: (
      <CardHeader
        subtitle="Posted 2 hours ago"
        actions={
          <Button iconOnly size="sm" variant="ghost" ariaLabel="More options">
            <MoreVertical className="w-4 h-4" />
          </Button>
        }
      >
        Article Title
      </CardHeader>
    ),
    footer: (
      <CardFooter>
        <div className="flex gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4" /> 24
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" /> 12
          </span>
        </div>
        <Button size="sm" variant="ghost">
          <Share2 className="w-4 h-4 mr-2" /> Share
        </Button>
      </CardFooter>
    ),
    children: (
      <CardContent>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </CardContent>
    ),
  },
};

// Hoverable card
export const Hoverable: Story = {
  args: {
    hoverable: true,
    children: (
      <>
        <h3 className="text-lg font-semibold mb-2">Hoverable Card</h3>
        <p className="text-gray-600">
          Hover over this card to see the elevation effect.
        </p>
      </>
    ),
  },
};

// Clickable card
export const Clickable: Story = {
  args: {
    clickable: true,
    hoverable: true,
    onClick: () => alert('Card clicked!'),
    children: (
      <>
        <h3 className="text-lg font-semibold mb-2">Clickable Card</h3>
        <p className="text-gray-600">
          Click this card to trigger an action.
        </p>
      </>
    ),
  },
};

// Loading state
export const Loading: Story = {
  args: {
    loading: true,
    children: (
      <>
        <h3 className="text-lg font-semibold mb-2">Loading Card</h3>
        <p className="text-gray-600">
          This content is loading...
        </p>
      </>
    ),
  },
};

// Patient appointment card
export const PatientAppointment: Story = {
  render: () => (
    <Card>
      <CardHeader
        subtitle="Primary Care Physician"
        avatar={
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
        }
      >
        Dr. Sarah Johnson
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Thursday, March 15, 2024</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>2:30 PM - 3:00 PM</span>
        </div>
        <p className="text-sm text-gray-600">
          Annual check-up and wellness exam
        </p>
      </CardContent>
      <CardFooter divided>
        <Button variant="outline" size="sm">Reschedule</Button>
        <Button variant="primary" size="sm">Join Video Call</Button>
      </CardFooter>
    </Card>
  ),
};

// Healthcare provider card
export const ProviderCard: Story = {
  render: () => (
    <Card hoverable>
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-xl">
          MH
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">Dr. Michael Harris</h3>
          <p className="text-sm text-gray-600 mb-2">Psychiatrist • 15 years experience</p>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              Anxiety
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              Depression
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              PTSD
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>⭐ 4.9 (124 reviews)</span>
            <span>📍 2.5 miles</span>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t flex justify-between">
        <Button variant="outline" size="sm">View Profile</Button>
        <Button variant="primary" size="sm">Book Appointment</Button>
      </div>
    </Card>
  ),
};

// Card grid example
export const CardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-full max-w-4xl">
      <Card>
        <h4 className="font-semibold mb-2">Total Patients</h4>
        <p className="text-2xl font-bold text-blue-600">1,234</p>
        <p className="text-sm text-gray-600 mt-1">+12% from last month</p>
      </Card>
      <Card>
        <h4 className="font-semibold mb-2">Appointments Today</h4>
        <p className="text-2xl font-bold text-green-600">18</p>
        <p className="text-sm text-gray-600 mt-1">6 completed, 12 remaining</p>
      </Card>
      <Card>
        <h4 className="font-semibold mb-2">Waitlist</h4>
        <p className="text-2xl font-bold text-amber-600">45</p>
        <p className="text-sm text-gray-600 mt-1">Average wait: 3 days</p>
      </Card>
      <Card>
        <h4 className="font-semibold mb-2">Revenue</h4>
        <p className="text-2xl font-bold text-purple-600">$24.5K</p>
        <p className="text-sm text-gray-600 mt-1">This month</p>
      </Card>
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="p-8">
        <Story />
      </div>
    ),
  ],
};

// Interactive playground
export const Playground: Story = {
  args: {
    variant: 'elevated',
    padding: 'md',
    hoverable: false,
    clickable: false,
    loading: false,
    children: (
      <>
        <h3 className="text-lg font-semibold mb-2">Playground Card</h3>
        <p className="text-gray-600">
          Use the controls to customize this card's appearance and behavior.
        </p>
      </>
    ),
  },
};