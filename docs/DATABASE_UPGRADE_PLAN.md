# Database Upgrade Plan for Project-H

## Executive Summary

After comprehensive analysis of the Project-H codebase, I've identified critical database upgrade opportunities that will enhance performance, security, and HIPAA compliance. This plan addresses the current mixed architecture (PostgreSQL backend + Supabase frontend) and proposes strategic improvements.

## Current State Analysis

### Architecture Overview
- **Backend**: Node.js with Knex.js ORM connecting to PostgreSQL
- **Frontend**: React with Supabase client for direct database access
- **Mixed Pattern**: Both backend APIs and frontend direct DB access
- **Security**: Basic RLS policies in Supabase, HIPAA compliance requirements

### Key Findings
1. **Dual Database Access Pattern**: Frontend uses Supabase while backend uses Knex.js
2. **Limited Field-Level Encryption**: PHI data stored without field-level encryption
3. **Basic Indexing**: Missing optimized indexes for complex queries
4. **No Partitioning**: Large tables (appointments, audit_logs) lack partitioning
5. **Limited Caching**: No database-level caching strategy
6. **Basic RLS**: Row-level security needs enhancement for HIPAA compliance

## Upgrade Recommendations

### 1. Database Performance Optimization

#### A. Advanced Indexing Strategy
```sql
-- Composite indexes for common query patterns
CREATE INDEX idx_appointments_provider_date ON appointments(provider_id, start_time) 
  WHERE status = 'scheduled';

CREATE INDEX idx_waitlist_entries_matching ON waitlist_entries(waitlist_id, status, priority_score DESC) 
  WHERE status = 'active';

-- Partial indexes for filtered queries
CREATE INDEX idx_providers_active_specialties ON providers 
  USING GIN (specialties) 
  WHERE telehealth = true;

-- Text search index for patient search
CREATE INDEX idx_patients_search ON patients 
  USING GIN (to_tsvector('english', first_name || ' ' || last_name || ' ' || email));
```

#### B. Table Partitioning
```sql
-- Partition appointments by month for better query performance
ALTER TABLE appointments RENAME TO appointments_old;

CREATE TABLE appointments (
  LIKE appointments_old INCLUDING ALL
) PARTITION BY RANGE (start_time);

-- Create monthly partitions
CREATE TABLE appointments_2025_01 PARTITION OF appointments
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE appointments_2025_02 PARTITION OF appointments
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Partition audit_logs by month
ALTER TABLE audit_logs RENAME TO audit_logs_old;

CREATE TABLE audit_logs (
  LIKE audit_logs_old INCLUDING ALL
) PARTITION BY RANGE (created_at);
```

### 2. Security & HIPAA Compliance

#### A. Field-Level Encryption for PHI
```sql
-- Create encrypted columns for sensitive PHI data
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add encrypted columns
ALTER TABLE patients 
  ADD COLUMN ssn_encrypted bytea,
  ADD COLUMN medical_history_encrypted bytea,
  ADD COLUMN insurance_details_encrypted bytea;

-- Create functions for transparent encryption/decryption
CREATE OR REPLACE FUNCTION encrypt_phi(data text, key_id uuid) 
RETURNS bytea AS $$
BEGIN
  RETURN pgp_sym_encrypt(data, get_encryption_key(key_id), 'cipher-algo=aes256');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_phi(encrypted_data bytea, key_id uuid) 
RETURNS text AS $$
BEGIN
  RETURN pgp_sym_decrypt(encrypted_data, get_encryption_key(key_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### B. Enhanced Row-Level Security
```sql
-- Mental health specific RLS policies
CREATE POLICY "psychotherapy_notes_access" ON appointments
  FOR ALL
  USING (
    -- Only treating provider or patient can access therapy notes
    (type = 'psychotherapy' AND (
      provider_id = auth.uid() OR 
      patient_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM patient_consents pc
        WHERE pc.patient_id = appointments.patient_id
        AND pc.consent_type = 'psychotherapy_notes_access'
        AND pc.granted_to = auth.uid()
        AND pc.valid_until > NOW()
      )
    ))
    OR type != 'psychotherapy'
  );

-- Crisis intervention access
CREATE POLICY "crisis_intervention_access" ON appointments
  FOR SELECT
  USING (
    type = 'crisis_intervention' AND (
      -- Emergency personnel with valid crisis access
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.role IN ('emergency_provider', 'crisis_counselor')
        AND u.crisis_access_expires > NOW()
      )
      OR provider_id = auth.uid()
      OR patient_id = auth.uid()
    )
  );
```

### 3. Data Architecture Improvements

#### A. Unified Database Access Layer
```javascript
// Create a unified data access layer
// backend/src/database/UnifiedDataAccess.js

class UnifiedDataAccess {
  constructor() {
    this.knex = require('../config/database');
    this.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  }

  // Unified query interface
  async query(table, options = {}) {
    if (options.useSupabase && this.isPublicQuery(table, options)) {
      return this.supabaseQuery(table, options);
    }
    return this.knexQuery(table, options);
  }

  // Automatic query routing based on security requirements
  isPublicQuery(table, options) {
    const publicTables = ['providers', 'practices', 'appointment_slots'];
    return publicTables.includes(table) && !options.includePHI;
  }
}
```

#### B. Caching Strategy
```sql
-- Create materialized views for expensive queries
CREATE MATERIALIZED VIEW provider_availability_summary AS
SELECT 
  p.provider_id,
  p.first_name,
  p.last_name,
  COUNT(DISTINCT as2.slot_id) as available_slots,
  MIN(as2.start_time) as next_available,
  array_agg(DISTINCT s.name) as specialties
