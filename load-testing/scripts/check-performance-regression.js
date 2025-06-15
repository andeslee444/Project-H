#!/usr/bin/env node

/**
 * Check for performance regression by comparing current results with baseline
 * Usage: node check-performance-regression.js <results-dir>
 */

const fs = require('fs');
const path = require('path');

// Regression thresholds (% change considered regression)
const REGRESSION_THRESHOLDS = {
  responseTime: 0.20, // 20% increase in response time
  errorRate: 0.10, // 10% increase in error rate
  throughput: -0.10 // 10% decrease in throughput
};

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node check-performance-regression.js <results-dir>');
  process.exit(1);
}

const resultsDir = args[0];

// Function to extract metrics from results
function extractMetrics(results) {
  const metrics = {
    avgResponseTime: 0,
    p95ResponseTime: 0,
    errorRate: 0,
    throughput: 0
  };
  
  if (results.metrics) {
    if (results.metrics.http_req_duration) {
      metrics.avgResponseTime = results.metrics.http_req_duration.avg || 0;
      metrics.p95ResponseTime = results.metrics.http_req_duration['p(95)'] || 0;
    }
    if (results.metrics.http_req_failed) {
      metrics.errorRate = results.metrics.http_req_failed.rate || 0;
    }
    if (results.metrics.http_reqs) {
      metrics.throughput = results.metrics.http_reqs.rate || 0;
    }
  }
  
  return metrics;
}

// Function to compare metrics
function compareMetrics(current, baseline) {
  const regressions = [];
  
  // Check response time regression
  if (baseline.avgResponseTime > 0) {
    const change = (current.avgResponseTime - baseline.avgResponseTime) / baseline.avgResponseTime;
    if (change > REGRESSION_THRESHOLDS.responseTime) {
      regressions.push({
        metric: 'Average Response Time',
        baseline: baseline.avgResponseTime.toFixed(2),
        current: current.avgResponseTime.toFixed(2),
        change: `+${(change * 100).toFixed(1)}%`
      });
    }
  }
  
  // Check error rate regression
  if (baseline.errorRate >= 0) {
    const change = current.errorRate - baseline.errorRate;
    if (change > REGRESSION_THRESHOLDS.errorRate) {
      regressions.push({
        metric: 'Error Rate',
        baseline: `${(baseline.errorRate * 100).toFixed(2)}%`,
        current: `${(current.errorRate * 100).toFixed(2)}%`,
        change: `+${(change * 100).toFixed(2)}%`
      });
    }
  }
  
  // Check throughput regression
  if (baseline.throughput > 0) {
    const change = (current.throughput - baseline.throughput) / baseline.throughput;
    if (change < REGRESSION_THRESHOLDS.throughput) {
      regressions.push({
        metric: 'Throughput',
        baseline: baseline.throughput.toFixed(2),
        current: current.throughput.toFixed(2),
        change: `${(change * 100).toFixed(1)}%`
      });
    }
  }
  
  return regressions;
}

// Main execution
try {
  console.log('Checking for performance regression...');
  console.log(`Results directory: ${resultsDir}`);
  
  // For now, we'll skip regression checks if no baseline exists
  // In a real implementation, you would store baseline results separately
  const baselinePath = path.join(resultsDir, '.baseline');
  
  if (!fs.existsSync(baselinePath)) {
    console.log('\nNo baseline found. Skipping regression checks.');
    console.log('Current results will be used as baseline for future runs.');
    
    // Create baseline directory
    if (!fs.existsSync(baselinePath)) {
      fs.mkdirSync(baselinePath, { recursive: true });
    }
    
    // Copy current results as baseline
    if (fs.existsSync(resultsDir)) {
      const files = fs.readdirSync(resultsDir).filter(f => f.endsWith('.json'));
      files.forEach(file => {
        const src = path.join(resultsDir, file);
        const dest = path.join(baselinePath, file);
        try {
          fs.copyFileSync(src, dest);
        } catch (err) {
          console.warn(`Warning: Could not copy ${file} to baseline: ${err.message}`);
        }
      });
    }
    
    process.exit(0);
  }
  
  console.log('\nBaseline found. Comparing results...\n');
  
  // Compare each test result with baseline
  let hasRegression = false;
  const currentFiles = fs.readdirSync(resultsDir).filter(f => f.endsWith('.json'));
  
  currentFiles.forEach(file => {
    const currentPath = path.join(resultsDir, file);
    const baselinePath = path.join(resultsDir, '.baseline', file);
    
    if (fs.existsSync(baselinePath)) {
      try {
        const currentResults = JSON.parse(fs.readFileSync(currentPath, 'utf8'));
        const baselineResults = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
        
        const currentMetrics = extractMetrics(currentResults);
        const baselineMetrics = extractMetrics(baselineResults);
        
        const regressions = compareMetrics(currentMetrics, baselineMetrics);
        
        if (regressions.length > 0) {
          hasRegression = true;
          console.log(`❌ ${file} - Performance regression detected:`);
          regressions.forEach(r => {
            console.log(`   - ${r.metric}: ${r.baseline} → ${r.current} (${r.change})`);
          });
        } else {
          console.log(`✅ ${file} - No regression detected`);
        }
      } catch (err) {
        console.warn(`Warning: Could not compare ${file}: ${err.message}`);
      }
    } else {
      console.log(`⚠️  ${file} - No baseline to compare`);
    }
  });
  
  console.log('\n');
  if (hasRegression) {
    console.log('❌ Performance regression detected!');
    process.exit(1);
  } else {
    console.log('✅ No performance regression detected!');
    process.exit(0);
  }
} catch (err) {
  console.error('Error checking regression:', err);
  process.exit(1);
}