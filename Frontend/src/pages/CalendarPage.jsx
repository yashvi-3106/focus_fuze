// import { useState, useEffect } from "react";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import interactionPlugin from "@fullcalendar/interaction";
// import axios from "axios";
// import {
//   TextField,
//   Button,
//   CssBaseline,
// } from "@mui/material";
// import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import "./CalendarPage.css";

// const CalendarPage = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [newEvent, setNewEvent] = useState({
//     title: "",
//     date: null,
//     description: "",
//   });
//   const userId = localStorage.getItem("userId") || "";
//   const API_URL = "http://localhost:3000/calendar";

//   useEffect(() => {
//     if (!userId) {
//       toast.error("Please log in to access the calendar");
//       window.location.href = "/login";
//       return;
//     }

//     fetchEvents();
//     Notification.requestPermission().then((permission) => {
//       console.log("Notification permission:", permission);
//     });
//     const interval = setInterval(checkDueDates, 5 * 1000);
//     checkDueDates();
//     return () => clearInterval(interval);
//   }, [userId]);

//   const fetchEvents = async () => {
//     setLoading(true);
//     try {
//       console.log("Fetching events for userId:", userId); // Debug
//       const response = await axios.get(`${API_URL}/${userId}`, {
//         withCredentials: true,
//       });
//       console.log("Fetch events response:", response.data); // Debug
//       setEvents(
//         response.data.map((event) => ({
//           id: event._id,
//           title: event.title,
//           start: event.date,
//           extendedProps: { description: event.description },
//         }))
//       );
//     } catch (error) {
//       console.error("Fetch events error:", error.response); // Detailed error
//       toast.error("Error fetching events: " + (error.response?.data?.error || "Unknown error"));
//     } finally {
//       setTimeout(() => setLoading(false), 1000);
//     }
//   };

//   const handleInputChange = (name, value) => {
//     setNewEvent((prevEvent) => ({
//       ...prevEvent,
//       [name]: value,
//     }));
//   };

//   const handleAddEvent = async () => {
//     if (!newEvent.title || !newEvent.date) {
//       toast.warn("Please enter event title and date");
//       return;
//     }
  
//     setLoading(true);
//     try {
//       const localEvent = {
//         userId,
//         title: newEvent.title,
//         date: newEvent.date.format("YYYY-MM-DD"),
//         description: newEvent.description,
//       };
//       console.log("Adding event:", localEvent); // Debug
//       const response = await axios.post(API_URL, localEvent, {
//         withCredentials: true,
//       });
//       console.log("Add event response:", response.data); // Debug
//       fetchEvents();
//       setNewEvent({ title: "", date: null, description: "" });
//       toast.success("Event added successfully and synced with Google Calendar!");
//     } catch (error) {
//       console.error("Add event error:", error.response);
//       if (error.response && error.response.status === 403 && error.response.data.redirect) {
//         toast.info("Redirecting to Google authentication...");
//         window.location.href = "http://localhost:3000/auth/google";
//       } else if (error.response && error.response.status === 401) {
//         toast.error("Session expired. Please log in again.");
//         window.location.href = "/login";
//       } else {
//         toast.error("Error adding event: " + (error.response?.data?.error || "Unknown error"));
//       }
//     } finally {
//       setTimeout(() => setLoading(false), 1000);
//     }
//   };

//   const handleEventClick = async (clickInfo) => {
//     const eventId = clickInfo.event.id;
//     toast.info("Click again to confirm deletion", {
//       onClose: async () => {
//         setLoading(true);
//         try {
//           await axios.delete(`${API_URL}/${eventId}`, {
//             withCredentials: true,
//           });
//           fetchEvents();
//           toast.success("Event deleted successfully!");
//         } catch (error) {
//           toast.error("Error deleting event");
//           console.error("Error deleting event:", error);
//         } finally {
//           setTimeout(() => setLoading(false), 1000);
//         }
//       },
//       autoClose: 2000,
//     });
//   };

//   const checkDueDates = () => {
//     if (Notification.permission !== "granted") return;
//     const now = new Date();
//     events.forEach((event) => {
//       const eventDate = new Date(event.start);
//       const timeDiff = eventDate - now;
//       const hoursLeft = Math.ceil(timeDiff / (1000 * 60 * 60));
//       if (hoursLeft > 0 && hoursLeft <= 24) {
//         new Notification("FocusFuze Calendar Reminder", {
//           body: `Event "${event.title}" is scheduled in ${hoursLeft} hour${hoursLeft === 1 ? "" : "s"}!`,
//           icon: "https://img.freepik.com/free-vector/time-management-concept-illustration_114360-767.jpg",
//         });
//       } else if (timeDiff <= 0) {
//         new Notification("FocusFuze Calendar Reminder", {
//           body: `Event "${event.title}" is overdue!`,
//           icon: "https://img.freepik.com/free-vector/time-management-concept-illustration_114360-767.jpg",
//         });
//       }
//     });
//   };

