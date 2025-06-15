/**
 * Example backend endpoint for Twilio SMS integration
 * This should be implemented in your backend (Node.js/Express, etc.)
 * 
 * IMPORTANT: Never expose Twilio credentials in frontend code!
 * This file is for reference only.
 */

// Example Express.js endpoint
/*
import express from 'express';
import twilio from 'twilio';

const router = express.Router();

// Initialize Twilio client with environment variables
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Send single SMS
router.post('/api/sms/send', async (req, res) => {
  try {
    const { to, message, patientName } = req.body;
    
    // Validate phone number
    if (!to || !message) {
      return res.status(400).json({ error: 'Phone number and message are required' });
    }

    // Personalize message
    const personalizedMessage = message.replace('{name}', patientName || 'Patient');

    // Send SMS via Twilio
    const result = await twilioClient.messages.create({
      body: personalizedMessage,
      from: TWILIO_PHONE_NUMBER,
      to: to
    });

    res.json({ 
      success: true, 
      messageId: result.sid,
      status: result.status 
    });

  } catch (error) {
    console.error('Twilio error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Send bulk SMS (blast)
router.post('/api/sms/blast', async (req, res) => {
  try {
    const { recipients } = req.body;
    
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'Recipients array is required' });
    }

    const results = await Promise.allSettled(
      recipients.map(async (recipient) => {
        const personalizedMessage = recipient.message.replace(
          '{name}', 
          recipient.patientName || 'Patient'
        );

        return twilioClient.messages.create({
          body: personalizedMessage,
          from: TWILIO_PHONE_NUMBER,
          to: recipient.to
        });
      })
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    res.json({
      success: failed === 0,
      sent,
      failed,
      results: results.map((r, i) => ({
        to: recipients[i].to,
        success: r.status === 'fulfilled',
        error: r.status === 'rejected' ? r.reason?.message : undefined
      }))
    });

  } catch (error) {
    console.error('Twilio blast error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Waterfall SMS endpoint
router.post('/api/sms/waterfall', async (req, res) => {
  try {
    const { recipients, intervalMinutes = 5 } = req.body;
    
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'Recipients array is required' });
    }

    // Queue the waterfall job (using Bull, RabbitMQ, or similar)
    // This is a simplified example - in production, use a proper job queue
    const jobId = await queueWaterfallJob({
      recipients,
      intervalMinutes,
      startTime: new Date()
    });

    res.json({
      success: true,
      jobId,
      message: `Waterfall SMS queued for ${recipients.length} recipients`,
      estimatedCompletionMinutes: (recipients.length - 1) * intervalMinutes
    });

  } catch (error) {
    console.error('Waterfall queue error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get waterfall status
router.get('/api/sms/waterfall/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Get job status from queue
    const jobStatus = await getWaterfallJobStatus(jobId);
    
    if (!jobStatus) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      jobId,
      status: jobStatus.status,
      sent: jobStatus.sent,
      total: jobStatus.total,
      remainingMinutes: jobStatus.remainingMinutes,
      errors: jobStatus.errors
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;
*/

// Frontend API client example
export const twilioAPI = {
  async sendSMS(to: string, message: string, patientName?: string) {
    const response = await fetch('/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, message, patientName })
    });
    return response.json();
  },

  async sendBlastSMS(recipients: Array<{ to: string; message: string; patientName?: string }>) {
    const response = await fetch('/api/sms/blast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipients })
    });
    return response.json();
  },

  async startWaterfallSMS(
    recipients: Array<{ to: string; message: string; patientName?: string }>,
    intervalMinutes: number = 5
  ) {
    const response = await fetch('/api/sms/waterfall', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipients, intervalMinutes })
    });
    return response.json();
  },

  async getWaterfallStatus(jobId: string) {
    const response = await fetch(`/api/sms/waterfall/${jobId}`);
    return response.json();
  }
};