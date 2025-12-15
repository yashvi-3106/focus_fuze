import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "https://focus-fuze.onrender.com";

const getYoutubeId = (url = "") => {
  try {
    const u = new URL(url.trim());

    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace("/", "");
    }

    const v = u.searchParams.get("v");
    if (v) return v;

    const shorts = u.pathname.match(/\/shorts\/([^/]+)/);
    if (shorts?.[1]) return shorts[1];

    const embed = u.pathname.match(/\/embed\/([^/]+)/);
    if (embed?.[1]) return embed[1];

    return null;
  } catch {
    return null;
  }
};

const SaveVideo = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [savedVideos, setSavedVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const fetchVideos = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/videos/saved/${userId}`);
      setSavedVideos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load videos");
      setSavedVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
    // eslint-disable-next-line
  }, []);

  const saveVideo = async () => {
    if (!videoUrl.trim()) return toast.warning("Enter a YouTube URL");
    const id = getYoutubeId(videoUrl);
    if (!id) return toast.error("Invalid YouTube URL");

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/videos/save`, {
        userId,
        videoUrl,
      });
      toast.success("Video saved");
      setVideoUrl("");
      fetchVideos();
    } catch (err) {
      console.error(err);
      toast.error("Error saving video");
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (videoId) => {
    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/api/videos/delete/${videoId}`, {
        data: { userId },
      });
      toast.success("Video deleted");
      fetchVideos();
    } catch (err) {
      console.error(err);
      toast.error("Error deleting video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-[10px] pb-10">
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

      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">NoteTube</h1>
          <p className="mt-1 text-sm text-slate-500">
            Save YouTube videos and open them later with notes.
          </p>
        </div>

        {/* Add Video */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">
            Save a video
          </h2>
          <p className="mb-4 text-sm text-slate-500">
            Paste any YouTube link (watch / shorts / youtu.be).
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
            />

            <button
              onClick={saveVideo}
              className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 active:scale-[0.98]"
            >
              Save
            </button>
          </div>
        </div>

        {/* Saved Videos */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Saved videos
            </h2>
            <p className="text-sm text-slate-500">
              {savedVideos.length} video
              {savedVideos.length !== 1 ? "s" : ""} saved
            </p>
          </div>

          {savedVideos.length === 0 ? (
            <div className="py-10 text-center">
              <p className="font-medium text-slate-700">
                No videos saved yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Add your first YouTube link above.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {savedVideos.map((video) => {
                const videoId = getYoutubeId(video.videoUrl);
                if (!videoId) return null;

                return (
                  <div
                    key={video._id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                  >
                    {/* Thumbnail */}
                    <div
                      className="relative aspect-video cursor-pointer"
                      onClick={() => navigate(`/video/${video._id}`)}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                        alt="Thumbnail"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                        <span className="text-5xl text-white">▶</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-2 p-4">
                      <p
                        className="truncate text-xs text-slate-500"
                        title={video.videoUrl}
                      >
                        {video.videoUrl}
                      </p>

                      <button
                        onClick={() => deleteVideo(video._id)}
                        className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaveVideo;