//   return (
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       <CssBaseline />
//       <div className="calendar-container">
//         <section className="event-input-section">
//           <h2 className="section-title1">Add New Event</h2>
//           <p className="section-subtitle1">Schedule Your Day</p>
//           <div className="event-form">
//             <TextField
//               label="Event Title"
//               variant="outlined"
//               fullWidth
//               value={newEvent.title}
//               onChange={(e) => handleInputChange("title", e.target.value)}
//               sx={{ marginBottom: 2 }}
//               InputLabelProps={{ style: { color: "#555" } }}
//               InputProps={{ style: { borderRadius: "5px" } }}
//               disabled={loading}
//             />
//             <DesktopDatePicker
//               label="Event Date"
//               value={newEvent.date}
//               onChange={(newValue) => handleInputChange("date", newValue)}
//               renderInput={(params) => (
//                 <TextField
//                   {...params}
//                   fullWidth
//                   sx={{ marginBottom: 2 }}
//                   InputLabelProps={{ style: { color: "#555" } }}
//                   InputProps={{ style: { borderRadius: "5px" } }}
//                   disabled={loading}
//                 />
//               )}
//             />
//             <TextField
//               label="Description (Optional)"
//               variant="outlined"
//               fullWidth
//               multiline
//               rows={4}
//               value={newEvent.description}
//               onChange={(e) => handleInputChange("description", e.target.value)}
//               sx={{ marginBottom: 2 }}
//               InputLabelProps={{ style: { color: "#555" } }}
//               InputProps={{ style: { borderRadius: "5px" } }}
//               disabled={loading}
//             />
//             <Button
//               variant="contained"
//               onClick={handleAddEvent}
//               disabled={loading}
//               sx={{
//                 backgroundColor: "#007bff",
//                 "&:hover": {
//                   backgroundColor: "#0056b3",
//                   transform: "translateY(-2px)",
//                   boxShadow: "0 4px 15px rgba(0, 123, 255, 0.3)",
//                 },
//                 borderRadius: "5px",
//                 padding: "12px 25px",
//                 fontSize: "16px",
//                 transition: "all 0.3s ease",
//               }}
//             >
//               {loading ? "Adding..." : "Add Event"}
//             </Button>
//           </div>
//         </section>
//         <section className="calendar-display-section">
//           <h2 className="section-title">Your Calendar</h2>
//           <p className="section-subtitle">Stay on Top of Your Schedule</p>
//           {loading ? (
//             <div className="loader-container">
//               <img
//                 src="https://cdn-icons-png.freepik.com/256/11857/11857533.png?semt=ais_hybrid"
//                 alt="Loading..."
//                 className="loader"
//               />
//             </div>
//           ) : (
//             <div className="calendar-wrapper">
//               <FullCalendar
//                 plugins={[dayGridPlugin, interactionPlugin]}
//                 initialView="dayGridMonth"
//                 events={events}
//                 eventClick={handleEventClick}
//                 height="auto"
//               />
//             </div>
//           )}
//         </section>
//         <div className="toast-container">
//           <ToastContainer position="top-right" autoClose={3000} />
//         </div>
//       </div>
//     </LocalizationProvider>
//   );
// };

// export default CalendarPage;


import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import {
  TextField,
  Button,
  CssBaseline,
} from "@mui/material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./CalendarPage.css";
axios.defaults.withCredentials = true;


