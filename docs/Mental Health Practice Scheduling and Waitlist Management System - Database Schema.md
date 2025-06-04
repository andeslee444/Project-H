# Mental Health Practice Scheduling and Waitlist Management System - Database Schema

## Overview

The database schema for the Mental Health Practice Scheduling and Waitlist Management System is designed to support all the requirements outlined in the PRD while ensuring HIPAA compliance, data integrity, and optimal performance. The schema follows a relational model using PostgreSQL with appropriate indexes, constraints, and relationships to maintain data consistency and enable efficient querying.

## Entity Relationship Diagram

```
+----------------+       +----------------+       +----------------+
| Practice       |       | Provider       |       | Patient        |
+----------------+       +----------------+       +----------------+
| PK practice_id |<----->| PK provider_id |       | PK patient_id  |
| name           |       | FK practice_id |       | first_name     |
| address        |       | first_name     |       | last_name      |
| phone          |       | last_name      |       | email          |
| email          |       | email          |       | phone          |
| settings       |       | specialties    |       | date_of_birth  |
| created_at     |       | modalities     |       | insurance_info |
| updated_at     |       | availability   |       | preferences    |
+----------------+       | experience     |       | created_at     |
                         | telehealth     |       | updated_at     |
                         | created_at     |       +-------+--------+
                         | updated_at     |               |
                         +-------+--------+               |
                                 |                        |
                                 |                        |
                                 v                        v
                         +-------+------------------------+--------+
                         | Waitlist                                |
                         +----------------------------------------+
                         | PK waitlist_id                         |
                         | FK practice_id                         |
                         | name                                   |
                         | description                            |
                         | criteria                               |
                         | created_at                             |
                         | updated_at                             |
                         +----------------+-----------------------+
                                          |
                                          |
                                          v
                         +----------------+-----------------------+
                         | WaitlistEntry                          |
                         +----------------------------------------+
                         | PK entry_id                            |
                         | FK waitlist_id                         |
                         | FK patient_id                          |
                         | FK provider_id (preferred, nullable)   |
                         | priority_score                         |
                         | status                                 |
                         | notes                                  |
                         | created_at                             |
                         | updated_at                             |
                         +----------------+-----------------------+
                                          |
                                          |
            +---------------------------+ | +---------------------------+
            |                           | | |                           |
            v                           | v |                           v
+-----------+------------+  +-----------+-+-+------------+  +-----------+------------+
| Appointment            |  | AppointmentRequest         |  | Notification           |
+------------------------+  +----------------------------+  +------------------------+
| PK appointment_id      |  | PK request_id              |  | PK notification_id     |
| FK provider_id         |  | FK patient_id              |  | FK recipient_id        |
| FK patient_id          |  | FK provider_id             |  | recipient_type         |
| FK waitlist_entry_id   |  | FK waitlist_entry_id       |  | type                   |
| start_time             |  | FK appointment_slot_id     |  | content                |
| end_time               |  | status                     |  | status                 |
| status                 |  | requested_time             |  | sent_at                |
| type                   |  | notes                      |  | read_at                |
| notes                  |  | created_at                 |  | created_at             |
| created_at             |  | updated_at                 |  | updated_at             |
| updated_at             |  +----------------------------+  +------------------------+
+------------------------+
            |
            |
            v
+-----------+------------+
| AppointmentSlot        |
+------------------------+
| PK slot_id             |
| FK provider_id         |
| start_time             |
| end_time               |
| status                 |
| created_at             |
| updated_at             |
+------------------------+
```

## Table Definitions

### Practice

Stores information about mental health practices using the system.

