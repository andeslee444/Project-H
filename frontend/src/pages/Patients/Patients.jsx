import React, { useState } from 'react';
import './Patients.css';

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Mock data for patients
  const [patients, setPatients] = useState([
    { 
      id: 1, 
      name: 'Sarah Johnson', 
      email: 'sarah.j@example.com', 
      phone: '(555) 123-4567', 
      insurance: 'Blue Cross',
      waitlist: 'Depression',
      status: 'active',
      priority: 'High',
      lastContact: '2 days ago'
    },
    { 
      id: 2, 
      name: 'Robert Chen', 
      email: 'robert.c@example.com', 
      phone: '(555) 234-5678', 
      insurance: 'Aetna',
      waitlist: 'General Therapy',
      status: 'active',
      priority: 'Medium',
      lastContact: '1 week ago'
    },
    { 
      id: 3, 
      name: 'Emma Davis', 
      email: 'emma.d@example.com', 
      phone: '(555) 345-6789', 
      insurance: 'UnitedHealth',
      waitlist: 'Anxiety',
      status: 'scheduled',
      priority: 'Low',
      lastContact: 'Today'
    },
    { 
      id: 4, 
      name: 'David Miller', 
      email: 'david.m@example.com', 
      phone: '(555) 456-7890', 
      insurance: 'Medicare',
      waitlist: 'Child Therapy',
      status: 'active',
      priority: 'High',
      lastContact: '3 days ago'
    },
    { 
      id: 5, 
      name: 'Lisa Garcia', 
      email: 'lisa.g@example.com', 
      phone: '(555) 567-8901', 
      insurance: 'Cigna',
      waitlist: 'Depression',
      status: 'inactive',
      priority: 'Medium',
      lastContact: '1 month ago'
    }
  ]);
  
  // Filter patients based on search term and status
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  // Handle patient action
  const handlePatientAction = (patientId, action) => {
    console.log(`Action ${action} on patient ${patientId}`);
    // In a real app, this would perform the action and update the state
  };

  return (
    <div className="patients-page">
      <h1 className="page-title">Patient Management</h1>
      
      <div className="patients-actions">
        <button className="add-patient-button">+ Add Patient</button>
        
        <div className="patient-filters">
          <div className="filter-dropdown">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Patients</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="inactive">Inactive</option>
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
      
      <div className="patients-table-container">
        <table className="patients-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Insurance</th>
              <th>Waitlist</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Last Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map(patient => (
              <tr key={patient.id}>
                <td className="patient-name">{patient.name}</td>
                <td>
                  <div>{patient.email}</div>
                  <div className="secondary-text">{patient.phone}</div>
                </td>
                <td>{patient.insurance}</td>
                <td>{patient.waitlist}</td>
                <td>
                  <span className={`status-badge ${patient.status}`}>
                    {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                  </span>
                </td>
                <td>
                  <span className={`priority-badge ${patient.priority.toLowerCase()}`}>
                    {patient.priority}
                  </span>
                </td>
                <td>{patient.lastContact}</td>
                <td>
                  <div className="patient-actions">
                    <button 
                      className="action-button small"
                      onClick={() => handlePatientAction(patient.id, 'view')}
                    >
                      View
                    </button>
                    <button 
                      className="action-button small"
                      onClick={() => handlePatientAction(patient.id, 'edit')}
                    >
                      Edit
                    </button>
                    <button 
                      className="action-button small"
                      onClick={() => handlePatientAction(patient.id, 'contact')}
                    >
                      Contact
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="patients-footer">
        <div className="pagination">
          <button className="pagination-button">&lt;</button>
          <span className="pagination-info">Page 1 of 1</span>
          <button className="pagination-button">&gt;</button>
        </div>
        
        <div className="export-options">
          <button className="export-button">Export List</button>
        </div>
      </div>
    </div>
  );
};

export default Patients;
