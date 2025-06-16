import React, { useState } from 'react';
import { MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import twilioService from '../../services/twilioService';

const TestTwilioButton: React.FC = () => {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleTestSMS = async () => {
    if (!phoneNumber) {
      setErrorMessage('Please enter a phone number');
      return;
    }

    setTestStatus('testing');
    setErrorMessage('');

    try {
      const result = await twilioService.sendSMS({
        to: phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber.replace(/\D/g, '')}`,
        message: 'Hi {name}, this is a test message from Project H. Your Twilio integration is working! Reply STOP to opt out.',
        patientName: 'Test User'
      });

      if (result.success) {
        setTestStatus('success');
        setTimeout(() => setTestStatus('idle'), 3000);
      } else {
        setTestStatus('error');
        setErrorMessage(result.error || 'Failed to send SMS');
      }
    } catch (error) {
      setTestStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const isMockMode = import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_SMS === 'true';

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 max-w-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Twilio Integration</h3>
      
      {isMockMode && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Mock Mode Active:</strong> SMS will be simulated. Check console for logs.
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            Set VITE_USE_MOCK_SMS=false to send real messages.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Phone Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="(555) 123-4567"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter your phone number to test SMS delivery
          </p>
        </div>

        <button
          onClick={handleTestSMS}
          disabled={testStatus === 'testing' || !phoneNumber}
          className={`w-full px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            testStatus === 'testing'
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : testStatus === 'success'
              ? 'bg-green-600 text-white'
              : testStatus === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {testStatus === 'testing' ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Sending Test SMS...
            </>
          ) : testStatus === 'success' ? (
            <>
              <CheckCircle className="w-4 h-4" />
              SMS Sent Successfully!
            </>
          ) : testStatus === 'error' ? (
            <>
              <AlertCircle className="w-4 h-4" />
              Error Sending SMS
            </>
          ) : (
            <>
              <MessageSquare className="w-4 h-4" />
              Send Test SMS
            </>
          )}
        </button>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        {testStatus === 'success' && !isMockMode && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              Check your phone! The message was sent from (425) 533-6828.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Integration Status</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isMockMode ? 'bg-yellow-500' : 'bg-green-500'}`} />
            <span className="text-gray-600">
              Mode: {isMockMode ? 'Mock (Development)' : 'Live (Production)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-600">Edge Function: Deployed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-600">Twilio Number: (425) 533-6828</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestTwilioButton;