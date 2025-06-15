#!/usr/bin/env node

/**
 * Generate comprehensive report from test results
 * Usage: node generate-comprehensive-report.js <results-dir> <reports-dir>
 */

const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node generate-comprehensive-report.js <results-dir> <reports-dir>');
  process.exit(1);
}

const resultsDir = args[0];
const reportsDir = args[1];

// Ensure reports directory exists
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Function to parse test results
function parseTestResults(resultsPath) {
  try {
    const files = fs.readdirSync(resultsPath);
    const results = {};
    
    files.forEach(file => {
      if (file.endsWith('.json')) {
        try {
          const content = fs.readFileSync(path.join(resultsPath, file), 'utf8');
          results[file] = JSON.parse(content);
        } catch (err) {
          console.warn(`Warning: Could not parse ${file}: ${err.message}`);
        }
      }
    });
    
    return results;
  } catch (err) {
    console.warn(`Warning: Could not read results directory: ${err.message}`);
    return {};
  }
}

// Function to generate summary
function generateSummary(results) {
  const summary = {
    totalTests: Object.keys(results).length,
    passedTests: 0,
    failedTests: 0,
    metrics: {
      avgResponseTime: 0,
      p95ResponseTime: 0,
      errorRate: 0,
      totalRequests: 0
    }
  };
  
  // Calculate metrics from results
  Object.values(results).forEach(result => {
    if (result.metrics) {
      // Add logic to extract metrics from K6 results
      if (result.metrics.http_req_duration) {
        summary.metrics.avgResponseTime = result.metrics.http_req_duration.avg || 0;
        summary.metrics.p95ResponseTime = result.metrics.http_req_duration['p(95)'] || 0;
      }
      if (result.metrics.http_req_failed) {
        summary.metrics.errorRate = result.metrics.http_req_failed.rate || 0;
      }
    }
  });
  
  return summary;
}

// Generate HTML report
function generateHTMLReport(summary, resultsPath) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Project-H Load Testing Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .summary { background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .metric { margin: 10px 0; }
    .metric-label { font-weight: bold; }
    .metric-value { color: #007bff; }
    .status-pass { color: green; }
    .status-fail { color: red; }
  </style>
</head>
<body>
  <h1>Project-H Load Testing Report</h1>
  <div class="summary">
    <h2>Test Summary</h2>
    <div class="metric">
      <span class="metric-label">Total Tests:</span>
      <span class="metric-value">${summary.totalTests}</span>
    </div>
    <div class="metric">
      <span class="metric-label">Average Response Time:</span>
      <span class="metric-value">${summary.metrics.avgResponseTime.toFixed(2)}ms</span>
    </div>
    <div class="metric">
      <span class="metric-label">95th Percentile Response Time:</span>
      <span class="metric-value">${summary.metrics.p95ResponseTime.toFixed(2)}ms</span>
    </div>
    <div class="metric">
      <span class="metric-label">Error Rate:</span>
      <span class="metric-value">${(summary.metrics.errorRate * 100).toFixed(2)}%</span>
    </div>
  </div>
  <p>Generated at: ${new Date().toISOString()}</p>
</body>
</html>
  `;
  
  const reportPath = path.join(reportsDir, `comprehensive-report-${Date.now()}.html`);
  fs.writeFileSync(reportPath, html);
  console.log(`HTML report generated: ${reportPath}`);
}

// Main execution
try {
  console.log('Generating comprehensive report...');
  console.log(`Results directory: ${resultsDir}`);
  console.log(`Reports directory: ${reportsDir}`);
  
  // Parse test results
  const results = parseTestResults(resultsDir);
  
  // Generate summary
  const summary = generateSummary(results);
  
  // Generate HTML report
  generateHTMLReport(summary, resultsDir);
  
  // Also create a JSON summary
  const jsonPath = path.join(reportsDir, `summary-${Date.now()}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2));
  console.log(`JSON summary generated: ${jsonPath}`);
  
  console.log('Report generation completed successfully');
} catch (err) {
  console.error('Error generating report:', err);
  process.exit(1);
}