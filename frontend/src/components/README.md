# Component Library Structure

This directory contains the refactored component library for the Mental Health Practice Management System.

## Directory Structure

```
components/
├── ui/                    # Core UI components (buttons, inputs, etc.)
│   ├── button/
│   ├── card/
│   ├── form/
│   └── ...
├── common/               # Shared business components
│   ├── appointment/
│   ├── schedule/
│   └── ...
├── patient/             # Patient-specific components
│   ├── dashboard/
│   ├── booking/
│   └── ...
├── provider/            # Provider-specific components
│   ├── dashboard/
│   ├── scheduler/
│   └── ...
├── layouts/             # Layout components
│   ├── app-layout/
│   ├── patient-layout/
│   └── ...
└── types/               # Shared TypeScript types
```

## Component Standards

### File Structure
Each component should follow this structure:
```
ComponentName/
├── ComponentName.tsx       # Main component file
├── ComponentName.test.tsx  # Tests
├── ComponentName.stories.tsx # Storybook stories (optional)
├── ComponentName.module.css # Styles (if needed)
├── index.ts               # Export file
└── types.ts              # Component-specific types
```

### Component Template
```typescript
import React from 'react'
import styles from './ComponentName.module.css'
import type { ComponentNameProps } from './types'

export const ComponentName: React.FC<ComponentNameProps> = ({
  // props
}) => {
  return (
    <div className={styles.container}>
      {/* Component content */}
    </div>
  )
}

ComponentName.displayName = 'ComponentName'
```

### Export Pattern
```typescript
// index.ts
export { ComponentName } from './ComponentName'
export type { ComponentNameProps } from './types'
```

## Migration Status

### ✅ Completed
- Component library structure
- TypeScript configuration

### 🚧 In Progress
- UI component library
- Patient components
- Provider components

### 📋 To Do
- Layout components
- Common components
- Component documentation
- Storybook setup