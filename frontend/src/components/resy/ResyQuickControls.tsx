import React, { useState } from 'react';
import { 
  Power, Bell, Clock, Calendar, DollarSign, Shield,
  MessageSquare, Users, Zap, Settings, CheckCircle,
  AlertCircle, Smartphone, Mail, Globe, Database,
  CreditCard, FileText, Link, ToggleLeft, ToggleRight,
  Plus, Minus, Edit, Save, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToggleSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  icon: React.ElementType;
  category: 'availability' | 'notifications' | 'booking' | 'integrations';
}

interface NotificationRule {
  id: string;
  event: string;
  timing: string;
  method: 'email' | 'sms' | 'push';
  enabled: boolean;
}

interface AppointmentType {
  id: string;
  name: string;
  duration: number;
  color: string;
  price: number;
  requiresIntake: boolean;
}

const ResyQuickControls: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quick' | 'notifications' | 'templates' | 'integrations'>('quick');
  const [settings, setSettings] = useState<ToggleSetting[]>([
    {
      id: 'available_now',
      label: 'Available Now',
      description: 'Show as available for immediate bookings',
      enabled: true,
      icon: Power,
      category: 'availability'
    },
    {
      id: 'auto_accept',
      label: 'Auto-accept Bookings',
      description: 'Automatically confirm appointments from verified patients',
      enabled: false,
      icon: Zap,
      category: 'booking'
    },
    {
      id: 'insurance_verify',
      label: 'Require Insurance Verification',
      description: 'Block bookings until insurance is verified',
      enabled: true,
      icon: Shield,
      category: 'booking'
    },
    {
      id: 'waitlist_notify',
      label: 'Waitlist Auto-Notify',
      description: 'Automatically notify waitlist when slots open',
      enabled: true,
      icon: Bell,
      category: 'notifications'
    }
  ]);

  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>([
    {
      id: '1',
      event: 'Cancellation within 24h',
      timing: 'Immediately',
      method: 'push',
      enabled: true
    },
    {
      id: '2',
      event: 'Utilization drops below 70%',
      timing: 'Daily at 9am',
      method: 'email',
      enabled: true
    },
    {
      id: '3',
      event: 'New patient inquiry',
      timing: 'Immediately',
      method: 'sms',
      enabled: true
    },
    {
      id: '4',
      event: 'Patient reminder',
      timing: '24h before appointment',
      method: 'sms',
      enabled: true
    }
  ]);

  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([
    {
      id: '1',
      name: 'Initial Consultation',
      duration: 90,
      color: 'blue',
      price: 300,
      requiresIntake: true
    },
    {
      id: '2',
      name: 'Follow-up Session',
      duration: 50,
      color: 'green',
      price: 200,
      requiresIntake: false
    },
    {
      id: '3',
      name: 'Crisis Intervention',
      duration: 120,
      color: 'red',
      price: 350,
      requiresIntake: false
    }
  ]);

  const integrations = [
    { name: 'Google Calendar', icon: Calendar, connected: true, lastSync: '2 min ago' },
    { name: 'Stripe Payments', icon: CreditCard, connected: true, lastSync: '1 hour ago' },
    { name: 'Insurance Verifier', icon: Shield, connected: false, lastSync: 'Not connected' },
    { name: 'Epic EHR', icon: Database, connected: true, lastSync: '5 min ago' }
  ];

  const toggleSetting = (id: string) => {
    setSettings(settings.map(setting => 
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    ));
  };

  const toggleNotification = (id: string) => {
    setNotificationRules(notificationRules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Quick Controls</h1>
              <p className="text-gray-600 mt-1">
                Manage availability, notifications, and integrations
              </p>
            </div>

            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save All Changes
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-6 mt-6 border-b -mb-px">
            {[
              { id: 'quick', label: 'Quick Settings', icon: Zap },
              { id: 'notifications', label: 'Smart Notifications', icon: Bell },
              { id: 'templates', label: 'Templates', icon: FileText },
              { id: 'integrations', label: 'Integrations', icon: Link }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-1 flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'quick' && (
            <motion.div
              key="quick"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Instant Availability Toggle */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Instant Availability</h2>
                <div className="space-y-4">
                  {settings.filter(s => s.category === 'availability' || s.category === 'booking').map(setting => (
                    <div key={setting.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <setting.icon className={`w-5 h-5 mt-0.5 ${
                          setting.enabled ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <div>
                          <h3 className="font-medium">{setting.label}</h3>
                          <p className="text-sm text-gray-600 mt-0.5">{setting.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSetting(setting.id)}
                        className="mt-0.5"
                      >
                        {setting.enabled ? (
                          <ToggleRight className="w-10 h-6 text-blue-600" />
                        ) : (
                          <ToggleLeft className="w-10 h-6 text-gray-400" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="font-medium mb-4">Office Hours</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Monday - Friday</span>
                      <span className="text-sm font-medium">9:00 AM - 5:00 PM</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Saturday</span>
                      <span className="text-sm font-medium">10:00 AM - 2:00 PM</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sunday</span>
                      <span className="text-sm text-gray-500">Closed</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm">
                    Edit Hours
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="font-medium mb-4">Vacation Mode</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Block all bookings during vacation
                  </p>
                  <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                    Enable Vacation Mode
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Currently: Off
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="font-medium mb-4">Emergency Block</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Instantly block next 24 hours
                  </p>
                  <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Block Emergency
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Will notify affected patients
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Smart Notification Rules</h2>
                
                {/* Add New Rule */}
                <button className="mb-6 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 w-full flex items-center justify-center gap-2 text-gray-600">
                  <Plus className="w-4 h-4" />
                  Add New Rule
                </button>

                {/* Existing Rules */}
                <div className="space-y-3">
                  {notificationRules.map(rule => (
                    <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleNotification(rule.id)}
                          className="mt-0.5"
                        >
                          {rule.enabled ? (
                            <ToggleRight className="w-10 h-6 text-blue-600" />
                          ) : (
                            <ToggleLeft className="w-10 h-6 text-gray-400" />
                          )}
                        </button>
                        <div>
                          <h3 className="font-medium">Notify me when: {rule.event}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {rule.timing}
                            </span>
                            <span className="flex items-center gap-1">
                              {rule.method === 'email' && <Mail className="w-3 h-3" />}
                              {rule.method === 'sms' && <Smartphone className="w-3 h-3" />}
                              {rule.method === 'push' && <Bell className="w-3 h-3" />}
                              {rule.method}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded">
                        <Edit className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Notification Preferences */}
                <div className="mt-8 pt-6 border-t">
                  <h3 className="font-medium mb-4">Default Notification Methods</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <Mail className="w-5 h-5 text-gray-600" />
                      <span>Email</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <Smartphone className="w-5 h-5 text-gray-600" />
                      <span>SMS</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <Bell className="w-5 h-5 text-gray-600" />
                      <span>Push</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'templates' && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Appointment Types */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Appointment Types & Durations</h2>
                <div className="space-y-3">
                  {appointmentTypes.map(type => (
                    <div key={type.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full bg-${type.color}-500`} />
                        <div>
                          <h3 className="font-medium">{type.name}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span>{type.duration} minutes</span>
                            <span>${type.price}</span>
                            {type.requiresIntake && (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
                                Requires intake
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded">
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded">
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-4 px-4 py-2 border rounded-lg hover:bg-gray-50 w-full">
                  + Add Appointment Type
                </button>
              </div>

              {/* Policy Templates */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Policy Templates</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Cancellation Policy</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      24-hour notice required for cancellations. Late cancellations subject to full session fee.
                    </p>
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      Edit Policy
                    </button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">No-Show Policy</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Two no-shows result in requiring pre-payment for future appointments.
                    </p>
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      Edit Policy
                    </button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Intake Requirements</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      New patients must complete intake forms 24 hours before first appointment.
                    </p>
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      Edit Requirements
                    </button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Insurance Guidelines</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Insurance verification required before first visit. Co-pay collected at time of service.
                    </p>
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      Edit Guidelines
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'integrations' && (
            <motion.div
              key="integrations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Integration Hub</h2>
                <div className="grid grid-cols-2 gap-4">
                  {integrations.map((integration, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <integration.icon className={`w-8 h-8 ${
                            integration.connected ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                          <div>
                            <h3 className="font-medium">{integration.name}</h3>
                            <p className="text-sm text-gray-600">
                              {integration.connected ? (
                                <span className="flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3 text-green-600" />
                                  Connected
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3 text-gray-400" />
                                  Not connected
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">
                        Last sync: {integration.lastSync}
                      </p>
                      <button className={`w-full px-3 py-2 rounded-lg text-sm ${
                        integration.connected
                          ? 'border hover:bg-gray-50'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}>
                        {integration.connected ? 'Settings' : 'Connect'}
                      </button>
                    </div>
                  ))}
                </div>

                {/* API Access */}
                <div className="mt-8 pt-6 border-t">
                  <h3 className="font-medium mb-4">API Access</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-mono">API Key: ••••••••••••3a2f</span>
                      <button className="text-sm text-blue-600 hover:text-blue-700">
                        Regenerate
                      </button>
                    </div>
                    <p className="text-xs text-gray-600">
                      Use this key to integrate with custom applications
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
};

export default ResyQuickControls;