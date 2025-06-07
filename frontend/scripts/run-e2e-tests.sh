#!/bin/bash

# E2E Test Runner Script for Project-H
# This script provides various options for running Playwright E2E tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

# Function to display usage
show_usage() {
    echo "E2E Test Runner for Project-H"
    echo ""
    echo "Usage: ./scripts/run-e2e-tests.sh [command] [options]"
    echo ""
    echo "Commands:"
    echo "  all             Run all E2E tests"
    echo "  smoke           Run smoke tests only"
    echo "  auth            Run authentication tests"
    echo "  appointments    Run appointment tests"
    echo "  providers       Run provider tests"
    echo "  waitlist        Run waitlist tests"
    echo "  notifications   Run notification tests"
    echo "  accessibility   Run accessibility tests"
    echo "  debug           Run tests in debug mode"
    echo "  ui              Run tests in UI mode"
    echo "  install         Install Playwright browsers"
    echo "  report          Show last test report"
    echo "  clean           Clean test artifacts"
    echo ""
    echo "Options:"
    echo "  --headed        Run tests in headed mode"
    echo "  --browser       Specify browser (chromium, firefox, webkit)"
    echo "  --workers       Number of parallel workers"
    echo "  --retries       Number of retries"
    echo ""
}

# Parse command
COMMAND=${1:-all}
shift || true

# Parse options
HEADED=""
BROWSER=""
WORKERS=""
RETRIES=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --headed)
            HEADED="--headed"
            shift
            ;;
        --browser)
            BROWSER="--browser=$2"
            shift 2
            ;;
        --workers)
            WORKERS="--workers=$2"
            shift 2
            ;;
        --retries)
            RETRIES="--retries=$2"
            shift 2
            ;;
        *)
            print_color $RED "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Build options string
OPTIONS="$HEADED $BROWSER $WORKERS $RETRIES"

# Execute command
case $COMMAND in
    all)
        print_color $BLUE "Running all E2E tests..."
        npm run test:e2e -- $OPTIONS
        ;;
    smoke)
        print_color $BLUE "Running smoke tests..."
        npx playwright test tests/e2e/smoke.spec.ts $OPTIONS
        ;;
    auth)
        print_color $BLUE "Running authentication tests..."
        npm run test:e2e:auth -- $OPTIONS
        ;;
    appointments)
        print_color $BLUE "Running appointment tests..."
        npm run test:e2e:appointments -- $OPTIONS
        ;;
    providers)
        print_color $BLUE "Running provider tests..."
        npm run test:e2e:providers -- $OPTIONS
        ;;
    waitlist)
        print_color $BLUE "Running waitlist tests..."
        npm run test:e2e:waitlist -- $OPTIONS
        ;;
    notifications)
        print_color $BLUE "Running notification tests..."
        npm run test:e2e:notifications -- $OPTIONS
        ;;
    accessibility)
        print_color $BLUE "Running accessibility tests..."
        npm run test:e2e:accessibility -- $OPTIONS
        ;;
    debug)
        print_color $YELLOW "Running tests in debug mode..."
        npm run test:e2e:debug
        ;;
    ui)
        print_color $YELLOW "Opening Playwright UI..."
        npm run test:e2e:ui
        ;;
    install)
        print_color $BLUE "Installing Playwright browsers..."
        npx playwright install
        ;;
    report)
        print_color $BLUE "Opening test report..."
        npx playwright show-report
        ;;
    clean)
        print_color $YELLOW "Cleaning test artifacts..."
        rm -rf test-results/
        rm -rf playwright-report/
        rm -rf .playwright/
        print_color $GREEN "Test artifacts cleaned!"
        ;;
    help)
        show_usage
        ;;
    *)
        print_color $RED "Unknown command: $COMMAND"
        show_usage
        exit 1
        ;;
esac

# Check exit status
if [ $? -eq 0 ]; then
    print_color $GREEN "✓ Tests completed successfully!"
else
    print_color $RED "✗ Tests failed!"
    exit 1
fi