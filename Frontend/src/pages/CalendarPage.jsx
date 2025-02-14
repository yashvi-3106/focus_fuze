import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import "./CalendarPage.css";

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", description: "" });
  const userId = localStorage.getItem("userId") || ""; // Fetch logged-in userId

  const API_URL = "http://localhost:3000/calendar";

  // Fetch events on mount
  useEffect(() => {
    if (userId) {
      fetchEvents();
    }
  }, [userId]);

  // Fetch events from backend
  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_URL}/${userId}`);
      setEvents(response.data.map(event => ({
        id: event._id,
        title: event.title,
        start: event.date,
        extendedProps: { description: event.description }
      })));
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // Add new event
  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date) return;
    try {
      await axios.post(API_URL, { userId, ...newEvent });
      fetchEvents();
      setNewEvent({ title: "", date: "", description: "" });
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  // Handle event click (Delete)
  const handleEventClick = async (clickInfo) => {
    const eventId = clickInfo.event.id;
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await axios.delete(`${API_URL}/${eventId}`);
        fetchEvents();
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  return (
    <div className="calendar-container">
      <h2>Calendar</h2>
      <div className="event-input">
        <input
          type="text"
          placeholder="Event Title"
          value={newEvent.title}
          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
        />
        <input
          type="date"
          value={newEvent.date}
          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
        />
        <textarea
          placeholder="Description (optional)"
          value={newEvent.description}
          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
        />
        <button onClick={handleAddEvent}>Add Event</button>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={handleEventClick}
      />
    </div>
  );
};

export default CalendarPage;
