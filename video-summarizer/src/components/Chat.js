import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Header from './Header';
import './Chat.css';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [chatHistory, setChatHistory] = useState([
    { id: 1, title: 'Previous Chat 1', date: '2024-03-20' },
    { id: 2, title: 'Previous Chat 2', date: '2024-03-19' },
  ]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Initialize Gemini API
  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const result = await model.generateContent(inputMessage);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: text,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Handle file upload logic here
      console.log('File uploaded:', file);
    }
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat?')) {
      setMessages([]);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSelectedChat(null);
    // Add logic to create new chat in history
  };

  const selectChat = (chat) => {
    setSelectedChat(chat);
    // Add logic to load chat messages
  };

  return (
    <div className="page-container">
      <Header />
      <div className="main-content">
        <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3>Chat History</h3>
          </div>
          <div className="sidebar-content">
            <button className="new-chat-btn" onClick={startNewChat}>
              <i className="fas fa-plus"></i> New Chat
            </button>
            <div className="chat-history-list">
              {chatHistory.map((chat) => (
                <div 
                  key={chat.id} 
                  className={`chat-history-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                  onClick={() => selectChat(chat)}
                >
                  <i className="fas fa-comment"></i>
                  <div className="chat-info">
                    <span className="chat-title">{chat.title}</span>
                    <span className="chat-date">{chat.date}</span>
                  </div>
                  <button className="delete-chat-btn">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chat-container">
          <div className="chat-header">
            <div className="header-left">
              <button 
                className="toggle-sidebar-btn"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <i className={`fas fa-${isSidebarOpen ? 'times' : 'bars'}`}></i>
              </button>
              <h2>AI Assistant</h2>
            </div>
            <div className="chat-actions">
              <button className="action-btn" title="Search">
                <i className="fas fa-search"></i>
              </button>
              <button className="action-btn" title="Download Chat">
                <i className="fas fa-download"></i>
              </button>
              <button className="action-btn" onClick={clearChat} title="Clear Chat">
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
          
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="welcome-message">
                <div className="welcome-icon">
                  <i className="fas fa-robot"></i>
                </div>
                <h3>Welcome to AI Chat!</h3>
                <p>Start a conversation with your AI assistant.</p>
              </div>
            )}
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
              >
                <div className="message-content">
                  <div className="message-avatar">
                    {message.role === 'user' ? 
                      <i className="fas fa-user"></i> : 
                      <i className="fas fa-robot"></i>
                    }
                  </div>
                  <div className="message-bubble">
                    <div className="message-text">
                      {message.content}
                    </div>
                    <div className="message-time">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant-message">
                <div className="message-content">
                  <div className="message-avatar">
                    <i className="fas fa-robot"></i>
                  </div>
                  <div className="message-bubble">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="chat-input">
            <div className="input-actions">
              <button 
                type="button" 
                className="action-btn"
                onClick={() => fileInputRef.current.click()}
              >
                <i className="fas fa-paperclip"></i>
              </button>
              <button 
                type="button" 
                className="action-btn"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <i className="far fa-smile"></i>
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <div className="input-wrapper">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="send-btn"
                disabled={isLoading || !inputMessage.trim()}
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat; 