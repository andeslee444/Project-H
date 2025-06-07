import React, { useState, useMemo, useCallback, memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useHealthcareMemo, useHealthcareCallbacks, HealthcareMemo, OptimizationMonitor } from '../../lib/performance/OptimizationEngine';
import './Waitlist.css';

// Memoized waitlist entry row component
const WaitlistEntryRow = memo(({ index, style, data }) => {
  const { entries, onActionClick } = data;
  const entry = entries[index];

  if (!entry) return null;

  const getMatchScoreColor = (score) => {
    if (score >= 90) return '#4CAF50'; // Green
    if (score >= 70) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  return (
    <div style={style} className="virtual-waitlist-row">
      <div className="waitlist-row-content">
        <div className="patient-info">
          <div className="patient-name">{entry.patient}</div>
          <div className="patient-id">ID: {entry.id}</div>
        </div>
        
        <div className="priority-cell">
          <span className={`priority-badge ${entry.priority.toLowerCase()}`}>
            {entry.priority}
          </span>
        </div>
        
        <div className="wait-time-cell">
          {entry.waitTime}
        </div>
        
        <div className="match-score-cell">
          <div className="match-score-container">
            <div className="match-score-bar">
              <div 
                className="match-score-fill"
                style={{ 
                  width: `${entry.matchScore}%`,
                  backgroundColor: getMatchScoreColor(entry.matchScore)
                }}
              />
            </div>
            <span className="match-score-text">{entry.matchScore}%</span>
          </div>
        </div>
        
        <div className="entry-actions">
          <button 
            className="action-button small primary"
            onClick={() => onActionClick(entry.id, 'match')}
          >
            Match
          </button>
          <button 
            className="action-button small secondary"
            onClick={() => onActionClick(entry.id, 'contact')}
          >
            Contact
          </button>
          <button 
            className="action-button small"
            onClick={() => onActionClick(entry.id, 'reschedule')}
          >
            Reschedule
          </button>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  const prevEntry = prevProps.data.entries[prevProps.index];
  const nextEntry = nextProps.data.entries[nextProps.index];
  
  return (
    prevEntry?.id === nextEntry?.id &&
    prevEntry?.priority === nextEntry?.priority &&
    prevEntry?.waitTime === nextEntry?.waitTime &&
    prevEntry?.matchScore === nextEntry?.matchScore
  );
});

WaitlistEntryRow.displayName = 'WaitlistEntryRow';

// Memoized waitlist summary card
const WaitlistSummaryCard = memo(({ waitlist, isSelected, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(waitlist.id);
  }, [waitlist.id, onSelect]);

  return (
    <div 
      className={`waitlist-card ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      <h3 className="waitlist-name">{waitlist.name}</h3>
      <div className="waitlist-stats">
        <div className="stat">
          <span className="stat-value">{waitlist.patients}</span>
          <span className="stat-label">Patients</span>
        </div>
        <div className="stat">
          <span className="stat-value">{waitlist.avgWait}</span>
          <span className="stat-label">Avg Wait</span>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.waitlist.id === nextProps.waitlist.id &&
    prevProps.waitlist.patients === nextProps.waitlist.patients &&
    prevProps.waitlist.avgWait === nextProps.waitlist.avgWait &&
    prevProps.isSelected === nextProps.isSelected
  );
});

WaitlistSummaryCard.displayName = 'WaitlistSummaryCard';

// Main optimized waitlist component
const OptimizedWaitlist = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedWaitlistId, setSelectedWaitlistId] = useState(1);
  const [sortBy, setSortBy] = useState('priority');
  const [sortOrder, setSortOrder] = useState('desc');

  // Mock data - in real app this would come from API
  const [waitlists] = useState([
    { id: 1, name: 'General Therapy', patients: 23, avgWait: '14 days' },
    { id: 2, name: 'Depression', patients: 15, avgWait: '21 days' },
    { id: 3, name: 'Anxiety', patients: 18, avgWait: '18 days' },
    { id: 4, name: 'Child Therapy', patients: 12, avgWait: '30 days' },
    { id: 5, name: 'PTSD Treatment', patients: 8, avgWait: '25 days' },
    { id: 6, name: 'Family Counseling', patients: 16, avgWait: '19 days' }
  ]);

  const [allWaitlistEntries] = useState(() => {
    // Generate more entries for performance testing
    const baseEntries = [
      { id: 1, patient: 'Robert Chen', priority: 'High', waitTime: '30 days', matchScore: 95, waitlistId: 1 },
      { id: 2, patient: 'Sarah Johnson', priority: 'Medium', waitTime: '21 days', matchScore: 87, waitlistId: 1 },
      { id: 3, patient: 'David Miller', priority: 'Medium', waitTime: '14 days', matchScore: 76, waitlistId: 1 },
      { id: 4, patient: 'Lisa Garcia', priority: 'Low', waitTime: '7 days', matchScore: 65, waitlistId: 1 },
      { id: 5, patient: 'James Wilson', priority: 'High', waitTime: '28 days', matchScore: 92, waitlistId: 1 },
      { id: 6, patient: 'Mary Smith', priority: 'High', waitTime: '35 days', matchScore: 88, waitlistId: 2 },
      { id: 7, patient: 'John Doe', priority: 'Medium', waitTime: '12 days', matchScore: 72, waitlistId: 2 },
      { id: 8, patient: 'Jane Brown', priority: 'Low', waitTime: '5 days', matchScore: 68, waitlistId: 3 }
    ];

    // Expand dataset for performance testing
    const expandedEntries = [];
    for (let i = 0; i < 15; i++) {
      baseEntries.forEach((entry, index) => {
        expandedEntries.push({
          ...entry,
          id: i * baseEntries.length + entry.id,
          patient: `${entry.patient} ${i + 1}`,
          waitlistId: (entry.waitlistId % waitlists.length) + 1
        });
      });
    }
    return expandedEntries;
  });

  // Optimized filtering and sorting with memoization
  const filteredAndSortedEntries = useHealthcareMemo.appointments(
    () => {
      const endMeasure = OptimizationMonitor.startMeasure('WaitlistFiltering');
      
      let filtered = allWaitlistEntries;

      // Filter by selected waitlist
      if (selectedWaitlistId && activeTab !== 'all') {
        filtered = filtered.filter(entry => entry.waitlistId === selectedWaitlistId);
      }

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(entry =>
          entry.patient.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Filter by priority tab
      if (activeTab !== 'all') {
        filtered = filtered.filter(entry => entry.priority.toLowerCase() === activeTab);
      }

      // Sort entries
      filtered.sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'priority':
            const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
            comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
            break;
          case 'waitTime':
            const aDays = parseInt(a.waitTime);
            const bDays = parseInt(b.waitTime);
            comparison = aDays - bDays;
            break;
          case 'matchScore':
            comparison = a.matchScore - b.matchScore;
            break;
          case 'patient':
            comparison = a.patient.localeCompare(b.patient);
            break;
          default:
            comparison = 0;
        }
        
        return sortOrder === 'desc' ? -comparison : comparison;
      });

      endMeasure();
      return filtered;
    },
    'waitlist-filtering',
    selectedWaitlistId,
    [searchTerm, activeTab, selectedWaitlistId, sortBy, sortOrder, allWaitlistEntries]
  );

  // Optimized waitlist statistics
  const waitlistStats = useHealthcareMemo.clinical(
    () => {
      const totalPatients = filteredAndSortedEntries.length;
      const highPriority = filteredAndSortedEntries.filter(e => e.priority === 'High').length;
      const avgMatchScore = totalPatients > 0 
        ? Math.round(filteredAndSortedEntries.reduce((sum, e) => sum + e.matchScore, 0) / totalPatients)
        : 0;
      
      return { totalPatients, highPriority, avgMatchScore };
    },
    'waitlist-stats',
    [filteredAndSortedEntries]
  );

  // Optimized callbacks
  const waitlistActions = useHealthcareCallbacks.providerActions('waitlist-manager');

  const handleWaitlistSelect = useCallback((id) => {
    setSelectedWaitlistId(id);
    setActiveTab('all'); // Reset tab when switching waitlists
  }, []);

  const handleActionClick = useCallback((entryId, action) => {
    const endMeasure = OptimizationMonitor.startMeasure('WaitlistAction');
    
    console.log(`Action ${action} on entry ${entryId}`);
    
    switch (action) {
      case 'match':
        waitlistActions.onPatientSelect(entryId.toString());
        break;
      case 'contact':
        waitlistActions.onAppointmentUpdate(entryId.toString(), { action: 'contact' });
        break;
      case 'reschedule':
        waitlistActions.onAppointmentUpdate(entryId.toString(), { action: 'reschedule' });
        break;
    }
    
    endMeasure();
  }, [waitlistActions]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleSortChange = useCallback((field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  }, [sortBy, sortOrder]);

  // Data for virtual list
  const listData = useMemo(() => ({
    entries: filteredAndSortedEntries,
    onActionClick: handleActionClick
  }), [filteredAndSortedEntries, handleActionClick]);

  return (
    <div className="waitlist-page">
      <h1 className="page-title">Waitlist Management (Optimized)</h1>
      
      <div className="waitlist-actions">
        <button className="create-waitlist-button">+ Create Waitlist</button>
        
        <div className="waitlist-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      {/* Waitlist Summary Cards */}
      <div className="waitlist-summary">
        <h2>Waitlist Overview</h2>
        <div className="waitlist-cards">
          {waitlists.map(waitlist => (
            <WaitlistSummaryCard
              key={waitlist.id}
              waitlist={waitlist}
              isSelected={selectedWaitlistId === waitlist.id}
              onSelect={handleWaitlistSelect}
            />
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="waitlist-stats-bar">
        <div className="stat-item">
          <span className="stat-value">{waitlistStats.totalPatients}</span>
          <span className="stat-label">Total Patients</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{waitlistStats.highPriority}</span>
          <span className="stat-label">High Priority</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{waitlistStats.avgMatchScore}%</span>
          <span className="stat-label">Avg Match Score</span>
        </div>
      </div>

      {/* Priority Tabs */}
      <div className="priority-tabs">
        <button 
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => handleTabChange('all')}
        >
          All ({filteredAndSortedEntries.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'high' ? 'active' : ''}`}
          onClick={() => handleTabChange('high')}
        >
          High Priority ({filteredAndSortedEntries.filter(e => e.priority === 'High').length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'medium' ? 'active' : ''}`}
          onClick={() => handleTabChange('medium')}
        >
          Medium Priority ({filteredAndSortedEntries.filter(e => e.priority === 'Medium').length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'low' ? 'active' : ''}`}
          onClick={() => handleTabChange('low')}
        >
          Low Priority ({filteredAndSortedEntries.filter(e => e.priority === 'Low').length})
        </button>
      </div>

      {/* Sortable Header */}
      <div className="virtual-waitlist-header">
        <div className="virtual-header-row">
          <div 
            className={`header-cell sortable ${sortBy === 'patient' ? 'sorted-' + sortOrder : ''}`}
            onClick={() => handleSortChange('patient')}
          >
            Patient {sortBy === 'patient' && (sortOrder === 'asc' ? '↑' : '↓')}
          </div>
          <div 
            className={`header-cell sortable ${sortBy === 'priority' ? 'sorted-' + sortOrder : ''}`}
            onClick={() => handleSortChange('priority')}
          >
            Priority {sortBy === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
          </div>
          <div 
            className={`header-cell sortable ${sortBy === 'waitTime' ? 'sorted-' + sortOrder : ''}`}
            onClick={() => handleSortChange('waitTime')}
          >
            Wait Time {sortBy === 'waitTime' && (sortOrder === 'asc' ? '↑' : '↓')}
          </div>
          <div 
            className={`header-cell sortable ${sortBy === 'matchScore' ? 'sorted-' + sortOrder : ''}`}
            onClick={() => handleSortChange('matchScore')}
          >
            Match Score {sortBy === 'matchScore' && (sortOrder === 'asc' ? '↑' : '↓')}
          </div>
          <div className="header-cell">Actions</div>
        </div>
      </div>

      {/* Virtualized Waitlist Entries */}
      <div className="virtual-waitlist-container">
        {filteredAndSortedEntries.length > 0 ? (
          <List
            height={500}
            itemCount={filteredAndSortedEntries.length}
            itemSize={80}
            itemData={listData}
            overscanCount={10}
          >
            {WaitlistEntryRow}
          </List>
        ) : (
          <div className="no-entries">
            <p>No waitlist entries found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OptimizedWaitlist;