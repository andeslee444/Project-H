-- Update the first patient on the waitlist to have the test phone number
-- This will allow SMS testing with 833-820-5947

-- First, let's find a patient that's on the waitlist
UPDATE patients 
SET phone = '(833) 820-5947'
WHERE patient_id IN (
    SELECT patient_id 
    FROM waitlist_entries 
    WHERE status = 'waiting'
    AND patient_id IS NOT NULL
    LIMIT 1
);

-- Verify the update
SELECT 
    p.patient_id,
    p.first_name,
    p.last_name,
    p.phone,
    we.status
FROM patients p
INNER JOIN waitlist_entries we ON p.patient_id = we.patient_id
WHERE p.phone = '(833) 820-5947';