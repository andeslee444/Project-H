# Provider Login Credentials

This document lists all the demo provider login credentials for the Mental Health Practice Scheduling System.

## Admin Account

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Administrator | admin@example.com | demopassword123 | Can view and edit all provider specialties |

## Provider Accounts

Each provider has their own login credentials and can only edit their own specialties:

| Provider Name | Title | Email | Password | Specialties |
|--------------|-------|-------|----------|-------------|
| Dr. Sarah Johnson | Dr. | sjohnson@example.com | provider123 | Depression, Anxiety/Panic, PTSD/Trauma |
| Dr. Michael Chen | Dr. | mchen@example.com | provider123 | Bipolar/Manic Depressive, Schizophrenia, Personality Disorders |
| Emily Rodriguez | LCSW | erodriguez@example.com | provider123 | ADD/ADHD, Autism, Behavior Modification |
| David Thompson | PhD | dthompson@example.com | provider123 | Chemical Dependency Assessment, Co-Occurring disorders, Compulsive Gambling |
| Lisa Martinez | LMFT | lmartinez@example.com | provider123 | Relatives (Family Therapy), Divorce, Grief/Bereavement |
| James Wilson | PsyD | jwilson@example.com | provider123 | EMDR, PTSD/Trauma, Domestic Violence |

## Patient Account

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Patient | patient@example.com | demopassword123 | Patient portal access only |

## Access Control Rules

1. **Admins** can:
   - View all providers
   - Edit any provider's specialties
   - Add new specialties to any provider
   - Remove specialties from any provider

2. **Providers** can:
   - View all providers
   - Edit only their own specialties
   - Add new specialties to their own profile
   - Remove specialties from their own profile
   - Cannot edit other providers' specialties

3. **Patients** cannot access the provider management page

## Login Instructions

1. Navigate to the login page
2. Enter the email and password from the table above
3. Select the appropriate role from the dropdown (Provider, Practice Administrator, or Patient)
4. Click "Sign in"

Alternatively, you can use the demo buttons:
- Click "Demo Credentials" to expand the demo section
- Click on the appropriate demo button for quick login

## Testing Provider-Specific Access

To test that providers can only edit their own specialties:

1. Log in as Dr. Sarah Johnson (sjohnson@example.com)
2. Navigate to the Providers page
3. You should see "Manage Specialties" button only on Dr. Sarah Johnson's card
4. Other provider cards should show "View Specialties" button only
5. Click "Manage Specialties" on your own card to edit specialties
6. Click "View Specialties" on other cards to view (but not edit) their specialties

## Notes

- All passwords are for demo purposes only
- In a production environment, passwords would be properly hashed and stored securely
- The `provider@example.com` account with password `provider123` is a generic demo provider account
- Provider IDs are mapped as follows:
  - Dr. Sarah Johnson: ID 1
  - Dr. Michael Chen: ID 2
  - Emily Rodriguez: ID 3
  - David Thompson: ID 4
  - Lisa Martinez: ID 5
  - James Wilson: ID 6