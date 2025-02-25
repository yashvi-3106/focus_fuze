import { useState, useEffect } from "react";
import axios from "axios";
import "./SavedVideos.css";

const SaveVideo = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [savedVideos, setSavedVideos] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state

  // Function to show loader for at least 1 second
  const showLoader = async (action) => {
    setLoading(true);
    const start = Date.now();
    await action();
    const elapsed = Date.now() - start;
    setTimeout(() => setLoading(false), Math.max(0, 1000 - elapsed));
  };

  // Fetch Saved Videos from Backend
  const fetchVideos = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("User ID not found.");
      return;
    }

    await showLoader(async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/videos/saved/${userId}`);
        setSavedVideos(res.data);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    });
  };

  // Save Video to Backend
  const saveVideo = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("User not logged in.");
      return;
    }

    if (!videoUrl) {
      alert("Please enter a video URL");
      return;
    }

    await showLoader(async () => {
      try {
        await axios.post("http://localhost:3000/api/videos/save", { userId, videoUrl });
        setVideoUrl("");
        fetchVideos();
      } catch (error) {
        console.error("Error saving video:", error);
      }
    });
  };

  // Delete Video
  const deleteVideo = async (videoId) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("User ID not found.");
      return;
    }

    await showLoader(async () => {
      try {
        await axios.delete(`http://localhost:3000/api/videos/delete/${videoId}`, { data: { userId } });
        fetchVideos();
      } catch (error) {
        console.error("Error deleting video:", error);
      }
    });
  };

  // Load videos on mount
  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <div className="container">
      {loading && ( // Show loader while loading
        <div className="loader-container1">
          <img
            src="https://cdn-icons-png.freepik.com/256/11857/11857533.png?semt=ais_hybrid"
            alt="Loading..."
            className="custom-loader1"
          />
        </div>
      )}

      <div className="input-container">
        <input
          type="text"
          placeholder="Enter YouTube video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        <button onClick={saveVideo}>Save</button>
      </div>

      <div className="video-list">
        {savedVideos.length === 0 ? (
          <p>No videos saved yet.</p>
        ) : (
          savedVideos.map((video) => (
            <div key={video._id} className="video-card">
              <iframe
                width="300"
                height="200"
                src={`https://www.youtube.com/embed/${new URL(video.videoUrl).searchParams.get("v")}`}
                title="YouTube Video"
                allowFullScreen
              ></iframe>
              <button className="delete-btn" onClick={() => deleteVideo(video._id)}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SaveVideo;