const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: null,
    description: "",
  });
  const userId = localStorage.getItem("userId") || "";

  const API_URL = "http://localhost:3000/calendar";

  useEffect(() => {
    if (userId) {
      fetchEvents();
    } else {
      toast.error("User not logged in");
    }

    Notification.requestPermission().then((permission) => {
      console.log("Notification permission:", permission);
    });

    const interval = setInterval(checkDueDates, 60 * 60 * 1000); 
    checkDueDates();
    return () => clearInterval(interval);
  }, [userId]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/${userId}`, { withCredentials: true });
      setEvents(
        response.data.map((event) => ({
          id: event._id,
          title: event.title,
          start: event.date,
          extendedProps: { description: event.description },
        }))
      );
    } catch (error) {
      toast.error("Error fetching events");
      console.error("Error fetching events:", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const handleInputChange = (name, value) => {
    setNewEvent((prevEvent) => ({
      ...prevEvent,
      [name]: value,
    }));
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date) {
      toast.warn("Please enter event title and date");
      return;
    }
  
    setLoading(true);
    try {
      const response = await axios.post(
        API_URL,
        {
          userId,
          title: newEvent.title,
          date: newEvent.date.format("YYYY-MM-DD"),
          description: newEvent.description,
        },
        { withCredentials: true }
      );
      console.log("Event added successfully:", response.data);
      fetchEvents();
      setNewEvent({ title: "", date: null, description: "" });
      toast.success("Event added successfully!");
    } catch (error) {
      console.error("Error adding event:", error);
      toast.error(error.response?.data?.error || "Error adding event");
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };
  
  // Delete event
  const handleEventClick = async (clickInfo) => {
    const eventId = clickInfo.event.id;
    toast.info("Click again to confirm deletion", {
      onClose: async () => {
        setLoading(true);
        try {
          await axios.delete(`${API_URL}/${eventId}`, { withCredentials: true });
          fetchEvents();
          toast.success("Event deleted successfully!");
        } catch (error) {
          toast.error("Error deleting event");
          console.error("Error deleting event:", error);
        } finally {
          setTimeout(() => setLoading(false), 1000);
        }
      },
      autoClose: 2000,
    });
  };

  const checkDueDates = () => {
    if (Notification.permission !== "granted") {
      console.log("Notifications not permitted");
      return;
    }

    console.log("Checking calendar due dates...");
    const now = new Date();
    events.forEach((event) => {
      const eventDate = new Date(event.start);
      const timeDiff = eventDate - now;
      const hoursLeft = Math.ceil(timeDiff / (1000 * 60 * 60));
      console.log(`Event: ${event.title}, Hours Left: ${hoursLeft}`);

      if (hoursLeft > 0 && hoursLeft <= 24) {
        new Notification("FocusFuze Calendar Reminder", {
          body: `Event "${event.title}" is scheduled in ${hoursLeft} hour${hoursLeft === 1 ? "" : "s"}!`,
          icon: "https://img.freepik.com/free-vector/time-management-concept-illustration_114360-767.jpg",
        });
        console.log(`Notification sent: ${event.title} in ${hoursLeft} hours`);
      } else if (timeDiff <= 0) {
        new Notification("FocusFuze Calendar Reminder", {
          body: `Event "${event.title}" is overdue!`,
          icon: "https://img.freepik.com/free-vector/time-management-concept-illustration_114360-767.jpg",
        });
        console.log(`Notification sent: ${event.title} is overdue`);
      }
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <CssBaseline />
      <div className="calendar-container">
        <section className="event-input-section">
          <h2 className="section-title">Add New Event</h2>
          <p className="section-subtitle">Schedule Your Day</p>
          <div className="event-form">
            <TextField
              label="Event Title"
              variant="outlined"
              fullWidth
              value={newEvent.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              sx={{ marginBottom: 2 }}
              InputLabelProps={{ style: { color: "#555" } }}
              InputProps={{ style: { borderRadius: "5px" } }}
            />

            <DesktopDatePicker
              label="Event Date"
              value={newEvent.date}
              onChange={(newValue) => handleInputChange("date", newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  sx={{ marginBottom: 2 }}
                  InputLabelProps={{ style: { color: "#555" } }}
                  InputProps={{ style: { borderRadius: "5px" } }}
                />
              )}
            />

            <TextField
              label="Description (Optional)"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={newEvent.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              sx={{ marginBottom: 2 }}
              InputLabelProps={{ style: { color: "#555" } }}
              InputProps={{ style: { borderRadius: "5px" } }}
            />

            <Button
              variant="contained"
              onClick={handleAddEvent}
              sx={{
                backgroundColor: "#007bff",
                "&:hover": {
                  backgroundColor: "#0056b3",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 15px rgba(0, 123, 255, 0.3)",
                },
                borderRadius: "5px",
                padding: "12px 25px",
                fontSize: "16px",
                transition: "all 0.3s ease",
              }}
            >
              Add Event
            </Button>
          </div>
        </section>

        <section className="calendar-display-section">
          <h2 className="section-title">Your Calendar</h2>
          <p className="section-subtitle">Stay on Top of Your Schedule</p>
          {loading ? (
            <div className="loader-container">
              <img
                src="https://cdn-icons-png.freepik.com/256/11857/11857533.png?semt=ais_hybrid"
                alt="Loading..."
                className="loader"
              />
            </div>
          ) : (
            <div className="calendar-wrapper">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                eventClick={handleEventClick}
                height="auto"
              />
            </div>
          )}
        </section>

        <div className="toast-container">
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default CalendarPage;