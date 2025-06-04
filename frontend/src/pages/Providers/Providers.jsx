import React, { useState } from 'react';
import './Providers.css';

const Providers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  
  // Mock data for providers
  const [providers, setProviders] = useState([
    { 
      id: 1, 
      name: 'Dr. Johnson', 
      email: 'johnson@example.com', 
      phone: '(555) 123-4567', 
      specialties: ['Depression', 'Anxiety'],
      modalities: ['CBT', 'Psychodynamic'],
      availability: 'Mon, Wed, Fri',
      patients: 45,
      utilization: 92
    },
    { 
      id: 2, 
      name: 'Dr. Williams', 
      email: 'williams@example.com', 
      phone: '(555) 234-5678', 
      specialties: ['Child Therapy', 'ADHD'],
      modalities: ['Play Therapy', 'Family Systems'],
      availability: 'Tue, Thu',
      patients: 38,
      utilization: 85
    },
    { 
      id: 3, 
      name: 'Dr. Lee', 
      email: 'lee@example.com', 
      phone: '(555) 345-6789', 
      specialties: ['Trauma', 'PTSD'],
      modalities: ['EMDR', 'Somatic Experiencing'],
      availability: 'Mon, Tue, Thu',
      patients: 42,
      utilization: 78
    },
    { 
      id: 4, 
      name: 'Dr. Garcia', 
      email: 'garcia@example.com', 
      phone: '(555) 456-7890', 
      specialties: ['Couples Therapy', 'Relationship Issues'],
      modalities: ['Gottman Method', 'EFT'],
      availability: 'Wed, Fri',
      patients: 35,
      utilization: 88
    }
  ]);
  
  // Filter providers based on search term and specialty
  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         provider.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = filterSpecialty === 'all' || provider.specialties.includes(filterSpecialty);
    
    return matchesSearch && matchesSpecialty;
  });
  
  // Get unique specialties for filter dropdown
  const specialties = [...new Set(providers.flatMap(provider => provider.specialties))];
  
  // Handle provider action
  const handleProviderAction = (providerId, action) => {
    console.log(`Action ${action} on provider ${providerId}`);
    // In a real app, this would perform the action and update the state
  };

  return (
    <div className="providers-page">
      <h1 className="page-title">Provider Management</h1>
      
      <div className="providers-actions">
        <button className="add-provider-button">+ Add Provider</button>
        
        <div className="provider-filters">
          <div className="filter-dropdown">
            <select 
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
            >
              <option value="all">All Specialties</option>
              {specialties.map((specialty, index) => (
                <option key={index} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>
          
          <div className="search-box">
            <input
              type="text"
              placeholder="Search providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="providers-grid">
        {filteredProviders.map(provider => (
          <div key={provider.id} className="provider-card">
            <div className="provider-header">
              <h3 className="provider-name">{provider.name}</h3>
              <div className="utilization-badge" style={{ backgroundColor: provider.utilization >= 90 ? '#47B881' : '#4A6FA5' }}>
                {provider.utilization}% Utilized
              </div>
            </div>
            
            <div className="provider-details">
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{provider.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{provider.phone}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Specialties:</span>
                <span className="detail-value">{provider.specialties.join(', ')}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Modalities:</span>
                <span className="detail-value">{provider.modalities.join(', ')}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Availability:</span>
                <span className="detail-value">{provider.availability}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Patients:</span>
                <span className="detail-value">{provider.patients}</span>
              </div>
            </div>
            
            <div className="provider-actions">
              <button 
                className="action-button"
                onClick={() => handleProviderAction(provider.id, 'view')}
              >
                View Schedule
              </button>
              <button 
                className="action-button"
                onClick={() => handleProviderAction(provider.id, 'edit')}
              >
                Edit Profile
              </button>
              <button 
                className="action-button"
                onClick={() => handleProviderAction(provider.id, 'waitlist')}
              >
                View Waitlist
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Providers;
