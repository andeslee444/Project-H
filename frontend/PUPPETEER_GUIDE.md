# Puppeteer Authentication Guide

This guide explains how to easily authenticate in Puppeteer sessions when testing the Project-H frontend.

## Quick Start - Recommended Approach

The most reliable way to authenticate in Puppeteer is using the demo credentials:

```javascript
// 1. Navigate to login page
await page.goto('http://localhost:3000/login');

// 2. Click Demo Credentials
await page.evaluate(() => {
  const demoButton = Array.from(document.querySelectorAll('div')).find(el => 
    el.textContent.includes('Demo Credentials')
  );
  if (demoButton) demoButton.click();
});

// 3. Wait a moment for options to appear
await page.waitForTimeout(500);

// 4. Click your desired role
await page.evaluate(() => {
  const adminButton = Array.from(document.querySelectorAll('button')).find(el => 
    el.textContent.includes('Practice Administrator')
  );
  if (adminButton) adminButton.click();
});

// 5. Wait for navigation
await page.waitForNavigation();

// 6. Navigate to your target page
await page.goto('http://localhost:3000/provider-resy');
```

## Available Roles

- **Practice Administrator** - Full admin access
- **Provider** - Healthcare provider access
- **Patient** - Patient user access

## Complete Example: Testing Notifications

```javascript
const puppeteer = require('puppeteer');

async function testNotifications() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Login
  await page.goto('http://localhost:3000/login');
  await page.evaluate(() => {
    document.querySelector('div').click(); // Demo Credentials
  });
  await page.waitForTimeout(500);
  await page.click('button:has-text("Practice Administrator")');
  await page.waitForNavigation();
  
  // Go to waitlist
  await page.goto('http://localhost:3000/provider-resy');
  
  // Select provider and patients
  await page.click('.w-64'); // First provider
  await page.click('input[type="checkbox"]'); // First patient
  
  // Open notification modal
  await page.click('button:has-text("Notify Selected")');
  
  // Test new notification types
  await page.click('button:has-text("Provider-Led Scheduling")');
  
  await browser.close();
}
```

## Alternative: Manual localStorage Setup

For advanced use cases, you can manually set authentication:

```javascript
// Navigate to login first
await page.goto('http://localhost:3000/login');

// Set authentication in localStorage
await page.evaluate(() => {
  const adminUser = {
    id: 'demo-admin-001',
    email: 'admin@example.com',
    role: 'admin',
    first_name: 'Admin',
    last_name: '',
    user_metadata: { role: 'admin' }
  };
  
  localStorage.setItem('isDemoMode', 'true');
  localStorage.setItem('demoUser', JSON.stringify(adminUser));
  localStorage.setItem('demoUserEmail', 'admin@example.com');
  localStorage.setItem('isAuthenticated', 'true');
});

// Navigate to target page
await page.goto('http://localhost:3000/provider-resy');
```

## Testing the Notification System

A complete test script is available at `test-notification-puppeteer.js`:

```bash
node test-notification-puppeteer.js
```

This script will:
1. Login as admin
2. Navigate to waitlist
3. Select a provider and time slot
4. Select patients
5. Test the new notification modal with provider-led and calendar options
6. Take screenshots of the results

## Troubleshooting

If authentication isn't working:

1. **Ensure the app is running**: `npm run dev`
2. **Clear localStorage**:
   ```javascript
   await page.evaluate(() => localStorage.clear());
   ```
3. **Check console for errors**:
   ```javascript
   page.on('console', msg => console.log('Browser:', msg.text()));
   ```
4. **Use demo credentials approach** - it's the most reliable
5. **Check auth state**:
   ```javascript
   const authState = await page.evaluate(() => ({
     isDemoMode: localStorage.getItem('isDemoMode'),
     isAuthenticated: localStorage.getItem('isAuthenticated'),
     demoUser: localStorage.getItem('demoUser')
   }));
   console.log(authState);
   ```

## Best Practices

1. Always wait for navigation after login
2. Use `waitForSelector` to ensure elements are loaded
3. Add small delays (`waitForTimeout`) between actions for stability
4. Take screenshots for debugging
5. Use the demo credentials approach for most reliable results