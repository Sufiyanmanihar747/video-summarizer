import React, { useState } from "react";
import "./Home.css";
import api from "../utilities/api";

function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [summary, setSummary] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSummary('');
    setStatus('Starting process...');

    try {
      const response = await fetch('http://127.0.0.1:5000/process_video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setStatus(data.message);
      
      if (data.status === 'completed') {
        setSummary(data.summary);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Video Summarizer</h1>

      <form onSubmit={handleSubmit} className="form">
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter YouTube URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            className="url-input"
          />
          <button 
            type="submit" 
            disabled={loading || !url}
            className="submit-button"
          >
            {loading ? 'Processing...' : 'Process'}
          </button>
        </div>
      </form>

      {error && <div className="error">{error}</div>}
      
      {status && <div className="status">{status}</div>}

      {summary && (
        <div className="summary-container">
          <h2>Summary</h2>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}

export default Home;
