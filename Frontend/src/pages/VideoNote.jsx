import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ReactQuill from "react-quill";
import { ToastContainer, toast } from "react-toastify";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import "react-toastify/dist/ReactToastify.css"; // Import Toast styles
import "./VideoNote.css";

const VideoNote = () => {
  const { videoId } = useParams();
  const [videoUrl, setVideoUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchVideoDetails = async () => {
      setLoading(true);
      try {
        console.log("Fetching notes for videoId:", videoId, "and userId:", userId);

        const res = await axios.get(`https://focus-fuze.onrender.com/api/videos/saved/${userId}`);
        const video = res.data.find((v) => v._id === videoId);
        if (video) {
          setVideoUrl(video.videoUrl);
        } else {
          toast.error("Video not found in saved videos.");
        }

        try {
          const noteRes = await axios.get(`https://focus-fuze.onrender.com/api/videos/get-note/${videoId}/${userId}`);
          console.log("Fetched notes:", noteRes.data);
          setNotes(noteRes.data.notes || "");
        } catch (error) {
          console.warn("No notes found. User might not have saved any notes yet.");
          setNotes("");
        }
      } catch (error) {
        toast.error("Error fetching video details!");
        console.error("Error fetching video details:", error.response?.data || error.message);
      }
      setTimeout(() => setLoading(false), 1000); // Hide loader after 1 second
    };

    fetchVideoDetails();
  }, [videoId, userId]);

  const saveNotes = async () => {
    setLoading(true);
    try {
      await axios.post(`https://focus-fuze.onrender.com/api/videos/save-note/${videoId}`, { userId, notes });
      toast.success("Notes saved successfully!");
    } catch (error) {
      toast.error("Error saving notes!");
      console.error("Error saving notes:", error);
    }
    setTimeout(() => setLoading(false), 1000); // Hide loader after 1 second
  };

  // Quill Toolbar Options
  const toolbarOptions = [
    [{ font: [] }, { size: [] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["image", "link", "video"],
    ["clean"],
  ];

  return (
    <div className="video-note-container">
      {/* Toast notifications at top-right */}
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Show loader while API is fetching */}
      {loading && (
        <div className="loader-container12">
          <img
            src="https://cdn-icons-png.freepik.com/256/11857/11857533.png"
            alt="Loading..."
            className="loader12"
          />
        </div>
      )}

      {/* Video Section */}
      <div className="video-section2">
        {videoUrl ? (
          <iframe
            width="100%"
            height="400"
            src={`https://www.youtube.com/embed/${new URL(videoUrl).searchParams.get("v")}`}
            title="YouTube Video"
            allowFullScreen
          ></iframe>
        ) : (
          <p>Loading video...</p>
        )}
      </div>

      {/* Notes Section */}
      <div className="notes-section2">
        <ReactQuill
          value={notes}
          onChange={setNotes}
          modules={{ toolbar: toolbarOptions }}
          theme="snow"
          placeholder="Write your notes here..."
          className="custom-quill"
        />
        <button onClick={saveNotes}>Save Notes</button>
      </div>
    </div>
  );
};

export default VideoNote;
