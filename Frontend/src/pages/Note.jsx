import { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./Note.css";

const Note = () => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [userId] = useState(localStorage.getItem("userId") || "");
  const [selectedNote, setSelectedNote] = useState(null);
  

  const API_URL = "http://localhost:3000/notes";
  
  // Separate URL for summaries

  // Fetch notes when component loads
  useEffect(() => {
    if (userId) {
      fetchNotes();
    }
  }, [userId]);

  const fetchNotes = async () => {
    try {
      const response = await axios.get(`${API_URL}/${userId}`);
      setNotes(response.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const handleAddNote = async () => {
    if (!title.trim() || !content.trim()) return;
    try {
      await axios.post(API_URL, { userId, title, content });
      setTitle("");
      setContent("");
      fetchNotes();
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const handleUpdateNote = async () => {
    if (!selectedNote || !title.trim() || !content.trim()) return;
    try {
      await axios.put(`${API_URL}/${selectedNote._id}`, { title, content });
      setSelectedNote(null);
      setTitle("");
      setContent("");
      fetchNotes();
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

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
                style={{ color: "black" }}
                onClick={() => {
                  setSelectedNote(note);
                  setTitle(note.title);
                  setContent(note.content);
                }}
              />
              <FaTrash
                className="delete-icon"
                style={{ color: "black" }}
                onClick={() => handleDeleteNote(note._id)}
              />
              
            </div>
          </div>
        ))}
      </div> 

      



    </div>
  );
};

export default Note;
