import React, { useState, useEffect } from 'react';
import { doctorAPI } from '../services/api';

const AppointmentCalendar = ({ doctorId, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateClick = async (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(date);
    
    // Fetch available slots
    setLoading(true);
    try {
      const response = await doctorAPI.getAvailableSlots(
        doctorId,
        date.toISOString().split('T')[0]
      );
      setAvailableSlots(response.data.slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="empty-day"></div>);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = selectedDate?.getDate() === day &&
                        selectedDate?.getMonth() === currentMonth.getMonth();
      const isPast = date < new Date() && date.getDate() < new Date().getDate();

      days.push(
        <div
          key={day}
          className={`calendar-day ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''}`}
          onClick={() => !isPast && handleDateClick(day)}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="appointment-calendar">
      <div className="calendar">
        <div className="calendar-header">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
            ← Previous
          </button>
          <h3>{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
            Next →
          </button>
        </div>

        <div className="weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-grid">
          {renderCalendar()}
        </div>
      </div>

      {selectedDate && (
        <div className="time-slots">
          <h4>Available Slots for {selectedDate.toDateString()}</h4>
          {loading ? (
            <p>Loading slots...</p>
          ) : availableSlots.length > 0 ? (
            <div className="slots-grid">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  className="slot-btn"
                  onClick={() => onDateSelect({ date: selectedDate, time: slot })}
                >
                  {slot}
                </button>
              ))}
            </div>
          ) : (
            <p className="no-slots">No slots available for this date</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentCalendar;