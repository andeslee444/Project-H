/**
 * Database schema definitions for Mental Health Practice Scheduling and Waitlist Management System
 * This file defines the Knex.js migrations for creating all required database tables
 */

exports.up = function(knex) {
  return knex.schema
    // Practices table
    .createTable('practices', function(table) {
      table.uuid('practice_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name', 255).notNullable();
      table.jsonb('address').notNullable();
      table.string('phone', 20).notNullable();
      table.string('email', 255).notNullable().unique();
      table.jsonb('settings').notNullable().defaultTo('{}');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    })
    
    // Providers table
    .createTable('providers', function(table) {
      table.uuid('provider_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('practice_id').notNullable().references('practice_id').inTable('practices').onDelete('CASCADE');
      table.string('first_name', 100).notNullable();
      table.string('last_name', 100).notNullable();
      table.string('email', 255).notNullable().unique();
      table.jsonb('specialties').notNullable().defaultTo('[]');
      table.jsonb('modalities').notNullable().defaultTo('[]');
      table.jsonb('availability').notNullable().defaultTo('{}');
      table.integer('experience').notNullable().defaultTo(0);
      table.boolean('telehealth').notNullable().defaultTo(false);
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      
      // Indexes
      table.index('practice_id');
      table.index('email');
    })
    
    // Patients table
    .createTable('patients', function(table) {
      table.uuid('patient_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('first_name', 100).notNullable();
      table.string('last_name', 100).notNullable();
      table.string('email', 255).notNullable().unique();
      table.string('phone', 20).notNullable();
      table.date('date_of_birth').notNullable();
      table.jsonb('insurance_info').notNullable().defaultTo('{}');
      table.jsonb('preferences').notNullable().defaultTo('{}');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      
      // Indexes
      table.index('email');
    })
    
    // Waitlists table
    .createTable('waitlists', function(table) {
      table.uuid('waitlist_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('practice_id').notNullable().references('practice_id').inTable('practices').onDelete('CASCADE');
      table.string('name', 255).notNullable();
      table.text('description');
      table.jsonb('criteria').notNullable().defaultTo('{}');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      
      // Indexes
      table.index('practice_id');
    })
    
    // WaitlistEntries table
    .createTable('waitlist_entries', function(table) {
      table.uuid('entry_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('waitlist_id').notNullable().references('waitlist_id').inTable('waitlists').onDelete('CASCADE');
      table.uuid('patient_id').notNullable().references('patient_id').inTable('patients').onDelete('CASCADE');
      table.uuid('provider_id').references('provider_id').inTable('providers').onDelete('SET NULL');
      table.float('priority_score').notNullable().defaultTo(0);
      table.string('status', 50).notNullable().defaultTo('active');
      table.text('notes');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      
      // Indexes
      table.index('waitlist_id');
      table.index('patient_id');
      table.index('provider_id');
      table.index('priority_score');
      table.index('status');
    })
    
    // AppointmentSlots table
    .createTable('appointment_slots', function(table) {
      table.uuid('slot_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('provider_id').notNullable().references('provider_id').inTable('providers').onDelete('CASCADE');
      table.timestamp('start_time').notNullable();
      table.timestamp('end_time').notNullable();
      table.string('status', 50).notNullable().defaultTo('available');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      
      // Indexes
      table.index('provider_id');
      table.index('start_time');
      table.index(['provider_id', 'status']);
    })
    
    // AppointmentRequests table
    .createTable('appointment_requests', function(table) {
      table.uuid('request_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('patient_id').notNullable().references('patient_id').inTable('patients').onDelete('CASCADE');
      table.uuid('provider_id').notNullable().references('provider_id').inTable('providers').onDelete('CASCADE');
      table.uuid('waitlist_entry_id').references('entry_id').inTable('waitlist_entries').onDelete('SET NULL');
      table.uuid('appointment_slot_id').notNullable().references('slot_id').inTable('appointment_slots').onDelete('CASCADE');
      table.string('status', 50).notNullable().defaultTo('pending');
      table.timestamp('requested_time').notNullable().defaultTo(knex.fn.now());
      table.text('notes');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      
      // Indexes
      table.index('patient_id');
      table.index('provider_id');
      table.index('appointment_slot_id');
      table.index('status');
    })
    
    // Appointments table
    .createTable('appointments', function(table) {
      table.uuid('appointment_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('provider_id').notNullable().references('provider_id').inTable('providers').onDelete('CASCADE');
      table.uuid('patient_id').notNullable().references('patient_id').inTable('patients').onDelete('CASCADE');
      table.uuid('waitlist_entry_id').references('entry_id').inTable('waitlist_entries').onDelete('SET NULL');
      table.timestamp('start_time').notNullable();
      table.timestamp('end_time').notNullable();
      table.string('status', 50).notNullable().defaultTo('scheduled');
      table.string('type', 50).notNullable().defaultTo('in-person');
      table.text('notes');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      
      // Indexes
      table.index('provider_id');
      table.index('patient_id');
      table.index('start_time');
      table.index('status');
    })
    
    // Notifications table
    .createTable('notifications', function(table) {
      table.uuid('notification_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('recipient_id').notNullable();
      table.string('recipient_type', 50).notNullable();
      table.string('type', 50).notNullable();
      table.jsonb('content').notNullable();
      table.string('status', 50).notNullable().defaultTo('pending');
      table.timestamp('sent_at');
      table.timestamp('read_at');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      
      // Indexes
      table.index(['recipient_id', 'recipient_type']);
      table.index('status');
    })
    
    // Users table for authentication
    .createTable('users', function(table) {
      table.uuid('user_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('email', 255).notNullable().unique();
      table.string('password_hash', 255).notNullable();
      table.string('role', 50).notNullable();
      table.uuid('reference_id').notNullable();
      table.string('reference_type', 50).notNullable();
      table.boolean('active').notNullable().defaultTo(true);
      table.timestamp('last_login');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      
      // Indexes
      table.index('email');
      table.index('role');
      table.index(['reference_id', 'reference_type']);
    })
    
    // Roles table
    .createTable('roles', function(table) {
      table.string('role_id', 50).primary();
      table.string('name', 100).notNullable();
      table.text('description');
      table.jsonb('permissions').notNullable().defaultTo('[]');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    })
    
    // AuditLogs table
    .createTable('audit_logs', function(table) {
      table.uuid('log_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').references('user_id').inTable('users').onDelete('SET NULL');
      table.string('action', 100).notNullable();
      table.string('entity_type', 100).notNullable();
      table.uuid('entity_id');
      table.jsonb('details').notNullable().defaultTo('{}');
      table.string('ip_address', 50);
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      
      // Indexes
      table.index('user_id');
      table.index('action');
      table.index(['entity_type', 'entity_id']);
      table.index('created_at');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('audit_logs')
    .dropTableIfExists('roles')
    .dropTableIfExists('users')
    .dropTableIfExists('notifications')
    .dropTableIfExists('appointments')
    .dropTableIfExists('appointment_requests')
    .dropTableIfExists('appointment_slots')
    .dropTableIfExists('waitlist_entries')
    .dropTableIfExists('waitlists')
    .dropTableIfExists('patients')
    .dropTableIfExists('providers')
    .dropTableIfExists('practices');
};
