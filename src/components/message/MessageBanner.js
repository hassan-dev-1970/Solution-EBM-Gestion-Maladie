import React from 'react';
import '../message/MessageBanner.css';

const MessageBanner = ({ message, type = 'success', onClose, global = false }) => {
  if (!message) return null;

  // On choisit dynamiquement la classe CSS selon le contexte
  const className = global ? 'message-banner-Global' : 'message-banner';

  return (
    <div className={`${className} ${type}`}>
      <span>{message}</span>
      <button className="close-btn" onClick={onClose}>×</button>
    </div>
  );
};

export default MessageBanner;
