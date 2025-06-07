import type { Meta, StoryObj } from '@storybook/react';
import MoodTracker from './MoodTracker';

const meta = {
  title: 'Healthcare/MoodTracker',
  component: MoodTracker,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A GitHub-style mood tracking component for mental health patients. Allows daily mood logging with a 1-10 scale and visualizes mood patterns over 12 weeks.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="bg-gray-50 p-8 rounded-lg">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MoodTracker>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default mood tracker
export const Default: Story = {
  render: () => <MoodTracker />,
};

// Within a patient dashboard context
export const InDashboard: Story = {
  render: () => (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Patient Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900">Next Appointment</h3>
            <p className="text-2xl font-bold text-blue-700 mt-1">March 15</p>
            <p className="text-sm text-blue-700">Dr. Sarah Johnson</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-900">Mood Streak</h3>
            <p className="text-2xl font-bold text-green-700 mt-1">7 days</p>
            <p className="text-sm text-green-700">Keep it up!</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-900">Average Mood</h3>
            <p className="text-2xl font-bold text-purple-700 mt-1">7.2/10</p>
            <p className="text-sm text-purple-700">This month</p>
          </div>
        </div>
      </div>
      
      <MoodTracker />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

// Dark mode variant
export const DarkMode: Story = {
  render: () => <MoodTracker />,
  decorators: [
    (Story) => (
      <div className="dark bg-gray-900 p-8 rounded-lg">
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

// Mobile view
export const Mobile: Story = {
  render: () => <MoodTracker />,
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm mx-auto bg-gray-50 p-4 rounded-lg">
        <Story />
      </div>
    ),
  ],
};

// With annotations
export const WithAnnotations: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">📊 Mood Tracking Benefits</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Helps identify patterns and triggers</li>
          <li>• Provides valuable data for therapy sessions</li>
          <li>• Encourages daily self-reflection</li>
          <li>• Visualizes progress over time</li>
        </ul>
      </div>
      
      <MoodTracker />
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-2">💡 Tips for Mood Tracking</h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Log your mood at the same time each day</li>
          <li>• Be honest with your ratings</li>
          <li>• Add notes about significant events</li>
          <li>• Review patterns with your therapist</li>
        </ul>
      </div>
    </div>
  ),
};

// Loading state simulation
export const LoadingState: Story = {
  render: () => {
    // This would typically show a loading state
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="flex justify-between items-center mb-6">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="space-y-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-4 bg-gray-200 rounded w-10"></div>
                <div className="flex space-x-1">
                  {[...Array(12)].map((_, j) => (
                    <div key={j} className="w-8 h-8 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

// Documentation example
export const Documentation: Story = {
  render: () => (
    <div className="prose max-w-none">
      <h2>Mood Tracker Component</h2>
      <p>
        The MoodTracker component provides a visual interface for patients to log and track their daily mood patterns.
        Inspired by GitHub's contribution graph, it offers an intuitive way to visualize emotional well-being over time.
      </p>
      
      <h3>Features:</h3>
      <ul>
        <li>12-week mood history visualization</li>
        <li>1-10 mood scale with color coding</li>
        <li>Daily mood logging with optional notes</li>
        <li>Streak tracking to encourage consistency</li>
        <li>Average mood calculation</li>
        <li>Mobile-responsive design</li>
        <li>Dark mode support</li>
      </ul>
      
      <h3>Color Scale:</h3>
      <div className="grid grid-cols-10 gap-2 my-4">
        {[1,2,3,4,5,6,7,8,9,10].map((mood) => (
          <div key={mood} className="text-center">
            <div className={`w-12 h-12 rounded ${
              mood <= 3 ? 'bg-red-500' :
              mood <= 4 ? 'bg-orange-400' :
              mood === 5 ? 'bg-yellow-400' :
              mood <= 7 ? 'bg-green-400' :
              'bg-green-600'
            } mb-1`}></div>
            <span className="text-xs">{mood}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <MoodTracker />
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};