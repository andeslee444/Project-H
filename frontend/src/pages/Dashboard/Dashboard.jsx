import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  // Mock data for dashboard
  const [dashboardData, setDashboardData] = useState({
    todayAppointments: 12,
    openSlots: 2,
    waitlistPatients: 45,
    highPriorityPatients: 5,
    recentActivity: [
      { id: 1, type: 'request', message: 'New appointment request from Sarah Johnson', time: '10 minutes ago' },
      { id: 2, type: 'filled', message: 'Open slot filled with Robert Chen', time: '25 minutes ago' },
      { id: 3, type: 'cancel', message: 'Appointment cancelled by David Miller', time: '1 hour ago' }
    ],
    upcomingAppointments: [
      { id: 1, time: '9:00 AM', patient: 'Jane Smith', provider: 'Dr. Johnson', status: 'Confirmed' },
      { id: 2, time: '10:00 AM', patient: 'Michael Brown', provider: 'Dr. Williams', status: 'Confirmed' },
      { id: 3, time: '11:00 AM', patient: null, provider: 'Dr. Johnson', status: 'Open' },
      { id: 4, time: '1:00 PM', patient: 'Emma Davis', provider: 'Dr. Lee', status: 'Confirmed' },
      { id: 5, time: '2:00 PM', patient: null, provider: 'Dr. Williams', status: 'Open' }
    ]
  });

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>
      
      <div className="dashboard-grid">
        <div className="dashboard-card summary-card">
          <h2>Today's Schedule</h2>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-value">{dashboardData.todayAppointments}</span>
              <span className="stat-label">Appointments</span>
            </div>
            <div className="stat highlight">
              <span className="stat-value">{dashboardData.openSlots}</span>
              <span className="stat-label">Open Slots</span>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card summary-card">
          <h2>Waitlist Summary</h2>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-value">{dashboardData.waitlistPatients}</span>
              <span className="stat-label">Patients</span>
            </div>
            <div className="stat highlight-urgent">
              <span className="stat-value">{dashboardData.highPriorityPatients}</span>
              <span className="stat-label">High Priority</span>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <h2>Recent Activity</h2>
          <ul className="activity-list">
            {dashboardData.recentActivity.map(activity => (
              <li key={activity.id} className={`activity-item ${activity.type}`}>
                <span className="activity-message">{activity.message}</span>
                <span className="activity-time">{activity.time}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="dashboard-card">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button className="action-button">Add Patient</button>
            <button className="action-button">Create Slot</button>
            <button className="action-button">Match Patients</button>
            <button className="action-button">View Waitlist</button>
          </div>
        </div>
      </div>
      
      <div className="dashboard-card full-width">
        <div className="card-header">
          <h2>Upcoming Appointments</h2>
          <button className="view-all-button">View All</button>
        </div>
        <div className="table-container">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Patient</th>
                <th>Provider</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.upcomingAppointments.map(appointment => (
                <tr key={appointment.id} className={appointment.status === 'Open' ? 'open-slot' : ''}>
                  <td>{appointment.time}</td>
                  <td>{appointment.patient || 'OPEN SLOT'}</td>
                  <td>{appointment.provider}</td>
                  <td>
                    <span className={`status-badge ${appointment.status.toLowerCase()}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td>
                    {appointment.status === 'Open' ? (
                      <button className="fill-slot-button">Fill Slot</button>
                    ) : (
                      <button className="view-details-button">View</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
