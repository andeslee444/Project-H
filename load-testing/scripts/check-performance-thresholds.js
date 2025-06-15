#!/usr/bin/env node

/**
 * Check performance thresholds from test results
 * Usage: node check-performance-thresholds.js <results-dir>
 */

const fs = require('fs');
const path = require('path');

// Default thresholds
const THRESHOLDS = {
  maxResponseTime: 2000, // ms
  maxErrorRate: 0.05, // 5%
  minSuccessRate: 0.95, // 95%
  maxP95ResponseTime: 3000 // ms
};

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node check-performance-thresholds.js <results-dir>');
  process.exit(1);
}

const resultsDir = args[0];

// Function to check a single test result
function checkTestResult(filePath, fileName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const result = JSON.parse(content);
    
    const violations = [];
    
    // Check metrics if available
    if (result.metrics) {
      // Check response time
      if (result.metrics.http_req_duration) {
        const avgDuration = result.metrics.http_req_duration.avg || 0;
        const p95Duration = result.metrics.http_req_duration['p(95)'] || 0;
        
        if (avgDuration > THRESHOLDS.maxResponseTime) {
          violations.push(`Average response time (${avgDuration.toFixed(2)}ms) exceeds threshold (${THRESHOLDS.maxResponseTime}ms)`);
        }
        
        if (p95Duration > THRESHOLDS.maxP95ResponseTime) {
          violations.push(`P95 response time (${p95Duration.toFixed(2)}ms) exceeds threshold (${THRESHOLDS.maxP95ResponseTime}ms)`);
        }
      }
      
      // Check error rate
      if (result.metrics.http_req_failed) {
        const errorRate = result.metrics.http_req_failed.rate || 0;
        if (errorRate > THRESHOLDS.maxErrorRate) {
          violations.push(`Error rate (${(errorRate * 100).toFixed(2)}%) exceeds threshold (${(THRESHOLDS.maxErrorRate * 100)}%)`);
        }
      }
      
      // Check success rate (inverse of error rate)
      if (result.metrics.checks) {
        const successRate = result.metrics.checks.passes / (result.metrics.checks.passes + result.metrics.checks.fails);
        if (successRate < THRESHOLDS.minSuccessRate) {
          violations.push(`Success rate (${(successRate * 100).toFixed(2)}%) below threshold (${(THRESHOLDS.minSuccessRate * 100)}%)`);
        }
      }
    }
    
    return { fileName, violations };
  } catch (err) {
    console.warn(`Warning: Could not check ${fileName}: ${err.message}`);
    return { fileName, violations: [] };
  }
}

// Main execution
try {
  console.log('Checking performance thresholds...');
  console.log(`Results directory: ${resultsDir}`);
  console.log('\nThresholds:');
  console.log(`- Max Average Response Time: ${THRESHOLDS.maxResponseTime}ms`);
  console.log(`- Max P95 Response Time: ${THRESHOLDS.maxP95ResponseTime}ms`);
  console.log(`- Max Error Rate: ${(THRESHOLDS.maxErrorRate * 100)}%`);
  console.log(`- Min Success Rate: ${(THRESHOLDS.minSuccessRate * 100)}%`);
  console.log('\n');
  
  // Check if results directory exists
  if (!fs.existsSync(resultsDir)) {
    console.log('No results directory found. Skipping threshold checks.');
    process.exit(0);
  }
  
  // Get all JSON files in results directory
  const files = fs.readdirSync(resultsDir).filter(f => f.endsWith('.json'));
  
  if (files.length === 0) {
    console.log('No test results found. Skipping threshold checks.');
    process.exit(0);
  }
  
  // Check each test result
  let hasViolations = false;
  files.forEach(file => {
    const filePath = path.join(resultsDir, file);
    const result = checkTestResult(filePath, file);
    
    if (result.violations.length > 0) {
      hasViolations = true;
      console.log(`❌ ${result.fileName}`);
      result.violations.forEach(v => console.log(`   - ${v}`));
    } else {
      console.log(`✅ ${result.fileName} - All thresholds passed`);
    }
  });
  
  console.log('\n');
  if (hasViolations) {
    console.log('❌ Performance threshold violations detected!');
    process.exit(1);
  } else {
    console.log('✅ All performance thresholds passed!');
    process.exit(0);
  }
} catch (err) {
  console.error('Error checking thresholds:', err);
  process.exit(1);
}