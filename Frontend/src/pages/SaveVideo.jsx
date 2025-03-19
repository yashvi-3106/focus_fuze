import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./SavedVideos.css";

const SaveVideo = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [savedVideos, setSavedVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  // Fetch saved videos
  const fetchVideos = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:3000/api/videos/saved/${userId}`);
      setSavedVideos(res.data || []); // Ensure data is an array
    } catch (error) {
     
      console.error("Error fetching videos:", error);
      setSavedVideos([]); // Reset to empty array on error
    }
    setTimeout(() => setLoading(false), 1000); // Hide loader after 1 second
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Save new video
  const saveVideo = async () => {
    if (!videoUrl.trim()) return toast.warning("Please enter a valid YouTube URL!");
    setLoading(true);
    try {
      await axios.post("http://localhost:3000/api/videos/save", { userId, videoUrl });
      setVideoUrl(""); // Clear input field
      toast.success("Video saved successfully!");
      fetchVideos(); // Refresh saved videos list
    } catch (error) {
      toast.error("Error saving video!");
      console.error("Error saving video:", error);
    }
  };

  // Delete a video
  const deleteVideo = async (videoId) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:3000/api/videos/delete/${videoId}`, {
        data: { userId }, // Sending userId for verification
      });
      toast.success("Video deleted successfully!");
      fetchVideos(); // Refresh saved videos list
    } catch (error) {
      toast.error("Error deleting video!");
      console.error("Error deleting video:", error);
    }
  };

  return (
    <div className="video-main-container">
      {/* Toast notification container at top-right */}
      <ToastContainer position="top-right" autoClose={2000} className="video-toast-container" />

      {/* Show loader while API is fetching */}
      {loading && (
        <div className="video-loader-container">
          <img
            src="https://cdn-icons-png.freepik.com/256/11857/11857533.png"
            alt="Loading..."
            className="video-loader"
          />
        </div>
      )}

      <h2>Save YouTube Videos</h2>

      {/* Input Field for Entering YouTube URL */}
      <div className="video-input-container">
        <input
          type="text"
          placeholder="Enter YouTube video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        <button onClick={saveVideo}>Save Video</button>
      </div>

      {/* List of Saved Videos */}
      <div className="video-list">
        {savedVideos.length === 0 ? (
          <p className="video-no-videos">No videos saved yet.</p>
        ) : (
          savedVideos.map((video) => {
            const videoId = new URL(video.videoUrl).searchParams.get("v");
            if (!videoId) {
              console.warn("Invalid video URL for video:", video._id, video.videoUrl);
              return null; // Skip invalid URLs
            }
            console.log("Rendering video card for:", video._id); // Debug log
            return (
              <div key={video._id} className="video-card">
                <div className="thumbnail" onClick={() => navigate(`/video/${video._id}`)}>
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                    alt="Video Thumbnail"
                    onError={(e) => (e.target.src = "https://via.placeholder.com/480x360?text=Thumbnail+Error")}
                  />
                </div>
                <div className="video-card-footer">
                  <button className="delete-btn" onClick={() => deleteVideo(video._id)}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SaveVideo;