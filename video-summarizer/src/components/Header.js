import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Header.css';

function Header() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <div className="logo">
            <i className="fas fa-video"></i>
            <h1>Video Summarizer</h1>
          </div>
          <nav className={`nav-menu ${showMobileMenu ? 'active' : ''}`}>
            <a href="#" className="nav-link active">
              <i className="fas fa-home"></i>
              Home
            </a>
            <a href="#" className="nav-link">
              <i className="fas fa-history"></i>
              History
            </a>
            <a href="#" className="nav-link">
              <i className="fas fa-star"></i>
              Favorites
            </a>
          </nav>
        </div>

        <div className="header-right">
          {user && (
            <>
              <div className="search-bar">
                <i className="fas fa-search"></i>
                <input type="text" placeholder="Search summaries..." />
              </div>
              
              <div className="notification-bell">
                <i className="fas fa-bell"></i>
                <span className="notification-badge">3</span>
              </div>

              <div className="user-profile" onClick={() => setShowDropdown(!showDropdown)}>
                <div className="avatar">
                  {user.full_name ? user.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
                <span className="user-name">{user.full_name || user.email}</span>
                <i className="fas fa-chevron-down"></i>

                {showDropdown && (
                  <div className="dropdown-menu">
                    <a href="#" className="dropdown-item">
                      <i className="fas fa-user"></i>
                      Profile
                    </a>
                    <a href="#" className="dropdown-item">
                      <i className="fas fa-cog"></i>
                      Settings
                    </a>
                    <a href="#" className="dropdown-item">
                      <i className="fas fa-question-circle"></i>
                      Help
                    </a>
                    <div className="dropdown-divider"></div>
                    <a onClick={handleLogout} className="dropdown-item logout">
                      <i className="fas fa-sign-out-alt"></i>
                      Logout
                    </a>
                  </div>
                )}
              </div>
            </>
          )}

          <button 
            className="mobile-menu-button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <i className={`fas ${showMobileMenu ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header; 