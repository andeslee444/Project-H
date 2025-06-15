-- Create SMS queue table for waterfall messaging
CREATE TABLE IF NOT EXISTS sms_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipients JSONB NOT NULL,
  interval_minutes INTEGER DEFAULT 5,
  status VARCHAR(50) DEFAULT 'pending',
  current_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_log JSONB DEFAULT '[]'::jsonb
);

-- Add RLS policies
ALTER TABLE sms_queue ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_sms_queue_status ON sms_queue(status);
CREATE INDEX idx_sms_queue_created_at ON sms_queue(created_at);

-- Create a function to process waterfall queue (would be called by a cron job)
CREATE OR REPLACE FUNCTION process_sms_waterfall_queue()
RETURNS void AS $$
DECLARE
  queue_record RECORD;
  recipient JSONB;
  next_index INTEGER;
BEGIN
  -- Find active waterfall jobs that need processing
  FOR queue_record IN 
    SELECT * FROM sms_queue 
    WHERE status = 'pending' 
    AND current_index < jsonb_array_length(recipients)
    AND (
      created_at + (interval '1 minute' * interval_minutes * current_index) <= NOW()
    )
  LOOP
    -- Get the next recipient
    recipient := queue_record.recipients->queue_record.current_index;
    
    -- Here you would call the Twilio API
    -- For now, we just update the index
    
    next_index := queue_record.current_index + 1;
    
    -- Update the queue record
    UPDATE sms_queue 
    SET 
      current_index = next_index,
      updated_at = NOW(),
      status = CASE 
        WHEN next_index >= jsonb_array_length(queue_record.recipients) THEN 'completed'
        ELSE 'pending'
      END,
      completed_at = CASE 
        WHEN next_index >= jsonb_array_length(queue_record.recipients) THEN NOW()
        ELSE NULL
      END
    WHERE id = queue_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create SMS logs table for tracking
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  queue_id UUID REFERENCES sms_queue(id),
  recipient_phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) NOT NULL,
  twilio_message_id VARCHAR(255),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_sms_logs_queue_id ON sms_logs(queue_id);
CREATE INDEX idx_sms_logs_sent_at ON sms_logs(sent_at);