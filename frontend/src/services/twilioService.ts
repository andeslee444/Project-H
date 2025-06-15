interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromPhoneNumber?: string;
}

interface SendSMSParams {
  to: string;
  message: string;
  patientName?: string;
}

interface WaterfallQueue {
  messages: SendSMSParams[];
  intervalMinutes: number;
  currentIndex: number;
  intervalId?: NodeJS.Timeout;
  onComplete?: () => void;
  onMessageSent?: (index: number, total: number) => void;
}

class TwilioService {
  private config: TwilioConfig;
  private waterfallQueue: WaterfallQueue | null = null;
  
  constructor(config: TwilioConfig) {
    this.config = config;
  }

  /**
   * Personalize message with patient name
   */
  private personalizeMessage(message: string, patientName?: string): string {
    if (!patientName) return message;
    return message.replace('{name}', patientName);
  }

  /**
   * Send a single SMS message via Supabase Edge Function
   */
  async sendSMS(params: SendSMSParams): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if we're in development mode or if USE_MOCK_SMS is set
      const isDevelopment = import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_SMS === 'true';
      
      if (isDevelopment) {
        // In development, just log and simulate
        console.log('Development mode - Simulating SMS:', {
          to: params.to,
          message: this.personalizeMessage(params.message, params.patientName),
          from: this.config.fromPhoneNumber || '+1234567890'
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
      }

      // In production, call Supabase Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'send_single',
          data: {
            to: params.to,
            message: params.message,
            patientName: params.patientName
          }
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send SMS');
      }

      return { success: true };

    } catch (error) {
      console.error('Error sending SMS:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send SMS' 
      };
    }
  }

  /**
   * Send SMS to multiple recipients at once (blast)
   */
  async sendBlastSMS(
    recipients: SendSMSParams[],
    onProgress?: (sent: number, total: number) => void
  ): Promise<{ success: boolean; sent: number; failed: number; errors: string[] }> {
    try {
      const isDevelopment = import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_SMS === 'true';
      
      if (isDevelopment) {
        // Simulate sending in development
        const errors: string[] = [];
        let sent = 0;
        
        for (let i = 0; i < recipients.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 100));
          sent++;
          if (onProgress) {
            onProgress(i + 1, recipients.length);
          }
        }
        
        return { success: true, sent, failed: 0, errors };
      }

      // In production, call Supabase Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'send_blast',
          data: { recipients }
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send blast SMS');
      }

      // Update progress for UI
      if (onProgress && result.sent) {
        onProgress(result.sent, recipients.length);
      }

      return {
        success: result.success,
        sent: result.sent || 0,
        failed: result.failed || 0,
        errors: result.results?.filter((r: any) => !r.success).map((r: any) => r.error) || []
      };

    } catch (error) {
      console.error('Error sending blast SMS:', error);
      return {
        success: false,
        sent: 0,
        failed: recipients.length,
        errors: [error instanceof Error ? error.message : 'Failed to send SMS']
      };
    }
  }

  /**
   * Send SMS messages with a delay between each (waterfall)
   */
  async startWaterfallSMS(
    recipients: SendSMSParams[],
    intervalMinutes: number = 5,
    callbacks?: {
      onMessageSent?: (index: number, total: number) => void;
      onComplete?: () => void;
      onSlotFilled?: () => void;
    }
  ): Promise<void> {
    // Stop any existing waterfall
    this.stopWaterfall();

    this.waterfallQueue = {
      messages: recipients,
      intervalMinutes,
      currentIndex: 0,
      onComplete: callbacks?.onComplete,
      onMessageSent: callbacks?.onMessageSent
    };

    // Send first message immediately
    await this.sendNextWaterfallMessage();

    // Schedule subsequent messages
    if (this.waterfallQueue.messages.length > 1) {
      this.waterfallQueue.intervalId = setInterval(async () => {
        const continueWaterfall = await this.sendNextWaterfallMessage();
        
        if (!continueWaterfall) {
          this.stopWaterfall();
          if (callbacks?.onComplete) {
            callbacks.onComplete();
          }
        }
      }, intervalMinutes * 60 * 1000); // Convert minutes to milliseconds
    }
  }

  /**
   * Send the next message in the waterfall queue
   */
  private async sendNextWaterfallMessage(): Promise<boolean> {
    if (!this.waterfallQueue || this.waterfallQueue.currentIndex >= this.waterfallQueue.messages.length) {
      return false;
    }

    const message = this.waterfallQueue.messages[this.waterfallQueue.currentIndex];
    const result = await this.sendSMS(message);

    if (result.success) {
      this.waterfallQueue.currentIndex++;
      
      if (this.waterfallQueue.onMessageSent) {
        this.waterfallQueue.onMessageSent(
          this.waterfallQueue.currentIndex,
          this.waterfallQueue.messages.length
        );
      }

      // Check if we've sent all messages
      if (this.waterfallQueue.currentIndex >= this.waterfallQueue.messages.length) {
        return false;
      }
    }

    return true;
  }

  /**
   * Stop the waterfall process
   */
  stopWaterfall(): void {
    if (this.waterfallQueue?.intervalId) {
      clearInterval(this.waterfallQueue.intervalId);
    }
    this.waterfallQueue = null;
  }

  /**
   * Get the current waterfall status
   */
  getWaterfallStatus(): { isActive: boolean; sent: number; total: number; minutesRemaining: number } | null {
    if (!this.waterfallQueue) {
      return null;
    }

    const remaining = this.waterfallQueue.messages.length - this.waterfallQueue.currentIndex;
    const minutesRemaining = (remaining - 1) * this.waterfallQueue.intervalMinutes;

    return {
      isActive: true,
      sent: this.waterfallQueue.currentIndex,
      total: this.waterfallQueue.messages.length,
      minutesRemaining
    };
  }
}

// Create a singleton instance
// Note: In production, the API key should come from environment variables
// and the actual Twilio calls should be made from a secure backend
const twilioService = new TwilioService({
  accountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID || '',
  authToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN || '',
  fromPhoneNumber: import.meta.env.VITE_TWILIO_PHONE_NUMBER || '+1234567890'
});

export default twilioService;
export type { SendSMSParams, TwilioConfig };