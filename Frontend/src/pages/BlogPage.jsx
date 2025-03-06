import { useNavigate } from "react-router-dom";
import "./BlogPage.css";

const BlogPage = () => {
  const navigate = useNavigate();

  return (
    <div className="blog-container">
      {/* <h1 className="blog-title">The Importance of Goal Setting in Everyday Life</h1>                                            */}

      <div className="video-container">
        <iframe
          className="video-iframe"
          width="100%"
          height="315"
          src="https://www.youtube.com/embed/V2PP3p4_4R8"
          title="Importance of Goal Setting"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
        
        <button onClick={() => navigate("/personal-goals")} className="skip-btn">Skip</button>
      </div>
{/* 
      <div className="content-section">
        <p className="intro-text">
          Setting goals is one of the most effective ways to achieve success in life.
          Whether it is personal or professional, goals provide direction and purpose.
        </p>

        <div className="info-boxes">
          <div className="info-box">
            <h2>Why is Goal Setting Important?</h2>
            <ul>
              <li>✨ Provides clarity on what you want to achieve.</li>
              <li>🚀 Keeps you motivated and focused.</li>
              <li>⏳ Helps manage time efficiently.</li>
              <li>📈 Allows tracking of progress and achievements.</li>
            </ul>
          </div>

          <div className="info-box">
            <h2>How to Set Effective Goals?</h2>
            <p>Follow the SMART framework:</p>
            <ul>
              <li><b>S</b>pecific - Clearly define what you want to accomplish.</li>
              <li><b>M</b>easurable - Ensure your goal has measurable progress.</li>
              <li><b>A</b>chievable - Set realistic and attainable goals.</li>
              <li><b>R</b>elevant - Align with your long-term vision.</li>
              <li><b>T</b>ime-bound - Set deadlines to stay accountable.</li>
            </ul>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default BlogPage;

