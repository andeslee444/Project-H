# E2E Testing with Playwright

This directory contains end-to-end tests for the Mental Health Practice Scheduling and Waitlist Management System.

## Overview

The E2E tests cover critical user workflows including:
- Patient registration and login
- Appointment booking flow
- Provider schedule management
- Waitlist management
- Notification system
- HIPAA compliance workflows
- Accessibility testing

## Structure

```
tests/e2e/
├── fixtures/          # Test data and user fixtures
├── helpers/           # Helper functions and utilities
├── specs/            # Test specifications
│   ├── auth/         # Authentication tests
│   ├── appointments/ # Appointment booking tests
│   ├── providers/    # Provider management tests
│   ├── waitlist/     # Waitlist management tests
│   └── notifications/ # Notification system tests
└── README.md
```

## Running Tests

### All Tests
```bash
npm run test:e2e
```

### Interactive UI Mode
```bash
npm run test:e2e:ui
```

### Headed Mode (see browser)
```bash
npm run test:e2e:headed
```

### Debug Mode
```bash
npm run test:e2e:debug
```

### Specific Test Suites
```bash
# Authentication tests
npm run test:e2e:auth

# Appointment tests
npm run test:e2e:appointments

# Provider tests
npm run test:e2e:providers

# Waitlist tests
npm run test:e2e:waitlist

# Notification tests
npm run test:e2e:notifications
```

### Specific Browsers
```bash
# Chrome only
npm run test:e2e:chrome

# Firefox only
npm run test:e2e:firefox

# Safari only
npm run test:e2e:webkit

# Mobile browsers
npm run test:e2e:mobile
```

## Test Data

Test users and data are defined in `fixtures/`:
- `test-users.ts`: Pre-configured test users (patient, provider, admin)
- `test-data.ts`: Test appointments, notifications, waitlist preferences, etc.

## Writing Tests

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../helpers/auth.helper';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
  });

  test('should do something', async ({ page }) => {
    // Test implementation
  });
});
```

### Using Helpers
```typescript
// Login as a test user
const authHelper = new AuthHelper(page);
await authHelper.login('patient');

// Check accessibility
const a11yHelper = new AccessibilityHelper(page);
await a11yHelper.checkPageAccessibility();
```

## Accessibility Testing

All test suites include accessibility checks using axe-core:
- WCAG 2.0/2.1 AA compliance
- Keyboard navigation
- Screen reader compatibility
- Focus management
- Color contrast

## HIPAA Compliance

Tests verify HIPAA-compliant workflows:
- Secure authentication
- Session management
- Data encryption indicators
- Audit logging
- Access controls

## Test Reports

### View HTML Report
```bash
npm run test:e2e:report
```

### View Trace Files
```bash
npm run test:e2e:trace
```

## Debugging

### Generate Tests with Codegen
```bash
npm run test:e2e:codegen
```

### Debug Specific Test
```bash
npx playwright test path/to/test.spec.ts --debug
```

### View Test Traces
Tests automatically capture traces on failure. View them with:
```bash
npx playwright show-trace path/to/trace.zip
```

## CI/CD Integration

Tests are configured to run in CI with:
- Retry on failure (2 attempts)
- Parallel execution disabled
- JUnit XML reports
- Screenshot/video on failure

## Environment Variables

Set these in your `.env` file:
```
TEST_BASE_URL=http://localhost:5173
TEST_API_URL=http://localhost:3000
```

## Best Practices

1. **Use data-testid attributes**: All interactive elements should have `data-testid` attributes
2. **Avoid hard waits**: Use Playwright's auto-waiting features
3. **Test isolation**: Each test should be independent
4. **Meaningful assertions**: Use specific error messages
5. **Accessibility first**: Include a11y checks in all tests

## Troubleshooting

### Tests failing locally
1. Ensure dev server is running: `npm run dev`
2. Check browser installation: `npx playwright install`
3. Clear test data: Tests use mock data that resets

### Flaky tests
1. Check for proper waits
2. Ensure test isolation
3. Review network conditions
4. Check for race conditions

### Performance issues
1. Run tests in parallel when possible
2. Use test.describe.parallel() for independent tests
3. Minimize browser context creation