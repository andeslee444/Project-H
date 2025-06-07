# Project-H Load Testing Suite

Comprehensive K6 load testing framework for the Mental Health Practice Scheduling and Waitlist Management System.

## Overview

This testing suite provides healthcare-specific load testing scenarios with HIPAA compliance considerations, performance monitoring, and CI/CD integration.

## Quick Start

```bash
# Setup
npm run setup

# Install K6 (macOS)
npm run install-k6

# Run smoke test
npm run test:smoke

# Run load test
npm run test:load

# Generate HTML report
npm run report:html
```

## Test Scenarios

### Performance Tests
- **Smoke Test**: Basic functionality with minimal load
- **Load Test**: Normal expected load
- **Stress Test**: Beyond normal capacity
- **Spike Test**: Sudden traffic spikes
- **Volume Test**: Large data sets
- **Soak Test**: Extended duration testing

### Workflow Tests
- **Authentication**: Patient/provider login flows
- **Appointment Booking**: End-to-end booking process
- **Provider Schedule**: Schedule management operations
- **Waitlist Operations**: Waitlist management workflows
- **Notifications**: Real-time notification system

### Security Tests
- **HIPAA Compliance**: Privacy and security validation
- **Rate Limiting**: API throttling tests
- **Session Management**: Authentication persistence

## Healthcare-Specific Considerations

### HIPAA Compliance
- No real PHI in test data
- Synthetic patient data only
- Audit trail validation
- Encryption verification

### Performance SLAs
- Page load: < 2 seconds
- API response: < 500ms
- Database queries: < 200ms
- Real-time notifications: < 100ms

## Configuration

### Environment Variables
```bash
# API Configuration
K6_API_BASE_URL=http://localhost:3000/api/v1
K6_FRONTEND_URL=http://localhost:5173

# Database Configuration
K6_DB_HOST=localhost
K6_DB_PORT=5432
K6_DB_NAME=mental_health_system

# Load Testing Configuration
K6_VIRTUAL_USERS=50
K6_DURATION=5m
K6_RAMP_UP=30s
K6_RAMP_DOWN=30s

# Monitoring
K6_INFLUXDB_URL=http://localhost:8086
K6_GRAFANA_URL=http://localhost:3000
```

### Test Profiles

| Profile | VUs | Duration | Ramp-up | Use Case |
|---------|-----|----------|---------|----------|
| Smoke | 1-2 | 30s | 10s | Basic validation |
| Load | 10-50 | 5m | 1m | Normal traffic |
| Stress | 50-200 | 10m | 2m | Peak capacity |
| Spike | 1-500 | 5m | 10s | Traffic spikes |
| Soak | 20 | 1h | 5m | Stability testing |

## Directory Structure

```
load-testing/
├── config/           # Test configurations
├── scenarios/        # Test scenarios
│   ├── workflows/    # Business workflow tests
│   ├── security/     # Security-specific tests
│   └── api/          # API endpoint tests
├── utils/            # Helper utilities
├── data/             # Test data
├── results/          # Test results
├── reports/          # Generated reports
├── monitoring/       # Monitoring setup
└── scripts/          # Automation scripts
```

## CI/CD Integration

### GitHub Actions
```yaml
- name: Run Load Tests
  run: npm run test:ci
  env:
    K6_API_BASE_URL: ${{ secrets.STAGING_API_URL }}
```

### Performance Gates
- Response time P95 < 2s
- Error rate < 1%
- Throughput > 100 RPS
- Memory usage < 80%

## Monitoring & Reporting

### Real-time Monitoring
- InfluxDB for metrics storage
- Grafana for visualization
- Slack/email alerts for failures

### Reports
- HTML summary reports
- Trend analysis
- Performance regression detection
- SLA compliance reporting

## Best Practices

### Healthcare-Specific
1. Use synthetic data only
2. Respect rate limiting
3. Test during off-peak hours
4. Monitor patient privacy
5. Validate audit trails

### Performance Testing
1. Start with smoke tests
2. Establish baselines
3. Test incrementally
4. Monitor system resources
5. Document findings

## Security Considerations

### Test Data
- Synthetic patient records
- Anonymized provider data
- Randomized scheduling data
- HIPAA-compliant test scenarios

### Access Control
- Role-based test accounts
- Limited test permissions
- Secure credential management
- Audit trail monitoring

## Troubleshooting

### Common Issues
1. **High error rates**: Check API endpoints and rate limits
2. **Slow responses**: Monitor database performance
3. **Memory leaks**: Check long-running soak tests
4. **Network issues**: Validate connectivity and DNS

### Debug Commands
```bash
# Verbose output
k6 run --verbose scenarios/load-test.js

# Debug HTTP requests
k6 run --http-debug scenarios/load-test.js

# Custom log level
k6 run --log-level debug scenarios/load-test.js
```

## Contributing

1. Add new scenarios in `/scenarios`
2. Update configurations in `/config`
3. Add helper functions in `/utils`
4. Document test procedures
5. Follow naming conventions

## Support

For issues and questions:
- Check the troubleshooting guide
- Review test logs in `/results`
- Monitor system metrics
- Contact the development team