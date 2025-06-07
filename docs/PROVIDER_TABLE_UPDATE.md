# Provider Table View Update

## Overview
Updated the Provider Management page to display providers in a table format instead of cards, as requested.

## Changes Made

### 1. Created ProvidersTable Component
- **File**: `/frontend/src/pages/Providers/ProvidersTable.tsx`
- **Features**:
  - Table-based layout with sortable columns
  - Expandable rows for additional provider details
  - Maintains all access control logic from card view
  - Shows key information in columns: Provider, Contact, Specialties, Availability, Patients, Status
  - Expandable sections show: Professional Details, Service Details, Insurance, Biography

### 2. Created Shared ProviderSpecialtyModal
- **File**: `/frontend/src/pages/Providers/ProviderSpecialtyModal.tsx`
- **Purpose**: Avoid code duplication between ProvidersEnhanced and ProvidersTable
- **Exports**:
  - `ProviderSpecialtyModal` component
  - `MENTAL_HEALTH_SPECIALTIES` constant
  - `ProviderWithSpecialties` interface

### 3. Updated ProvidersDebug
- **File**: `/frontend/src/pages/Providers/ProvidersDebug.tsx`
- **Change**: Now imports and uses ProvidersTable instead of ProvidersEnhanced

### 4. Updated Module Exports
- **File**: `/frontend/src/pages/Providers/index.ts`
- **Change**: ProvidersDebug (with table view) is now the default export as `Providers`

## Table View Features

### Column Structure
1. **Provider**: Name, title, and license information
2. **Contact**: Email and phone number
3. **Specialties**: First 2 specialties with count of additional ones
4. **Availability**: Days of the week provider is available
5. **Patients**: Patient count and utilization percentage
6. **Status**: Active/Inactive badge
7. **Actions**: Manage/View Specialties button and expand/collapse toggle

### Expandable Row Details
When expanded, shows:
- **Professional Details**: Years of experience, languages spoken, license expiry
- **Service Details**: Session duration, max patients per day, service modalities
- **Insurance**: Accepted insurance providers or private pay status
- **Biography**: Provider's professional bio

### Access Control
Maintains the same access control as the card view:
- **Admins**: Can edit all providers' specialties (shows "Manage Specialties" button)
- **Providers**: Can only edit their own specialties (shows "Manage Specialties" on own row, "View Specialties" on others)
- **Other roles**: Can only view specialties (shows "View Specialties" button)

## Testing Instructions

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Login with different credentials to test access control:
   - **Admin**: admin@example.com / demopassword123
   - **Providers**: 
     - sjohnson@example.com / provider123
     - mchen@example.com / provider123
     - (and other providers listed in PROVIDER_CREDENTIALS.md)

3. Navigate to the Providers page and verify:
   - Table displays all provider information correctly
   - Expandable rows work properly
   - Access control is maintained (providers can only edit their own specialties)
   - Search and filter functionality works
   - Specialty management modal opens correctly

## Benefits of Table View

1. **Better Information Density**: More providers visible at once
2. **Easier Comparison**: Side-by-side comparison of provider attributes
3. **Cleaner Interface**: Less visual clutter than card layout
4. **Progressive Disclosure**: Additional details available on demand via expandable rows
5. **Familiar Pattern**: Table format is standard for data management interfaces

## Future Enhancements

1. Add column sorting functionality
2. Add column visibility toggles
3. Implement pagination for large provider lists
4. Add export functionality (CSV/Excel)
5. Add bulk actions for admin users