| Column      | Type         | Constraints       | Description                           |
|-------------|--------------|-------------------|---------------------------------------|
| practice_id | UUID         | PK, NOT NULL      | Unique identifier for the practice    |
| name        | VARCHAR(255) | NOT NULL          | Practice name                         |
| address     | JSONB        | NOT NULL          | Practice address as structured data   |
| phone       | VARCHAR(20)  | NOT NULL          | Contact phone number                  |
| email       | VARCHAR(255) | NOT NULL, UNIQUE  | Contact email address                 |
| settings    | JSONB        | NOT NULL          | Practice configuration settings       |
| created_at  | TIMESTAMP    | NOT NULL, DEFAULT | Record creation timestamp             |
| updated_at  | TIMESTAMP    | NOT NULL, DEFAULT | Record last update timestamp          |

### Provider

Stores information about mental health providers within practices.

| Column       | Type         | Constraints       | Description                           |
|--------------|--------------|-------------------|---------------------------------------|
| provider_id  | UUID         | PK, NOT NULL      | Unique identifier for the provider    |
| practice_id  | UUID         | FK, NOT NULL      | Reference to associated practice      |
| first_name   | VARCHAR(100) | NOT NULL          | Provider's first name                 |
| last_name    | VARCHAR(100) | NOT NULL          | Provider's last name                  |
| email        | VARCHAR(255) | NOT NULL, UNIQUE  | Provider's email address              |
| specialties  | JSONB        | NOT NULL          | Provider's areas of specialization    |
| modalities   | JSONB        | NOT NULL          | Treatment modalities offered          |
| availability | JSONB        | NOT NULL          | Recurring availability pattern        |
| experience   | INTEGER      | NOT NULL          | Years of experience                   |
| telehealth   | BOOLEAN      | NOT NULL          | Whether provider offers telehealth    |
| created_at   | TIMESTAMP    | NOT NULL, DEFAULT | Record creation timestamp             |
| updated_at   | TIMESTAMP    | NOT NULL, DEFAULT | Record last update timestamp          |

### Patient

Stores information about patients using the system.

| Column         | Type         | Constraints       | Description                           |
|----------------|--------------|-------------------|---------------------------------------|
| patient_id     | UUID         | PK, NOT NULL      | Unique identifier for the patient     |
| first_name     | VARCHAR(100) | NOT NULL          | Patient's first name                  |
| last_name      | VARCHAR(100) | NOT NULL          | Patient's last name                   |
| email          | VARCHAR(255) | NOT NULL, UNIQUE  | Patient's email address               |
| phone          | VARCHAR(20)  | NOT NULL          | Patient's phone number                |
| date_of_birth  | DATE         | NOT NULL          | Patient's date of birth               |
| insurance_info | JSONB        | NOT NULL          | Patient's insurance information       |
| preferences    | JSONB        | NOT NULL          | Treatment and scheduling preferences  |
| created_at     | TIMESTAMP    | NOT NULL, DEFAULT | Record creation timestamp             |
| updated_at     | TIMESTAMP    | NOT NULL, DEFAULT | Record last update timestamp          |

### Waitlist

Stores information about waitlists created by practices.

| Column       | Type         | Constraints       | Description                           |
|--------------|--------------|-------------------|---------------------------------------|
| waitlist_id  | UUID         | PK, NOT NULL      | Unique identifier for the waitlist    |
| practice_id  | UUID         | FK, NOT NULL      | Reference to associated practice      |
| name         | VARCHAR(255) | NOT NULL          | Waitlist name                         |
| description  | TEXT         |                   | Waitlist description                  |
| criteria     | JSONB        | NOT NULL          | Matching criteria for this waitlist   |
| created_at   | TIMESTAMP    | NOT NULL, DEFAULT | Record creation timestamp             |
| updated_at   | TIMESTAMP    | NOT NULL, DEFAULT | Record last update timestamp          |

### WaitlistEntry

Stores information about patients on waitlists.

