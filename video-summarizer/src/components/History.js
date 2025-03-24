import React, { useState, useEffect } from 'react';
import Header from './Header';
import api from '../utilities/api';
import './History.css';

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/get_history');
      setHistory(response.data.history);
    } catch (err) {
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'all') return matchesSearch;
    const isToday = new Date(item.created_at).toDateString() === new Date().toDateString();
    return matchesSearch && (filter === 'today' ? isToday : !isToday);
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("Your text here").then(() => {
      alert("Copied to clipboard!");
    });
  };
  
  const handleDownload = () => {
    const blob = new Blob(["Your text here"], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "file.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Share this",
          text: "Check this out!",
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      alert("Web Share API not supported in this browser.");
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
    <div className="history-container">
      <Header />
      <div className="history-content">
        <div className="history-header">
          <h1>Your Summary History</h1>
          <div className="history-controls">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search summaries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="older">Older</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading your history...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-history"></i>
            <p>No summaries found</p>
          </div>
        ) : (
          <div className="history-list">
            {filteredHistory.map((item, index) => (
              <div key={index} className="history-item">
                <div className="history-item-header" onClick={() => setSelectedSummary(selectedSummary === item ? null : item)}>
                  <div className="header-content">
                    <h3>{item.title.replace(/videos\//, '').replace(/\.mp4$/, '')}</h3>
                    <span className="date">{formatDate(item.created_at)}</span>
                  </div>
                  <i className={`fas fa-chevron-${selectedSummary === item ? 'up' : 'down'}`}></i>
                </div>
                
                {selectedSummary === item && (
                  <div className="history-item-content">
                    <div className="content-section summary-section">
                      <h4>Summary</h4>
                      <div className="content-box">
                      <TypingText text={item.summary} />
                      </div>
                    </div>
                    
                    <div className="content-section transcription-section">
                      <h4>Transcription</h4>
                      <div className="content-box">
                        <p>{item.transcription}</p>
                      </div>
                    </div>

                    <div className="actions">
                      <button className="action-button" onClick={() => handleCopy()}>
                        <i className="fas fa-copy"></i> Copy
                      </button>
                      <button className="action-button" onClick={() => handleDownload()}>
                        <i className="fas fa-download"></i> Download
                      </button>
                      {/* <button className="action-button" onClick={() => handleShare()}>
                        <i className="fas fa-share"></i> Share
                      </button> */}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default History; 