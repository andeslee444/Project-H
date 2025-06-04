# CLAUDE.local.md - Project-H Local Configuration

## Project Overview
Project-H is a HIPAA-compliant mental health practice scheduling platform with:
- React + Vite frontend
- Express + Knex backend with PostgreSQL
- Intelligent patient-provider matching
- Waitlist management system

## Database Context
- Refer to `docs/Database Schema.md` for complete schema
- Key tables: users, patients, providers, appointments, waitlists, practices

## Testing Guidelines
### E2E Puppeteer Tests for Booking Workflows
- Test patient registration and login
- Test provider availability setup
- Test appointment booking flow
- Test waitlist signup and management
- Test notification system

### Test Commands
```bash
# Frontend tests
cd frontend && npm test

# Backend tests  
cd backend && npm test

# E2E tests (when implemented)
npm run test:e2e
```

## Sentry Configuration
### Frontend
- Add Sentry DSN to frontend/.env
- Initialize in frontend/src/main.jsx
- Wrap App component with Sentry.ErrorBoundary

### Backend
- Add Sentry DSN to backend/.env
- Initialize in backend/src/app.js
- Add error middleware for Express

## Development Workflow
1. Always run linting before commits: `npm run lint`
2. Check type errors: `npm run typecheck` (if available)
3. Test changes locally before pushing
4. Use descriptive commit messages referencing issues

## GitHub Integration
- Use `gh` CLI for all GitHub operations
- Reference issues in commits: "Fix #123: Description"
- Create draft PRs for work in progress
- Request reviews from team members

## Common Tasks
- Fix GitHub issue: `.claude/commands/fix-github-issue.md [issue-number]`
- Analyze errors: `.claude/commands/analyze-frontend-errors.md`
- Database migrations: `cd backend && npm run migrate`

## Project-Specific Context
- Patient-provider matching algorithm in `backend/src/services/MatchingService.js`
- Appointment scheduling logic handles availability, conflicts, and waitlist
- HIPAA compliance requirements affect data handling and logging
- Real-time notifications use WebSockets (when implemented)

## Development Learnings & Configuration Notes

### Tailwind CSS Configuration (June 2024)
**Issue**: Conflicting Tailwind CSS versions causing build failures
- Had `tailwindcss: ^3.4.17` and `@tailwindcss/postcss: ^4.1.8` causing version conflicts
- Error: "Cannot apply unknown utility class `bg-white`"

**Solution**:
1. Removed conflicting `@tailwindcss/postcss` package: `npm uninstall @tailwindcss/postcss`
2. Used ES module syntax in config files due to `"type": "module"` in package.json
3. Ensured both `tailwind.config.js` and `postcss.config.js` use `export default` syntax

**Key Files**:
- `frontend/tailwind.config.js` - Must use ES module export
- `frontend/postcss.config.js` - Must use ES module export  
- `frontend/src/styles/index.css` - Tailwind imports must be first

### Mood Tracking Feature Implementation (June 2024)
**Feature**: GitHub-style mood contributions chart for patient wellness tracking

**Technical Implementation**:
- **Component**: `frontend/src/components/patient/MoodTracker.jsx`
- **Integration**: Connected to "Log Mood" button in `PatientDashboard.jsx` via smooth scroll
- **Styling**: Tailwind CSS with healthcare-focused color palette
- **Animation**: Framer Motion for modal transitions and hover effects
- **Data Structure**: 12-week grid (84 days) with mood scale 1-10
- **Color Psychology**: Green (good mood) to Red (poor mood) spectrum

**UI/UX Patterns**:
- Modal-based mood entry with 1-10 scale buttons
- GitHub-style contributions grid with hover tooltips
- Real-time statistics (streak, average, total entries)
- Responsive design for mobile and desktop
- Accessibility-compliant color contrasts

**Code Patterns Used**:
```javascript
// Date grid generation for 12 weeks
const generateDateGrid = () => {
  const today = new Date();
  const grid = [];
  const weeks = 12;
  
  for (let week = weeks - 1; week >= 0; week--) {
    const weekData = [];
    for (let day = 6; day >= 0; day--) {
      const date = new Date(today);
      date.setDate(today.getDate() - (week * 7 + day));
      weekData.unshift(date.toISOString().split('T')[0]);
    }
    grid.push(weekData);
  }
  return grid;
};

// Mood color mapping (1-10 scale)
const getMoodColor = (mood) => {
  const colors = {
    1: 'bg-red-900',     // Very bad
    2: 'bg-red-700',     // Bad
    // ... through to ...
    9: 'bg-green-700',   // Excellent  
    10: 'bg-green-900'   // Outstanding
  };
  return colors[mood] || 'bg-gray-100';
};
```

### Authentication & Routing Configuration
**Current Setup**: Simple mock authentication with role-based routing
- Uses `backend/src/app-simple.js` for simplified backend
- Email pattern determines role: `*patient*` = patient, `*provider*` = provider
- No database authentication - suitable for development/demo

**Frontend Routing**:
- Role-based dashboard routing in `PatientDashboard.jsx` and provider equivalent
- Removed conflicting `RoleBasedRedirect` component that was causing access issues
- Direct navigation to role-specific dashboards based on auth context

### Server Configuration
**Local Development**:
- Frontend: http://localhost:5173/ (Vite dev server)
- Backend: http://localhost:3001/ (Express API)

**GitHub Pages Deployment**:
- Live Demo: https://andeslee444.github.io/Project-H/
- Status: ✅ Successfully deployed
- Last Update: June 4, 2025

**Startup Commands**:
```bash
# Frontend (Local Development)
cd frontend && npm run dev

# Frontend (Production Build)
cd frontend && NODE_ENV=production npm run build

# Backend  
cd backend && node src/app-simple.js
```

**Health Check**: `curl http://localhost:3001/api/health`

### Component Architecture Patterns
**Healthcare Dashboard Components**:
- Modular component structure with clear separation of concerns
- Custom hooks for state management (`useAuth.jsx`)
- Framer Motion for professional animations
- Tailwind CSS utility classes for consistent styling
- Accessibility-first design patterns

**File Organization**:
- `src/components/patient/` - Patient-specific components
- `src/components/provider/` - Provider-specific components  
- `src/hooks/` - Custom React hooks
- `src/styles/` - Global styles and Tailwind configuration