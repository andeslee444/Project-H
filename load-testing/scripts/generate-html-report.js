#!/usr/bin/env node

/**
 * HTML Report Generator for Project-H Load Testing
 * 
 * Generates comprehensive HTML reports from K6 JSON results
 * Includes healthcare-specific metrics and HIPAA compliance indicators
 */

const fs = require('fs');
const path = require('path');

// Configuration
const REPORT_CONFIG = {
  title: 'Project-H Mental Health System Load Testing Report',
  healthcareSLAs: {
    critical: { responseTime: 200, availability: 0.999, errorRate: 0.001 },
    standard: { responseTime: 500, availability: 0.99, errorRate: 0.01 },
    nonCritical: { responseTime: 2000, availability: 0.95, errorRate: 0.05 }
  }
};

class HTMLReportGenerator {
  constructor(resultsDir, outputFile) {
    this.resultsDir = resultsDir;
    this.outputFile = outputFile;
    this.testResults = [];
    this.summary = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      startTime: null,
      endTime: null,
      duration: 0,
      hipaaCompliant: true,
      criticalIssues: []
    };
  }

  async generateReport() {
    console.log('Generating HTML report...');
    
    try {
      await this.loadTestResults();
      this.calculateSummary();
      const htmlContent = this.generateHTML();
      
      await fs.promises.writeFile(this.outputFile, htmlContent, 'utf8');
      console.log(`HTML report generated: ${this.outputFile}`);
      
      return true;
    } catch (error) {
      console.error('Failed to generate HTML report:', error.message);
      return false;
    }
  }

  async loadTestResults() {
    const files = await fs.promises.readdir(this.resultsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    for (const file of jsonFiles) {
      const filePath = path.join(this.resultsDir, file);
      try {
        const content = await fs.promises.readFile(filePath, 'utf8');
        const lines = content.trim().split('\n');
        
        const testResult = {
          testName: this.extractTestName(file),
          metrics: {},
          checks: {},
          thresholds: {},
          rawData: []
        };
        
        for (const line of lines) {
          if (line.trim()) {
            const data = JSON.parse(line);
            testResult.rawData.push(data);
            
            if (data.type === 'Point' && data.metric) {
              this.processMetric(testResult, data);
            }
          }
        }
        
        this.testResults.push(testResult);
      } catch (error) {
        console.warn(`Failed to process ${file}: ${error.message}`);
      }
    }
  }

  extractTestName(filename) {
    return filename
      .replace('.json', '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  processMetric(testResult, data) {
    const { metric, data: metricData } = data;
    
    if (!testResult.metrics[metric]) {
      testResult.metrics[metric] = {
        values: [],
        min: Infinity,
        max: -Infinity,
        avg: 0,
        p95: 0,
        p99: 0
      };
    }
    
    if (metricData.value !== undefined) {
      testResult.metrics[metric].values.push(metricData.value);
      testResult.metrics[metric].min = Math.min(testResult.metrics[metric].min, metricData.value);
      testResult.metrics[metric].max = Math.max(testResult.metrics[metric].max, metricData.value);
    }
    
    // Process tags for additional context
    if (metricData.tags) {
      if (!testResult.metrics[metric].tags) {
        testResult.metrics[metric].tags = {};
      }
      
      Object.entries(metricData.tags).forEach(([key, value]) => {
        if (!testResult.metrics[metric].tags[key]) {
          testResult.metrics[metric].tags[key] = new Set();
        }
        testResult.metrics[metric].tags[key].add(value);
      });
    }
  }

  calculateSummary() {
    this.summary.totalTests = this.testResults.length;
    
    let totalDuration = 0;
    let earliestStart = null;
    let latestEnd = null;
    
    for (const test of this.testResults) {
      // Calculate averages and percentiles
      Object.values(test.metrics).forEach(metric => {
        if (metric.values.length > 0) {
          metric.avg = metric.values.reduce((a, b) => a + b, 0) / metric.values.length;
          
          const sorted = metric.values.slice().sort((a, b) => a - b);
          metric.p95 = this.percentile(sorted, 95);
          metric.p99 = this.percentile(sorted, 99);
        }
      });
      
      // Check test status
      const failed = this.checkTestFailure(test);
      if (failed) {
        this.summary.failedTests++;
        this.summary.criticalIssues.push(...failed);
      } else {
        this.summary.passedTests++;
      }
      
      // Check HIPAA compliance
      if (!this.checkHIPAACompliance(test)) {
        this.summary.hipaaCompliant = false;
        this.summary.criticalIssues.push(`HIPAA compliance issue in ${test.testName}`);
      }
      
      // Extract timing information
      const testStart = this.extractTestStart(test);
      const testEnd = this.extractTestEnd(test);
      
      if (testStart && testEnd) {
        totalDuration += testEnd - testStart;
        
        if (!earliestStart || testStart < earliestStart) {
          earliestStart = testStart;
        }
        
        if (!latestEnd || testEnd > latestEnd) {
          latestEnd = testEnd;
        }
      }
    }
    
    this.summary.startTime = earliestStart;
    this.summary.endTime = latestEnd;
    this.summary.duration = latestEnd - earliestStart;
  }

  checkTestFailure(test) {
    const issues = [];
    
    // Check response times
    if (test.metrics.http_req_duration) {
      const responseTime = test.metrics.http_req_duration.p95;
      if (responseTime > REPORT_CONFIG.healthcareSLAs.standard.responseTime) {
        issues.push(`High response time in ${test.testName}: ${responseTime.toFixed(2)}ms`);
      }
    }
    
    // Check error rates
    if (test.metrics.http_req_failed) {
      const errorRate = test.metrics.http_req_failed.avg;
      if (errorRate > REPORT_CONFIG.healthcareSLAs.standard.errorRate) {
        issues.push(`High error rate in ${test.testName}: ${(errorRate * 100).toFixed(2)}%`);
      }
    }
    
    // Check check success rates
    if (test.metrics.checks) {
      const checkRate = test.metrics.checks.avg;
      if (checkRate < 0.95) {
        issues.push(`Low check success rate in ${test.testName}: ${(checkRate * 100).toFixed(2)}%`);
      }
    }
    
    return issues.length > 0 ? issues : null;
  }

  checkHIPAACompliance(test) {
    // Check for HIPAA-specific metrics
    return test.metrics.hipaa_compliance_checks && 
           test.metrics.hipaa_compliance_checks.values.length > 0;
  }

  extractTestStart(test) {
    const timestamps = test.rawData
      .filter(d => d.type === 'Point' && d.data.time)
      .map(d => new Date(d.data.time));
    
    return timestamps.length > 0 ? Math.min(...timestamps) : null;
  }

  extractTestEnd(test) {
    const timestamps = test.rawData
      .filter(d => d.type === 'Point' && d.data.time)
      .map(d => new Date(d.data.time));
    
    return timestamps.length > 0 ? Math.max(...timestamps) : null;
  }

  percentile(sorted, p) {
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)] || 0;
  }

  generateHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${REPORT_CONFIG.title}</title>
    <style>
        ${this.getCSS()}
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="container">
        ${this.generateHeader()}
        ${this.generateSummary()}
        ${this.generateHealthcareMetrics()}
        ${this.generateTestResults()}
        ${this.generateCharts()}
        ${this.generateFooter()}
    </div>
    
    <script>
        ${this.getJavaScript()}
    </script>
