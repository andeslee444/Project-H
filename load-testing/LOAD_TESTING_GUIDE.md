# Project-H Load Testing Implementation Guide

## Overview

This comprehensive load testing suite is specifically designed for the Project-H Mental Health Practice Scheduling and Waitlist Management System. It provides healthcare-specific testing scenarios with HIPAA compliance validation, performance monitoring, and CI/CD integration.

## 🏥 Healthcare-Specific Features

### HIPAA Compliance Testing
- **Synthetic Data Only**: No real PHI is used in any tests
- **Audit Trail Validation**: Every test action is logged and auditable
- **Security Headers Check**: Validates proper security headers are present
- **Data Encryption Verification**: Ensures all communications are encrypted
- **Access Control Testing**: Validates role-based access controls

### Healthcare Performance SLAs
- **Critical Workflows**: Response time < 200ms, 99.9% availability
- **Standard Workflows**: Response time < 500ms, 99% availability  
- **Non-Critical Workflows**: Response time < 2000ms, 95% availability

### Medical Workflow Testing
- Patient registration and authentication flows
- Provider schedule management and availability
- Appointment booking and modification workflows
- Waitlist management and matching algorithms
- Real-time notification systems

## 🚀 Quick Start

### Prerequisites
```bash
# Install Node.js (v16+)
# Install K6 load testing tool
npm run install-k6

# Setup test environment
npm install
npm run setup
```

### Basic Usage
```bash
# Run smoke test (basic validation)
npm run test:smoke

# Run normal load test
npm run test:load

# Run stress test
npm run test:stress

# Run all workflow tests
npm run test:workflows

# Run HIPAA compliance test
npm run test:hipaa
```

### Generate Reports
```bash
# Generate HTML report
npm run report:html

# Start monitoring dashboard
npm run report:grafana
```

## 📁 Directory Structure

```
load-testing/
├── config/              # Test configurations
│   ├── smoke.json       # Smoke test settings
│   ├── load.json        # Load test settings
│   ├── stress.json      # Stress test settings
│   ├── spike.json       # Spike test settings
│   └── soak.json        # Soak test settings
│
├── scenarios/           # Test scenarios
│   ├── smoke-test.js    # Basic functionality validation
│   ├── load-test.js     # Normal load simulation
│   ├── stress-test.js   # Beyond capacity testing
│   ├── workflows/       # Business workflow tests
│   │   ├── auth-workflow.js
│   │   ├── appointment-booking.js
│   │   ├── provider-schedule.js
│   │   ├── waitlist-operations.js
│   │   └── notification-system.js
│   └── security/        # Security-specific tests
│       └── hipaa-compliance.js
│
├── utils/              # Helper utilities
│   ├── config.js       # Configuration and SLAs
│   ├── auth.js         # Authentication helpers
│   └── test-data.js    # Test data generation
│
├── data/               # Generated test data
│   ├── credentials/    # Test user credentials
│   ├── patients.json   # Synthetic patient data
│   ├── providers.json  # Synthetic provider data
│   └── appointments.json
│
├── results/            # Test results
├── reports/            # Generated reports
├── monitoring/         # Monitoring stack
│   ├── docker-compose.yml
│   └── grafana/        # Dashboard configs
│
└── scripts/            # Automation scripts
    ├── run-load-tests.sh
    ├── setup-test-data.js
    └── generate-html-report.js
```

## 🧪 Test Scenarios

### 1. Smoke Tests
**Purpose**: Basic functionality validation with minimal load
- Health check endpoints
- Authentication system
- Basic CRUD operations
- HIPAA compliance headers

**Usage**:
```bash
npm run test:smoke
```

### 2. Load Tests
**Purpose**: Normal expected load simulation
- 25 concurrent users
- Patient registration and booking flows
- Provider schedule management
- Real-time notifications

**Usage**:
```bash
npm run test:load
```

### 3. Stress Tests
**Purpose**: Beyond normal capacity testing
- Up to 200 concurrent users
- System breaking point identification
- Recovery behavior validation

**Usage**:
```bash
npm run test:stress
```

### 4. Workflow Tests
**Purpose**: Healthcare-specific business workflows

#### Authentication Workflow
- Patient registration and login
- Provider authentication
- Admin access patterns
- Token refresh and session management

