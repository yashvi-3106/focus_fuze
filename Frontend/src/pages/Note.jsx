import { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./Note.css";

const Note = () => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [userId] = useState(localStorage.getItem("userId") || "");
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(false); // Loader state

  const API_URL = "http://localhost:3000/notes";

  useEffect(() => {
    if (userId) {
      fetchNotes();
    }
  }, [userId]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/${userId}`);
      setTimeout(() => {
        setNotes(response.data);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching notes:", error);
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      await axios.post(API_URL, { userId, title, content });
      setTimeout(() => {
        setTitle("");
        setContent("");
        fetchNotes();
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error adding note:", error);
      setLoading(false);
    }
  };

  const handleUpdateNote = async () => {
    if (!selectedNote || !title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      await axios.put(`${API_URL}/${selectedNote._id}`, { title, content });
      setTimeout(() => {
        setSelectedNote(null);
        setTitle("");
        setContent("");
        fetchNotes();
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error updating note:", error);
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/${noteId}`);
      setTimeout(() => {
        fetchNotes();
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error deleting note:", error);
      setLoading(false);
    }
  };

  return (
    <div className="notes-container">
      {loading && (
        <div className="loader-container2">
          <img
            src="https://cdn-icons-png.freepik.com/256/11857/11857533.png"
            alt="Loading..."
            className="loader2"
          />
        </div>
      )}

      {!loading && (
        <>
          <div className="note-input">
            <h2>{selectedNote ? "Edit Note" : "Create Note"}</h2>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <ReactQuill
              value={content}
              onChange={setContent}
              theme="snow"
              className="note-input quill-editor"
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, false] }],
                  [{ font: [] }],
                  [{ size: [] }],
                  [{ color: [] }, { background: [] }],
                  ["bold", "italic", "underline", "strike"],
                  [{ script: "sub" }, { script: "super" }],
                  [{ list: "ordered" }, { list: "bullet" }],
                  [{ align: [] }],
                  ["link"],
                  ["clean"],
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
        </>
      )}
    </div>
  );
};

export default Note;
