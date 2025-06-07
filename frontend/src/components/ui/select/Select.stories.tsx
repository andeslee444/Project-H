import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta = {
  title: 'Design System/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A customizable select dropdown component with support for labels, validation states, and helper text.',
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
      description: 'Select size',
    },
    error: {
      control: 'boolean',
      description: 'Show error state',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the select',
    },
    required: {
      control: 'boolean',
      description: 'Mark select as required',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic options
const countryOptions = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
];

// Basic select
export const Default: Story = {
  args: {
    placeholder: 'Select a country',
    options: countryOptions,
  },
};

// With label
export const WithLabel: Story = {
  args: {
    label: 'Country',
    placeholder: 'Select your country',
    options: countryOptions,
  },
};

// Required field
export const Required: Story = {
  args: {
    label: 'Country',
    placeholder: 'Select your country',
    options: countryOptions,
    required: true,
  },
};

// With helper text
export const WithHelperText: Story = {
  args: {
    label: 'Timezone',
    placeholder: 'Select timezone',
    helperText: 'Choose the timezone for appointment scheduling',
    options: [
      { value: 'est', label: 'Eastern Time (EST)' },
      { value: 'cst', label: 'Central Time (CST)' },
      { value: 'mst', label: 'Mountain Time (MST)' },
      { value: 'pst', label: 'Pacific Time (PST)' },
    ],
  },
};

// Error state
export const WithError: Story = {
  args: {
    label: 'Insurance Provider',
    placeholder: 'Select insurance',
    error: true,
    errorMessage: 'Please select a valid insurance provider',
    options: [
      { value: 'aetna', label: 'Aetna' },
      { value: 'bcbs', label: 'Blue Cross Blue Shield' },
      { value: 'cigna', label: 'Cigna' },
      { value: 'united', label: 'UnitedHealthcare' },
    ],
  },
};

// Success state
export const WithSuccess: Story = {
  args: {
    label: 'Preferred Language',
    variant: 'success',
    helperText: 'Language preference saved',
    defaultValue: 'en',
    options: [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Spanish' },
      { value: 'fr', label: 'French' },
      { value: 'zh', label: 'Chinese' },
    ],
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    label: 'Department',
    disabled: true,
    defaultValue: 'psychiatry',
    options: [
      { value: 'psychiatry', label: 'Psychiatry' },
      { value: 'psychology', label: 'Psychology' },
      { value: 'counseling', label: 'Counseling' },
    ],
  },
};

// Size variations
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Select
        size="sm"
        placeholder="Small select"
        options={[
          { value: '1', label: 'Option 1' },
          { value: '2', label: 'Option 2' },
        ]}
      />
      <Select
        size="md"
        placeholder="Medium select (default)"
        options={[
          { value: '1', label: 'Option 1' },
          { value: '2', label: 'Option 2' },
        ]}
      />
      <Select
        size="lg"
        placeholder="Large select"
        options={[
          { value: '1', label: 'Option 1' },
          { value: '2', label: 'Option 2' },
        ]}
      />
    </div>
  ),
};

// Healthcare-specific example
export const AppointmentType: Story = {
  args: {
    label: 'Appointment Type',
    placeholder: 'Select appointment type',
    required: true,
    helperText: 'Choose the type of appointment you need',
    options: [
      { value: 'initial', label: 'Initial Consultation (60 min)' },
      { value: 'followup', label: 'Follow-up Session (30 min)' },
      { value: 'therapy', label: 'Therapy Session (50 min)' },
      { value: 'assessment', label: 'Psychological Assessment (90 min)' },
      { value: 'group', label: 'Group Therapy (60 min)' },
      { value: 'emergency', label: 'Emergency Consultation' },
    ],
  },
};

// Provider specialty selection
export const ProviderSpecialty: Story = {
  args: {
    label: 'Provider Specialty',
    placeholder: 'Select a specialty',
    options: [
      { value: 'anxiety', label: 'Anxiety Disorders' },
      { value: 'depression', label: 'Depression' },
      { value: 'trauma', label: 'Trauma & PTSD' },
      { value: 'addiction', label: 'Addiction & Substance Abuse' },
      { value: 'eating', label: 'Eating Disorders' },
      { value: 'bipolar', label: 'Bipolar Disorder' },
      { value: 'ocd', label: 'OCD' },
      { value: 'child', label: 'Child & Adolescent' },
      { value: 'couples', label: 'Couples Therapy' },
      { value: 'family', label: 'Family Therapy' },
    ],
  },
};

// With disabled options
export const WithDisabledOptions: Story = {
  args: {
    label: 'Available Time Slots',
    placeholder: 'Select a time',
    options: [
      { value: '09:00', label: '9:00 AM' },
      { value: '10:00', label: '10:00 AM', disabled: true },
      { value: '11:00', label: '11:00 AM' },
      { value: '12:00', label: '12:00 PM', disabled: true },
      { value: '14:00', label: '2:00 PM' },
      { value: '15:00', label: '3:00 PM', disabled: true },
      { value: '16:00', label: '4:00 PM' },
      { value: '17:00', label: '5:00 PM' },
    ],
  },
};

// Grouped options using optgroup
export const GroupedOptions: Story = {
  render: () => (
    <Select label="Select Provider" placeholder="Choose a provider">
      <optgroup label="Psychiatrists">
        <option value="dr-johnson">Dr. Sarah Johnson - MD</option>
        <option value="dr-chen">Dr. Michael Chen - MD</option>
        <option value="dr-patel">Dr. Priya Patel - MD</option>
      </optgroup>
      <optgroup label="Psychologists">
        <option value="dr-williams">Dr. Emily Williams - PhD</option>
        <option value="dr-brown">Dr. James Brown - PsyD</option>
        <option value="dr-garcia">Dr. Maria Garcia - PhD</option>
      </optgroup>
      <optgroup label="Therapists">
        <option value="smith">Jennifer Smith - LCSW</option>
        <option value="davis">Robert Davis - LMFT</option>
        <option value="wilson">Lisa Wilson - LPC</option>
      </optgroup>
    </Select>
  ),
};

// Form example
export const InForm: Story = {
  render: () => (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <Select
        label="Gender"
        placeholder="Select gender"
        required
        options={[
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' },
          { value: 'prefer-not', label: 'Prefer not to say' },
        ]}
      />
      
      <Select
        label="Insurance Provider"
        placeholder="Select your insurance"
        required
        options={[
          { value: 'aetna', label: 'Aetna' },
          { value: 'bcbs', label: 'Blue Cross Blue Shield' },
          { value: 'cigna', label: 'Cigna' },
          { value: 'united', label: 'UnitedHealthcare' },
          { value: 'medicare', label: 'Medicare' },
          { value: 'medicaid', label: 'Medicaid' },
          { value: 'self-pay', label: 'Self-Pay' },
        ]}
      />
      
      <Select
        label="Preferred Session Type"
        placeholder="Select session type"
        helperText="You can change this preference anytime"
        options={[
          { value: 'in-person', label: 'In-Person' },
          { value: 'video', label: 'Video Call' },
          { value: 'phone', label: 'Phone Call' },
          { value: 'any', label: 'No Preference' },
        ]}
      />
      
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Save Preferences
      </button>
    </form>
  ),
};

// Interactive playground
export const Playground: Story = {
  args: {
    label: 'Select Label',
    placeholder: 'Choose an option',
    helperText: 'This is helper text',
    variant: 'default',
    size: 'md',
    error: false,
    disabled: false,
    required: false,
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
      { value: 'option4', label: 'Option 4', disabled: true },
    ],
  },
};