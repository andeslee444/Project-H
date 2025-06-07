import React, { useState, useEffect } from 'react';
import { Save, Bell, Mail, MessageSquare, Smartphone, Clock } from 'lucide-react';
import { NotificationService, NotificationPreferences, NotificationType } from '@/lib/notifications/NotificationService';
import { useAuth } from '@/hooks/useAuth';
import { Switch } from '@/components/ui/switch/Switch';
import { Card, CardHeader, CardContent } from '@/components/ui/card/Card';
import { Button } from '@/components/ui/button/Button';
import { Select } from '@/components/ui/select/Select';
import { toast } from 'react-toastify';

const notificationTypeLabels: Record<NotificationType, string> = {
  appointment_reminder: 'Appointment Reminders',
  appointment_confirmed: 'Appointment Confirmations',
  appointment_cancelled: 'Appointment Cancellations',
  appointment_rescheduled: 'Appointment Reschedules',
  waitlist_available: 'Waitlist Availability',
  waitlist_position_update: 'Waitlist Position Updates',
  provider_message: 'Provider Messages',
  system_alert: 'System Alerts',
  payment_reminder: 'Payment Reminders',
  document_ready: 'Document Availability'
};

const channelIcons = {
  inApp: <Bell className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  sms: <MessageSquare className="w-4 h-4" />,
  push: <Smartphone className="w-4 h-4" />
};

export const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    if (!user?.id) return;

    const fetchPreferences = async () => {
      try {
        const prefs = await notificationService.getUserPreferences(user.id);
        setPreferences(prefs);
      } catch (error) {
        console.error('Failed to fetch preferences:', error);
        toast.error('Failed to load notification preferences');
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id || !preferences) return;

    setSaving(true);
    try {
      await notificationService.updateUserPreferences(user.id, preferences);
      toast.success('Notification preferences saved successfully');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const updateChannelPreference = (channel: keyof NotificationPreferences['channels'], enabled: boolean) => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      channels: {
        ...preferences.channels,
        [channel]: enabled
      }
    });
  };

  const updateTypePreference = (
    type: NotificationType,
    field: 'enabled' | 'channels' | 'advanceNotice',
    value: any
  ) => {
    if (!preferences) return;

    setPreferences({
      ...preferences,
      types: {
        ...preferences.types,
        [type]: {
          ...preferences.types[type],
          [field]: value
        }
      }
    });
  };

  const updateQuietHours = (field: keyof NotificationPreferences['quietHours'], value: any) => {
    if (!preferences) return;

    setPreferences({
      ...preferences,
      quietHours: {
        ...preferences.quietHours,
        [field]: value
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Unable to load notification preferences</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Global Channel Preferences */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Notification Channels</h2>
          <p className="text-sm text-gray-600 mt-1">
            Choose how you want to receive notifications
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {channelIcons.inApp}
                <div>
                  <p className="font-medium">In-App Notifications</p>
                  <p className="text-sm text-gray-600">Show notifications in the app</p>
                </div>
              </div>
              <Switch
                checked={preferences.channels.inApp}
                onCheckedChange={(checked) => updateChannelPreference('inApp', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {channelIcons.email}
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-600">Send notifications to your email</p>
                </div>
              </div>
              <Switch
                checked={preferences.channels.email}
                onCheckedChange={(checked) => updateChannelPreference('email', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {channelIcons.sms}
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-gray-600">Send text messages</p>
                </div>
              </div>
              <Switch
                checked={preferences.channels.sms}
                onCheckedChange={(checked) => updateChannelPreference('sms', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
              <div className="flex items-center gap-3">
                {channelIcons.push}
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-600">Coming soon</p>
                </div>
              </div>
              <Switch
                checked={false}
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Type Preferences */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Notification Types</h2>
          <p className="text-sm text-gray-600 mt-1">
            Customize notifications for different events
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(notificationTypeLabels).map(([type, label]) => {
              const typeKey = type as NotificationType;
              const typePrefs = preferences.types[typeKey];

              return (
                <div key={type} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{label}</h3>
                    <Switch
                      checked={typePrefs?.enabled ?? true}
                      onCheckedChange={(checked) => 
                        updateTypePreference(typeKey, 'enabled', checked)
                      }
                    />
                  </div>

                  {typePrefs?.enabled && (
                    <div className="space-y-3 pl-4">
                      <div className="flex flex-wrap gap-2">
                        {(['inApp', 'email', 'sms'] as const).map(channel => (
                          <label
                            key={channel}
                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                              typePrefs.channels?.includes(channel)
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600'
                            } ${!preferences.channels[channel] ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={typePrefs.channels?.includes(channel) ?? false}
                              disabled={!preferences.channels[channel]}
                              onChange={(e) => {
                                const channels = typePrefs.channels || [];
                                const newChannels = e.target.checked
                                  ? [...channels, channel]
                                  : channels.filter(c => c !== channel);
                                updateTypePreference(typeKey, 'channels', newChannels);
                              }}
                            />
                            {channelIcons[channel]}
                            <span className="capitalize">{channel}</span>
                          </label>
                        ))}
                      </div>

                      {type === 'appointment_reminder' && (
                        <div className="flex items-center gap-3">
                          <label className="text-sm text-gray-600">
                            Remind me
                          </label>
                          <Select
                            size="sm"
                            value={String(typePrefs.advanceNotice || 60)}
                            onChange={(e) => 
                              updateTypePreference(typeKey, 'advanceNotice', Number(e.target.value))
                            }
                            options={[
                              { value: '15', label: '15 minutes before' },
                              { value: '30', label: '30 minutes before' },
                              { value: '60', label: '1 hour before' },
                              { value: '120', label: '2 hours before' },
                              { value: '1440', label: '1 day before' }
                            ]}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Quiet Hours</h2>
          <p className="text-sm text-gray-600 mt-1">
            Pause non-urgent notifications during specific hours
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium">Enable Quiet Hours</p>
                  <p className="text-sm text-gray-600">
                    Only urgent notifications will be delivered immediately
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.quietHours.enabled}
                onCheckedChange={(checked) => updateQuietHours('enabled', checked)}
              />
            </div>

            {preferences.quietHours.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={preferences.quietHours.start}
                    onChange={(e) => updateQuietHours('start', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={preferences.quietHours.end}
                    onChange={(e) => updateQuietHours('end', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <Select
                    value={preferences.quietHours.timezone}
                    onChange={(e) => updateQuietHours('timezone', e.target.value)}
                    options={[
                      { value: 'America/New_York', label: 'Eastern Time' },
                      { value: 'America/Chicago', label: 'Central Time' },
                      { value: 'America/Denver', label: 'Mountain Time' },
                      { value: 'America/Los_Angeles', label: 'Pacific Time' }
                    ]}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          loading={saving}
          icon={<Save className="w-4 h-4" />}
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
};