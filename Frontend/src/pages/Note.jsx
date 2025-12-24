import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const Note = () => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [userId] = useState(localStorage.getItem("userId") || "");
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(false);

  // filters
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortOrder, setSortOrder] = useState("recent");

  const API_URL = "https://focus-fuze-1.onrender.com/notes";

  useEffect(() => {
    if (userId) fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/${userId}`);
      // keep your “feel” delay
      setTimeout(() => {
        setNotes(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      }, 700);
    } catch (error) {
      console.error("Error fetching notes:", error);
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedNote(null);
    setTitle("");
    setContent("");
  };

  const handleAddNote = async () => {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      await axios.post(API_URL, { userId, title, content });
      setTimeout(() => {
        resetForm();
        fetchNotes();
        setLoading(false);
      }, 700);
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
        resetForm();
        fetchNotes();
        setLoading(false);
      }, 700);
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
      }, 700);
    } catch (error) {
      console.error("Error deleting note:", error);
      setLoading(false);
    }
  };

  const filteredNotes = useMemo(() => {
    const list = Array.isArray(notes) ? notes : [];

    return list
      .filter((note) => {
        const matchesSearch = (note.title || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        let matchesDate = true;

        if (startDate || endDate) {
          const noteDate = new Date(note.createdAt);

          if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            matchesDate = noteDate >= start && noteDate <= end;
          } else {
            const selectedDate = new Date(startDate || endDate);
            const startOfDay = new Date(selectedDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(selectedDate);
            endOfDay.setHours(23, 59, 59, 999);
            matchesDate = noteDate >= startOfDay && noteDate <= endOfDay;
          }
        }

        return matchesSearch && matchesDate;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
      });
  }, [notes, searchTerm, startDate, endDate, sortOrder]);

  // Quill toolbar
  const quillModules = useMemo(
    () => ({
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
    }),
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* ✅ IMPORTANT: prevent content going under your fixed navbar */}
      <div className="pt-[10px]">
        {/* Loader overlay */}
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
                Syncing your notes
              </p>
            </div>
          </div>
        )}

        {/* Page header */}
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 rounded-3xl border border-slate-200 bg-white/75 p-6 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  Notes
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Capture ideas. Keep them searchable. Stay calm.
                </p>
              </div>

              <div className="flex gap-2">
                {selectedNote ? (
                  <>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                      Cancel Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdateNote}
                      className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99]"
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddNote}
                    className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99]"
                  >
                    + Add Note
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="mx-auto max-w-6xl px-4 pb-12">
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Left: editor */}
            <section className="lg:col-span-3">
              <div className="rounded-3xl border border-slate-200 bg-white/75 p-5 shadow-sm backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      {selectedNote ? "Edit Note" : "Create Note"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Write clean. Format if you need.
                    </p>
                  </div>

                  {selectedNote ? (
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                      Editing
                    </span>
                  ) : (
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                      New
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Title
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Give it a clear title…"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none transition focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Content
                    </label>
                    <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white/90">
                      {/* Quill */}
                      <ReactQuill
                        value={content}
                        onChange={setContent}
                        theme="snow"
                        modules={quillModules}
                      />
                    </div>

                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                      >
                        Clear
                      </button>

                      <button
                        type="button"
                        onClick={selectedNote ? handleUpdateNote : handleAddNote}
                        className="rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99]"
                      >
                        {selectedNote ? "Update Note" : "Add Note"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Right: list */}
            <section className="lg:col-span-2">
              <div className="rounded-3xl border border-slate-200 bg-white/75 p-5 shadow-sm backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Your Notes
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Search, filter, and sort quickly.
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                    {filteredNotes.length}
                  </span>
                </div>

                {/* Filters */}
                <div className="mt-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Search by title…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none transition focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)]"
                  />

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      max={endDate || undefined}
                      className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none transition focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)]"
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || undefined}
                      className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none transition focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)]"
                    />
                  </div>

                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)]"
                  >
                    <option value="recent">Recent First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>

                {/* Notes list */}
                <div className="mt-5 space-y-3">
                  {filteredNotes.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 text-center">
                      <p className="text-sm font-semibold text-slate-900">
                        No notes found
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Try changing filters or create a new note.
                      </p>
                    </div>
                  ) : (
                    filteredNotes.map((note) => (
                      <div
                        key={note._id}
                        className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-4 shadow-sm transition hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-slate-900">
                              {note.title}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                              {new Date(note.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          {/* Hover actions */}
                          <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedNote(note);
                                setTitle(note.title);
                                setContent(note.content);
                              }}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm transition hover:bg-slate-50"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteNote(note._id)}
                              className="rounded-xl bg-rose-600 px-3 py-2 text-white shadow-sm transition hover:bg-rose-500"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>

                        <div
                          className="mt-3 text-sm text-slate-700 line-clamp-3"
                          // keeping your HTML preview behavior
                          dangerouslySetInnerHTML={{
                            __html:
                              (note.content || "").substring(0, 140) +
                              ((note.content || "").length > 140 ? "..." : ""),
                          }}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Optional: small Quill tweaks to match Tailwind look */}
      <style>{`
        .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid rgb(226 232 240) !important;
          background: rgba(255,255,255,0.65);
        }
        .ql-container.ql-snow {
          border: none !important;
          min-height: 260px;
        }
        .ql-editor {
          min-height: 260px;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default Note;
