# Mental Health Practice Scheduling and Waitlist Management System - UI/UX Wireframes

## Overview

This document outlines the UI/UX wireframes for the Mental Health Practice Scheduling and Waitlist Management System. The design focuses on creating an intuitive, accessible, and efficient user experience for both practice staff and patients, while ensuring HIPAA compliance and addressing the specific needs of mental health practices.

## Design Principles

1. **Simplicity**: Clean, uncluttered interfaces that reduce cognitive load
2. **Accessibility**: WCAG compliant design ensuring usability for all users
3. **Efficiency**: Minimize clicks and steps for common tasks
4. **Consistency**: Uniform design patterns across the application
5. **Responsiveness**: Optimized for both desktop and mobile experiences
6. **Privacy-focused**: Clear indicators of data privacy and security

## Color Palette

- **Primary**: #4A6FA5 (Calm Blue) - Main brand color, used for primary actions
- **Secondary**: #47B881 (Healing Green) - Used for success states and positive actions
- **Accent**: #FFB84D (Warm Orange) - Used for highlights and attention-grabbing elements
- **Neutral**: #F5F7FA to #2D3748 (Light to Dark Gray) - Used for text, backgrounds, and UI elements
- **Alert**: #E53E3E (Warning Red) - Used sparingly for critical alerts and errors

## Typography

- **Headings**: Inter (Sans-serif), Bold, various sizes
- **Body Text**: Inter (Sans-serif), Regular, 16px
- **Buttons and UI Elements**: Inter (Sans-serif), Medium, various sizes
- **Minimum text size**: 16px to ensure readability

## Common UI Components

### Navigation

- **Top Navigation Bar**: Contains logo, practice selector, notifications, and user profile
- **Sidebar Navigation**: Context-specific navigation based on user role
- **Breadcrumbs**: For deep navigation paths
- **Back Buttons**: For multi-step processes

### Interactive Elements

- **Primary Buttons**: Filled, rounded corners, high contrast
- **Secondary Buttons**: Outlined, rounded corners
- **Text Links**: Underlined on hover
- **Toggle Switches**: For binary options
- **Dropdown Menus**: For selection from multiple options
- **Search Fields**: With filtering capabilities
- **Date/Time Pickers**: Optimized for appointment scheduling

### Data Display

- **Tables**: For structured data with sorting and filtering
- **Cards**: For summary information and quick actions
- **Charts and Graphs**: For analytics visualization
- **Lists**: For sequential information
- **Calendars**: For schedule visualization
- **Status Indicators**: Clear visual cues for waitlist position, appointment status, etc.

## User Flows

### Practice Staff Flows

#### 1. Practice Onboarding Flow

1. **Welcome Screen**
   - Brief introduction to the system
   - Get started button

2. **Practice Information**
   - Practice name, address, contact information
   - Practice type and size
   - Next button

3. **Provider Setup**
   - Add provider information (name, credentials, specialties)
   - Option to add multiple providers
   - Next button

4. **Waitlist Import**
   - Option to import existing waitlists
   - Manual entry or file upload
   - Next button

5. **Integration Preferences**
   - Select integration options
   - Configure notification preferences
   - Complete setup button

6. **Dashboard Introduction**
   - Tutorial overlay highlighting key features
   - Get started with your practice button

#### 2. Waitlist Management Flow

1. **Waitlist Overview**
   - List of all waitlists with summary metrics
   - Create new waitlist button
   - Search and filter options

2. **Waitlist Detail View**
   - Patient entries with key information
   - Sort and filter options
   - Quick actions (contact, schedule, remove)
   - Priority score indicators

3. **Add Patient to Waitlist**
   - Patient search or create new
   - Waitlist selection
   - Priority factors input
   - Provider preference selection
   - Add to waitlist button

4. **Waitlist Filtering Interface**
   - Multiple filter criteria (insurance, diagnosis, age, etc.)
   - Save filter preset option
   - Apply filters button

#### 3. Schedule Management Flow

1. **Calendar View**
   - Week/day/month toggle
   - Provider filter
   - Appointment type color coding
   - Available/booked slot visualization

2. **Add Appointment Slot**
   - Date and time selection
   - Duration selection
   - Recurring option
   - Provider assignment
   - Create slot button

3. **Fill Empty Slot**
   - Slot details
   - Matching patients list with match score
   - Quick contact options
   - Confirm booking button

4. **Appointment Request Review**
   - Patient information
   - Requested time
   - Accept/decline options
   - Propose alternative time option

#### 4. Analytics Dashboard Flow

1. **Overview Dashboard**
   - Key metrics summary
   - Time period selector
   - Quick links to detailed reports

2. **Revenue Recaptured View**
   - Revenue metrics visualization
   - Comparison to previous periods
   - Breakdown by provider

