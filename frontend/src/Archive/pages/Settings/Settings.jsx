import React, { useState } from 'react';
import './Settings.css';
import TestTwilioButton from '../../components/dev/TestTwilioButton';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('practice');
  
  // Mock data for practice settings
  const [practiceSettings, setPracticeSettings] = useState({
    name: 'Mindful Wellness Center',
    address: '123 Healing Way, Suite 200',
    city: 'Portland',
    state: 'OR',
    zip: '97201',
    phone: '(555) 987-6543',
    email: 'info@mindfulwellness.com',
    website: 'www.mindfulwellness.com',
    matchingWeights: {
      waitTime: 30,
      priority: 25,
      providerPreference: 20,
      specialtyMatch: 15,
      modalityMatch: 10
    },
    notifications: {
      email: true,
      sms: true,
      patientReminders: 24,
      providerAlerts: true
    }
  });
  
  // Mock data for waitlist settings
  const [waitlistSettings, setWaitlistSettings] = useState({
    autoFill: true,
    priorityFactors: ['Wait Time', 'Clinical Urgency', 'Insurance Status'],
    maxWaitTime: 30,
    followUpInterval: 7
  });
  
  // Mock data for security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordExpiry: 90,
    dataRetention: 7
  });
  
  // Handle settings update
  const handleSettingsUpdate = (section, data) => {
    console.log(`Update ${section} settings:`, data);
    // In a real app, this would update the settings in the backend
  };

  return (
    <div className="settings-page">
      <h1 className="page-title">System Settings</h1>
      
      <div className="settings-container">
        <div className="settings-sidebar">
          <div className="settings-tabs">
            <button 
              className={`tab-button ${activeTab === 'practice' ? 'active' : ''}`}
              onClick={() => setActiveTab('practice')}
            >
              Practice Information
            </button>
            <button 
              className={`tab-button ${activeTab === 'waitlist' ? 'active' : ''}`}
              onClick={() => setActiveTab('waitlist')}
            >
              Waitlist Configuration
            </button>
            <button 
              className={`tab-button ${activeTab === 'matching' ? 'active' : ''}`}
              onClick={() => setActiveTab('matching')}
            >
              Matching Algorithm
            </button>
            <button 
              className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              Notifications
            </button>
            <button 
              className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Security & Privacy
            </button>
            <button 
              className={`tab-button ${activeTab === 'integrations' ? 'active' : ''}`}
              onClick={() => setActiveTab('integrations')}
            >
              Integrations
            </button>
          </div>
        </div>
        
        <div className="settings-content">
          {activeTab === 'practice' && (
            <div className="settings-section">
              <h2>Practice Information</h2>
              <form className="settings-form">
                <div className="form-group">
                  <label htmlFor="practiceName">Practice Name</label>
                  <input 
                    type="text" 
                    id="practiceName" 
                    value={practiceSettings.name}
                    onChange={(e) => setPracticeSettings({...practiceSettings, name: e.target.value})}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <input 
                      type="text" 
                      id="address" 
                      value={practiceSettings.address}
                      onChange={(e) => setPracticeSettings({...practiceSettings, address: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input 
                      type="text" 
                      id="city" 
                      value={practiceSettings.city}
                      onChange={(e) => setPracticeSettings({...practiceSettings, city: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="state">State</label>
                    <input 
                      type="text" 
                      id="state" 
                      value={practiceSettings.state}
                      onChange={(e) => setPracticeSettings({...practiceSettings, state: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="zip">ZIP Code</label>
                    <input 
                      type="text" 
                      id="zip" 
                      value={practiceSettings.zip}
                      onChange={(e) => setPracticeSettings({...practiceSettings, zip: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input 
                      type="text" 
                      id="phone" 
                      value={practiceSettings.phone}
                      onChange={(e) => setPracticeSettings({...practiceSettings, phone: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      value={practiceSettings.email}
                      onChange={(e) => setPracticeSettings({...practiceSettings, email: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="website">Website</label>
                  <input 
                    type="text" 
                    id="website" 
                    value={practiceSettings.website}
                    onChange={(e) => setPracticeSettings({...practiceSettings, website: e.target.value})}
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="save-button"
                    onClick={() => handleSettingsUpdate('practice', practiceSettings)}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {activeTab === 'matching' && (
            <div className="settings-section">
              <h2>Matching Algorithm Configuration</h2>
              <p className="settings-description">
                Adjust the weights of different factors used in the matching algorithm to prioritize patients for open slots.
              </p>
              
              <div className="weight-sliders">
                <div className="weight-slider">
                  <label>Wait Time Importance</label>
                  <div className="slider-container">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={practiceSettings.matchingWeights.waitTime}
                      onChange={(e) => setPracticeSettings({
                        ...practiceSettings, 
                        matchingWeights: {
                          ...practiceSettings.matchingWeights,
                          waitTime: parseInt(e.target.value)
                        }
                      })}
                    />
                    <span className="slider-value">{practiceSettings.matchingWeights.waitTime}%</span>
                  </div>
                </div>
                
                <div className="weight-slider">
                  <label>Priority Score Importance</label>
                  <div className="slider-container">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={practiceSettings.matchingWeights.priority}
                      onChange={(e) => setPracticeSettings({
                        ...practiceSettings, 
                        matchingWeights: {
                          ...practiceSettings.matchingWeights,
                          priority: parseInt(e.target.value)
                        }
                      })}
                    />
                    <span className="slider-value">{practiceSettings.matchingWeights.priority}%</span>
                  </div>
                </div>
                
                <div className="weight-slider">
                  <label>Provider Preference Importance</label>
                  <div className="slider-container">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={practiceSettings.matchingWeights.providerPreference}
                      onChange={(e) => setPracticeSettings({
                        ...practiceSettings, 
                        matchingWeights: {
                          ...practiceSettings.matchingWeights,
                          providerPreference: parseInt(e.target.value)
                        }
                      })}
                    />
                    <span className="slider-value">{practiceSettings.matchingWeights.providerPreference}%</span>
                  </div>
                </div>
                
                <div className="weight-slider">
                  <label>Specialty Match Importance</label>
                  <div className="slider-container">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={practiceSettings.matchingWeights.specialtyMatch}
                      onChange={(e) => setPracticeSettings({
                        ...practiceSettings, 
                        matchingWeights: {
                          ...practiceSettings.matchingWeights,
                          specialtyMatch: parseInt(e.target.value)
                        }
                      })}
                    />
                    <span className="slider-value">{practiceSettings.matchingWeights.specialtyMatch}%</span>
                  </div>
                </div>
                
                <div className="weight-slider">
                  <label>Modality Match Importance</label>
                  <div className="slider-container">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={practiceSettings.matchingWeights.modalityMatch}
                      onChange={(e) => setPracticeSettings({
                        ...practiceSettings, 
                        matchingWeights: {
                          ...practiceSettings.matchingWeights,
                          modalityMatch: parseInt(e.target.value)
                        }
                      })}
                    />
                    <span className="slider-value">{practiceSettings.matchingWeights.modalityMatch}%</span>
                  </div>
                </div>
              </div>
              
              <div className="total-weight">
                Total: {Object.values(practiceSettings.matchingWeights).reduce((a, b) => a + b, 0)}% 
                {Object.values(practiceSettings.matchingWeights).reduce((a, b) => a + b, 0) !== 100 && 
                  <span className="weight-warning"> (Should equal 100%)</span>
                }
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="save-button"
                  onClick={() => handleSettingsUpdate('matching', practiceSettings.matchingWeights)}
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security & Privacy Settings</h2>
              <p className="settings-description">
                Configure security settings to ensure HIPAA compliance and protect patient data.
              </p>
              
              <form className="settings-form">
                <div className="form-group checkbox-group">
                  <input 
                    type="checkbox" 
                    id="twoFactorAuth" 
                    checked={securitySettings.twoFactorAuth}
                    onChange={(e) => setSecuritySettings({...securitySettings, twoFactorAuth: e.target.checked})}
                  />
                  <label htmlFor="twoFactorAuth">Require Two-Factor Authentication</label>
                </div>
                
                <div className="form-group">
                  <label htmlFor="sessionTimeout">Session Timeout (minutes)</label>
                  <input 
                    type="number" 
                    id="sessionTimeout" 
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="passwordExpiry">Password Expiry (days)</label>
                  <input 
                    type="number" 
                    id="passwordExpiry" 
                    value={securitySettings.passwordExpiry}
                    onChange={(e) => setSecuritySettings({...securitySettings, passwordExpiry: parseInt(e.target.value)})}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="dataRetention">Data Retention Period (years)</label>
                  <input 
                    type="number" 
                    id="dataRetention" 
                    value={securitySettings.dataRetention}
                    onChange={(e) => setSecuritySettings({...securitySettings, dataRetention: parseInt(e.target.value)})}
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="save-button"
                    onClick={() => handleSettingsUpdate('security', securitySettings)}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {activeTab === 'waitlist' && (
            <div className="settings-section">
              <h2>Waitlist Configuration</h2>
              <p className="settings-description">
                Configure how waitlists are managed and prioritized.
              </p>
              
              <form className="settings-form">
                <div className="form-group checkbox-group">
                  <input 
                    type="checkbox" 
                    id="autoFill" 
                    checked={waitlistSettings.autoFill}
                    onChange={(e) => setWaitlistSettings({...waitlistSettings, autoFill: e.target.checked})}
                  />
                  <label htmlFor="autoFill">Automatically fill open slots from waitlist</label>
                </div>
                
                <div className="form-group">
                  <label>Priority Factors</label>
                  <div className="checkbox-list">
                    {['Wait Time', 'Clinical Urgency', 'Insurance Status', 'Provider Preference', 'Previous Cancellations'].map(factor => (
                      <div key={factor} className="checkbox-group">
                        <input 
                          type="checkbox" 
                          id={factor.replace(/\s+/g, '')} 
                          checked={waitlistSettings.priorityFactors.includes(factor)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setWaitlistSettings({
                                ...waitlistSettings, 
                                priorityFactors: [...waitlistSettings.priorityFactors, factor]
                              });
                            } else {
                              setWaitlistSettings({
                                ...waitlistSettings, 
                                priorityFactors: waitlistSettings.priorityFactors.filter(f => f !== factor)
                              });
                            }
                          }}
                        />
                        <label htmlFor={factor.replace(/\s+/g, '')}>{factor}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="maxWaitTime">Maximum Wait Time Alert (days)</label>
                  <input 
                    type="number" 
                    id="maxWaitTime" 
                    value={waitlistSettings.maxWaitTime}
                    onChange={(e) => setWaitlistSettings({...waitlistSettings, maxWaitTime: parseInt(e.target.value)})}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="followUpInterval">Patient Follow-up Interval (days)</label>
                  <input 
                    type="number" 
                    id="followUpInterval" 
                    value={waitlistSettings.followUpInterval}
                    onChange={(e) => setWaitlistSettings({...waitlistSettings, followUpInterval: parseInt(e.target.value)})}
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="save-button"
                    onClick={() => handleSettingsUpdate('waitlist', waitlistSettings)}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Settings</h2>
              <p className="settings-description">
                Configure how and when notifications are sent to patients and providers.
              </p>
              
              <form className="settings-form">
                <div className="form-group checkbox-group">
                  <input 
                    type="checkbox" 
                    id="emailNotifications" 
                    checked={practiceSettings.notifications.email}
                    onChange={(e) => setPracticeSettings({
                      ...practiceSettings, 
                      notifications: {
                        ...practiceSettings.notifications,
                        email: e.target.checked
                      }
                    })}
                  />
                  <label htmlFor="emailNotifications">Enable Email Notifications</label>
                </div>
                
                <div className="form-group checkbox-group">
                  <input 
                    type="checkbox" 
                    id="smsNotifications" 
                    checked={practiceSettings.notifications.sms}
                    onChange={(e) => setPracticeSettings({
                      ...practiceSettings, 
                      notifications: {
                        ...practiceSettings.notifications,
                        sms: e.target.checked
                      }
                    })}
                  />
                  <label htmlFor="smsNotifications">Enable SMS Notifications</label>
                </div>
                
                <div className="form-group">
                  <label htmlFor="patientReminders">Patient Appointment Reminders (hours before)</label>
                  <input 
                    type="number" 
                    id="patientReminders" 
                    value={practiceSettings.notifications.patientReminders}
                    onChange={(e) => setPracticeSettings({
                      ...practiceSettings, 
                      notifications: {
                        ...practiceSettings.notifications,
                        patientReminders: parseInt(e.target.value)
                      }
                    })}
                  />
                </div>
                
                <div className="form-group checkbox-group">
                  <input 
                    type="checkbox" 
                    id="providerAlerts" 
                    checked={practiceSettings.notifications.providerAlerts}
                    onChange={(e) => setPracticeSettings({
                      ...practiceSettings, 
                      notifications: {
                        ...practiceSettings.notifications,
                        providerAlerts: e.target.checked
                      }
                    })}
                  />
                  <label htmlFor="providerAlerts">Send Providers Alerts for Filled Slots</label>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="save-button"
                    onClick={() => handleSettingsUpdate('notifications', practiceSettings.notifications)}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
              
              {/* SMS Testing Section */}
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">SMS Integration Testing</h3>
                <TestTwilioButton />
              </div>
            </div>
          )}
          
          {activeTab === 'integrations' && (
            <div className="settings-section">
              <h2>Integrations</h2>
              <p className="settings-description">
                Connect with other systems and services.
              </p>
              
              <div className="integrations-list">
                <div className="integration-item">
                  <div className="integration-info">
                    <h3>Electronic Health Record (EHR)</h3>
                    <p>Connect to your EHR system to sync patient data and appointments.</p>
                    <div className="integration-status not-connected">Not Connected</div>
                  </div>
                  <button className="connect-button">Connect</button>
                </div>
                
                <div className="integration-item">
                  <div className="integration-info">
                    <h3>Calendar Integration</h3>
                    <p>Sync with Google Calendar, Outlook, or other calendar services.</p>
                    <div className="integration-status not-connected">Not Connected</div>
                  </div>
                  <button className="connect-button">Connect</button>
                </div>
                
                <div className="integration-item">
                  <div className="integration-info">
                    <h3>Payment Processor</h3>
                    <p>Connect to payment services for billing and invoicing.</p>
                    <div className="integration-status not-connected">Not Connected</div>
                  </div>
                  <button className="connect-button">Connect</button>
                </div>
                
                <div className="integration-item">
                  <div className="integration-info">
                    <h3>Telehealth Platform</h3>
                    <p>Integrate with video conferencing for telehealth appointments.</p>
                    <div className="integration-status not-connected">Not Connected</div>
                  </div>
                  <button className="connect-button">Connect</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
