import React, { useState } from 'react';
import './Schedule.css';

const Schedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week');
  const [selectedProvider, setSelectedProvider] = useState('all');
  
  // Mock data for providers
  const providers = [
    { id: 1, name: 'Dr. Johnson' },
    { id: 2, name: 'Dr. Williams' },
    { id: 3, name: 'Dr. Lee' }
  ];
  
  // Mock data for appointments
  const appointments = [
    { id: 1, time: '9:00 AM', patient: 'Jane Smith', provider: 'Dr. Johnson', status: 'Confirmed' },
    { id: 2, time: '10:00 AM', patient: 'Michael Brown', provider: 'Dr. Williams', status: 'Confirmed' },
    { id: 3, time: '11:00 AM', patient: null, provider: 'Dr. Johnson', status: 'Open' },
    { id: 4, time: '12:00 PM', patient: null, provider: 'All', status: 'Lunch' },
    { id: 5, time: '1:00 PM', patient: 'David Miller', provider: 'Dr. Lee', status: 'Confirmed' },
    { id: 6, time: '2:00 PM', patient: null, provider: 'Dr. Williams', status: 'Open' },
    { id: 7, time: '3:00 PM', patient: 'Emma Davis', provider: 'Dr. Johnson', status: 'Confirmed' },
    { id: 8, time: '4:00 PM', patient: null, provider: 'Dr. Lee', status: 'Open' }
  ];
  
  // Generate time slots for the schedule
  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
  
  // Format date for display
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };
  
  // Handle date navigation
  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };
  
  // Get appointment for a specific time slot and provider
  const getAppointment = (time, provider) => {
    return appointments.find(
      app => app.time === time && (app.provider === provider || app.provider === 'All')
    );
  };
  
  // Handle appointment action
  const handleAppointmentAction = (appointment) => {
    if (appointment && appointment.status === 'Open') {
      console.log('Fill slot:', appointment);
      // In a real app, this would open a modal to fill the slot
    } else if (appointment && appointment.status === 'Confirmed') {
      console.log('View appointment:', appointment);
      // In a real app, this would open appointment details
    }
  };

  return (
    <div className="schedule-page">
      <h1 className="page-title">Schedule Management</h1>
      
      <div className="schedule-controls">
        <div className="view-controls">
          <button 
            className={`view-button ${viewMode === 'day' ? 'active' : ''}`}
            onClick={() => setViewMode('day')}
          >
            Day
          </button>
          <button 
            className={`view-button ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => setViewMode('week')}
          >
            Week
          </button>
          <button 
            className={`view-button ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
        </div>
        
        <div className="date-navigation">
          <button className="nav-button" onClick={() => navigateDate(-1)}>
            &lt; Previous
          </button>
          <span className="current-date">{formatDate(currentDate)}</span>
          <button className="nav-button" onClick={() => navigateDate(1)}>
            Next &gt;
          </button>
        </div>
        
        <div className="provider-filter">
          <select 
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
          >
            <option value="all">All Providers</option>
            {providers.map(provider => (
              <option key={provider.id} value={provider.name}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="schedule-container">
        <table className="schedule-table">
          <thead>
            <tr>
              <th className="time-column">Time</th>
              {providers.map(provider => (
                <th key={provider.id} className="provider-column">
                  {provider.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(time => (
              <tr key={time} className={time === '12:00 PM' ? 'lunch-row' : ''}>
                <td className="time-cell">{time}</td>
                {providers.map(provider => {
                  const appointment = getAppointment(time, provider.name);
                  const isLunch = time === '12:00 PM';
                  const isEmpty = !appointment;
                  const isOpen = appointment && appointment.status === 'Open';
                  const isConfirmed = appointment && appointment.status === 'Confirmed';
                  
                  return (
                    <td 
                      key={`${time}-${provider.id}`} 
                      className={`appointment-cell ${isLunch ? 'lunch-cell' : ''} ${isOpen ? 'open-cell' : ''} ${isConfirmed ? 'confirmed-cell' : ''}`}
                      onClick={() => handleAppointmentAction(appointment)}
                    >
                      {isLunch ? (
                        <div className="lunch-indicator">LUNCH</div>
                      ) : isEmpty ? (
                        <button className="add-appointment-button">+</button>
                      ) : isOpen ? (
                        <div className="open-slot">
                          <span className="slot-status">OPEN</span>
                          <button className="fill-slot-button">Fill Slot</button>
                        </div>
                      ) : (
                        <div className="appointment-info">
                          <div className="patient-name">{appointment.patient}</div>
                          <div className="appointment-status">{appointment.status}</div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="schedule-actions">
        <button className="action-button">+ Add Slot</button>
        <button className="action-button">Fill Open Slots</button>
        <button className="action-button">Manage Recurring</button>
      </div>
    </div>
  );
};

export default Schedule;
