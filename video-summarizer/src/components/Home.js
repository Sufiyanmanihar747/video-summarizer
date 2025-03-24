import React, { useEffect, useState } from "react";
import Header from './Header';
import "./Home.css";
import api from "../utilities/api";

function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [summary, setSummary] = useState('');
  const [showInstructions, setShowInstructions] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSummary('');
    setStatus('Starting process...');

    try {
      const response = await api.post('/process_video', { url });
      if (response.data.summary) {
        setSummary(response.data.summary);
        setStatus('Summary generated successfully!');

        await api.post('/save_summary', {
          url,
          title: response.data.title || 'Untitled Video',
          summary: response.data.summary,
          url: response.data.url,
          transcription: response.data.transcript || '',
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const TypingText = ({ text, speed = 10 }) => {
    const [displayedText, setDisplayedText] = useState("");
  
    useEffect(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText((prev) => prev + text[index]);
          index++;
        } else {
          clearInterval(interval);
        }
      }, speed);
  
      return () => clearInterval(interval);
    }, [text, speed]);
  
    return <p>{displayedText}</p>;
  };

  return (
    <div className="home-container">
      <Header />
      <div className="content">
        <div className="welcome-section">
          <h1>Video Summarizer</h1>
          <p>Transform long videos into concise, readable summaries</p>
        </div>

        <div className="main-section">
          <div className="url-section">
            <form onSubmit={handleSubmit} className="form">
              <div className="input-container">
                <i className="fas fa-link"></i>
                <input
                  type="text"
                  placeholder="Paste your YouTube URL here"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                  className="url-input"
                />
                <button 
                  type="submit" 
                  disabled={loading || !url}
                  className={`submit-button ${loading ? 'loading' : ''}`}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic"></i>
                      Summarize
                    </>
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}
            
            {status && !error && (
              <div className="status-message">
                <i className="fas fa-info-circle"></i>
                {status}
              </div>
            )}
          </div>

          {showInstructions && !summary && (
            <div className="instructions-section">
              <div className="instruction-card">
                <i className="fas fa-paste"></i>
                <h3>Paste URL</h3>
                <p>Copy and paste any YouTube video URL</p>
              </div>
              <div className="instruction-card">
                <i className="fas fa-cogs"></i>
                <h3>Process</h3>
                <p>Our AI will analyze the video content</p>
              </div>
              <div className="instruction-card">
                <i className="fas fa-file-alt"></i>
                <h3>Get Summary</h3>
                <p>Receive a concise, readable summary</p>
              </div>
            </div>
          )}

          {summary && (
            <div className="summary-section">
              <div className="summary-header">
                <h2>
                  <i className="fas fa-check-circle"></i>
                  Summary Generated
                </h2>
                <div className="summary-actions">
                  <button className="action-button">
                    <i className="fas fa-copy"></i>
                    Copy
                  </button>
                  <button className="action-button">
                    <i className="fas fa-download"></i>
                    Download
                  </button>
                  <button className="action-button">
                    <i className="fas fa-share"></i>
                    Share
                  </button>
                </div>
              </div>
              <div className="summary-content">
                <TypingText text={summary} />
              </div>
            </div>
          )}
        </div>

        <div className="features-section">
          <h2>Why Choose Our Video Summarizer?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <i className="fas fa-bolt"></i>
              <h3>Fast Processing</h3>
              <p>Get summaries in seconds</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-brain"></i>
              <h3>AI Powered</h3>
              <p>Advanced ML algorithms</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-bullseye"></i>
              <h3>Accurate</h3>
              <p>High-quality summaries</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-lock"></i>
              <h3>Secure</h3>
              <p>Your data is protected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