| Column        | Type         | Constraints       | Description                           |
|---------------|--------------|-------------------|---------------------------------------|
| entry_id      | UUID         | PK, NOT NULL      | Unique identifier for the entry       |
| waitlist_id   | UUID         | FK, NOT NULL      | Reference to associated waitlist      |
| patient_id    | UUID         | FK, NOT NULL      | Reference to associated patient       |
| provider_id   | UUID         | FK                | Preferred provider (if any)           |
| priority_score| FLOAT        | NOT NULL          | Calculated priority score             |
| status        | VARCHAR(50)  | NOT NULL          | Current status of waitlist entry      |
| notes         | TEXT         |                   | Additional notes                      |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT | Record creation timestamp             |
| updated_at    | TIMESTAMP    | NOT NULL, DEFAULT | Record last update timestamp          |

### AppointmentSlot

Stores information about available appointment slots.

| Column      | Type         | Constraints       | Description                           |
|-------------|--------------|-------------------|---------------------------------------|
| slot_id     | UUID         | PK, NOT NULL      | Unique identifier for the slot        |
| provider_id | UUID         | FK, NOT NULL      | Reference to associated provider      |
| start_time  | TIMESTAMP    | NOT NULL          | Start time of the appointment slot    |
| end_time    | TIMESTAMP    | NOT NULL          | End time of the appointment slot      |
| status      | VARCHAR(50)  | NOT NULL          | Current status of the slot            |
| created_at  | TIMESTAMP    | NOT NULL, DEFAULT | Record creation timestamp             |
| updated_at  | TIMESTAMP    | NOT NULL, DEFAULT | Record last update timestamp          |

### AppointmentRequest

Stores information about patient requests for appointments.

| Column            | Type         | Constraints       | Description                           |
|-------------------|--------------|-------------------|---------------------------------------|
| request_id        | UUID         | PK, NOT NULL      | Unique identifier for the request     |
| patient_id        | UUID         | FK, NOT NULL      | Reference to requesting patient       |
| provider_id       | UUID         | FK, NOT NULL      | Reference to requested provider       |
| waitlist_entry_id | UUID         | FK                | Reference to waitlist entry if any    |
| appointment_slot_id | UUID       | FK, NOT NULL      | Reference to requested slot           |
| status            | VARCHAR(50)  | NOT NULL          | Current status of the request         |
| requested_time    | TIMESTAMP    | NOT NULL          | When the request was made             |
| notes             | TEXT         |                   | Additional notes                      |
| created_at        | TIMESTAMP    | NOT NULL, DEFAULT | Record creation timestamp             |
| updated_at        | TIMESTAMP    | NOT NULL, DEFAULT | Record last update timestamp          |

### Appointment

Stores information about confirmed appointments.

| Column            | Type         | Constraints       | Description                           |
|-------------------|--------------|-------------------|---------------------------------------|
| appointment_id    | UUID         | PK, NOT NULL      | Unique identifier for the appointment |
| provider_id       | UUID         | FK, NOT NULL      | Reference to associated provider      |
| patient_id        | UUID         | FK, NOT NULL      | Reference to associated patient       |
| waitlist_entry_id | UUID         | FK                | Reference to waitlist entry if any    |
| start_time        | TIMESTAMP    | NOT NULL          | Start time of the appointment         |
| end_time          | TIMESTAMP    | NOT NULL          | End time of the appointment           |
| status            | VARCHAR(50)  | NOT NULL          | Current status of the appointment     |
| type              | VARCHAR(50)  | NOT NULL          | Type of appointment (in-person/virtual)|
| notes             | TEXT         |                   | Additional notes                      |
| created_at        | TIMESTAMP    | NOT NULL, DEFAULT | Record creation timestamp             |
| updated_at        | TIMESTAMP    | NOT NULL, DEFAULT | Record last update timestamp          |

### Notification

Stores information about notifications sent to users.

