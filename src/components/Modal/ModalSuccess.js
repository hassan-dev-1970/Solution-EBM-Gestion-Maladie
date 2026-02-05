import React from 'react';
import Modal from './Modal';
import './Modal.css';

const ModalSuccess = ({ 
  isOpen, 
  onClose, 
  title = 'Succès', 
  message,
  buttonText = 'OK'
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      footer={
        <button className="btn-primary" onClick={onClose}>
          {buttonText}
        </button>
      }
    >
      <div className="text-center">
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>
          ✅
        </div>
        <p style={{ fontSize: '16px', color: '#27ae60', fontWeight: '600', lineHeight: '1.6' }}>
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default ModalSuccess;