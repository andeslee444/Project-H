import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Frontend Smoke Test for Project-H
 * Tests basic frontend availability and response times
 */

export let options = {
  scenarios: {
    smoke_test: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 1,
      maxDuration: '30s'
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99']
  }
};

const FRONTEND_URL = __ENV.FRONTEND_URL || 'http://localhost:3000';

export default function() {
  console.log('Starting frontend smoke test...');
  
  // Test 1: Home Page
  testHomePage();
  sleep(1);
  
  // Test 2: Login Page
  testLoginPage();
  sleep(1);
  
  // Test 3: Static Assets
  testStaticAssets();
  sleep(1);
  
  // Test 4: Main App Bundle
  testAppBundle();
  
  console.log('Frontend smoke test completed');
}

function testHomePage() {
  console.log('Testing home page...');
  
  const response = http.get(FRONTEND_URL, {
    tags: { name: 'home_page' }
  });
  
  check(response, {
    'Home Page - Status is 200': (r) => r.status === 200,
    'Home Page - Response time < 2s': (r) => r.timings.duration < 2000,
    'Home Page - Has HTML content': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('text/html'),
    'Home Page - Contains app root': (r) => r.body.includes('id="root"')
  });
}

function testLoginPage() {
  console.log('Testing login page...');
  
  const response = http.get(`${FRONTEND_URL}/login`, {
    tags: { name: 'login_page' }
  });
  
  check(response, {
    'Login Page - Status is 200': (r) => r.status === 200,
    'Login Page - Response time < 2s': (r) => r.timings.duration < 2000,
    'Login Page - Has HTML content': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('text/html')
  });
}

function testStaticAssets() {
  console.log('Testing static assets...');
  
  // Test favicon
  const faviconResponse = http.get(`${FRONTEND_URL}/favicon.ico`, {
    tags: { name: 'favicon' }
  });
  
  check(faviconResponse, {
    'Favicon - Status is 200': (r) => r.status === 200,
    'Favicon - Response time < 1s': (r) => r.timings.duration < 1000,
    'Favicon - Is image': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('image/')
  });
}

function testAppBundle() {
  console.log('Testing app bundle loading...');
  
  // First get the main page to find the bundle URL
  const mainResponse = http.get(FRONTEND_URL);
  
  // Extract JavaScript bundle URL from the response
  const scriptMatch = mainResponse.body.match(/src="(\/assets\/[^"]+\.js)"/);
  
  if (scriptMatch && scriptMatch[1]) {
    const scriptUrl = `${FRONTEND_URL}${scriptMatch[1]}`;
    console.log(`Testing JS bundle: ${scriptUrl}`);
    
    const scriptResponse = http.get(scriptUrl, {
      tags: { name: 'js_bundle' }
    });
    
    check(scriptResponse, {
      'JS Bundle - Status is 200': (r) => r.status === 200,
      'JS Bundle - Response time < 3s': (r) => r.timings.duration < 3000,
      'JS Bundle - Is JavaScript': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('javascript'),
      'JS Bundle - Has content': (r) => r.body && r.body.length > 1000
    });
  } else {
    console.warn('Could not find JavaScript bundle URL');
  }
  
  // Extract CSS bundle URL
  const cssMatch = mainResponse.body.match(/href="(\/assets\/[^"]+\.css)"/);
  
  if (cssMatch && cssMatch[1]) {
    const cssUrl = `${FRONTEND_URL}${cssMatch[1]}`;
    console.log(`Testing CSS bundle: ${cssUrl}`);
    
    const cssResponse = http.get(cssUrl, {
      tags: { name: 'css_bundle' }
    });
    
    check(cssResponse, {
      'CSS Bundle - Status is 200': (r) => r.status === 200,
      'CSS Bundle - Response time < 2s': (r) => r.timings.duration < 2000,
      'CSS Bundle - Is CSS': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('css'),
      'CSS Bundle - Has content': (r) => r.body && r.body.length > 1000
    });
  } else {
    console.warn('Could not find CSS bundle URL');
  }
}

export function teardown() {
  console.log('Cleaning up frontend smoke test...');
  console.log('Frontend smoke test cleanup completed');
}