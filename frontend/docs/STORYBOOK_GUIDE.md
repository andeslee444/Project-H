# Storybook Component Documentation Guide

## Overview

This guide covers how to use and contribute to our Storybook component documentation for the Mental Health Practice Management System.

## 🚀 Getting Started

### Running Storybook

```bash
# Start Storybook development server
npm run storybook

# Build static Storybook site
npm run build-storybook

# Build documentation only
npm run storybook:docs
```

Storybook will be available at: http://localhost:6006

## 📁 Project Structure

```
frontend/
├── .storybook/
│   ├── main.ts           # Storybook configuration
│   └── preview.tsx       # Global decorators and parameters
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── button/
│   │       │   ├── Button.tsx
│   │       │   ├── Button.stories.tsx
│   │       │   └── types.ts
│   │       └── ...
│   └── stories/
│       ├── Introduction.mdx    # Welcome page
│       └── Healthcare.mdx      # Healthcare components guide
```

## 📝 Writing Stories

### Basic Story Structure

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Design System/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Button component description',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      description: 'Visual style variant',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Click me',
    variant: 'primary',
  },
};
```

### Story Categories

Stories are organized into categories:

- **Design System**: Core UI components (Button, Input, Card, etc.)
- **Healthcare**: Domain-specific components (MoodTracker, AppointmentCard)
- **Layouts**: Page layouts and navigation
- **Features**: Complex feature components

### Best Practices

1. **Always include a default story**
   ```tsx
   export const Default: Story = {
     args: {
       // minimal props
     },
   };
   ```

2. **Show all variants**
   ```tsx
   export const Variants: Story = {
     render: () => (
       <div className="space-y-4">
         <Button variant="primary">Primary</Button>
         <Button variant="secondary">Secondary</Button>
         <Button variant="danger">Danger</Button>
       </div>
     ),
   };
   ```

3. **Include interactive examples**
   ```tsx
   export const Interactive: Story = {
     render: () => {
       const [count, setCount] = useState(0);
       return (
         <Button onClick={() => setCount(count + 1)}>
           Clicked {count} times
         </Button>
       );
     },
   };
   ```

4. **Add healthcare context**
   ```tsx
   export const HealthcareExample: Story = {
     render: () => (
       <Card>
         <h3>Patient Appointment</h3>
         <Button icon={<Calendar />}>
           Schedule Appointment
         </Button>
       </Card>
     ),
   };
   ```

## 🎨 Component Documentation Standards

### Component Description

Every component should have a clear description:

```tsx
const meta = {
  title: 'Design System/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: `
A versatile button component that supports multiple variants, sizes, and states.
Designed for healthcare applications with accessibility in mind.

### Features:
- Multiple visual variants
- Loading and disabled states
- Icon support
- Full keyboard navigation
- ARIA compliant
        `,
      },
    },
  },
};
```

### Props Documentation

Use TypeScript interfaces with JSDoc comments:

```tsx
export interface ButtonProps {
  /**
   * Visual style variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'danger';
  
  /**
   * Button size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Whether the button is in a loading state
   * @default false
   */
  loading?: boolean;
}
```

### ArgTypes Configuration

Configure controls for better playground experience:

```tsx
argTypes: {
  variant: {
    control: 'select',
    description: 'Visual style variant',
    table: {
      type: { summary: 'string' },
      defaultValue: { summary: 'primary' },
    },
  },
  onClick: {
    action: 'clicked',
    description: 'Click handler',
  },
}
```

## 🏥 Healthcare-Specific Guidelines

### HIPAA Compliance Notes

Add security notes for components handling PHI:

```tsx
parameters: {
  docs: {
    description: {
      component: `
⚠️ **HIPAA Compliance**: This component handles Protected Health Information (PHI).
Ensure all data is encrypted and access is properly logged.
      `,
    },
  },
}
```

### Accessibility Requirements

Document accessibility features:

```tsx
export const AccessibilityDemo: Story = {
  render: () => (
    <div>
      <p>Keyboard Navigation: Tab, Space, Enter</p>
      <p>Screen Reader: Announces state changes</p>
      <p>ARIA: role="button", aria-pressed, aria-label</p>
      <Button ariaLabel="Schedule appointment for John Doe">
        Schedule
      </Button>
    </div>
  ),
};
```

## 🧪 Testing Stories

Stories can be used for testing:

```tsx
// Button.test.tsx
import { composeStories } from '@storybook/react';
import * as stories from './Button.stories';

const { Primary, Disabled } = composeStories(stories);

test('renders primary button', () => {
  render(<Primary />);
  expect(screen.getByRole('button')).toHaveClass('bg-blue-600');
});

test('disabled button is not clickable', () => {
  const handleClick = jest.fn();
  render(<Disabled onClick={handleClick} />);
  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).not.toHaveBeenCalled();
});
```

## 📱 Responsive Stories

Test components at different viewports:

```tsx
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};
```

## 🌙 Dark Mode Support

Show components in dark mode:

```tsx
export const DarkMode: Story = {
  decorators: [
    (Story) => (
      <div className="dark bg-gray-900 p-8">
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: { default: 'dark' },
  },
};
```

## 📦 Building for Production

### Static Site Generation

```bash
# Build Storybook as static site
npm run build-storybook

# Output will be in storybook-static/
# Can be deployed to any static hosting service
```

### Deployment Options

1. **GitHub Pages**
   ```bash
   npm run build-storybook
   npx gh-pages -d storybook-static
   ```

2. **Netlify**
   - Connect repo to Netlify
   - Build command: `npm run build-storybook`
   - Publish directory: `storybook-static`

3. **Vercel**
   - Import project
   - Framework preset: Other
   - Build command: `npm run build-storybook`
   - Output directory: `storybook-static`

## 🔧 Troubleshooting

### Common Issues

1. **Story not appearing**
   - Check the story title matches folder structure
   - Ensure story is exported
   - Verify file extension is `.stories.tsx`

2. **Controls not working**
   - Check argTypes configuration
   - Ensure props are properly passed to component

3. **Styles not loading**
   - Verify Tailwind CSS import in preview.tsx
   - Check for CSS module issues

### Getting Help

- Check the [official Storybook docs](https://storybook.js.org/docs)
- Review existing stories for examples
- Ask in team chat for component-specific questions

## 🎯 Next Steps

1. **Add stories for existing components**
   - Priority: Core UI components
   - Healthcare-specific components
   - Complex feature components

2. **Improve documentation**
   - Add more MDX documentation pages
   - Create usage guidelines
   - Document patterns and best practices

3. **Integrate with CI/CD**
   - Add visual regression testing
   - Automate deployment
   - Add accessibility checks

## 📚 Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [Component Story Format](https://storybook.js.org/docs/react/api/csf)
- [MDX Documentation](https://storybook.js.org/docs/react/writing-docs/mdx)
- [Accessibility Testing](https://storybook.js.org/docs/react/writing-tests/accessibility-testing)