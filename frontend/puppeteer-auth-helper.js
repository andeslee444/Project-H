/**
 * Puppeteer Authentication Helper for Project-H
 * 
 * This script provides helper functions to authenticate in Puppeteer sessions
 * without manually clicking through the login flow.
 */

/**
 * Authenticate as a specific role in Project-H
 * @param {Object} page - Puppeteer page object
 * @param {string} role - 'admin', 'provider', or 'patient'
 * @param {string} targetPath - Optional path to navigate to after auth (default: '/provider-resy')
 */
async function authenticateProjectH(page, role = 'admin', targetPath = '/provider-resy') {
  // First, navigate to login page to ensure app is loaded
  await page.goto('http://localhost:3000/login');
  
  // Wait for app to load
  await page.waitForSelector('.bg-white', { timeout: 5000 });
  
  // Set up demo authentication in localStorage
  const demoUsers = {
    admin: {
      id: 'demo-admin-001',
      email: 'admin@example.com',
      role: 'admin',
      first_name: 'Admin',
      last_name: '',
      user_metadata: { role: 'admin' }
    },
    provider: {
      id: 'demo-provider-001',
      email: 'provider@example.com',
      role: 'provider',
      first_name: 'Sarah',
      last_name: 'Johnson',
      title: 'Dr.',
      provider_id: '1',
      user_metadata: { role: 'provider', provider_id: '1' }
    },
    patient: {
      id: 'demo-patient-001',
      email: 'patient@example.com',
      role: 'patient',
      first_name: 'Demo',
      last_name: 'Patient',
      user_metadata: { role: 'patient' }
    }
  };
  
  const user = demoUsers[role] || demoUsers.admin;
  
  // Set authentication in localStorage
  await page.evaluate((userData) => {
    localStorage.setItem('isDemoMode', 'true');
    localStorage.setItem('demoUser', JSON.stringify(userData));
    localStorage.setItem('demoUserEmail', userData.email);
    localStorage.setItem('isAuthenticated', 'true');
  }, user);
  
  // Navigate to target page
  await page.goto(`http://localhost:3000${targetPath}`);
  
  // Wait for navigation to complete
  await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {
    // Sometimes navigation is immediate if already on the page
  });
  
  // Check if we're still on login page (auth might have failed)
  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    // Try the demo credentials approach
    console.log('Direct auth failed, trying demo credentials...');
    
    // Click Demo Credentials
    await page.evaluate(() => {
      const demoButton = Array.from(document.querySelectorAll('div')).find(el => 
        el.textContent.includes('Demo Credentials')
      );
      if (demoButton) demoButton.click();
    });
    
    // Wait for options to appear
    await page.waitForTimeout(500);
    
    // Click the appropriate role
    const roleMap = {
      admin: 'Practice Administrator',
      provider: 'Provider',
      patient: 'Patient'
    };
    
    await page.evaluate((roleName) => {
      const roleButton = Array.from(document.querySelectorAll('button')).find(el => 
        el.textContent.includes(roleName)
      );
      if (roleButton) roleButton.click();
    }, roleMap[role]);
    
    // Wait for navigation
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
  }
  
  return true;
}

/**
 * Quick login helper for testing the notification system
 */
async function loginForNotificationTest(page) {
  await authenticateProjectH(page, 'admin', '/provider-resy');
  
  // Wait for the waitlist page to load
  await page.waitForSelector('h1:has-text("Waitlist Management")', { timeout: 10000 });
  
  console.log('Successfully logged in and navigated to waitlist page');
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    authenticateProjectH,
    loginForNotificationTest
  };
}