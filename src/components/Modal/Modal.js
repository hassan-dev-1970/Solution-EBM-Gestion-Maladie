import React from 'react';
import './Modal.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'medium', // 'small', 'medium', 'large'
  showCloseButton = true,
  showHeader = true
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-container modal-${size}`} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        {showHeader && (
          <div className="modal-header">
            <h5>{title}</h5>
            {showCloseButton && (
              <button className="modal-close-btn" onClick={onClose} aria-label="Fermer">
                ✕
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="modal-content">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;