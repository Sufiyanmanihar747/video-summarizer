import React, { useState } from "react";
import "./Home.css";
import api from "../utilities/api";

function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [videoPath, setVideoPath] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Sending the URL in a POST request to your Flask endpoint '/download_video'
      const response = await api.post("/download_video", { url });
      
      // Response will contain the transcript, summary, or in our case, the video path
      if (response.data && response.data.path) {
        setVideoPath(response.data.path);
        setMessage("Video downloaded successfully!");
      } else {
        setMessage("Unexpected response from the server.");
      }
    } catch (error) {
      console.error("Error during API call:", error);
      setMessage("An error occurred while processing the video.");
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Video Downloader</h1>
        <p>Enter a video URL to download the video.</p>
      </header>
      <main className="main-content">
        <form onSubmit={handleSubmit} className="url-form">
          <input
            type="text"
            placeholder="Enter video URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="url-input"
          />
          <button type="submit" className="submit-button">
            {loading ? "Processing..." : "Submit"}
          </button>
        </form>
        {message && <p className="message">{message}</p>}
        {videoPath && (
          <div className="result">
            <h2>Download Path:</h2>
            <p>{videoPath}</p>
          </div>
        )}
      </main>
      <footer className="footer">
        <p>© 2025 Video Downloader. All Rights Reserved.</p>
      </footer>
    </div>
  );
}


export default Home;
