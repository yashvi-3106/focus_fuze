import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import {
  TextField,
  Button,
  CssBaseline,
  Container,
} from "@mui/material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "./CalendarPage.css";

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: "", date: null, description: "" });
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId") || ""; 

  const API_URL = "http://localhost:3000/calendar";

  useEffect(() => {
    if (userId) {
      fetchEvents();
    }
  }, [userId]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/${userId}`);
      setEvents(
        response.data.map(event => ({
          id: event._id,
          title: event.title,
          start: event.date,
          extendedProps: { description: event.description },
        }))
      );
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date) return;
    setLoading(true);
    try {
      await axios.post(API_URL, { userId, ...newEvent });
      fetchEvents();
      setNewEvent({ title: "", date: null, description: "" });
    } catch (error) {
      console.error("Error adding event:", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const handleEventClick = async (clickInfo) => {
    const eventId = clickInfo.event.id;
    if (window.confirm("Are you sure you want to delete this event?")) {
      setLoading(true);
      try {
        await axios.delete(`${API_URL}/${eventId}`);
        fetchEvents();
      } catch (error) {
        console.error("Error deleting event:", error);
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <CssBaseline />
      <Container>
        <div className="calendar-container">
          {loading ? (
            <div className="loader-container1">
              <img
                src="https://cdn-icons-png.freepik.com/256/11857/11857533.png?semt=ais_hybrid"
                alt="Loading..."
                className="custom-loader1"
              />
            </div>
          ) : (
            <>
              <div className="event-input">
                <TextField
                  label="Event Title"
                  variant="outlined"
                  fullWidth
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  sx={{ marginBottom: 2 }}
                />

                <DesktopDatePicker
                  label="Event Date"
                  inputFormat="yyyy-MM-dd"
                  value={newEvent.date}
                  onChange={(newValue) => setNewEvent({ ...newEvent, date: newValue })}
                  renderInput={(params) => <TextField {...params} fullWidth sx={{ marginBottom: 2 }} />}
                />

                <Button variant="contained" color="primary" onClick={handleAddEvent}>
                  Add Event
                </Button>
              </div>

              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                eventClick={handleEventClick}
              />
            </>
          )}
        </div>
      </Container>
    </LocalizationProvider>
  );
};

export default CalendarPage;
