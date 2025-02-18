import { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./Note.css";

const Note = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [userId] = useState(localStorage.getItem("userId") || "");

  // const userId = localStorage.getItem("userId");
console.log("User ID in Frontend:", userId);


  const API_URL = "http://localhost:3000/notes";

  useEffect(() => {
    if (userId) { 
      fetchNotes();
    }
  }, [userId]);

  // Fetch notes from backend for the logged-in user
  const fetchNotes = async () => {
    try {
      const response = await axios.get(`${API_URL}/${userId}`);
      setNotes(response.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  // Add new note
  const handleAddNote = async () => {
    if (!title.trim() || !content.trim()) return;
    try {
      await axios.post(API_URL, { userId, title, content });
      fetchNotes();
      setTitle("");
      setContent("");
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  // Update existing note
  const handleUpdateNote = async () => {
    if (!selectedNote || !title.trim() || !content.trim()) return;
    try {
      await axios.put(`${API_URL}/${selectedNote._id}`, { title, content });
      fetchNotes();
      setSelectedNote(null);
      setTitle("");
      setContent("");
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  // Delete note
  const handleDeleteNote = async (noteId) => {
    try {
      await axios.delete(`${API_URL}/${noteId}`);
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return (
    <div className="notes-container">


      <div className="note-input">
        <h2>{selectedNote ? "Edit Note" : "Create Note"}</h2>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Write your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button onClick={selectedNote ? handleUpdateNote : handleAddNote}>
          {selectedNote ? "Update Note" : "Add Note"}
        </button>
      </div>

      <div className="notes-grid">
        {notes.map((note) => (
          <div key={note._id} className="note-box">
            <h3>{note.title}</h3>
            <p>{note.content.slice(0, 50)}...</p>
            <div className="actions">
              <FaEdit
                className="edit-icon"
                onClick={() => {
                  setSelectedNote(note);
                  setTitle(note.title);
                  setContent(note.content);
                }}
              />
              <FaTrash className="delete-icon" onClick={() => handleDeleteNote(note._id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Note;
