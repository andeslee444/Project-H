# 🔌 Supabase Connection Guide - Project H Frontend

## Overview

The Project-H frontend connects to Supabase for authentication, database operations, and real-time features. Here's how it's structured:

## 🔑 Connection Architecture

### 1. **Supabase Client Configuration** (`src/lib/supabase.js`)
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qjsktpjgfwtgpnmsonrq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**⚠️ Important**: These are hardcoded credentials that should be moved to environment variables for security.

### 2. **Environment Configuration** (`src/config/features/database.config.ts`)

The app supports environment-based configuration:

```typescript
// Development
supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321'
supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key'

// Production
supabaseUrl: import.meta.env.VITE_SUPABASE_URL || ''
supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
```

## 🔐 Authentication Flow (`src/hooks/useAuth.jsx`)

### Connection Flow:
1. **Initial Session Check** - On app load, checks for existing Supabase session
2. **User Profile Fetch** - Gets user details from `users` table
3. **Auth State Listener** - Real-time auth state changes via `onAuthStateChange`
4. **Session Management** - Handles login, logout, and session persistence

```javascript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})

// Get Session
const { data: { session } } = await supabase.auth.getSession()

// Logout
await supabase.auth.signOut()
```

## 📊 Database Operations (`src/services/supabaseService.js`)

### Main Service Features:

#### 1. **CRUD Operations**
- Practices: `getPractices()`, `createPractice()`
- Providers: `getProviders()`, `createProvider()`
- Patients: `getPatients()`, `createPatient()`, `getPatient()`
- Appointments: `getAppointments()`, `createAppointment()`, `updateAppointment()`
- Waitlists: `getWaitlists()`, `joinWaitlist()`, `updateWaitlistEntry()`

#### 2. **Real-time Subscriptions**
```javascript
// Subscribe to appointments
subscribeToAppointments(callback, filters)

// Subscribe to waitlist changes
subscribeToWaitlistEntries(callback, waitlistId)

// Subscribe to notifications
subscribeToNotifications(callback, recipientId)
```

#### 3. **Edge Functions**
```javascript
// Patient matching algorithm
await supabase.functions.invoke('patient-matching', {
  body: { slot_id: slotId, options }
})
```

## 🗄️ Database Schema

The frontend expects these main tables:
- `users` - User authentication and profiles
- `practices` - Medical practices
- `providers` - Healthcare providers
- `patients` - Patient records
- `appointments` - Scheduled appointments
- `appointment_slots` - Available time slots
- `waitlists` - Practice waitlists
- `waitlist_entries` - Patient waitlist entries
- `notifications` - System notifications

## 🔧 Setup Instructions

### 1. **Create Environment File**
Create a `.env` file in the frontend directory:

```bash
# .env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. **Update Supabase Client**
Modify `src/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 3. **Supabase Project Setup**

In your Supabase project:

1. **Enable Authentication**
   - Email/Password authentication
   - Configure password policies

2. **Create Database Tables**
   - Run migrations from `backend/migrations/`
   - Set up Row Level Security (RLS) policies

3. **Configure RLS Policies**
   ```sql
   -- Example: Users can only see their own data
   CREATE POLICY "Users can view own profile" 
   ON users FOR SELECT 
   USING (auth.uid() = id);
   ```

4. **Set up Edge Functions** (if using patient matching)
   - Deploy the `patient-matching` function

## 🚨 Security Considerations

1. **Never commit credentials** - Always use environment variables
2. **Enable RLS** - Row Level Security is crucial for data protection
3. **Use Service Role Key carefully** - Only on backend, never in frontend
4. **Validate permissions** - Check user roles before sensitive operations

## 🔄 Data Flow

```
Frontend Component
    ↓
useAuth Hook / supabaseService
    ↓
Supabase Client (lib/supabase.js)
    ↓
Supabase Backend
    ↓
PostgreSQL Database
```

## 🛠️ Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables"**
   - Ensure `.env` file exists with correct values
   - Restart dev server after adding `.env`

2. **"Permission denied" errors**
   - Check RLS policies in Supabase dashboard
   - Verify user authentication status

3. **Real-time not working**
   - Enable real-time for tables in Supabase dashboard
   - Check WebSocket connection

4. **Auth session issues**
   - Clear localStorage and cookies
   - Check Supabase auth settings

## 📝 Best Practices

1. **Use environment variables** for all Supabase configuration
2. **Implement proper error handling** for all database operations
3. **Unsubscribe from real-time** listeners on component unmount
4. **Cache frequently accessed data** to reduce database calls
5. **Use TypeScript types** for database schema (when migrating to TS)

## 🔗 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime/subscriptions)