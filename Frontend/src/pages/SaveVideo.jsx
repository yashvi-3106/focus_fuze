import { useState, useEffect } from "react";
import axios from "axios";
import "./SavedVideos.css"


const SaveVideo = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [savedVideos, setSavedVideos] = useState([]);

  // Fetch Saved Videos from Backend
  const fetchVideos = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/videos/saved");
      setSavedVideos(res.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  // Save Video to Backend
  const saveVideo = async () => {
    if (!videoUrl) return alert("Please enter a video URL");

    try {
      await axios.post("http://localhost:3000/api/videos/save", { videoUrl });
      setVideoUrl("");
      fetchVideos(); // Refresh list
    } catch (error) {
      console.error("Error saving video:", error);
    }
  };

  // Delete Video
  const deleteVideo = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/videos/delete/${id}`);
      fetchVideos(); // Refresh list
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  // Load videos on mount
  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <div className="container">

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