3. **Provider Utilization View**
   - Utilization rate charts
   - Empty slot analysis
   - Optimization recommendations

4. **Waitlist Conversion View**
   - Conversion rate metrics
   - Average wait time
   - Patient satisfaction indicators

### Patient Flows

#### 1. Patient Onboarding Flow

1. **Welcome Screen**
   - Brief introduction
   - Privacy policy highlights
   - Create account button

2. **Account Creation**
   - Basic information (name, email, password)
   - Terms and privacy acceptance
   - Create account button

3. **Demographic Information**
   - Personal details
   - Contact preferences
   - Next button

4. **Care Preferences**
   - Provider preferences
   - Treatment modality preferences
   - Scheduling preferences
   - Next button

5. **Privacy Settings**
   - Data sharing options
   - Notification preferences
   - Complete setup button

6. **Dashboard Introduction**
   - Tutorial overlay highlighting key features
   - Explore available options button

#### 2. Appointment Management Flow

1. **Appointments Overview**
   - Upcoming appointments
   - Waitlist status
   - Request new appointment button

2. **Provider Availability View**
   - Calendar view of available slots
   - Provider filter
   - Time/date filter
   - Request slot button

3. **Appointment Request Form**
   - Selected slot details
   - Reason for visit
   - Special requests
   - Submit request button

4. **Waitlist Position View**
   - Current position indicator
   - Estimated wait time
   - Position change history
   - Remove from waitlist option

## Key Screens Wireframes

### Practice Staff Screens

#### Dashboard

```
+-----------------------------------------------------------------------+
|  Logo   Practice Name           Notifications (3)   User Profile       |
+-----------------------------------------------------------------------+
|        |                                                               |
| MENU   |  DASHBOARD OVERVIEW                                           |
|        |                                                               |
| Home   |  +-------------------+  +-------------------+                 |
|        |  | TODAY'S SCHEDULE  |  | WAITLIST SUMMARY  |                 |
| Waitlist|  | 12 Appointments  |  | 45 Patients       |                 |
|        |  | 2 Open Slots      |  | 5 High Priority   |                 |
| Schedule|  +-------------------+  +-------------------+                 |
|        |                                                               |
| Patients|  +-------------------+  +-------------------+                 |
|        |  | RECENT ACTIVITY   |  | QUICK ACTIONS     |                 |
| Providers| | - New request     |  | [Add Patient]     |                 |
|        |  | - Slot filled     |  | [Create Slot]     |                 |
| Analytics| | - Cancellation    |  | [Match Patients]  |                 |
|        |  +-------------------+  +-------------------+                 |
| Settings|                                                              |
|        |  UPCOMING APPOINTMENTS                                        |
|        |  +-------------------------------------------------------+    |
|        |  | Time  | Patient        | Provider       | Status      |    |
|        |  |-------|----------------|----------------|-------------|    |
|        |  | 9:00  | Jane Smith     | Dr. Johnson    | Confirmed   |    |
|        |  | 10:00 | Michael Brown  | Dr. Williams   | Confirmed   |    |
|        |  | 11:00 | [OPEN SLOT]    | Dr. Johnson    | [FILL SLOT] |    |
|        |  +-------------------------------------------------------+    |
|        |                                                               |
+-----------------------------------------------------------------------+
```

#### Waitlist Management

```
+-----------------------------------------------------------------------+
|  Logo   Practice Name           Notifications (3)   User Profile       |
+-----------------------------------------------------------------------+
|        |                                                               |
| MENU   |  WAITLIST MANAGEMENT                   [+ CREATE WAITLIST]    |
|        |                                                               |
| Home   |  [All Waitlists ▼]  [Filter ▼]  [Search...]                  |
|        |                                                               |
| Waitlist|  ACTIVE WAITLISTS                                            |
|        |  +-------------------------------------------------------+    |
| Schedule|  | Waitlist Name    | Patients | Avg Wait | Actions      |    |
|        |  |------------------|----------|----------|--------------|    |
| Patients|  | General Therapy  | 23       | 14 days  | [View][Edit] |    |
|        |  | Depression        | 15       | 21 days  | [View][Edit] |    |
| Providers| | Anxiety          | 18       | 18 days  | [View][Edit] |    |
|        |  | Child Therapy     | 12       | 30 days  | [View][Edit] |    |
| Analytics| +-------------------------------------------------------+    |
|        |                                                               |
| Settings|  GENERAL THERAPY WAITLIST                                    |
|        |  +-------------------------------------------------------+    |
|        |  | Patient        | Priority | Wait Time | Match | Actions |  |
|        |  |----------------|----------|-----------|-------|---------|  |
|        |  | Robert Chen    | High     | 30 days   | 95%   | [▼]     |  |
|        |  | Sarah Johnson  | Medium   | 21 days   | 87%   | [▼]     |  |
|        |  | David Miller   | Medium   | 14 days   | 76%   | [▼]     |  |
|        |  | Lisa Garcia    | Low      | 7 days    | 65%   | [▼]     |  |
|        |  +-------------------------------------------------------+    |
|        |                                                               |
|        |  [+ ADD PATIENT]  [MATCH TO OPEN SLOTS]  [EXPORT LIST]        |
|        |                                                               |
+-----------------------------------------------------------------------+
```

