import React, { useState } from 'react';
import './Waitlist.css';

const Waitlist = () => {
  // Mock data for waitlists
  const [waitlists, setWaitlists] = useState([
    { id: 1, name: 'General Therapy', patients: 23, avgWait: '14 days' },
    { id: 2, name: 'Depression', patients: 15, avgWait: '21 days' },
    { id: 3, name: 'Anxiety', patients: 18, avgWait: '18 days' },
    { id: 4, name: 'Child Therapy', patients: 12, avgWait: '30 days' }
  ]);

  // Mock data for selected waitlist entries
  const [selectedWaitlist, setSelectedWaitlist] = useState({
    id: 1,
    name: 'General Therapy',
    entries: [
      { id: 1, patient: 'Robert Chen', priority: 'High', waitTime: '30 days', matchScore: 95 },
      { id: 2, patient: 'Sarah Johnson', priority: 'Medium', waitTime: '21 days', matchScore: 87 },
      { id: 3, patient: 'David Miller', priority: 'Medium', waitTime: '14 days', matchScore: 76 },
      { id: 4, patient: 'Lisa Garcia', priority: 'Low', waitTime: '7 days', matchScore: 65 },
      { id: 5, patient: 'James Wilson', priority: 'High', waitTime: '28 days', matchScore: 92 }
    ]
  });

  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleWaitlistSelect = (id) => {
    // In a real app, this would fetch the waitlist entries from the backend
    console.log(`Selected waitlist ${id}`);
    // For demo, we'll just keep the current selected waitlist
  };

  const handleActionClick = (entryId, action) => {
    console.log(`Action ${action} on entry ${entryId}`);
    // In a real app, this would perform the action and update the state
  };

  return (
    <div className="waitlist-page">
      <h1 className="page-title">Waitlist Management</h1>
      
      <div className="waitlist-actions">
        <button className="create-waitlist-button">+ Create Waitlist</button>
        
        <div className="waitlist-filters">
          <div className="filter-dropdown">
            <select defaultValue="all">
              <option value="all">All Waitlists</option>
              {waitlists.map(list => (
                <option key={list.id} value={list.id}>{list.name}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-dropdown">
            <select defaultValue="all">
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
          
          <div className="search-box">
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="waitlist-section">
        <h2>Active Waitlists</h2>
        <div className="waitlist-table-container">
          <table className="waitlist-table">
            <thead>
              <tr>
                <th>Waitlist Name</th>
                <th>Patients</th>
                <th>Avg. Wait</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {waitlists.map(list => (
                <tr key={list.id} onClick={() => handleWaitlistSelect(list.id)}>
                  <td>{list.name}</td>
                  <td>{list.patients}</td>
                  <td>{list.avgWait}</td>
                  <td>
                    <button className="action-button small">View</button>
                    <button className="action-button small">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="waitlist-section">
        <div className="section-header">
          <h2>{selectedWaitlist.name} Waitlist</h2>
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Patients
            </button>
            <button 
              className={`tab-button ${activeTab === 'high' ? 'active' : ''}`}
              onClick={() => setActiveTab('high')}
            >
              High Priority
            </button>
            <button 
              className={`tab-button ${activeTab === 'new' ? 'active' : ''}`}
              onClick={() => setActiveTab('new')}
            >
              New Requests
            </button>
          </div>
        </div>
        
        <div className="waitlist-entries-container">
          <table className="waitlist-entries-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Priority</th>
                <th>Wait Time</th>
                <th>Match Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedWaitlist.entries.map(entry => (
                <tr key={entry.id}>
                  <td>{entry.patient}</td>
                  <td>
                    <span className={`priority-badge ${entry.priority.toLowerCase()}`}>
                      {entry.priority}
                    </span>
                  </td>
                  <td>{entry.waitTime}</td>
                  <td>
                    <div className="match-score">
                      <div className="match-bar" style={{ width: `${entry.matchScore}%` }}></div>
                      <span>{entry.matchScore}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="entry-actions">
                      <button 
                        className="action-button small"
                        onClick={() => handleActionClick(entry.id, 'schedule')}
                      >
                        Schedule
                      </button>
                      <button 
                        className="action-button small secondary"
                        onClick={() => handleActionClick(entry.id, 'contact')}
                      >
                        Contact
                      </button>
                      <button 
                        className="action-button small danger"
                        onClick={() => handleActionClick(entry.id, 'remove')}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="waitlist-footer">
          <button className="add-patient-button">+ Add Patient</button>
          <button className="match-slots-button">Match to Open Slots</button>
          <button className="export-button">Export List</button>
        </div>
      </div>
    </div>
  );
};

export default Waitlist;
