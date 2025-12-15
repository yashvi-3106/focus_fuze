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


import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

axios.defaults.withCredentials = true;

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ simple form state (no dayjs needed)
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "", // "YYYY-MM-DD"
    description: "",
  });

  const userId = localStorage.getItem("userId") || "";
  const API_URL = "https://focus-fuze.onrender.com/calendar";

  useEffect(() => {
    if (!userId) {
      toast.error("User not logged in");
      setLoading(false);
      return;
    }

    fetchEvents();

    Notification.requestPermission().catch(() => {});
    // check every hour
    const interval = setInterval(() => checkDueDates(), 60 * 60 * 1000);
    // initial check
    setTimeout(() => checkDueDates(), 800);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // IMPORTANT: since checkDueDates uses events, re-check when events change
  useEffect(() => {
    checkDueDates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/${userId}`, {
        withCredentials: true,
      });

      const mapped = (response.data || []).map((event) => ({
        id: event._id,
        title: event.title,
        start: event.date, // expects YYYY-MM-DD
        extendedProps: { description: event.description },
      }));

      setEvents(mapped);
    } catch (error) {
      toast.error("Error fetching events");
      console.error("Error fetching events:", error);
    } finally {
      setTimeout(() => setLoading(false), 700);
    }
  };

  const handleChange = (name, value) => {
    setNewEvent((p) => ({ ...p, [name]: value }));
  };

  const handleAddEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.date) {
      toast.warn("Please enter event title and date");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        API_URL,
        {
          userId,
          title: newEvent.title.trim(),
          date: newEvent.date, // already YYYY-MM-DD
          description: newEvent.description,
        },
        { withCredentials: true }
      );

      toast.success("Event added successfully!");
      setNewEvent({ title: "", date: "", description: "" });
      await fetchEvents();
    } catch (error) {
      console.error("Error adding event:", error);
      toast.error(error.response?.data?.error || "Error adding event");
    } finally {
      setTimeout(() => setLoading(false), 700);
    }
  };

  // Delete event (same behavior: click -> toast -> confirm after toast closes)
  const handleEventClick = async (clickInfo) => {
    const eventId = clickInfo.event.id;

    toast.info("Click again to confirm deletion", {
      autoClose: 2000,
      onClose: async () => {
        setLoading(true);
        try {
          await axios.delete(`${API_URL}/${eventId}`, {
            withCredentials: true,
          });
          toast.success("Event deleted successfully!");
          await fetchEvents();
        } catch (error) {
          toast.error("Error deleting event");
          console.error("Error deleting event:", error);
        } finally {
          setTimeout(() => setLoading(false), 700);
        }
      },
    });
  };

  const checkDueDates = () => {
    if (Notification.permission !== "granted") return;

    const now = new Date();

    events.forEach((event) => {
      const eventDate = new Date(event.start);
      const timeDiff = eventDate - now;
      const hoursLeft = Math.ceil(timeDiff / (1000 * 60 * 60));

      if (hoursLeft > 0 && hoursLeft <= 24) {
        new Notification("FocusFuze Calendar Reminder", {
          body: `Event "${event.title}" is scheduled in ${hoursLeft} hour${
            hoursLeft === 1 ? "" : "s"
          }!`,
          icon: "https://img.freepik.com/free-vector/time-management-concept-illustration_114360-767.jpg",
        });
      } else if (timeDiff <= 0) {
        new Notification("FocusFuze Calendar Reminder", {
          body: `Event "${event.title}" is overdue!`,
          icon: "https://img.freepik.com/free-vector/time-management-concept-illustration_114360-767.jpg",
        });
      }
    });
  };

  const totalEvents = useMemo(() => events?.length || 0, [events]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* ✅ so it never hides under fixed navbar */}
      <div className="pt-[10px]">
        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-900/30 backdrop-blur-sm">
            <div className="rounded-3xl border border-white/30 bg-white/70 p-6 shadow-xl backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 animate-pulse rounded-full bg-slate-900" />
                <p className="text-sm font-semibold text-slate-900">
                  Loading…
                </p>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Syncing your calendar
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 rounded-3xl border border-slate-200 bg-white/75 p-6 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  Calendar
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Plan your day, keep reminders, stay consistent.
                </p>
              </div>

              <span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                {totalEvents} events
              </span>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="mx-auto max-w-6xl px-4 pb-12">
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Left: Add Event */}
            <section className="lg:col-span-2">
              <div className="rounded-3xl border border-slate-200 bg-white/75 p-5 shadow-sm backdrop-blur">
                <h2 className="text-base font-semibold text-slate-900">
                  Add New Event
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Title + Date required. Description optional.
                </p>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Event Title
                    </label>
                    <input
                      value={newEvent.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      placeholder="e.g., Submit assignment"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none transition focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Event Date
                    </label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => handleChange("date", e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none transition focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={newEvent.description}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                      placeholder="Optional details..."
                      className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none transition focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddEvent}
                    className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99]"
                  >
                    + Add Event
                  </button>

                  <p className="text-xs text-slate-500">
                    Tip: Click an event on the calendar to delete it.
                  </p>
                </div>
              </div>
            </section>

            {/* Right: Calendar */}
            <section className="lg:col-span-3">
              <div className="rounded-3xl border border-slate-200 bg-white/75 p-5 shadow-sm backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Your Calendar
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Stay on top of your schedule.
                    </p>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="p-2 sm:p-4">
                    <FullCalendar
                      plugins={[dayGridPlugin, interactionPlugin]}
                      initialView="dayGridMonth"
                      events={events}
                      eventClick={handleEventClick}
                      height="auto"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* ✅ FullCalendar styling tweaks (optional but makes it match your UI) */}
      <style>{`
        .fc {
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
          font-size: 14px;
          color: #0f172a;
        }
        .fc .fc-toolbar-title {
          font-size: 16px;
          font-weight: 700;
        }
        .fc .fc-button {
          border-radius: 12px;
          border: 1px solid rgb(226 232 240);
          background: white;
          color: rgb(51 65 85);
          padding: 8px 12px;
          font-weight: 600;
        }
        .fc .fc-button:hover {
          background: rgb(248 250 252);
        }
        .fc .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          background: rgb(15 23 42);
          border-color: rgb(15 23 42);
          color: white;
        }
        .fc .fc-daygrid-day-number {
          font-weight: 600;
          color: rgb(71 85 105);
        }
        .fc .fc-event {
          border-radius: 12px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          padding: 2px 6px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default CalendarPage;
