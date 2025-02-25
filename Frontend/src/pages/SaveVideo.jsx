import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
      setSavedVideos(res.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Save new video
  const saveVideo = async () => {
    if (!videoUrl.trim()) return alert("Please enter a valid YouTube URL!");
    try {
      await axios.post("http://localhost:3000/api/videos/save", { userId, videoUrl });
      setVideoUrl(""); // Clear input field
      fetchVideos(); // Refresh saved videos list
    } catch (error) {
      console.error("Error saving video:", error);
    }
  };

  return (
    <div className="container">
      <h2>Save YouTube Videos</h2>

      {/* Input Field for Entering YouTube URL */}
      <div className="input-section">
        <input
          type="text"
          placeholder="Enter YouTube video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        <button onClick={saveVideo}>Save Video</button>
      </div>

      {loading && <p>Loading...</p>}

      {/* List of Saved Videos */}
      <div className="video-list">
        {savedVideos.length === 0 ? (
          <p>No videos saved yet.</p>
        ) : (
          savedVideos.map((video) => {
            const videoId = new URL(video.videoUrl).searchParams.get("v");

            return (
              <div
                key={video._id}
                className="video-card"
                onClick={() => navigate(`/video/${video._id}`)}
              >
                <div className="thumbnail">
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                    alt="Video Thumbnail"
                  />
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