| Column         | Type         | Constraints       | Description                           |
|----------------|--------------|-------------------|---------------------------------------|
| notification_id| UUID         | PK, NOT NULL      | Unique identifier for the notification|
| recipient_id   | UUID         | NOT NULL          | ID of the recipient                   |
| recipient_type | VARCHAR(50)  | NOT NULL          | Type of recipient (patient/provider)  |
| type           | VARCHAR(50)  | NOT NULL          | Type of notification                  |
| content        | JSONB        | NOT NULL          | Content of the notification           |
| status         | VARCHAR(50)  | NOT NULL          | Current status of the notification    |
| sent_at        | TIMESTAMP    |                   | When the notification was sent        |
| read_at        | TIMESTAMP    |                   | When the notification was read        |
| created_at     | TIMESTAMP    | NOT NULL, DEFAULT | Record creation timestamp             |
| updated_at     | TIMESTAMP    | NOT NULL, DEFAULT | Record last update timestamp          |

## Indexes

To optimize query performance, the following indexes will be created:

1. **Practice Table**
   - Index on `email` for quick lookup during authentication

2. **Provider Table**
   - Index on `practice_id` for filtering providers by practice
   - Index on `email` for quick lookup during authentication
   - Composite index on `practice_id` and `specialties` for specialty-based filtering

3. **Patient Table**
   - Index on `email` for quick lookup during authentication
   - Index on `insurance_info` using GIN for JSON path queries

4. **Waitlist Table**
   - Index on `practice_id` for filtering waitlists by practice

5. **WaitlistEntry Table**
   - Index on `waitlist_id` for filtering entries by waitlist
   - Index on `patient_id` for filtering entries by patient
   - Index on `provider_id` for filtering entries by preferred provider
   - Index on `priority_score` for sorting by priority
   - Index on `status` for filtering by status

6. **AppointmentSlot Table**
   - Index on `provider_id` for filtering slots by provider
   - Index on `start_time` for time-based queries
   - Composite index on `provider_id` and `status` for available slot queries

7. **AppointmentRequest Table**
   - Index on `patient_id` for filtering requests by patient
   - Index on `provider_id` for filtering requests by provider
   - Index on `appointment_slot_id` for filtering by slot
   - Index on `status` for filtering by status

8. **Appointment Table**
   - Index on `provider_id` for filtering appointments by provider
   - Index on `patient_id` for filtering appointments by patient
   - Index on `start_time` for time-based queries
   - Index on `status` for filtering by status

9. **Notification Table**
   - Composite index on `recipient_id` and `recipient_type` for filtering notifications
   - Index on `status` for filtering by status

## Data Security and HIPAA Compliance

To ensure HIPAA compliance and data security, the following measures will be implemented at the database level:

1. **Encryption**
   - All sensitive data will be encrypted at rest using PostgreSQL's encryption features
   - Column-level encryption for PII using pgcrypto extension

2. **Access Control**
   - Row-level security policies to restrict access based on user roles
   - Database roles with least privilege principles

3. **Audit Logging**
   - Comprehensive audit logging using PostgreSQL's audit extension
   - Tracking of all data access and modifications

4. **Data Retention**
   - Automated data archiving and purging based on retention policies
   - Secure deletion procedures for removed data

5. **Backup and Recovery**
   - Point-in-time recovery capabilities
   - Encrypted backups with secure key management

## Data Validation and Integrity

To maintain data quality and integrity, the following constraints will be implemented:

1. **Foreign Key Constraints**
   - Ensure referential integrity between related tables
   - Appropriate cascade or restrict actions for updates and deletes

2. **Check Constraints**
   - Validate data ranges and formats (e.g., email formats, phone numbers)
   - Ensure business rules are enforced at the database level

3. **Unique Constraints**
   - Prevent duplicate records where appropriate
   - Composite unique constraints for business-level uniqueness

4. **Not Null Constraints**
   - Ensure required data is always provided
   - Default values for optional fields when appropriate

## Schema Evolution Strategy

To support future enhancements and changes:

1. **Version Control**
   - Database schema changes will be version controlled
   - Migration scripts for schema updates

2. **Backward Compatibility**
   - New columns will be added with default values
   - Deprecated columns will be marked before removal

3. **Schema Documentation**
   - Comprehensive documentation of schema changes
   - Clear communication of breaking changes

4. **Testing Strategy**
   - Automated testing of migrations
   - Data validation after schema changes
