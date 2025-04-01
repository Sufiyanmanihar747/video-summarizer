import React, { useState, useEffect } from 'react';
import Header from './Header';
import Quiz from './Quiz';
import api from '../utilities/api';
import './History.css';
import GeminiQuiz from './GeminiQuiz';
import DeleteModal from './DeleteModal';

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedTranscription, setSelectedTranscription] = useState(null);
  const [geminiQuestions, setGeminiQuestions] = useState({});
  const [loadingGemini, setLoadingGemini] = useState({});
  const [showGeminiQuiz, setShowGeminiQuiz] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState(null);
  const [deletingIds, setDeletingIds] = useState({});
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    summaryId: null,
    title: ''
  });

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

  const handleCopy = (item) => {
    navigator.clipboard.writeText(item.transcription).then(() => {
      alert("Copied to clipboard!");
    });
  };
  
  const handleDownload = (item) => {
    const blob = new Blob([item.transcription], { type: "text/plain" });
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

  const handleStartQuiz = (transcription) => {
    setSelectedTranscription(transcription);
    setShowQuiz(true);
  };

  const handleCloseQuiz = () => {
    setShowQuiz(false);
    setSelectedTranscription(null);
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

  const handleGeminiQuestions = async (transcription, summaryId) => {
    try {
      setLoadingGemini(prev => ({ ...prev, [summaryId]: true }));
      
      const response = await api.post('/generate_gemini_questions', {
        text: transcription
      });

      if (response.data && response.data.questions) {
        setCurrentQuestions(response.data.questions);
        setShowGeminiQuiz(true);
      }
    } catch (error) {
      console.error('Error generating Gemini questions:', error);
    } finally {
      setLoadingGemini(prev => ({ ...prev, [summaryId]: false }));
    }
  };

  const handleDeleteClick = (summaryId, title) => {
    setDeleteModal({
      isOpen: true,
      summaryId,
      title
    });
  };

  const handleDeleteConfirm = async () => {
    const summaryId = deleteModal.summaryId;
    
    try {
      setDeletingIds(prev => ({ ...prev, [summaryId]: true }));

      const response = await api.delete('/delete_summary', {
        data: { summaryId }
      });

      if (response.data.success) {
        setHistory(prevHistory => 
          prevHistory.filter(item => item._id !== summaryId)
        );
        if (selectedSummary && selectedSummary._id === summaryId) {
          setSelectedSummary(null);
        }
      }
    } catch (error) {
      console.error('Error deleting summary:', error);
    } finally {
      setDeletingIds(prev => ({ ...prev, [summaryId]: false }));
      setDeleteModal({ isOpen: false, summaryId: null, title: '' });
    }
  };

  return (
    <div className="history-container">
      <DeleteModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, summaryId: null, title: '' })}
        onConfirm={handleDeleteConfirm}
        title={deleteModal.title}
      />
      <Header />
      <div className="history-content">
        {showQuiz ? (
          <div className="quiz-overlay">
            <div className="quiz-modal">
              <button className="close-quiz-btn" onClick={handleCloseQuiz}>
                <i className="fas fa-times"></i>
              </button>
              <Quiz transcription={selectedTranscription} />
            </div>
          </div>
        ) : (
          <>
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
                {filteredHistory.map((item, index) => {
                  const itemId = item._id || item.id;
                  const itemTitle = item.title.replace(/videos\//, '').replace(/\.mp4$/, '');
                  
                  return (
                    <div key={itemId || index} className="history-item">
                      <div className="history-item-header">
                        <div className="header-content">
                          <h3 onClick={() => setSelectedSummary(selectedSummary === item ? null : item)}>{itemTitle}</h3>
                          <span className="date">{formatDate(item.created_at)}</span>
                        </div>
                        <div className="header-actions">
                          <button
                            className={`delete-button ${deletingIds[itemId] ? 'deleting' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(itemId, itemTitle);
                            }}
                            disabled={deletingIds[itemId]}
                          >
                            {deletingIds[itemId] ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fas fa-trash"></i>
                            )}
                          </button>
                          <i 
                            className={`fas fa-chevron-${selectedSummary === item ? 'up' : 'down'}`}
                            onClick={() => setSelectedSummary(selectedSummary === item ? null : item)}
                          ></i>
                        </div>
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
                            <button className="action-button" onClick={() => handleCopy(item)}>
                              <i className="fas fa-copy"></i> Copy
                            </button>
                            <button className="action-button" onClick={() => handleDownload(item)}>
                              <i className="fas fa-download"></i> Download
                            </button>
                            <button 
                              className="action-button quiz-button"
                              onClick={() => handleStartQuiz(item.transcription)}
                            >
                              <i className="fas fa-question-circle"></i>
                              Start Quiz
                            </button>
                            <button 
                              className={`action-button gemini-button ${loadingGemini[item.id] ? 'loading' : ''}`}
                              onClick={() => handleGeminiQuestions(item.transcription, item.id)}
                              disabled={loadingGemini[item.id]}
                            >
                              <i className={`fas ${loadingGemini[item.id] ? 'fa-spinner fa-spin' : 'fa-robot'}`}></i>
                              {loadingGemini[item.id] ? 'Generating...' : 'Gemini Questions'}
                            </button>
                          </div>

                          {geminiQuestions[item.id] && (
                            <div className="gemini-questions-section">
                              <h4>Gemini Generated Questions</h4>
                              <div className="questions-list">
                                {geminiQuestions[item.id].map((q, qIndex) => (
                                  <div key={qIndex} className="question-item">
                                    <p className="question-text">{q.question}</p>
                                    <div className="options-list">
                                      {q.options.map((option, oIndex) => (
                                        <div 
                                          key={oIndex} 
                                          className={`option ${q.correct_answer === oIndex ? 'correct' : ''}`}
                                        >
                                          {option}
                                        </div>
                                      ))}
                                    </div>
                                    {q.explanation && (
                                      <p className="explanation">{q.explanation}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
        
        {showGeminiQuiz && currentQuestions && (
          <GeminiQuiz 
            questions={currentQuestions} 
            onClose={() => {
              setShowGeminiQuiz(false);
              setCurrentQuestions(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default History; 