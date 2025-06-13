-- Disable RLS for seeding
ALTER TABLE IF EXISTS practices DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS providers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS waitlists DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS waitlist_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;

-- Clear existing data
TRUNCATE practices, providers, patients, waitlists, waitlist_entries CASCADE;

-- Insert practice
INSERT INTO practices (practice_id, name, address, phone, email) 
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Serenity Mental Health Center',
    '{"street": "123 Wellness Way", "city": "San Francisco", "state": "CA", "zipCode": "94105"}'::json,
    '(415) 555-0100',
    'info@serenitymhc.com'
);

-- Insert providers
INSERT INTO providers (practice_id, first_name, last_name, email) VALUES
('11111111-1111-1111-1111-111111111111', 'Sarah', 'Chen', 'sarah.chen@serenitymhc.com'),
('11111111-1111-1111-1111-111111111111', 'Michael', 'Rodriguez', 'michael.rodriguez@serenitymhc.com'),
('11111111-1111-1111-1111-111111111111', 'Emily', 'Johnson', 'emily.johnson@serenitymhc.com'),
('11111111-1111-1111-1111-111111111111', 'David', 'Williams', 'david.williams@serenitymhc.com'),
('11111111-1111-1111-1111-111111111111', 'Lisa', 'Anderson', 'lisa.anderson@serenitymhc.com'),
('11111111-1111-1111-1111-111111111111', 'James', 'Taylor', 'james.taylor@serenitymhc.com'),
('11111111-1111-1111-1111-111111111111', 'Maria', 'Garcia', 'maria.garcia@serenitymhc.com'),
('11111111-1111-1111-1111-111111111111', 'Robert', 'Martinez', 'robert.martinez@serenitymhc.com'),
('11111111-1111-1111-1111-111111111111', 'Jennifer', 'Brown', 'jennifer.brown@serenitymhc.com'),
('11111111-1111-1111-1111-111111111111', 'William', 'Davis', 'william.davis@serenitymhc.com');

-- Insert 30 patients
INSERT INTO patients (first_name, last_name, email, phone, date_of_birth) VALUES
('John', 'Smith', 'john.smith@email.com', '(415) 555-0101', '1985-03-15'),
('Emily', 'Davis', 'emily.davis@email.com', '(415) 555-0102', '1990-07-22'),
('Michael', 'Brown', 'michael.brown@email.com', '(415) 555-0103', '1978-11-08'),
('Sarah', 'Wilson', 'sarah.wilson@email.com', '(415) 555-0104', '1995-02-28'),
('David', 'Martinez', 'david.martinez@email.com', '(415) 555-0105', '1982-09-12'),
('Jessica', 'Anderson', 'jessica.anderson@email.com', '(415) 555-0106', '1988-05-20'),
('Christopher', 'Taylor', 'chris.taylor@email.com', '(415) 555-0107', '1992-10-30'),
('Amanda', 'Thomas', 'amanda.thomas@email.com', '(415) 555-0108', '1986-12-15'),
('Daniel', 'Jackson', 'daniel.jackson@email.com', '(415) 555-0109', '1983-04-08'),
('Michelle', 'White', 'michelle.white@email.com', '(415) 555-0110', '1991-08-25'),
('James', 'Harris', 'james.harris@email.com', '(415) 555-0111', '1979-06-18'),
('Patricia', 'Martin', 'patricia.martin@email.com', '(415) 555-0112', '1987-11-02'),
('Robert', 'Thompson', 'robert.thompson@email.com', '(415) 555-0113', '1984-01-27'),
('Linda', 'Garcia', 'linda.garcia@email.com', '(415) 555-0114', '1993-09-14'),
('Kevin', 'Robinson', 'kevin.robinson@email.com', '(415) 555-0115', '1980-07-05'),
('Karen', 'Clark', 'karen.clark@email.com', '(415) 555-0116', '1989-03-23'),
('Steven', 'Rodriguez', 'steven.rodriguez@email.com', '(415) 555-0117', '1985-10-11'),
('Betty', 'Lewis', 'betty.lewis@email.com', '(415) 555-0118', '1994-05-07'),
('Mark', 'Lee', 'mark.lee@email.com', '(415) 555-0119', '1981-12-29'),
('Nancy', 'Walker', 'nancy.walker@email.com', '(415) 555-0120', '1990-04-16'),
('Thomas', 'Hall', 'thomas.hall@email.com', '(415) 555-0121', '1977-08-13'),
('Donna', 'Allen', 'donna.allen@email.com', '(415) 555-0122', '1988-02-09'),
('Paul', 'Young', 'paul.young@email.com', '(415) 555-0123', '1983-11-21'),
('Sandra', 'King', 'sandra.king@email.com', '(415) 555-0124', '1992-06-04'),
('Brian', 'Wright', 'brian.wright@email.com', '(415) 555-0125', '1986-09-19'),
('Ashley', 'Lopez', 'ashley.lopez@email.com', '(415) 555-0126', '1995-01-12'),
('Kenneth', 'Hill', 'kenneth.hill@email.com', '(415) 555-0127', '1979-07-28'),
('Helen', 'Scott', 'helen.scott@email.com', '(415) 555-0128', '1987-03-06'),
('Joshua', 'Green', 'joshua.green@email.com', '(415) 555-0129', '1991-10-24'),
('Maria', 'Adams', 'maria.adams@email.com', '(415) 555-0130', '1984-05-31');

-- Create waitlist
INSERT INTO waitlists (practice_id, name, description)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'General Waitlist',
    'Main waitlist for new patient appointments'
);

-- Add all patients to waitlist with varying priority scores
INSERT INTO waitlist_entries (waitlist_id, patient_id, status, priority_score, notes)
SELECT 
    w.waitlist_id,
    p.patient_id,
    'waiting',
    50 + floor(random() * 50)::int as priority_score,
    CASE 
        WHEN random() < 0.2 THEN 'Urgent - immediate attention needed'
        WHEN random() < 0.4 THEN 'Prefers morning appointments'
        WHEN random() < 0.6 THEN 'Flexible schedule'
        ELSE 'New patient consultation'
    END
FROM patients p
CROSS JOIN waitlists w
WHERE w.name = 'General Waitlist';

-- Display results
SELECT 'Data seeded successfully!' as message;
SELECT 'Practices' as table_name, COUNT(*) as count FROM practices
UNION ALL
SELECT 'Providers', COUNT(*) FROM providers
UNION ALL
SELECT 'Patients', COUNT(*) FROM patients
UNION ALL
SELECT 'Waitlists', COUNT(*) FROM waitlists
UNION ALL
SELECT 'Waitlist Entries', COUNT(*) FROM waitlist_entries;