FROM providers p
LEFT JOIN appointment_slots as2 ON p.provider_id = as2.provider_id
LEFT JOIN provider_specialties ps ON p.provider_id = ps.provider_id
LEFT JOIN specialties s ON ps.specialty_id = s.id
WHERE as2.status = 'available' AND as2.start_time > NOW()
GROUP BY p.provider_id, p.first_name, p.last_name;

-- Refresh strategy
CREATE OR REPLACE FUNCTION refresh_provider_availability()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY provider_availability_summary;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh every 15 minutes
SELECT cron.schedule('refresh-provider-availability', '*/15 * * * *', 
  'SELECT refresh_provider_availability()');
```

### 4. Audit & Compliance Enhancements

#### A. Enhanced Audit Trail
```sql
-- Create comprehensive audit trigger
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS trigger AS $$
DECLARE
  audit_data jsonb;
  table_name text;
  operation text;
BEGIN
  table_name := TG_TABLE_NAME;
  operation := TG_OP;
  
  -- Build audit data
  audit_data := jsonb_build_object(
    'table_name', table_name,
    'operation', operation,
    'user_id', current_setting('app.current_user_id', true),
    'ip_address', current_setting('app.current_ip', true),
    'timestamp', NOW(),
    'session_id', current_setting('app.session_id', true)
  );
  
  -- Add row data based on operation
  IF operation = 'DELETE' THEN
    audit_data := audit_data || jsonb_build_object('old_data', row_to_json(OLD));
  ELSIF operation = 'UPDATE' THEN
    audit_data := audit_data || jsonb_build_object(
      'old_data', row_to_json(OLD),
      'new_data', row_to_json(NEW),
      'changed_fields', jsonb_diff(row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb)
    );
  ELSIF operation = 'INSERT' THEN
    audit_data := audit_data || jsonb_build_object('new_data', row_to_json(NEW));
  END IF;
  
  -- Insert into partitioned audit log
  INSERT INTO audit_logs (action, entity_type, entity_id, details, user_id, ip_address)
  VALUES (
    operation,
    table_name,
    COALESCE(NEW.id, OLD.id),
    audit_data,
    current_setting('app.current_user_id', true)::uuid,
    current_setting('app.current_ip', true)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all PHI tables
CREATE TRIGGER audit_patients AFTER INSERT OR UPDATE OR DELETE ON patients
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_appointments AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

### 5. Mood Tracking Enhancement (Per CLAUDE.md)

```sql
-- Create mood tracking tables
CREATE TABLE mood_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(patient_id),
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
  mood_color VARCHAR(7) NOT NULL, -- Hex color based on score
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_mood_entries_patient_date ON mood_entries(patient_id, created_at DESC);

-- Mood analytics view
CREATE MATERIALIZED VIEW patient_mood_analytics AS
SELECT 
  patient_id,
  AVG(mood_score) as avg_mood_last_7_days,
  AVG(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN mood_score END) as avg_mood_last_30_days,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as entries_last_7_days,
  MAX(created_at) as last_entry_date,
  -- Calculate streak
  (SELECT COUNT(*) FROM (
    SELECT created_at::date, 
           created_at::date - ROW_NUMBER() OVER (ORDER BY created_at::date) * INTERVAL '1 day' as grp
    FROM mood_entries me2
    WHERE me2.patient_id = me.patient_id
    AND me2.created_at > NOW() - INTERVAL '90 days'
    GROUP BY created_at::date
  ) t
  WHERE grp = (SELECT MAX(grp) FROM (
    SELECT created_at::date - ROW_NUMBER() OVER (ORDER BY created_at::date) * INTERVAL '1 day' as grp
    FROM mood_entries me3
    WHERE me3.patient_id = me.patient_id
    GROUP BY created_at::date
  ) t2)) as current_streak
FROM mood_entries me
WHERE created_at > NOW() - INTERVAL '90 days'
GROUP BY patient_id;
```

## Implementation Plan

### Phase 1: Performance & Indexing (Week 1-2)
1. Implement advanced indexing strategy
2. Set up table partitioning for appointments and audit_logs
3. Create materialized views for common queries
4. Test query performance improvements

### Phase 2: Security & Encryption (Week 3-4)
1. Implement field-level encryption for PHI
2. Enhanced RLS policies for mental health data
3. Update backend models to handle encryption
4. Test HIPAA compliance features

### Phase 3: Architecture Unification (Week 5-6)
1. Create unified data access layer
2. Implement caching strategy
3. Update frontend to use secure patterns
4. Performance testing

### Phase 4: Monitoring & Optimization (Week 7-8)
1. Set up query performance monitoring
2. Implement automated maintenance tasks
3. Create compliance dashboards
4. Load testing and optimization

## Risk Mitigation

1. **Data Migration**: Use blue-green deployment for zero-downtime migration
2. **Backward Compatibility**: Maintain compatibility during transition
3. **Testing**: Comprehensive test suite for all changes
4. **Rollback Plan**: Automated rollback procedures for each phase

## Success Metrics

1. **Performance**: 50% reduction in query response times
2. **Security**: 100% PHI encryption coverage
3. **Compliance**: Pass HIPAA security audit
4. **Reliability**: 99.9% uptime during migration

## Conclusion

This upgrade plan addresses critical performance, security, and compliance requirements while maintaining system stability. The phased approach ensures minimal disruption while delivering significant improvements to the Project-H database infrastructure.