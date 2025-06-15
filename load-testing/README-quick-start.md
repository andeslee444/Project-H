# Load Testing Quick Start Guide

## Prerequisites

1. Install K6:
```bash
# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo 'deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main' | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6
```

2. Install dependencies:
```bash
cd load-testing
npm install
```

## Running Tests

### Frontend Tests (Currently Available)

The frontend smoke test validates basic frontend availability and performance:

```bash
# Make sure frontend is running
cd ../frontend
npm run dev

# In another terminal, run the test
cd load-testing
k6 run scenarios/frontend-smoke-test.js
```

### Backend Tests (Requires Backend Setup)

The comprehensive load tests require the backend API to be running:

```bash
# Start backend (not currently set up)
cd ../backend
npm start

# Run tests
cd load-testing
npm run test:smoke    # Basic functionality test
npm run test:load     # Standard load test
npm run test:stress   # Stress test
```

## Test Results

After running tests, you'll see:
- ✓ Pass/fail status for each check
- Response time metrics (avg, min, max, p95)
- Request rate and data transfer stats
- Error rates

### Example Output
```
✓ Home Page - Status is 200
✓ Home Page - Response time < 2s
✓ Home Page - Has HTML content

http_req_duration: avg=4.11ms p(95)=5.68ms
http_req_failed: 0.00%
```

## Customizing Tests

Edit test configurations in `config/` directory:
- `smoke.json` - Basic functionality tests
- `load.json` - Normal load scenarios
- `stress.json` - High load scenarios

## Monitoring

For real-time monitoring, set up Grafana:
```bash
npm run report:grafana
```

Then access Grafana at http://localhost:3000 (default credentials: admin/admin)

## Troubleshooting

1. **K6 not found**: Make sure K6 is installed and in your PATH
2. **Frontend not accessible**: Ensure the frontend is running on port 3000
3. **Backend tests failing**: Backend server needs to be configured and running

## Next Steps

1. Set up the backend API server
2. Configure database connections
3. Add more comprehensive test scenarios
4. Set up continuous integration testing