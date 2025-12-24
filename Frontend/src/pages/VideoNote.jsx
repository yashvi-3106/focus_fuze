import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ReactQuill from "react-quill";
import { ToastContainer, toast } from "react-toastify";
import "react-quill/dist/quill.snow.css";
import "react-toastify/dist/ReactToastify.css";

const API = "https://focus-fuze-1.onrender.com";

const getYoutubeId = (url = "") => {
  try {
    const u = new URL(url.trim());

    // youtu.be/xxxx
    if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "");

    // youtube.com/watch?v=xxxx
    const v = u.searchParams.get("v");
    if (v) return v;

    // youtube.com/shorts/xxxx
    const shorts = u.pathname.match(/\/shorts\/([^/]+)/);
    if (shorts?.[1]) return shorts[1];

    // youtube.com/embed/xxxx
    const embed = u.pathname.match(/\/embed\/([^/]+)/);
    if (embed?.[1]) return embed[1];

    return null;
  } catch {
    return null;
  }
};

const VideoNote = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();

  const [videoUrl, setVideoUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const userId = localStorage.getItem("userId");

  const ytId = useMemo(() => getYoutubeId(videoUrl), [videoUrl]);

  const toolbarOptions = [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link", "image"],
    ["clean"],
  ];

  useEffect(() => {
    const fetchVideoDetails = async () => {
      if (!userId) {
        toast.error("Please login again");
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        // 1) get saved videos & find matching one
        const res = await axios.get(`${API}/api/videos/saved/${userId}`);
        const video = (res.data || []).find((v) => v._id === videoId);

        if (!video) {
          toast.error("Video not found in saved videos.");
          setLoading(false);
          return;
        }

        setVideoUrl(video.videoUrl);

        // 2) get note (may not exist)
        try {
          const noteRes = await axios.get(
            `${API}/api/videos/get-note/${videoId}/${userId}`
          );
          setNotes(noteRes.data?.notes || "");
        } catch {
          setNotes("");
        }
      } catch (error) {
        toast.error("Error fetching video details!");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoDetails();
  }, [videoId, userId, navigate]);

  const saveNotes = async () => {
    if (!userId) return toast.error("Please login again");
    setSaving(true);
    try {
      await axios.post(`${API}/api/videos/save-note/${videoId}`, { userId, notes });
      toast.success("Notes saved!");
    } catch (error) {
      toast.error("Error saving notes!");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-[96px] pb-10">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 backdrop-blur-sm">
          <img
            src="https://cdn-icons-png.freepik.com/256/11857/11857533.png"
            alt="Loading"
            className="h-16 w-16 animate-spin"
          />
        </div>
      )}

      <div className="mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
              Video Notes
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Watch and write notes neatly.
            </p>
          </div>

          <button
            onClick={() => navigate("/save-video")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            ← Back
          </button>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* Video */}
          <div className="border-b border-slate-200 bg-slate-100">
            <div className="relative aspect-video w-full">
              {ytId ? (
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube.com/embed/${ytId}`}
                  title="YouTube Video"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center">
                  <p className="text-sm font-medium text-slate-600">
                    Invalid YouTube link
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="p-5 sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Notes</h2>
                <p className="text-sm text-slate-500">
                  Save key points while watching.
                </p>
              </div>

              <button
                onClick={saveNotes}
                disabled={saving}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Notes"}
              </button>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              <ReactQuill
                value={notes}
                onChange={setNotes}
                modules={{ toolbar: toolbarOptions }}
                theme="snow"
                placeholder="Write your notes here..."
                className="bg-white"
              />
            </div>

            {/* Quill polish */}
            <style>{`
              .ql-toolbar.ql-snow {
                border: 0;
                border-bottom: 1px solid #e2e8f0;
                background: #f8fafc;
              }
              .ql-container.ql-snow {
                border: 0;
                min-height: 260px;
              }
              .ql-editor {
                min-height: 260px;
              }
            `}</style>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoNote;
