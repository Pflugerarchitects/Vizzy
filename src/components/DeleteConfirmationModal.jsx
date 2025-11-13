import React, { useEffect, useRef } from 'react';

const DeleteConfirmationModal = ({ onConfirm, onCancel }) => {
  const noButtonRef = useRef(null);

  // Focus the "No" button when modal opens
  useEffect(() => {
    if (noButtonRef.current) {
      noButtonRef.current.focus();
    }
  }, []);

  // Handle escape key to cancel
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Delete Project?</h2>

        <p className="modal-message">
          This action cannot be undone.
        </p>

        <div className="modal-actions">
          <button
            ref={noButtonRef}
            className="modal-button modal-button-cancel"
            onClick={onCancel}
          >
            No, Keep it
          </button>
          <button
            className="modal-button modal-button-danger"
            onClick={onConfirm}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