#### Schedule Management

```
+-----------------------------------------------------------------------+
|  Logo   Practice Name           Notifications (3)   User Profile       |
+-----------------------------------------------------------------------+
|        |                                                               |
| MENU   |  SCHEDULE MANAGEMENT                                          |
|        |                                                               |
| Home   |  [Day][Week][Month]  [Date Picker]  [Provider ▼]              |
|        |                                                               |
| Waitlist|  MONDAY, JUNE 5                                              |
|        |  +-------------------------------------------------------+    |
| Schedule|  |       | Dr. Johnson      | Dr. Williams     | Dr. Lee     |
|        |  |-------|------------------|------------------|-------------|
| Patients|  | 9:00  | Jane Smith       | Michael Brown    | [OPEN]      |
|        |  | 10:00 | Robert Chen      | [OPEN]           | Emma Davis  |
| Providers| | 11:00 | [OPEN]           | Sarah Johnson    | [OPEN]      |
|        |  | 12:00 | LUNCH            | LUNCH            | LUNCH       |
| Analytics| | 1:00  | David Miller     | Lisa Garcia      | James Wilson|
|        |  | 2:00  | [OPEN]           | [OPEN]           | Sofia Lopez |
| Settings|  | 3:00  | Emma Davis       | Robert Chen      | [OPEN]      |
|        |  | 4:00  | [OPEN]           | David Miller     | Jane Smith  |
|        |  +-------------------------------------------------------+    |
|        |                                                               |
|        |  [+ ADD SLOT]  [FILL OPEN SLOTS]  [MANAGE RECURRING]          |
|        |                                                               |
+-----------------------------------------------------------------------+
```

#### Matching Interface

```
+-----------------------------------------------------------------------+
|  Logo   Practice Name           Notifications (3)   User Profile       |
+-----------------------------------------------------------------------+
|        |                                                               |
| MENU   |  MATCH PATIENTS TO SLOT                                       |
|        |                                                               |
| Home   |  SLOT DETAILS                                                 |
|        |  +-------------------------------------------------------+    |
| Waitlist|  | Provider: Dr. Johnson                                    |
|        |  | Date: Monday, June 5, 2023                                |
| Schedule|  | Time: 11:00 AM - 12:00 PM                                |
|        |  | Type: Individual Therapy                                  |
| Patients|  +-------------------------------------------------------+    |
|        |                                                               |
| Providers|  MATCHING PATIENTS                                           |
|        |  +-------------------------------------------------------+    |
| Analytics| | Patient        | Match | Priority | Wait Time | Actions  |  |
|        |  |----------------|-------|----------|-----------|----------|  |
| Settings|  | Sarah Johnson  | 95%   | High     | 30 days   | [SELECT] |  |
|        |  | David Miller   | 87%   | Medium   | 21 days   | [SELECT] |  |
|        |  | Lisa Garcia    | 76%   | Medium   | 14 days   | [SELECT] |  |
|        |  | Robert Chen    | 65%   | Low      | 7 days    | [SELECT] |  |
|        |  +-------------------------------------------------------+    |
|        |                                                               |
|        |  MATCHING CRITERIA                                            |
|        |  [✓] Insurance  [✓] Provider Specialty  [✓] Patient Preference|
|        |  [✓] Urgency    [✓] Wait Time          [✓] Previous No-Shows |
|        |                                                               |
|        |  [ADJUST CRITERIA]  [REFRESH MATCHES]                         |
|        |                                                               |
+-----------------------------------------------------------------------+
```

### Patient Screens

#### Patient Dashboard

```
+-----------------------------------------------------------------------+
|  Logo                          Notifications (1)   User Profile        |
+-----------------------------------------------------------------------+
|                                                                       |
|  WELCOME BACK, SARAH                                                  |
|                                                                       |
|  +-------------------+  +-------------------+                         |
|  | NEXT APPOINTMENT  |  | WAITLIST STATUS   |                         |
|  | June 10, 2:00 PM  |  | Position: 3 of 15 |                         |
|  | Dr. Johnson       |  | Est. Wait: 2 weeks |                         |
|  | [View Details]    |  | [View Details]     |                         |
|  +-------------------+  +-------------------+                         |
|                                                                       |
|  QUICK ACTIONS                                                        |
|  [Request Appointment]  [Update Preferences]  [Message Practice]      |
|                                                                       |
|  RECENT NOTIFICATIONS                                                 |
|  +-------------------------------------------------------+            |
|  | • New appointment slot available matching your preferences         |
|  | • Your waitlist position has improved from 5 to 3                 |
|  | • Appointment confirmed for June 10 at 2:00 PM                    |
|  +-------------------------------------------------------+            |
|                                                                       |
|  YOUR PROVIDERS                                                       |
|  +-------------------------------------------------------+            |
|  | Dr. Johnson        | Primary Therapist  | [Request Appointment]    |
|  | Dr. Williams       | Psychiatrist       | [Request Appointment]    |
|  +-------------------------------------------------------+            |
|                                                                       |
+-----------------------------------------------------------------------+
```

