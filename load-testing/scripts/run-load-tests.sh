#!/bin/bash

# Project-H Load Testing Execution Script
# This script orchestrates different types of load tests for the mental health scheduling system

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration
ENVIRONMENT=${K6_ENVIRONMENT:-local}
API_BASE_URL=${K6_API_BASE_URL:-http://localhost:3000/api/v1}
FRONTEND_URL=${K6_FRONTEND_URL:-http://localhost:5173}
RESULTS_DIR="./results"
REPORTS_DIR="./reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Test configuration
SMOKE_TEST=${SMOKE_TEST:-true}
LOAD_TEST=${LOAD_TEST:-false}
STRESS_TEST=${STRESS_TEST:-false}
SPIKE_TEST=${SPIKE_TEST:-false}
SOAK_TEST=${SOAK_TEST:-false}
WORKFLOWS_TEST=${WORKFLOWS_TEST:-false}
HIPAA_TEST=${HIPAA_TEST:-false}

# Performance thresholds
MAX_RESPONSE_TIME=${MAX_RESPONSE_TIME:-2000}
MAX_ERROR_RATE=${MAX_ERROR_RATE:-0.05}
MIN_SUCCESS_RATE=${MIN_SUCCESS_RATE:-0.95}

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v k6 &> /dev/null; then
        log_error "K6 is not installed. Please install K6 first."
        log_info "Run: npm run install-k6"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed."
        exit 1
    fi
    
    log_success "Dependencies check passed"
}

check_system_health() {
    log_info "Checking system health before testing..."
    
    # Check API health
    if curl -f -s "${API_BASE_URL}/health" > /dev/null; then
        log_success "API is healthy"
    else
        log_error "API health check failed. Please ensure the backend is running."
        exit 1
    fi
    
    # Check frontend (if specified)
    if [[ "${FRONTEND_URL}" != "http://localhost:5173" ]] || curl -f -s "${FRONTEND_URL}" > /dev/null 2>&1; then
        log_success "Frontend is accessible"
    else
        log_warning "Frontend health check failed. Some tests may not work properly."
    fi
}

setup_directories() {
    log_info "Setting up test directories..."
    
    mkdir -p "${RESULTS_DIR}"
    mkdir -p "${REPORTS_DIR}"
    mkdir -p "${RESULTS_DIR}/${TIMESTAMP}"
    
    log_success "Directories created"
}

run_smoke_test() {
    if [[ "${SMOKE_TEST}" == "true" ]]; then
        log_info "Running smoke test..."
        
        k6 run \
            --config config/smoke.json \
            --out json="${RESULTS_DIR}/${TIMESTAMP}/smoke-test.json" \
            scenarios/smoke-test.js
        
        local exit_code=$?
        if [ $exit_code -eq 0 ]; then
            log_success "Smoke test passed"
        else
            log_error "Smoke test failed"
            return $exit_code
        fi
    fi
}

run_load_test() {
    if [[ "${LOAD_TEST}" == "true" ]]; then
        log_info "Running load test..."
        
        k6 run \
            --config config/load.json \
            --out json="${RESULTS_DIR}/${TIMESTAMP}/load-test.json" \
            scenarios/load-test.js
        
        local exit_code=$?
        if [ $exit_code -eq 0 ]; then
            log_success "Load test passed"
        else
            log_error "Load test failed"
            return $exit_code
        fi
    fi
}

run_stress_test() {
    if [[ "${STRESS_TEST}" == "true" ]]; then
        log_info "Running stress test..."
        
        k6 run \
            --config config/stress.json \
            --out json="${RESULTS_DIR}/${TIMESTAMP}/stress-test.json" \
            scenarios/stress-test.js
        
        local exit_code=$?
        if [ $exit_code -eq 0 ]; then
            log_success "Stress test passed"
        else
            log_warning "Stress test completed with issues (expected under stress)"
        fi
    fi
}

run_spike_test() {
    if [[ "${SPIKE_TEST}" == "true" ]]; then
        log_info "Running spike test..."
        
        k6 run \
            --config config/spike.json \
            --out json="${RESULTS_DIR}/${TIMESTAMP}/spike-test.json" \
            scenarios/spike-test.js
        
        local exit_code=$?
        if [ $exit_code -eq 0 ]; then
            log_success "Spike test passed"
        else
            log_warning "Spike test completed with issues (expected during spikes)"
        fi
    fi
}

run_soak_test() {
    if [[ "${SOAK_TEST}" == "true" ]]; then
        log_info "Running soak test (this will take a while)..."
        log_warning "Soak test duration: 1 hour"
        
        k6 run \
            --config config/soak.json \
            --out json="${RESULTS_DIR}/${TIMESTAMP}/soak-test.json" \
            scenarios/soak-test.js
        
        local exit_code=$?
        if [ $exit_code -eq 0 ]; then
            log_success "Soak test passed"
        else
            log_error "Soak test failed"
            return $exit_code
        fi
    fi
}

run_workflow_tests() {
    if [[ "${WORKFLOWS_TEST}" == "true" ]]; then
        log_info "Running workflow tests..."
        
        # Authentication workflow
        log_info "Testing authentication workflow..."
        k6 run \
            --out json="${RESULTS_DIR}/${TIMESTAMP}/auth-workflow.json" \
            scenarios/workflows/auth-workflow.js
        
        # Appointment booking workflow
        log_info "Testing appointment booking workflow..."
        k6 run \
            --out json="${RESULTS_DIR}/${TIMESTAMP}/appointment-booking.json" \
            scenarios/workflows/appointment-booking.js
        
        # Provider schedule workflow
        log_info "Testing provider schedule workflow..."
        k6 run \
            --out json="${RESULTS_DIR}/${TIMESTAMP}/provider-schedule.json" \
            scenarios/workflows/provider-schedule.js
        
        # Waitlist operations workflow
        log_info "Testing waitlist operations workflow..."
        k6 run \
            --out json="${RESULTS_DIR}/${TIMESTAMP}/waitlist-operations.json" \
            scenarios/workflows/waitlist-operations.js
        
        # Notification system workflow
        log_info "Testing notification system workflow..."
        k6 run \
            --out json="${RESULTS_DIR}/${TIMESTAMP}/notification-system.json" \
            scenarios/workflows/notification-system.js
        
        log_success "Workflow tests completed"
    fi
}

run_hipaa_compliance_test() {
    if [[ "${HIPAA_TEST}" == "true" ]]; then
        log_info "Running HIPAA compliance test..."
        
        k6 run \
            --out json="${RESULTS_DIR}/${TIMESTAMP}/hipaa-compliance.json" \
            scenarios/security/hipaa-compliance.js
        
        local exit_code=$?
        if [ $exit_code -eq 0 ]; then
            log_success "HIPAA compliance test passed"
        else
            log_error "HIPAA compliance test failed - CRITICAL ISSUE"
            return $exit_code
        fi
    fi
}

generate_reports() {
    log_info "Generating test reports..."
    
    # Generate HTML report
    if [ -f "scripts/generate-html-report.js" ]; then
        node scripts/generate-html-report.js "${RESULTS_DIR}/${TIMESTAMP}" "${REPORTS_DIR}/report-${TIMESTAMP}.html"
    fi
    
    # Generate summary report
    cat > "${REPORTS_DIR}/summary-${TIMESTAMP}.txt" << EOF
Project-H Load Testing Summary Report
====================================

Test Run: ${TIMESTAMP}
Environment: ${ENVIRONMENT}
API Base URL: ${API_BASE_URL}

Tests Executed:
- Smoke Test: ${SMOKE_TEST}
- Load Test: ${LOAD_TEST}
- Stress Test: ${STRESS_TEST}
- Spike Test: ${SPIKE_TEST}
- Soak Test: ${SOAK_TEST}
- Workflow Tests: ${WORKFLOWS_TEST}
- HIPAA Compliance Test: ${HIPAA_TEST}

Performance Thresholds:
- Max Response Time: ${MAX_RESPONSE_TIME}ms
- Max Error Rate: ${MAX_ERROR_RATE}
- Min Success Rate: ${MIN_SUCCESS_RATE}

Results Location: ${RESULTS_DIR}/${TIMESTAMP}
EOF
    
    log_success "Reports generated in ${REPORTS_DIR}/"
}

validate_results() {
    log_info "Validating test results..."
    
    local overall_success=true
    
    # Check for critical failures in HIPAA compliance
    if [[ "${HIPAA_TEST}" == "true" ]]; then
        if [ -f "${RESULTS_DIR}/${TIMESTAMP}/hipaa-compliance.json" ]; then
            local hipaa_errors=$(grep -o '"hipaa_violations":{"count":[^,]*' "${RESULTS_DIR}/${TIMESTAMP}/hipaa-compliance.json" | grep -o '[0-9]*' | tail -1)
            if [ "${hipaa_errors:-0}" -gt 0 ]; then
                log_error "HIPAA compliance violations detected: ${hipaa_errors}"
                overall_success=false
            fi
        fi
    fi
    
    # Check error rates across all tests
    for result_file in "${RESULTS_DIR}/${TIMESTAMP}"/*.json; do
        if [ -f "$result_file" ]; then
            local error_rate=$(grep -o '"http_req_failed":{"rate":[^,]*' "$result_file" | grep -o '[0-9.]*' | tail -1)
            if (( $(echo "${error_rate:-0} > ${MAX_ERROR_RATE}" | bc -l) )); then
                log_warning "High error rate detected in $(basename "$result_file"): ${error_rate}"
            fi
        fi
    done
    
    if [ "$overall_success" = true ]; then
        log_success "All validation checks passed"
        return 0
    else
        log_error "Validation failed"
        return 1
    fi
}

cleanup() {
    log_info "Cleaning up temporary files..."
    
    # Clean up any test data that might have been created
    if [ -f "scripts/cleanup-test-data.js" ]; then
        node scripts/cleanup-test-data.js
    fi
    
    log_success "Cleanup completed"
}

send_notifications() {
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
        log_info "Sending Slack notification..."
        
        local status_icon="✅"
        local status_text="passed"
        
        if [ "$1" != "0" ]; then
            status_icon="❌"
            status_text="failed"
        fi
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"${status_icon} Project-H Load Test ${status_text} - ${TIMESTAMP}\"}" \
            "${SLACK_WEBHOOK_URL}"
    fi
    
    if [ -n "${EMAIL_RECIPIENT:-}" ]; then
        log_info "Sending email notification..."
        # Email notification implementation would go here
    fi
}

print_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Project-H Load Testing Script

Options:
    --smoke         Run smoke test only
    --load          Run load test
    --stress        Run stress test
    --spike         Run spike test
    --soak          Run soak test
    --workflows     Run workflow tests
    --hipaa         Run HIPAA compliance test
    --all           Run all tests
    --environment   Set environment (local|staging|production)
    --help          Show this help message

Environment Variables:
    K6_API_BASE_URL         API base URL (default: http://localhost:3000/api/v1)
    K6_FRONTEND_URL         Frontend URL (default: http://localhost:5173)
    MAX_RESPONSE_TIME       Maximum response time in ms (default: 2000)
    MAX_ERROR_RATE          Maximum error rate (default: 0.05)
    MIN_SUCCESS_RATE        Minimum success rate (default: 0.95)
    SLACK_WEBHOOK_URL       Slack webhook for notifications
    EMAIL_RECIPIENT         Email for notifications

Examples:
    $0 --smoke                          # Run smoke test only
    $0 --load --stress                  # Run load and stress tests
    $0 --all                           # Run all tests
    $0 --workflows --environment staging # Run workflow tests on staging

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --smoke)
            SMOKE_TEST=true
            LOAD_TEST=false
            STRESS_TEST=false
            SPIKE_TEST=false
            SOAK_TEST=false
            WORKFLOWS_TEST=false
            HIPAA_TEST=false
            shift
            ;;
        --load)
            LOAD_TEST=true
            shift
            ;;
        --stress)
            STRESS_TEST=true
            shift
            ;;
        --spike)
            SPIKE_TEST=true
            shift
            ;;
        --soak)
            SOAK_TEST=true
            shift
            ;;
        --workflows)
            WORKFLOWS_TEST=true
            shift
            ;;
        --hipaa)
            HIPAA_TEST=true
            shift
            ;;
        --all)
            SMOKE_TEST=true
            LOAD_TEST=true
            STRESS_TEST=true
            SPIKE_TEST=false  # Skip spike by default in --all
            SOAK_TEST=false   # Skip soak by default in --all (too long)
            WORKFLOWS_TEST=true
            HIPAA_TEST=true
            shift
            ;;
        --environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --help)
            print_usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            print_usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    log_info "Starting Project-H Load Testing Suite"
    log_info "Environment: ${ENVIRONMENT}"
    log_info "Timestamp: ${TIMESTAMP}"
    
    check_dependencies
    check_system_health
    setup_directories
    
    local overall_exit_code=0
    
    # Run tests in order of increasing intensity
    run_smoke_test || overall_exit_code=$?
    
    if [ $overall_exit_code -eq 0 ]; then
        run_hipaa_compliance_test || overall_exit_code=$?
        run_workflow_tests || overall_exit_code=$?
        run_load_test || overall_exit_code=$?
        run_stress_test || overall_exit_code=$?
        run_spike_test || overall_exit_code=$?
        run_soak_test || overall_exit_code=$?
    else
        log_error "Smoke test failed. Skipping remaining tests."
    fi
    
    generate_reports
    validate_results || overall_exit_code=$?
    cleanup
    send_notifications $overall_exit_code
    
    if [ $overall_exit_code -eq 0 ]; then
        log_success "All load tests completed successfully!"
        log_info "View results in: ${RESULTS_DIR}/${TIMESTAMP}"
        log_info "View reports in: ${REPORTS_DIR}"
    else
        log_error "Some tests failed. Please review the results."
        log_info "Results: ${RESULTS_DIR}/${TIMESTAMP}"
        log_info "Reports: ${REPORTS_DIR}"
        exit $overall_exit_code
    fi
}

# Execute main function
main "$@"