</body>
</html>`;
  }

  generateHeader() {
    const timestamp = new Date().toLocaleString();
    
    return `
    <header class="header">
        <h1>${REPORT_CONFIG.title}</h1>
        <div class="subtitle">
            Generated on ${timestamp}
        </div>
        ${this.summary.hipaaCompliant ? 
          '<div class="compliance-badge hipaa-compliant">HIPAA Compliant</div>' :
          '<div class="compliance-badge hipaa-violation">HIPAA Violations Detected</div>'
        }
    </header>`;
  }

  generateSummary() {
    const successRate = this.summary.totalTests > 0 ? 
      (this.summary.passedTests / this.summary.totalTests * 100).toFixed(1) : 0;
    
    const duration = this.summary.duration ? 
      this.formatDuration(this.summary.duration) : 'N/A';
    
    return `
    <section class="summary">
        <h2>Test Summary</h2>
        <div class="summary-grid">
            <div class="summary-card ${successRate >= 95 ? 'success' : 'failure'}">
                <h3>Overall Success Rate</h3>
                <div class="metric-value">${successRate}%</div>
                <div class="metric-details">${this.summary.passedTests}/${this.summary.totalTests} tests passed</div>
            </div>
            
            <div class="summary-card">
                <h3>Test Duration</h3>
                <div class="metric-value">${duration}</div>
                <div class="metric-details">Total execution time</div>
            </div>
            
            <div class="summary-card ${this.summary.criticalIssues.length === 0 ? 'success' : 'warning'}">
                <h3>Critical Issues</h3>
                <div class="metric-value">${this.summary.criticalIssues.length}</div>
                <div class="metric-details">Issues requiring attention</div>
            </div>
            
            <div class="summary-card ${this.summary.hipaaCompliant ? 'success' : 'failure'}">
                <h3>HIPAA Compliance</h3>
                <div class="metric-value">${this.summary.hipaaCompliant ? 'PASS' : 'FAIL'}</div>
                <div class="metric-details">Healthcare compliance status</div>
            </div>
        </div>
        
        ${this.summary.criticalIssues.length > 0 ? `
        <div class="critical-issues">
            <h3>Critical Issues Found</h3>
            <ul>
                ${this.summary.criticalIssues.map(issue => `<li>${issue}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
    </section>`;
  }

  generateHealthcareMetrics() {
    const healthcareMetrics = this.extractHealthcareMetrics();
    
    return `
    <section class="healthcare-metrics">
        <h2>Healthcare-Specific Performance Metrics</h2>
        <div class="metrics-grid">
            ${healthcareMetrics.map(metric => `
            <div class="metric-card ${metric.status}">
                <h3>${metric.name}</h3>
                <div class="metric-value">${metric.value}</div>
                <div class="metric-target">Target: ${metric.target}</div>
                <div class="metric-description">${metric.description}</div>
            </div>
            `).join('')}
        </div>
    </section>`;
  }

  extractHealthcareMetrics() {
    const metrics = [];
    
    // Calculate average response time across all tests
    let totalResponseTimes = [];
    let totalErrorRates = [];
    let totalAvailability = [];
    
    for (const test of this.testResults) {
      if (test.metrics.http_req_duration) {
        totalResponseTimes.push(test.metrics.http_req_duration.p95);
      }
      
      if (test.metrics.http_req_failed) {
        totalErrorRates.push(test.metrics.http_req_failed.avg);
      }
      
      if (test.metrics.checks) {
        totalAvailability.push(test.metrics.checks.avg);
      }
    }
    
    if (totalResponseTimes.length > 0) {
      const avgResponseTime = totalResponseTimes.reduce((a, b) => a + b, 0) / totalResponseTimes.length;
      metrics.push({
        name: 'Average Response Time',
        value: `${avgResponseTime.toFixed(2)}ms`,
        target: '<500ms',
        status: avgResponseTime < 500 ? 'success' : 'failure',
        description: 'Critical for patient care workflows'
      });
    }
    
    if (totalErrorRates.length > 0) {
      const avgErrorRate = totalErrorRates.reduce((a, b) => a + b, 0) / totalErrorRates.length;
      metrics.push({
        name: 'System Error Rate',
        value: `${(avgErrorRate * 100).toFixed(2)}%`,
        target: '<1%',
        status: avgErrorRate < 0.01 ? 'success' : 'failure',
        description: 'System reliability for healthcare operations'
      });
    }
    
    if (totalAvailability.length > 0) {
      const avgAvailability = totalAvailability.reduce((a, b) => a + b, 0) / totalAvailability.length;
      metrics.push({
        name: 'System Availability',
        value: `${(avgAvailability * 100).toFixed(2)}%`,
        target: '>99%',
        status: avgAvailability > 0.99 ? 'success' : 'failure',
        description: 'Uptime for mental health services'
      });
    }
    
    return metrics;
  }

  generateTestResults() {
    return `
    <section class="test-results">
        <h2>Detailed Test Results</h2>
        ${this.testResults.map(test => `
        <div class="test-result">
            <h3>${test.testName}</h3>
            <div class="test-metrics">
                ${this.generateTestMetrics(test)}
            </div>
        </div>
        `).join('')}
    </section>`;
  }

  generateTestMetrics(test) {
    const keyMetrics = ['http_req_duration', 'http_req_failed', 'http_reqs', 'checks'];
    
    return keyMetrics
      .filter(metric => test.metrics[metric])
      .map(metric => {
        const data = test.metrics[metric];
        return `
        <div class="metric">
            <span class="metric-name">${metric.replace(/_/g, ' ').toUpperCase()}</span>
            <span class="metric-value">
                ${metric.includes('duration') ? `${data.p95.toFixed(2)}ms (p95)` :
                  metric.includes('failed') ? `${(data.avg * 100).toFixed(2)}%` :
                  metric.includes('reqs') && !metric.includes('failed') ? `${data.values.length} requests` :
                  `${(data.avg * 100).toFixed(2)}%`}
            </span>
        </div>`;
      }).join('');
  }

  generateCharts() {
    return `
    <section class="charts">
        <h2>Performance Charts</h2>
        <div class="charts-grid">
            <div class="chart-container">
                <canvas id="responseTimeChart"></canvas>
            </div>
            <div class="chart-container">
                <canvas id="errorRateChart"></canvas>
            </div>
        </div>
    </section>`;
  }

  generateFooter() {
    return `
    <footer class="footer">
        <p>Generated by Project-H Load Testing Suite</p>
        <p>Report includes HIPAA compliance validation and healthcare-specific SLA monitoring</p>
        <p>For questions or support, contact the development team</p>
    </footer>`;
  }

  formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  getCSS() {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 10px;
            margin-bottom: 2rem;
            text-align: center;
            position: relative;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        
        .subtitle {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .compliance-badge {
            position: absolute;
            top: 1rem;
            right: 1rem;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9rem;
        }
        
        .hipaa-compliant {
            background: #10b981;
            color: white;
        }
        
        .hipaa-violation {
            background: #ef4444;
            color: white;
        }
        
        .summary {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            margin-bottom: 2rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .summary h2 {
            margin-bottom: 1.5rem;
            color: #2d3748;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .summary-card {
            background: #f8fafc;
            padding: 1.5rem;
            border-radius: 8px;
            border-left: 4px solid #e2e8f0;
            transition: transform 0.2s;
        }
        
        .summary-card:hover {
            transform: translateY(-2px);
        }
        
        .summary-card.success {
            border-left-color: #10b981;
        }
        
        .summary-card.failure {
            border-left-color: #ef4444;
        }
        
        .summary-card.warning {
            border-left-color: #f59e0b;
        }
        
        .summary-card h3 {
            color: #4a5568;
            margin-bottom: 0.5rem;
            font-size: 1rem;
        }
        
        .metric-value {
            font-size: 2rem;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 0.25rem;
        }
        
        .metric-details {
            color: #718096;
            font-size: 0.9rem;
        }
        
        .critical-issues {
            background: #fef2f2;
            border: 1px solid #fecaca;
            padding: 1.5rem;
            border-radius: 8px;
        }
        
        .critical-issues h3 {
            color: #dc2626;
            margin-bottom: 1rem;
        }
        
        .critical-issues ul {
            list-style-type: none;
        }
        
        .critical-issues li {
            padding: 0.5rem 0;
            border-bottom: 1px solid #fecaca;
            color: #b91c1c;
        }
        
        .critical-issues li:before {
            content: '⚠️ ';
            margin-right: 0.5rem;
        }
        
        .healthcare-metrics {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            margin-bottom: 2rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }
        
        .metric-card {
            padding: 1.5rem;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .metric-card.success {
            background: #f0fdf4;
            border-color: #bbf7d0;
        }
        
        .metric-card.failure {
            background: #fef2f2;
            border-color: #fecaca;
        }
        
        .metric-card h3 {
            margin-bottom: 0.5rem;
            color: #374151;
        }
        
        .metric-target {
            font-size: 0.9rem;
            color: #6b7280;
            margin: 0.25rem 0;
        }
        
        .metric-description {
            font-size: 0.8rem;
            color: #9ca3af;
        }
        
        .test-results {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            margin-bottom: 2rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .test-result {
            margin-bottom: 2rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .test-result:last-child {
            border-bottom: none;
        }
        
        .test-result h3 {
            margin-bottom: 1rem;
            color: #2d3748;
        }
        
        .test-metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
        }
        
        .metric {
            display: flex;
            justify-content: space-between;
            padding: 0.75rem;
            background: #f8fafc;
            border-radius: 6px;
        }
        
        .metric-name {
            font-weight: 600;
            color: #4a5568;
        }
        
        .charts {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            margin-bottom: 2rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 2rem;
        }
        
        .chart-container {
            position: relative;
            height: 300px;
        }
        
        .footer {
            background: #2d3748;
            color: white;
            padding: 2rem;
            border-radius: 10px;
            text-align: center;
        }
        
        .footer p {
            margin-bottom: 0.5rem;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .header h1 {
                font-size: 1.8rem;
            }
            
            .compliance-badge {
                position: static;
                margin-top: 1rem;
                display: inline-block;
            }
            
            .charts-grid {
                grid-template-columns: 1fr;
            }
        }
    `;
  }

  getJavaScript() {
    const chartData = this.prepareChartData();
    
    return `
        // Chart data
        const chartData = ${JSON.stringify(chartData)};
        
        // Response Time Chart
        const responseTimeCtx = document.getElementById('responseTimeChart').getContext('2d');
        new Chart(responseTimeCtx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Response Time (p95)',
                    data: chartData.responseTimes,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Response Time Trends (p95)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Time (ms)'
                        }
                    }
                }
            }
        });
        
        // Error Rate Chart
        const errorRateCtx = document.getElementById('errorRateChart').getContext('2d');
        new Chart(errorRateCtx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Error Rate (%)',
                    data: chartData.errorRates,
                    backgroundColor: chartData.errorRates.map(rate => 
                        rate > 5 ? '#ef4444' : rate > 1 ? '#f59e0b' : '#10b981'
                    )
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Error Rate by Test'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Error Rate (%)'
                        }
                    }
                }
            }
        });
    `;
  }

  prepareChartData() {
    const labels = this.testResults.map(test => test.testName);
    const responseTimes = this.testResults.map(test => 
      test.metrics.http_req_duration ? test.metrics.http_req_duration.p95 : 0
    );
    const errorRates = this.testResults.map(test => 
      test.metrics.http_req_failed ? test.metrics.http_req_failed.avg * 100 : 0
    );
    
    return { labels, responseTimes, errorRates };
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node generate-html-report.js <results-directory> <output-file>');
    process.exit(1);
  }
  
  const [resultsDir, outputFile] = args;
  
  if (!fs.existsSync(resultsDir)) {
    console.error(`Results directory not found: ${resultsDir}`);
    process.exit(1);
  }
  
  const generator = new HTMLReportGenerator(resultsDir, outputFile);
  const success = await generator.generateReport();
  
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = HTMLReportGenerator;