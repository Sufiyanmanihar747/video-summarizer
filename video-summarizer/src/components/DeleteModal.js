import React from 'react';
import './DeleteModal.css';

function DeleteModal({ isOpen, onClose, onConfirm, title }) {
  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal">
        <div className="delete-modal-header">
          <h3>Delete Summary</h3>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="delete-modal-content">
          <i className="fas fa-exclamation-triangle warning-icon"></i>
          <p>Are you sure you want to delete this summary?</p>
          <p className="summary-title">"{title}"</p>
          <p className="warning-text">This action cannot be undone.</p>
        </div>
        <div className="delete-modal-actions">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="confirm-button" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal; 