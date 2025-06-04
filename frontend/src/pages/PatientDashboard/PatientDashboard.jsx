import React, { useState, useEffect } from 'react';
import './PatientDashboard.css';

const PatientDashboard = () => {
  const [upcomingAppointments, setUpcomingAppointments] = useState([
    {
      id: 1,
      date: '2025-06-10',
      time: '10:00 AM',
      provider: 'Dr. Sarah Johnson',
      type: 'Therapy Session',
      status: 'Confirmed'
    },
    {
      id: 2,
      date: '2025-06-24',
      time: '2:30 PM',
      provider: 'Dr. Michael Williams',
      type: 'Follow-up',
      status: 'Pending'
    }
  ]);
  
  const [waitlistStatus, setWaitlistStatus] = useState({
    position: 3,
    estimatedWait: '2 weeks',
    preferredProviders: ['Dr. Sarah Johnson', 'Dr. Robert Chen'],
    lastUpdated: '2025-06-03'
  });
  
  const [recentMessages, setRecentMessages] = useState([
    {
      id: 1,
      from: 'Dr. Sarah Johnson',
      subject: 'Appointment Confirmation',
      date: '2025-06-03',
      read: true
    },
    {
      id: 2,
      from: 'MindfulMatch System',
      subject: 'Waitlist Position Update',
      date: '2025-06-02',
      read: false
    }
  ]);

  return (
    <div className="patient-dashboard">
      <h1>My Dashboard</h1>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>My Upcoming Appointments</h2>
          {upcomingAppointments.length > 0 ? (
            <div className="appointments-list">
              {upcomingAppointments.map(appointment => (
                <div key={appointment.id} className="appointment-item">
                  <div className="appointment-date">
                    <div className="date">{new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    <div className="time">{appointment.time}</div>
                  </div>
                  <div className="appointment-details">
                    <div className="provider">{appointment.provider}</div>
                    <div className="type">{appointment.type}</div>
                    <div className={`status ${appointment.status.toLowerCase()}`}>{appointment.status}</div>
                  </div>
                  <div className="appointment-actions">
                    <button className="btn-reschedule">Reschedule</button>
                    <button className="btn-cancel">Cancel</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No upcoming appointments</p>
          )}
          <button className="btn-primary">Schedule New Appointment</button>
        </div>
        
        <div className="dashboard-card">
          <h2>My Waitlist Status</h2>
          <div className="waitlist-status">
            <div className="status-item">
              <span className="label">Current Position:</span>
              <span className="value">{waitlistStatus.position}</span>
            </div>
            <div className="status-item">
              <span className="label">Estimated Wait Time:</span>
              <span className="value">{waitlistStatus.estimatedWait}</span>
            </div>
            <div className="status-item">
              <span className="label">Preferred Providers:</span>
              <span className="value">{waitlistStatus.preferredProviders.join(', ')}</span>
            </div>
            <div className="status-item">
              <span className="label">Last Updated:</span>
              <span className="value">{waitlistStatus.lastUpdated}</span>
            </div>
          </div>
          <button className="btn-secondary">Update Preferences</button>
        </div>
        
        <div className="dashboard-card">
          <h2>Recent Messages</h2>
          {recentMessages.length > 0 ? (
            <div className="messages-list">
              {recentMessages.map(message => (
                <div key={message.id} className={`message-item ${!message.read ? 'unread' : ''}`}>
                  <div className="message-icon">{message.read ? '✉️' : '📩'}</div>
                  <div className="message-content">
                    <div className="message-from">{message.from}</div>
                    <div className="message-subject">{message.subject}</div>
                    <div className="message-date">{message.date}</div>
                  </div>
                  <div className="message-action">
                    <button className="btn-view">View</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No recent messages</p>
          )}
          <button className="btn-secondary">View All Messages</button>
        </div>
        
        <div className="dashboard-card">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button className="action-button">
              <span className="icon">📅</span>
              <span className="text">Schedule Appointment</span>
            </button>
            <button className="action-button">
              <span className="icon">📝</span>
              <span className="text">Complete Forms</span>
            </button>
            <button className="action-button">
              <span className="icon">💬</span>
              <span className="text">Message Provider</span>
            </button>
            <button className="action-button">
              <span className="icon">⚙️</span>
              <span className="text">Update Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
