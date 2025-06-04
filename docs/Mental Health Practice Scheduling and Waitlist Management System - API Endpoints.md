# Mental Health Practice Scheduling and Waitlist Management System - API Endpoints

## Overview

This document outlines the API endpoints for the Mental Health Practice Scheduling and Waitlist Management System. The API follows RESTful principles and is organized by resource type. All endpoints require authentication except where noted, and responses are returned in JSON format.

## Base URL

All API endpoints are prefixed with: `/api/v1`

## Authentication Endpoints

### User Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user (practice admin, provider, or patient) |
| POST | `/auth/login` | Authenticate a user and receive JWT token |
| POST | `/auth/refresh` | Refresh an existing JWT token |
| POST | `/auth/logout` | Invalidate current JWT token |
| POST | `/auth/forgot-password` | Initiate password reset process |
| POST | `/auth/reset-password` | Complete password reset with token |
| GET | `/auth/me` | Get current authenticated user information |

## Practice Management Endpoints

### Practices

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/practices` | Create a new practice |
| GET | `/practices` | List all practices (admin only) |
| GET | `/practices/:id` | Get practice details |
| PUT | `/practices/:id` | Update practice information |
| DELETE | `/practices/:id` | Delete a practice (admin only) |
| GET | `/practices/:id/providers` | List all providers in a practice |
| GET | `/practices/:id/waitlists` | List all waitlists for a practice |
| GET | `/practices/:id/analytics` | Get practice analytics data |

### Practice Onboarding

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/practices/onboarding/step1` | Complete practice profile setup |
| POST | `/practices/onboarding/step2` | Set up provider profiles |
| POST | `/practices/onboarding/step3` | Import existing waitlists |
| POST | `/practices/onboarding/step4` | Configure integration preferences |
| GET | `/practices/onboarding/status` | Check onboarding completion status |

## Provider Management Endpoints

### Providers

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/providers` | Create a new provider |
| GET | `/providers` | List all providers (filtered by practice) |
| GET | `/providers/:id` | Get provider details |
| PUT | `/providers/:id` | Update provider information |
| DELETE | `/providers/:id` | Delete a provider |
| GET | `/providers/:id/availability` | Get provider availability |
| PUT | `/providers/:id/availability` | Update provider availability |
| GET | `/providers/:id/appointments` | List provider appointments |
| GET | `/providers/:id/analytics` | Get provider analytics data |

### Provider Specialties

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/specialties` | List all available specialties |
| POST | `/providers/:id/specialties` | Add specialties to a provider |
| DELETE | `/providers/:id/specialties/:specialty_id` | Remove a specialty from a provider |

### Treatment Modalities

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/modalities` | List all available treatment modalities |
| POST | `/providers/:id/modalities` | Add modalities to a provider |
| DELETE | `/providers/:id/modalities/:modality_id` | Remove a modality from a provider |

## Patient Management Endpoints

### Patients

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/patients` | Create a new patient |
| GET | `/patients` | List all patients (filtered by practice) |
| GET | `/patients/:id` | Get patient details |
| PUT | `/patients/:id` | Update patient information |
| DELETE | `/patients/:id` | Delete a patient |
| GET | `/patients/:id/appointments` | List patient appointments |
| GET | `/patients/:id/waitlists` | List waitlists patient is on |

### Patient Onboarding

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/patients/onboarding/step1` | Create patient account |
| POST | `/patients/onboarding/step2` | Add demographic information |
| POST | `/patients/onboarding/step3` | Set care preferences |
| POST | `/patients/onboarding/step4` | Configure privacy settings |
| GET | `/patients/onboarding/status` | Check onboarding completion status |

## Waitlist Management Endpoints

### Waitlists

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/waitlists` | Create a new waitlist |
| GET | `/waitlists` | List all waitlists (filtered by practice) |
| GET | `/waitlists/:id` | Get waitlist details |
| PUT | `/waitlists/:id` | Update waitlist information |
| DELETE | `/waitlists/:id` | Delete a waitlist |
| GET | `/waitlists/:id/entries` | List all entries on a waitlist |

### Waitlist Entries

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/waitlists/:id/entries` | Add a patient to a waitlist |
| GET | `/waitlists/entries/:id` | Get waitlist entry details |
| PUT | `/waitlists/entries/:id` | Update waitlist entry |
| DELETE | `/waitlists/entries/:id` | Remove a patient from a waitlist |
| PUT | `/waitlists/entries/:id/priority` | Update entry priority score |
| GET | `/waitlists/entries/:id/position` | Get estimated position on waitlist |

### Waitlist Filtering

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/waitlists/:id/filter` | Filter waitlist by criteria |
| GET | `/waitlists/filters` | Get available filtering options |
| POST | `/waitlists/:id/custom-filter` | Create a custom filter |
| GET | `/waitlists/:id/custom-filters` | List saved custom filters |

## Schedule Management Endpoints

### Appointment Slots

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/slots` | Create a new appointment slot |
| POST | `/slots/bulk` | Create multiple appointment slots |
| GET | `/slots` | List appointment slots (with filters) |
| GET | `/slots/:id` | Get appointment slot details |
| PUT | `/slots/:id` | Update appointment slot |
| DELETE | `/slots/:id` | Delete an appointment slot |
| GET | `/providers/:id/slots` | Get all slots for a provider |

### Appointments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/appointments` | Create a new appointment |
| GET | `/appointments` | List appointments (with filters) |
| GET | `/appointments/:id` | Get appointment details |
| PUT | `/appointments/:id` | Update appointment |
| DELETE | `/appointments/:id` | Cancel an appointment |
| POST | `/appointments/:id/reschedule` | Reschedule an appointment |
| GET | `/appointments/calendar` | Get calendar view of appointments |

