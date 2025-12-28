// context/MessageBannerContext.js
import React, { createContext, useContext, useState } from 'react';
import MessageBanner from '../message/MessageBannerGlobal';

const MessageBannerContext = createContext();

export const MessageBannerProvider = ({ children }) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState('');

  const showMessage = (msg, msgType = 'success') => {
    setMessage(msg);
    setType(msgType);
  };

  const hideMessage = () => {
    setMessage('');
  };

  return (
    <MessageBannerContext.Provider value={{ showMessage, hideMessage }}>
      {/* Affichage de la bannière en haut de main-content */}
      {message && (
        <MessageBanner
          message={message}
          type={type}
          onClose={hideMessage}
        />
      )}
      {children}
    </MessageBannerContext.Provider>
  );
};

export const useMessageBanner = () => useContext(MessageBannerContext);
