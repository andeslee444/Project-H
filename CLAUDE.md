# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Code Quality Rules

**Golden Rule**: Write the code as if the guy who ends up maintaining your code will be a violent psychopath who knows where you live.

**Principle**: Do not take shortcuts if there could be problems in the future, act as a L11 Google Fellow would

## Guidance for Technical Communication

- When explaining technical reasoning and other technical concepts, please explain as if the person doesn't understand code, provide metaphors

## User Directory Structure

This is a user home directory containing various projects and personal files. The main development projects are located in:
- `/Users/andeslee/Documents/Cursor-Projects/` - Contains multiple web development projects

## Development Projects Overview

### Primary Project: Cursor-Projects
Location: `/Users/andeslee/Documents/Cursor-Projects/`

This is a Vite + React + TypeScript project with the following key features:
- Uses Tailwind CSS for styling
- Redux Toolkit for state management
- Firebase integration
- Radix UI and Headless UI component libraries
- React Router for routing

### Common Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Format code
npm run format
```

## Sub-Projects in Cursor-Projects Directory

### Active Projects

1. **Project-H - Mental Health Practice Scheduling System**
   - Full-stack application for mental health practice management
   - Frontend: React + Vite, organized in `frontend/` directory
   - Backend: Node.js + Express + PostgreSQL, organized in `backend/` directory
   - Features: Waitlist management, intelligent patient-provider matching, HIPAA compliance
   - Well-documented with comprehensive docs in `docs/` directory
   - Commands:
     ```bash
     # Frontend
     cd frontend && npm run dev
     
     # Backend  
     cd backend && npm run dev
     ```

### Archived Projects (in Archive/ directory)

1. **Building Interactive Website for Stripes Venture Capital**
   - InsurTech dashboard with data visualization
   - React + TypeScript
   - GitHub Pages deployment

2. **Insurtech app**
   - E&S Market Opportunity Analyzer Dashboard
   - Multiple data analysis components
   - Python scripts for data extraction

3. **KitchenBuddy**
   - iOS app (Swift/SwiftUI)
   - Xcode project

4. **Visa Professional Fintech Insights**
   - Vite + React project
   - Tailwind CSS configuration

5. **browser-tools-mcp**
   - MCP (Model Context Protocol) server
   - Chrome extension integration
   - Puppeteer and Lighthouse integration

6. **meal-minder-guardian**
   - Next.js/React application
   - Supabase integration
   - Recipe generation features
   - Complex component structure with hooks and services

## Code Architecture Patterns

### React Projects
- Components are typically organized in `src/components/`
- Custom hooks in `src/hooks/` or `hooks/`
- Services/API calls in `src/services/`
- Type definitions in `src/types/` or `types/`
- Utility functions in `src/utils/` or `lib/`

### Testing
- Most projects appear to use Jest for testing
- Test files typically follow the pattern `*.test.ts` or `*.test.tsx`
- Some projects have `setupTests.ts` for test configuration

### State Management
- Redux Toolkit is used in the main project
- Context API is used in some sub-projects (e.g., meal-minder-guardian)

### Styling
- Tailwind CSS is the primary styling solution
- PostCSS configuration is present
- Some projects use CSS modules or styled components

## Important Notes

- Always check individual project directories for their own README.md files
- Each project may have its own specific configuration and dependencies
- When working on a specific project, navigate to its directory first
- Some projects have deployment scripts and Docker configurations
- The meal-minder-guardian project has extensive documentation about refactoring and rebuilding

## Recent Enhancements (Project-H)

### Mood Tracking System (Added 2024)
- **GitHub-style mood contributions chart** in patient dashboard
- **Interactive mood logging** with 1-10 scale and color-coded visualization
- **12-week mood history** with green-to-red color mapping
- **Connected UI**: "Log Mood" button smoothly scrolls to mood tracker section
- **Real-time insights** with streak tracking and trend analysis
- **Modal-based mood entry** with optional notes for context

**Technical Implementation:**
- `MoodTracker.jsx` component with GitHub-inspired grid layout
- Tailwind CSS for responsive design and animations
- Framer Motion for smooth interactions and modal transitions
- Local state management with mock data (ready for API integration)
- Color psychology: Green (good mood) to Red (poor mood) spectrum

## Development Todos and Checkpoints

- Add checkpoints between todos and extensive updates to:
  - Update documentation in `todo.md`
  - Update `readme.md`
  - Update `claude.local.md` or `claude.md`

## Development Tools and Best Practices

- Utilize puppeteer MCP liberally where relevant to test implemented features

## Workflow Guidance

- When errors or inconsistencies to the readme.md are found while reading or coding, add to todo.md or ask user for further guidance

## Critical Learnings for Load Testing & CI/CD (2025-06-15)

### K6 Load Testing Tool
- **K6 is NOT an npm package** - it's a standalone binary installed via system package managers
- Install via: `brew install k6` (macOS), `apt-get install k6` (Linux), `choco install k6` (Windows)
- Never add k6 to package.json dependencies - this will cause "No matching version found" errors

### GitHub Actions Workflow Dependencies
- **Always commit package-lock.json** when using npm cache in GitHub Actions
- The `cache-dependency-path` in setup-node action requires the lock file to exist
- Missing package-lock.json causes: "Some specified paths were not resolved, unable to cache dependencies"

### Load Testing Script Organization
- Keep all referenced scripts in the workflow actually exist in the repository
- Common scripts needed:
  - `generate-comprehensive-report.js` - for HTML/JSON report generation
  - `check-performance-thresholds.js` - for validating performance metrics
  - `check-performance-regression.js` - for comparing against baselines
- Make scripts executable: `chmod +x scripts/*.js`

### Git Best Practices
- **Always add .gitignore before installing dependencies**
- Common .gitignore entries for load testing:
  ```
  node_modules/
  results/
  reports/
  .env
  ```
- If node_modules gets committed accidentally:
  1. `git rm -rf node_modules/ --cached`
  2. Add .gitignore
  3. Commit the removal

### CI/CD Environment Variables
- GitHub Actions variables accessed via `${{ vars.VARIABLE_NAME }}`
- Always check if environment variables exist before using them
- Provide graceful fallbacks for missing configuration:
  ```bash
  if [ -z "${{ vars.API_BASE_URL }}" ]; then
    echo "API_BASE_URL not configured, skipping API tests"
    exit 0
  fi
  ```

### Debugging GitHub Actions
- Use `gh run view <run-id> --repo owner/repo` to see run details
- Use `gh run view <run-id> --log-failed` to see only failed logs
- Check workflow file syntax carefully - YAML is indent-sensitive

## Critical Project-H Specific Knowledge (SPEED OPTIMIZATIONS)

### Project Structure & Status
- **Frontend is deployed and working** at https://andeslee444.github.io/Project-H/
- **Backend is NOT deployed** - no API server, no database, no backend infrastructure
- **Authentication is mocked** - uses localStorage, not real auth
- **All data is mock data** - no real database connections

### Common Issues & Quick Fixes
1. **"Cannot find module" in frontend**: 
   - Always run `cd frontend && npm install` first
   - Check if import paths match actual file locations
   - Frontend uses Vite aliases: `@/` maps to `src/`

2. **GitHub Actions failures**:
   - Most workflows expect backend to exist (it doesn't)
   - Frontend-only workflows work fine
   - Always check if referenced scripts/files actually exist

3. **Package.json type issues**:
   - Frontend MUST use `"type": "module"` for Vite
   - Scripts in load-testing need CommonJS (no "type": "module")
   - Mixing these causes immediate failures

### Quick Commands for Common Tasks
```bash
# Fix most frontend issues
cd frontend && npm install && npm run dev

# Check GitHub Actions status
gh run list --repo andeslee444/Project-H --limit 5

# View failed workflow logs
gh run view <run-id> --repo andeslee444/Project-H --log-failed

# Quick git cleanup after accidental commits
git rm -rf <path> --cached && git commit --amend
```

### Time-Saving Patterns
1. **Always check file existence first** when debugging "module not found" errors
2. **Frontend runs on port 3000**, not 5173 (despite Vite defaults)
3. **Most "fixes" just need npm install** - don't overcomplicate
4. **Mock everything that's missing** - don't try to fix backend issues

### What's Actually Implemented vs Planned
**Working:**
- Frontend UI (all pages)
- Mood tracker visualization
- Frontend routing
- Mock authentication
- GitHub Pages deployment

**NOT Working (Don't waste time trying to fix):**
- Backend API calls
- Database operations  
- Real authentication
- SMS notifications
- Email services
- Any backend-dependent features

### Fastest Debugging Approach
1. Check if it's a frontend-only issue first
2. Run `npm install` in the appropriate directory
3. Check if imports match file structure
4. If backend-related, mock it instead of fixing
5. Use `gh` CLI for GitHub Actions debugging