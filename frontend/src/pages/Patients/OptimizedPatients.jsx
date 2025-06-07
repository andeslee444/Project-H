import React, { useState, useMemo, useCallback, memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useHealthcareMemo, useHealthcareCallbacks, HealthcareMemo, OptimizationMonitor } from '../../lib/performance/OptimizationEngine';
import './Patients.css';

// Memoized patient row component
const PatientRow = memo(({ index, style, data }) => {
  const { patients, onPatientAction } = data;
  const patient = patients[index];

  if (!patient) return null;

  return (
    <div style={style} className="virtual-patient-row">
      <div className="patient-row-content">
        <div className="patient-name">{patient.name}</div>
        <div className="patient-contact">
          <div>{patient.email}</div>
          <div className="secondary-text">{patient.phone}</div>
        </div>
        <div className="patient-insurance">{patient.insurance}</div>
        <div className="patient-waitlist">{patient.waitlist}</div>
        <div className="patient-status">
          <span className={`status-badge ${patient.status}`}>
            {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
          </span>
        </div>
        <div className="patient-priority">
          <span className={`priority-badge ${patient.priority.toLowerCase()}`}>
            {patient.priority}
          </span>
        </div>
        <div className="patient-last-contact">{patient.lastContact}</div>
        <div className="patient-actions">
          <button 
            className="action-button small"
            onClick={() => onPatientAction(patient.id, 'view')}
          >
            View
          </button>
          <button 
            className="action-button small"
            onClick={() => onPatientAction(patient.id, 'edit')}
          >
            Edit
          </button>
          <button 
            className="action-button small"
            onClick={() => onPatientAction(patient.id, 'contact')}
          >
            Contact
          </button>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  const prevPatient = prevProps.data.patients[prevProps.index];
  const nextPatient = nextProps.data.patients[nextProps.index];
  
  return (
    prevPatient?.id === nextPatient?.id &&
    prevPatient?.status === nextPatient?.status &&
    prevPatient?.priority === nextPatient?.priority &&
    prevPatient?.lastContact === nextPatient?.lastContact
  );
});

PatientRow.displayName = 'PatientRow';

// Optimized Patients component
const OptimizedPatients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Mock data - in real app this would come from API
  const [patients] = useState(() => {
    // Generate larger dataset for testing virtualization
    const basePatients = [
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
    ];

    // Duplicate for testing performance with larger datasets
    const expandedPatients = [];
    for (let i = 0; i < 20; i++) {
      basePatients.forEach((patient, index) => {
        expandedPatients.push({
          ...patient,
          id: i * basePatients.length + patient.id,
          name: `${patient.name} ${i + 1}`,
          email: `${patient.email.split('@')[0]}_${i}@example.com`
        });
      });
    }
    return expandedPatients;
  });

  // Optimized patient filtering with memoization
  const filteredPatients = useHealthcareMemo.patientData(
    () => {
      const endMeasure = OptimizationMonitor.startMeasure('PatientFiltering');
      
      const filtered = patients.filter(patient => {
        const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             patient.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
        
        return matchesSearch && matchesStatus;
      });
      
      endMeasure();
      return filtered;
    },
    'filtered-patients',
    [searchTerm, filterStatus, patients]
  );

  // Memoized pagination data
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredPatients.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedPatients = filteredPatients.slice(startIndex, endIndex);
    
    return {
      totalPages,
      paginatedPatients,
      startIndex,
      endIndex,
      totalPatients: filteredPatients.length
    };
  }, [filteredPatients, currentPage, pageSize]);

  // Optimized patient action callbacks
  const patientActions = useHealthcareCallbacks.patientActions('patient-list');

  // Optimized event handlers
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleStatusFilterChange = useCallback((e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const handlePatientAction = useCallback((patientId, action) => {
    const endMeasure = OptimizationMonitor.startMeasure('PatientAction');
    
    console.log(`Action ${action} on patient ${patientId}`);
    
    // Use healthcare-specific patient actions
    switch (action) {
      case 'view':
        patientActions.onUpdateNotes(`Viewed patient ${patientId}`);
        break;
      case 'edit':
        patientActions.onUpdateVitals({ patientId, action: 'edit' });
        break;
      case 'contact':
        patientActions.onScheduleAppointment({ patientId, type: 'contact' });
        break;
    }
    
    endMeasure();
  }, [patientActions]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= paginationData.totalPages) {
      setCurrentPage(newPage);
    }
  }, [paginationData.totalPages]);

  const handlePageSizeChange = useCallback((e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  }, []);

  // Data for virtual list
  const listData = useMemo(() => ({
    patients: paginationData.paginatedPatients,
    onPatientAction: handlePatientAction
  }), [paginationData.paginatedPatients, handlePatientAction]);

  return (
    <div className="patients-page">
      <h1 className="page-title">Patient Management (Optimized)</h1>
      
      <div className="patients-actions">
        <button className="add-patient-button">+ Add Patient</button>
        
        <div className="patient-filters">
          <div className="filter-dropdown">
            <select 
              value={filterStatus}
              onChange={handleStatusFilterChange}
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
              onChange={handleSearchChange}
            />
          </div>

          <div className="page-size-selector">
            <label>Show: </label>
            <select value={pageSize} onChange={handlePageSizeChange}>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
            <span> per page</span>
          </div>
        </div>
      </div>

      <div className="patients-stats">
        <span>Showing {paginationData.startIndex + 1}-{Math.min(paginationData.endIndex, paginationData.totalPatients)} of {paginationData.totalPatients} patients</span>
      </div>
      
      {/* Virtual table header */}
      <div className="virtual-table-header">
        <div className="virtual-header-row">
          <div className="header-cell">Name</div>
          <div className="header-cell">Contact</div>
          <div className="header-cell">Insurance</div>
          <div className="header-cell">Waitlist</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Priority</div>
          <div className="header-cell">Last Contact</div>
          <div className="header-cell">Actions</div>
        </div>
      </div>

      {/* Virtualized patient list */}
      <div className="virtual-patients-container">
        {paginationData.paginatedPatients.length > 0 ? (
          <List
            height={400} // Fixed height for virtualization
            itemCount={paginationData.paginatedPatients.length}
            itemSize={60} // Height of each patient row
            itemData={listData}
            overscanCount={5} // Render 5 extra items for smooth scrolling
          >
            {PatientRow}
          </List>
        ) : (
          <div className="no-patients">
            <p>No patients found matching your criteria.</p>
          </div>
        )}
      </div>
      
      <div className="patients-footer">
        <div className="pagination">
          <button 
            className="pagination-button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          <span className="pagination-info">
            Page {currentPage} of {paginationData.totalPages}
          </span>
          <button 
            className="pagination-button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === paginationData.totalPages}
          >
            &gt;
          </button>
          
          {/* Quick page navigation */}
          <div className="quick-navigation">
            <label>Go to page: </label>
            <input 
              type="number" 
              min="1" 
              max={paginationData.totalPages}
              value={currentPage}
              onChange={(e) => handlePageChange(Number(e.target.value))}
              className="page-input"
            />
          </div>
        </div>
        
        <div className="export-options">
          <button className="export-button">Export List</button>
        </div>
      </div>
    </div>
  );
};

export default OptimizedPatients;