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
  const [loading, setLoading] = useState(false);

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
        <div className="notes-loader-container">
          <img
            src="https://cdn-icons-png.freepik.com/256/11857/11857533.png"
            alt="Loading..."
            className="notes-loader"
          />
        </div>
      )}

      {!loading && (
        <div className="notes-main-layout">
          {/* Left Section: Note Input (70%) */}
          <section className="notes-input-area">
            <h2 className="notes-heading">
              {selectedNote ? "Edit Note" : "Create Note"}
            </h2>
            <p className="notes-subheading">Capture Your Thoughts</p>
            <div className="notes-input-form">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="notes-title-field"
              />
              <ReactQuill
                value={content}
                onChange={setContent}
                theme="snow"
                className="notes-quill-editor"
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
                    ["image", "link", "video"],
                    ["clean"],
                  ],
                }}
              />
              <button
                onClick={selectedNote ? handleUpdateNote : handleAddNote}
                className="notes-action-btn"
              >
                {selectedNote ? "Update Note" : "Add Note"}
              </button>
            </div>
          </section>

          {/* Right Section: Stored Notes (30%) */}
          <section className="notes-storage-area">
            <h2 className="notes-heading">Your Notes</h2>
            <p className="notes-subheading">Quick Access</p>
            <div className="notes-storage-list">
              {notes.map((note) => (
                <div key={note._id} className="notes-entry">
                  <h3>{note.title}</h3>
                  <div
                    className="notes-entry-preview"
                    dangerouslySetInnerHTML={{
                      __html:
                        note.content.substring(0, 100) +
                        (note.content.length > 100 ? "..." : ""),
                    }}
                  />
                  <div className="notes-entry-actions">
                    <FaEdit
                      className="notes-edit-btn"
                      onClick={() => {
                        setSelectedNote(note);
                        setTitle(note.title);
                        setContent(note.content);
                      }}
                    />
                    <FaTrash
                      className="notes-delete-btn"
                      onClick={() => handleDeleteNote(note._id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Note;