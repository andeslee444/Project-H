import React, { useState } from 'react';
import './Analytics.css';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('month');
  
  // Mock data for analytics
  const analyticsData = {
    summary: {
      revenue: {
        recaptured: '$12,450',
        percentage: '18%'
      },
      hours: {
        recaptured: '124',
        percentage: '22%'
      },
      slots: {
        filled: '78',
        total: '96',
        percentage: '81%'
      },
      waitlist: {
        converted: '45',
        total: '78',
        percentage: '58%'
      }
    },
    providers: [
      { name: 'Dr. Johnson', utilization: 92, slots: 42, recaptured: 12 },
      { name: 'Dr. Williams', utilization: 85, slots: 38, recaptured: 8 },
      { name: 'Dr. Lee', utilization: 78, slots: 36, recaptured: 6 }
    ],
    waitlists: [
      { name: 'General Therapy', patients: 23, converted: 15, avgWait: '14 days' },
      { name: 'Depression', patients: 15, converted: 10, avgWait: '21 days' },
      { name: 'Anxiety', patients: 18, converted: 12, avgWait: '18 days' },
      { name: 'Child Therapy', patients: 12, converted: 8, avgWait: '30 days' }
    ],
    timeToFill: {
      average: '4.2 hours',
      fastest: '15 minutes',
      slowest: '2 days'
    }
  };

  return (
    <div className="analytics-page">
      <h1 className="page-title">Analytics Dashboard</h1>
      
      <div className="analytics-controls">
        <div className="time-range-selector">
          <button 
            className={`range-button ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button 
            className={`range-button ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button 
            className={`range-button ${timeRange === 'quarter' ? 'active' : ''}`}
            onClick={() => setTimeRange('quarter')}
          >
            Quarter
          </button>
          <button 
            className={`range-button ${timeRange === 'year' ? 'active' : ''}`}
            onClick={() => setTimeRange('year')}
          >
            Year
          </button>
        </div>
        
        <button className="export-report-button">Export Report</button>
      </div>
      
      <div className="analytics-grid">
        <div className="analytics-card summary-card">
          <h2>Revenue Recaptured</h2>
          <div className="metric-value">{analyticsData.summary.revenue.recaptured}</div>
          <div className="metric-label">
            <span className="percentage positive">{analyticsData.summary.revenue.percentage}</span> of potential revenue
          </div>
        </div>
        
        <div className="analytics-card summary-card">
          <h2>Hours Recaptured</h2>
          <div className="metric-value">{analyticsData.summary.hours.recaptured}</div>
          <div className="metric-label">
            <span className="percentage positive">{analyticsData.summary.hours.percentage}</span> of available hours
          </div>
        </div>
        
        <div className="analytics-card summary-card">
          <h2>Slots Filled</h2>
          <div className="metric-value">{analyticsData.summary.slots.percentage}</div>
          <div className="metric-label">
            {analyticsData.summary.slots.filled} of {analyticsData.summary.slots.total} slots
          </div>
        </div>
        
        <div className="analytics-card summary-card">
          <h2>Waitlist Conversion</h2>
          <div className="metric-value">{analyticsData.summary.waitlist.percentage}</div>
          <div className="metric-label">
            {analyticsData.summary.waitlist.converted} of {analyticsData.summary.waitlist.total} patients
          </div>
        </div>
      </div>
      
      <div className="analytics-row">
        <div className="analytics-card">
          <h2>Provider Utilization</h2>
          <div className="table-container">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Utilization</th>
                  <th>Slots</th>
                  <th>Recaptured</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.providers.map((provider, index) => (
                  <tr key={index}>
                    <td>{provider.name}</td>
                    <td>
                      <div className="progress-bar-container">
                        <div 
                          className="progress-bar" 
                          style={{ width: `${provider.utilization}%` }}
                        ></div>
                        <span>{provider.utilization}%</span>
                      </div>
                    </td>
                    <td>{provider.slots}</td>
                    <td>{provider.recaptured}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="analytics-card">
          <h2>Waitlist Performance</h2>
          <div className="table-container">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Waitlist</th>
                  <th>Patients</th>
                  <th>Converted</th>
                  <th>Avg. Wait</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.waitlists.map((waitlist, index) => (
                  <tr key={index}>
                    <td>{waitlist.name}</td>
                    <td>{waitlist.patients}</td>
                    <td>{waitlist.converted}</td>
                    <td>{waitlist.avgWait}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="analytics-card full-width">
        <h2>Time to Fill Analysis</h2>
        <div className="time-to-fill-stats">
          <div className="stat-box">
            <div className="stat-label">Average Time to Fill</div>
            <div className="stat-value">{analyticsData.timeToFill.average}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Fastest Fill</div>
            <div className="stat-value">{analyticsData.timeToFill.fastest}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Slowest Fill</div>
            <div className="stat-value">{analyticsData.timeToFill.slowest}</div>
          </div>
        </div>
        <div className="chart-placeholder">
          <div className="chart-message">Time to Fill Distribution Chart</div>
          <div className="chart-note">(Interactive chart would be implemented here)</div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
