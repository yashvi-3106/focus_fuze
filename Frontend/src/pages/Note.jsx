import  { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import ReactQuill from "react-quill";  // Import Quill Editor
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import "./Note.css";

const Note = () => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // Use for Quill content
  const [userId] = useState(localStorage.getItem("userId") || "");
  const [selectedNote, setSelectedNote] = useState(null);

  const API_URL = "http://localhost:3000/notes";

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

        {/* ReactQuill Editor */}
        <ReactQuill
          value={content}
          onChange={setContent} // Ensure the editor updates `content` state
          theme="snow"
          className="note-input"
           modules={{
    toolbar: [
      [{ header: [1, 2, 3, false] }], // Heading options
      [{ font: [] }], // Font family
      [{ size: [] }], // Font size
      [{ color: [] }, { background: [] }], // Font and background color options
      ["bold", "italic", "underline", "strike"], // Text formatting
      [{ script: "sub" }, { script: "super" }], // Subscript & Superscript
      [{ list: "ordered" }, { list: "bullet" }], // Lists
      [{ align: [] }], // Text alignment
      ["link"], // Links and images
      ["clean"], // Clear formatting
    ],
  }}
          
        />

        <button onClick={selectedNote ? handleUpdateNote : handleAddNote}>
          {selectedNote ? "Update Note" : "Add Note"}
        </button>
      </div>

      <div className="notes-grid">
        {notes.map((note) => (
          <div key={note._id} className="note-box">
            <h3>{note.title}</h3>
            {/* Render HTML content safely */}
            <div dangerouslySetInnerHTML={{ __html: note.content }} />

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