### Appointment Requests

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/appointment-requests` | Create a new appointment request |
| GET | `/appointment-requests` | List appointment requests |
| GET | `/appointment-requests/:id` | Get appointment request details |
| PUT | `/appointment-requests/:id/approve` | Approve an appointment request |
| PUT | `/appointment-requests/:id/decline` | Decline an appointment request |
| DELETE | `/appointment-requests/:id` | Cancel an appointment request |

## Matching Algorithm Endpoints

### Matching

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/matching/slot/:slot_id` | Find matching patients for a slot |
| POST | `/matching/patient/:patient_id` | Find matching slots for a patient |
| GET | `/matching/criteria` | Get available matching criteria |
| POST | `/matching/criteria` | Create custom matching criteria |
| PUT | `/practices/:id/matching-preferences` | Update practice matching preferences |

## Communication Endpoints

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/notifications` | Create and send a notification |
| GET | `/notifications` | List notifications for current user |
| GET | `/notifications/:id` | Get notification details |
| PUT | `/notifications/:id/read` | Mark notification as read |
| DELETE | `/notifications/:id` | Delete a notification |
| PUT | `/notifications/preferences` | Update notification preferences |

### Messaging

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/messages` | Send a new message |
| GET | `/messages` | List messages for current user |
| GET | `/messages/:id` | Get message details |
| PUT | `/messages/:id/read` | Mark message as read |
| DELETE | `/messages/:id` | Delete a message |
| GET | `/conversations` | List all conversations |
| GET | `/conversations/:id` | Get conversation details |

## Analytics Endpoints

### Practice Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/practices/:id/revenue` | Get revenue recaptured data |
| GET | `/analytics/practices/:id/hours` | Get hours recaptured data |
| GET | `/analytics/practices/:id/fill-time` | Get average time to fill slots |
| GET | `/analytics/practices/:id/waitlist-conversion` | Get waitlist conversion rate |
| GET | `/analytics/practices/:id/provider-utilization` | Get provider utilization data |
| GET | `/analytics/practices/:id/dashboard` | Get practice analytics dashboard data |

### Custom Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analytics/reports` | Create a custom report |
| GET | `/analytics/reports` | List saved reports |
| GET | `/analytics/reports/:id` | Get report details and data |
| PUT | `/analytics/reports/:id` | Update a custom report |
| DELETE | `/analytics/reports/:id` | Delete a custom report |
| POST | `/analytics/reports/:id/export` | Export report data |

## System Administration Endpoints

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | List all users (admin only) |
| GET | `/admin/users/:id` | Get user details (admin only) |
| PUT | `/admin/users/:id` | Update user information (admin only) |
| DELETE | `/admin/users/:id` | Delete a user (admin only) |
| PUT | `/admin/users/:id/role` | Update user role (admin only) |

### Roles and Permissions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/roles` | List all available roles |
| GET | `/roles/:id` | Get role details |
| POST | `/roles` | Create a new role (admin only) |
| PUT | `/roles/:id` | Update a role (admin only) |
| DELETE | `/roles/:id` | Delete a role (admin only) |
| GET | `/permissions` | List all available permissions |

### Audit Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/audit-logs` | List audit logs (filtered by criteria) |
| GET | `/audit-logs/:id` | Get audit log details |
| GET | `/audit-logs/export` | Export audit logs |

## Integration Endpoints

### EHR Integration

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/integrations/ehr/connect` | Connect to EHR system |
| GET | `/integrations/ehr/status` | Check EHR connection status |
| POST | `/integrations/ehr/sync` | Synchronize data with EHR |
| DELETE | `/integrations/ehr/disconnect` | Disconnect from EHR system |

### External APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/integrations/available` | List available integrations |
| POST | `/integrations/:type/connect` | Connect to external service |
| GET | `/integrations/:type/status` | Check integration status |
| DELETE | `/integrations/:type/disconnect` | Disconnect from external service |

## System Configuration Endpoints

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/settings` | Get system settings |
| PUT | `/settings` | Update system settings (admin only) |
| GET | `/settings/practice/:id` | Get practice-specific settings |
| PUT | `/settings/practice/:id` | Update practice-specific settings |

### Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/templates` | List available notification templates |
| GET | `/templates/:id` | Get template details |
| POST | `/templates` | Create a new template |
| PUT | `/templates/:id` | Update a template |
| DELETE | `/templates/:id` | Delete a template |

## API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation successful",
  "errors": null,
  "meta": {
    "pagination": {
      "total": 100,
      "per_page": 10,
      "current_page": 1,
      "last_page": 10,
      "from": 1,
      "to": 10
    }
  }
}
```

For error responses:

```json
{
  "success": false,
  "data": null,
  "message": "Operation failed",
  "errors": {
    "field_name": ["Error message"]
  },
  "meta": null
}
```

## API Authentication

All API endpoints (except public endpoints like login and register) require authentication using JWT tokens. The token should be included in the Authorization header:

```
Authorization: Bearer {token}
```

## Rate Limiting

API requests are rate-limited to prevent abuse. The current limits are:

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit information is included in the response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1623456789
```

## Versioning

The API is versioned using URL path versioning (e.g., `/api/v1/`). When breaking changes are introduced, a new version will be released while maintaining support for previous versions for a deprecation period.

## HIPAA Compliance

All API endpoints are designed with HIPAA compliance in mind:

- All data is encrypted in transit using TLS 1.3
- Authentication and authorization are strictly enforced
- All PHI access is logged for audit purposes
- Appropriate access controls are implemented based on user roles
- Timeout mechanisms are in place for inactive sessions
