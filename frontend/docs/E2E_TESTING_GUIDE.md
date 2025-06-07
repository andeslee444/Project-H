# E2E Testing Guide for Project-H

## Overview

This guide covers the end-to-end (E2E) testing setup for the Mental Health Practice Scheduling and Waitlist Management System. Our E2E tests use Playwright to ensure all critical user workflows function correctly while maintaining HIPAA compliance and accessibility standards.

## Quick Start

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run specific test suites
npm run test:e2e:auth          # Authentication tests
npm run test:e2e:appointments  # Appointment booking tests
npm run test:e2e:providers     # Provider management tests
npm run test:e2e:waitlist      # Waitlist tests
npm run test:e2e:notifications # Notification tests

# Use the test runner script for more options
./scripts/run-e2e-tests.sh help
```

### Installation

```bash
# Install dependencies (already done)
npm install

# Install Playwright browsers
npx playwright install

# Or use the script
./scripts/run-e2e-tests.sh install
```

## Test Structure

```
tests/e2e/
├── fixtures/          # Test data and user fixtures
├── helpers/           # Helper functions and utilities
├── specs/            # Test specifications
│   ├── auth/         # Authentication tests
│   ├── appointments/ # Appointment tests
│   ├── providers/    # Provider tests
│   ├── waitlist/     # Waitlist tests
│   └── notifications/# Notification tests
└── smoke.spec.ts     # Quick smoke tests
```

## Key Features

### 1. HIPAA Compliance Testing

All tests verify HIPAA-compliant behaviors:
- Secure authentication flows
- Session timeout handling
- Data encryption verification
- Audit trail creation
- Access control validation

### 2. Accessibility Testing

Every test includes accessibility checks:
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader compatibility
- Focus management
- Color contrast validation

Example:
```typescript
// Automatically run in all tests
await checkAccessibility(page, {
  skipFailures: false,
  detailedReport: true,
  wcagLevel: 'AA'
});
```

### 3. Test Helpers

#### Authentication Helper
```typescript
// Quick login
await authHelper.login(page, 'patient@example.com', 'password');

// Register new patient
await authHelper.registerPatient(page, {
  email: 'new@example.com',
  password: 'SecurePass123!',
  firstName: 'John',
  lastName: 'Doe'
});
```

#### Page Objects
```typescript
// Navigate to pages
await navigateToAppointments(page);
await navigateToWaitlist(page);

// Wait for elements
await waitForLoadingComplete(page);
```

## Writing Tests

### Best Practices

1. **Use data-testid attributes**
   ```typescript
   await page.getByTestId('submit-button').click();
   ```

2. **Avoid hard waits**
   ```typescript
   // Bad
   await page.waitForTimeout(5000);
   
   // Good
   await page.waitForSelector('[data-testid="content"]');
   ```

3. **Test isolation**
   ```typescript
   test.beforeEach(async ({ page }) => {
     // Fresh state for each test
     await page.goto('/');
   });
   ```

4. **Meaningful assertions**
   ```typescript
   await expect(page.getByTestId('error-message'))
     .toHaveText('Invalid email format');
   ```

### Example Test

```typescript
test('patient can book appointment', async ({ page }) => {
  // Login
  await authHelper.login(page, testPatient.email, testPatient.password);
  
  // Navigate to appointments
  await navigateToAppointments(page);
  
  // Start booking flow
  await page.getByTestId('book-appointment-btn').click();
  
  // Select provider
  await page.getByTestId('provider-card-1').click();
  await page.getByTestId('next-step-btn').click();
  
  // Select time
  await page.getByTestId('date-picker').fill('2024-03-01');
  await page.getByTestId('time-slot-9am').click();
  await page.getByTestId('next-step-btn').click();
  
  // Verify confirmation
  await expect(page.getByTestId('booking-success'))
    .toBeVisible();
    
  // Check accessibility
  await checkAccessibility(page);
});
```

## Configuration

### playwright.config.ts

Key settings:
- **Parallel execution**: 4 workers by default
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure
- **Videos**: On first retry
- **Trace**: On first retry

### Environment Variables

```bash
# .env.test
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=test-key
```

## Debugging

### Debug Mode
```bash
# Run in debug mode
npm run test:e2e:debug

# Or specific test
npx playwright test path/to/test.spec.ts --debug
```

### UI Mode
```bash
# Interactive mode with time travel
npm run test:e2e:ui
```

### Trace Viewer
```bash
# View trace after failure
npx playwright show-trace trace.zip
```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
  env:
    CI: true

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Mobile Testing

Tests include mobile viewports:
```typescript
// Runs on desktop and mobile
test.describe('Mobile', () => {
  test.use({ 
    viewport: { width: 375, height: 667 },
    isMobile: true 
  });
  
  test('mobile appointment booking', async ({ page }) => {
    // Mobile-specific test
  });
});
```

## Performance Monitoring

Tests can measure performance:
```typescript
const metrics = await page.evaluate(() => ({
  loadTime: performance.timing.loadEventEnd - 
            performance.timing.navigationStart,
  domReady: performance.timing.domContentLoadedEventEnd - 
           performance.timing.navigationStart
}));

expect(metrics.loadTime).toBeLessThan(3000);
```

## Troubleshooting

### Common Issues

1. **Browser not installed**
   ```bash
   npx playwright install
   ```

2. **Tests timing out**
   - Check if dev server is running
   - Verify API endpoints are accessible
   - Increase timeout in config

3. **Flaky tests**
   - Add proper wait conditions
   - Check for race conditions
   - Use test.slow() for complex flows

### Clean Test Artifacts
```bash
./scripts/run-e2e-tests.sh clean
```

## Maintenance

### Regular Tasks

1. **Update browsers monthly**
   ```bash
   npx playwright install
   ```

2. **Review test coverage**
   ```bash
   npm run test:e2e -- --reporter=html
   ```

3. **Update test data**
   - Check `fixtures/test-data.ts`
   - Verify user credentials
   - Update API mocks if needed

### Adding New Tests

1. Create spec file in appropriate directory
2. Import necessary helpers
3. Follow naming convention: `feature-name.spec.ts`
4. Include accessibility checks
5. Add to appropriate npm script

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [CI/CD Guide](https://playwright.dev/docs/ci)

## Support

For issues or questions:
1. Check this guide
2. Review existing tests for examples
3. Consult Playwright documentation
4. Contact the development team