#### Appointment Booking Workflow
- Provider search and availability
- Appointment booking and confirmation
- Modification and cancellation flows
- Conflict resolution

#### Provider Schedule Workflow
- Schedule management
- Availability updates
- Appointment request handling

#### Waitlist Operations Workflow
- Waitlist joining and management
- Matching algorithms
- Priority-based queuing

#### Notification System Workflow
- Real-time notifications
- Email and SMS delivery
- Preference management

**Usage**:
```bash
npm run test:workflows
npm run test:auth
npm run test:booking
```

### 5. HIPAA Compliance Tests
**Purpose**: Healthcare security and privacy validation
- PHI protection verification
- Audit trail validation
- Security header checks
- Access control testing

**Usage**:
```bash
npm run test:hipaa
```

## 📊 Performance Monitoring

### Real-time Dashboards
The monitoring stack includes:
- **Grafana**: Visual dashboards for metrics
- **InfluxDB**: Time-series data storage
- **Prometheus**: System metrics collection
- **ElasticSearch**: Log aggregation

**Start Monitoring**:
```bash
cd monitoring
docker-compose up -d

# Access dashboards
open http://localhost:3000  # Grafana
open http://localhost:9090  # Prometheus
open http://localhost:5601  # Kibana
```

### Key Metrics Tracked
- **Response Times**: p50, p95, p99 percentiles
- **Error Rates**: HTTP errors and application failures
- **Throughput**: Requests per second
- **Availability**: System uptime and health
- **HIPAA Compliance**: Security validation counts
- **Business Metrics**: Booking success rates, waitlist performance

## 🔧 Configuration

### Environment Variables
```bash
# API Configuration
K6_API_BASE_URL=http://localhost:3000/api/v1
K6_FRONTEND_URL=http://localhost:5173

# Load Testing Configuration
K6_VIRTUAL_USERS=50
K6_DURATION=5m
K6_RAMP_UP=30s

# Performance Thresholds
MAX_RESPONSE_TIME=2000
MAX_ERROR_RATE=0.05
MIN_SUCCESS_RATE=0.95

# Monitoring
K6_INFLUXDB_URL=http://localhost:8086
SLACK_WEBHOOK_URL=your-slack-webhook
```

### Test Profiles

| Profile | VUs | Duration | Use Case |
|---------|-----|----------|----------|
| Smoke | 1-2 | 30s | Basic validation |
| Load | 10-50 | 5m | Normal traffic |
| Stress | 50-200 | 10m | Peak capacity |
| Spike | 1-500 | 5m | Traffic spikes |
| Soak | 20 | 1h | Stability testing |

## 🔄 CI/CD Integration

### GitHub Actions
Load testing is integrated into the CI/CD pipeline with the following triggers:
- **Pull Requests**: Smoke tests
- **Main Branch**: Load and workflow tests
- **Scheduled**: Daily comprehensive testing
- **Manual**: All test types with environment selection

### Pipeline Configuration
See `.github/workflows/load-testing.yml` for the complete pipeline configuration.

**Manual Trigger**:
```bash
# Via GitHub Actions UI
# Select test type: smoke, load, stress, workflows, hipaa, all
# Select environment: staging, production
```

### Performance Gates
- Response time P95 < 2s
- Error rate < 1%
- Throughput > 100 RPS
- HIPAA compliance: 100%

## 📈 Reporting

### HTML Reports
Comprehensive HTML reports are generated after each test run:
```bash
npm run report:html
```

**Report Includes**:
- Executive summary with pass/fail status
- Healthcare-specific SLA compliance
- Performance trends and charts
- HIPAA compliance status
- Critical issues and recommendations

### Real-time Monitoring
- **Grafana Dashboards**: Visual metrics and alerts
- **Slack Notifications**: Test results and alerts
- **Email Reports**: Detailed performance summaries

## 🛡️ Security & Compliance

### HIPAA Compliance
- All test data is synthetic and HIPAA-compliant
- No real PHI is used in any testing scenarios
- Audit trails are maintained for all test activities
- Security headers and encryption are validated

### Test Data Security
- Synthetic user accounts with randomized data
- No real patient or provider information
- Automated cleanup of test data after runs
- Secure credential management

### Access Control
- Role-based test scenarios (patient, provider, admin)
- Permission validation in workflows
- Authentication and authorization testing