#### Appointment Request

```
+-----------------------------------------------------------------------+
|  Logo                          Notifications (1)   User Profile        |
+-----------------------------------------------------------------------+
|                                                                       |
|  REQUEST APPOINTMENT                                                  |
|                                                                       |
|  SELECT PROVIDER                                                      |
|  [Dr. Johnson ▼]                                                      |
|                                                                       |
|  AVAILABLE SLOTS                                                      |
|  +-------------------------------------------------------+            |
|  | Date       | Time      | Type             | Select     |            |
|  |------------|-----------|------------------|------------|            |
|  | June 5     | 11:00 AM  | In-person        | [REQUEST]  |            |
|  | June 7     | 2:00 PM   | Telehealth       | [REQUEST]  |            |
|  | June 10    | 9:00 AM   | In-person        | [REQUEST]  |            |
|  | June 12    | 3:00 PM   | Telehealth       | [REQUEST]  |            |
|  +-------------------------------------------------------+            |
|                                                                       |
|  APPOINTMENT DETAILS                                                  |
|  +-------------------------------------------------------+            |
|  | Selected: June 5, 11:00 AM - 12:00 PM                             |
|  | Provider: Dr. Johnson                                             |
|  | Type: In-person therapy session                                   |
|  +-------------------------------------------------------+            |
|                                                                       |
|  ADDITIONAL INFORMATION                                               |
|  +-------------------------------------------------------+            |
|  | [Reason for visit...]                                             |
|  | [Special requests or notes...]                                    |
|  +-------------------------------------------------------+            |
|                                                                       |
|  [CANCEL]                           [SUBMIT REQUEST]                  |
|                                                                       |
+-----------------------------------------------------------------------+
```

#### Waitlist Status

```
+-----------------------------------------------------------------------+
|  Logo                          Notifications (1)   User Profile        |
+-----------------------------------------------------------------------+
|                                                                       |
|  YOUR WAITLIST STATUS                                                 |
|                                                                       |
|  GENERAL THERAPY WAITLIST                                             |
|  +-------------------------------------------------------+            |
|  | Current Position: 3 of 15                                         |
|  | Estimated Wait Time: 2 weeks                                      |
|  | Date Added: May 15, 2023                                          |
|  | Preferred Provider: Dr. Johnson                                   |
|  +-------------------------------------------------------+            |
|                                                                       |
|  POSITION HISTORY                                                     |
|  +-------------------------------------------------------+            |
|  |                                                                   |
|  |  [CHART: Line graph showing position improvement over time]       |
|  |                                                                   |
|  +-------------------------------------------------------+            |
|                                                                       |
|  NOTIFICATIONS                                                        |
|  [✓] Notify me when my position changes                              |
|  [✓] Notify me when new slots become available                       |
|  [✓] Notify me for last-minute openings                              |
|                                                                       |
|  [UPDATE PREFERENCES]                  [REMOVE FROM WAITLIST]         |
|                                                                       |
+-----------------------------------------------------------------------+
```

## Mobile Adaptations

The mobile interface will maintain the same functionality while optimizing for smaller screens:

1. **Navigation**: Bottom tab bar for primary navigation instead of sidebar
2. **Lists**: Simplified list views with expandable details
3. **Forms**: Single-column layouts with larger touch targets
4. **Calendars**: Optimized for touch interaction with simplified views
5. **Actions**: Floating action buttons for primary actions

## Accessibility Considerations

1. **Color Contrast**: All text meets WCAG AA standard (4.5:1 for normal text, 3:1 for large text)
2. **Screen Readers**: All interactive elements have appropriate ARIA labels
3. **Keyboard Navigation**: Full keyboard accessibility with visible focus states
4. **Text Sizing**: All text can be resized up to 200% without loss of functionality
5. **Alternative Text**: All images and icons have descriptive alternative text
6. **Error Handling**: Clear error messages with suggestions for resolution

## Responsive Breakpoints

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px and above

## Interactive Prototypes

For the next phase of development, interactive prototypes will be created using Figma to test user flows and gather feedback before implementation.
