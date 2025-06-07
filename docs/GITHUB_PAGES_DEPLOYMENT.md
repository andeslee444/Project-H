# GitHub Pages Deployment

## Overview
The Mental Health Practice Scheduling System (MindfulMatch) is deployed to GitHub Pages automatically whenever changes are pushed to the main branch.

## Deployment Configuration

### GitHub Actions Workflow
- **File**: `.github/workflows/deploy.yml`
- **Trigger**: Push to main branch
- **Build Command**: `npm run build`
- **Deploy Directory**: `frontend/dist`

### GitHub Pages URL
- **Production URL**: https://andeslee444.github.io/Project-H/

## Recent Updates

### Table View Implementation (Latest)
- Converted providers view from cards to table format
- Added responsive design with mobile card view
- Implemented expandable rows for additional details
- Enhanced UI/UX with better spacing and visual hierarchy
- Maintained all access control logic

## Deployment Process

1. **Automatic Deployment**
   - Push changes to main branch
   - GitHub Actions workflow triggers automatically
   - Build process runs with production configuration
   - Static files are deployed to GitHub Pages

2. **Manual Deployment**
   ```bash
   # Build locally
   cd frontend
   npm run build
   
   # Check build output
   ls -la dist/
   ```

## Demo Credentials

For testing the deployed application, use these demo credentials:

### Admin Access
- Email: admin@example.com
- Password: demopassword123

### Provider Access
- Dr. Michael Chen: mchen@example.com / provider123
- Dr. Sarah Johnson: sjohnson@example.com / provider123
- Other providers listed in PROVIDER_CREDENTIALS.md

### Patient Access
- Email: patient@example.com
- Password: demopassword123

## Features Available in Demo

1. **Provider Management** (New Table View)
   - View all providers in table format
   - Expandable rows for detailed information
   - Specialty management (edit own specialties as provider)
   - Utilization metrics with progress bars
   - Responsive design for mobile devices

2. **Dashboard**
   - Overview of practice metrics
   - Recent appointments
   - Waitlist status

3. **Appointment Scheduling**
   - View available slots
   - Book appointments (demo mode)

4. **Waitlist Management**
   - View waitlist entries
   - Priority-based matching

## Troubleshooting

### Deployment Issues
1. Check GitHub Actions tab for workflow status
2. Verify build logs for errors
3. Ensure all environment variables are set correctly

### Common Issues
- **404 Error**: Check if base path is configured correctly in vite.config.js
- **Blank Page**: Check browser console for JavaScript errors
- **Styling Issues**: Ensure CSS is being bundled correctly

## Monitoring Deployment

1. **GitHub Actions**: https://github.com/andeslee444/Project-H/actions
2. **Deployment Status**: Check the "Deploy to GitHub Pages" workflow
3. **Live Site**: https://andeslee444.github.io/Project-H/

## Next Steps

1. Monitor the deployment workflow completion
2. Test all demo accounts on the live site
3. Verify table view is working correctly
4. Check responsive design on mobile devices
5. Ensure all authentication flows work in demo mode

## Notes

- The deployment uses demo mode authentication (no real backend)
- All data is mocked for demonstration purposes
- Provider specialty changes are only persisted in browser session
- For production deployment, additional configuration would be needed