# Provider Availability Feature Setup

## Overview
This feature adds an expandable availability section to each provider card in the waitlist view. When a provider card is clicked, it expands to show their available appointment slots with calendar and time filtering options.

## Features
- 📅 Calendar dropdown to select dates (next 30 days, excluding weekends)
- 🕐 Time filter dropdown (All Day, Morning, Afternoon, Evening)
- 🔵 Blue rectangular time slot buttons in 30-minute increments
- 🏥 Support for both in-person and virtual appointments
- ✨ Smooth animations and beautiful UI

## Setup Instructions

### 1. Database Setup (Optional - for production)

If you want to use real data from Supabase, run this SQL in your Supabase SQL Editor:

```sql
-- Copy the contents of backend/scripts/provider-availability-simple.sql
-- and run it in your Supabase SQL Editor
```

### 2. Current Implementation

The feature currently works with **mock data** so you can see it in action immediately without database setup:

- Mock slots are generated for weekdays (Mon-Fri)
- Morning slots: 9:00 AM - 12:00 PM
- Afternoon slots: 2:00 PM - 5:00 PM
- Some slots are randomly marked as "booked" to simulate real availability

### 3. How to Use

1. Navigate to the Waitlist page
2. Click on any provider card in the carousel
3. The availability section will expand below showing:
   - Date selector (defaults to today)
   - Time filter (defaults to "All Day")
   - Available time slots as blue buttons

### 4. Visual Design

- **Expanded Section**: Gradient background from blue to white
- **Calendar Dropdown**: 
  - Today is highlighted
  - Past dates are grayed out
  - Unavailable dates are crossed out
  - Selected date has blue background
- **Time Slots**: 
  - Blue rectangular buttons with hover effects
  - Shows appointment type (in-person/virtual/both)
  - 30-minute increments

### 5. Future Enhancements

When connected to the database, the system will:
- Show real-time availability from the `provider_availability` table
- Allow booking appointments
- Update availability in real-time
- Send notifications to patients

## Technical Details

### Components
- `ProviderAvailability.tsx` - Main availability UI component
- `useProviderAvailability.ts` - Hook for fetching availability data

### Database Schema
```sql
provider_availability
- id (UUID)
- provider_id (UUID)
- date (DATE)
- start_time (TIME)
- end_time (TIME)
- is_available (BOOLEAN)
- is_booked (BOOLEAN)
- appointment_type (VARCHAR)
- patient_id (UUID, nullable)
- notes (TEXT)
```

### Mock Data Generation
The system generates mock availability for demonstration:
- Weekdays only (Monday-Friday)
- Two time blocks: 9 AM-12 PM and 2 PM-5 PM
- 30-minute slots
- ~70% availability rate

## Screenshots

The availability section appears as an expandable row below the provider card with:
- Clean, modern design
- Smooth animations
- Intuitive date/time selection
- Clear visual hierarchy