## 🚨 Troubleshooting

### Common Issues

#### High Error Rates
1. Check API endpoint availability
2. Verify rate limiting configuration
3. Monitor system resources
4. Review application logs

#### Slow Response Times
1. Monitor database performance
2. Check network connectivity
3. Review caching mechanisms
4. Analyze query performance

#### HIPAA Compliance Failures
1. Verify security headers
2. Check audit trail logging
3. Validate data encryption
4. Review access controls

### Debug Commands
```bash
# Verbose K6 output
k6 run --verbose scenarios/load-test.js

# HTTP request debugging
k6 run --http-debug scenarios/load-test.js

# Custom log level
k6 run --log-level debug scenarios/load-test.js
```

### Log Locations
- **K6 Results**: `./results/`
- **HTML Reports**: `./reports/`
- **Monitoring Logs**: `./monitoring/logs/`
- **CI/CD Logs**: GitHub Actions artifacts

## 🔮 Advanced Usage

### Custom Test Scenarios
Create custom test scenarios for specific use cases:

```javascript
// custom-scenario.js
import { check, sleep } from 'k6';
import { CONFIG } from '../utils/config.js';

export let options = {
  scenarios: {
    custom_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 10 },
        { duration: '5m', target: 10 },
        { duration: '2m', target: 0 }
      ]
    }
  }
};

export default function() {
  // Your custom test logic here
}
```

### Performance Regression Testing
```bash
# Compare against baseline
node scripts/check-performance-regression.js results/
```

### Capacity Planning
```bash
# Run capacity planning scenarios
npm run test:capacity
```

## 📚 Best Practices

### Healthcare-Specific Guidelines
1. **Use Synthetic Data Only**: Never use real patient information
2. **Respect Rate Limits**: Follow API throttling guidelines
3. **Test During Off-Peak**: Minimize impact on production
4. **Monitor Patient Privacy**: Ensure no PHI exposure
5. **Validate Audit Trails**: Confirm all actions are logged

### Performance Testing Guidelines
1. **Start Small**: Begin with smoke tests
2. **Establish Baselines**: Record performance benchmarks
3. **Test Incrementally**: Gradually increase load
4. **Monitor Resources**: Watch system metrics
5. **Document Findings**: Record insights and improvements

### Test Design Principles
1. **Realistic Scenarios**: Mirror actual user behavior
2. **Data Variety**: Use diverse test data sets
3. **Error Handling**: Test failure scenarios
4. **Recovery Testing**: Validate system recovery
5. **Continuous Monitoring**: Track performance trends

## 🆘 Support

### Getting Help
1. **Documentation**: Review this guide and inline comments
2. **Logs**: Check test results and monitoring data
3. **Issues**: Create GitHub issues for bugs
4. **Team Contact**: Reach out to the development team

### Contributing
1. Add new test scenarios in `/scenarios`
2. Update configurations in `/config`
3. Enhance utilities in `/utils`
4. Improve documentation
5. Follow naming conventions

### Resources
- [K6 Documentation](https://k6.io/docs/)
- [HIPAA Guidelines](https://www.hhs.gov/hipaa/)
- [Healthcare Performance Standards](https://www.healthit.gov/)
- [Project-H Architecture Docs](../docs/)

---

## 📋 Checklist for Load Testing

### Pre-Test Setup
- [ ] Environment is stable and healthy
- [ ] Test data is generated and valid
- [ ] Monitoring systems are running
- [ ] Baseline performance is established
- [ ] HIPAA compliance is verified

### During Testing
- [ ] Monitor system resources
- [ ] Watch for error patterns
- [ ] Track performance metrics
- [ ] Validate HIPAA compliance
- [ ] Document any issues

### Post-Test Analysis
- [ ] Generate comprehensive reports
- [ ] Analyze performance trends
- [ ] Identify improvement areas
- [ ] Update performance baselines
- [ ] Share results with team

### Compliance Verification
- [ ] No real PHI used in tests
- [ ] Audit trails are complete
- [ ] Security measures validated
- [ ] Access controls verified
- [ ] Data encryption confirmed

---

*This load testing suite ensures Project-H meets healthcare performance and compliance requirements while providing comprehensive monitoring and reporting capabilities.*