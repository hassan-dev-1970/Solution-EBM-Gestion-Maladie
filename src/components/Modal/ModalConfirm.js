import React from 'react';
import Modal from './Modal';
import './Modal.css';

const ModalConfirm = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirmation', 
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'warning' // 'warning', 'danger', 'info', 'success'
}) => {
  const getIcon = () => {
    const icons = {
      warning: '⚠️',
      danger: '❌',
      info: 'ℹ️',
      success: '✅'
    };
    return icons[type] || '⚠️';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            {cancelText}
          </button>
          <button 
            className={`btn-${type === 'danger' ? 'danger' : 'primary'}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <div className="text-center">
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>
          {getIcon()}
        </div>
        <p style={{ fontSize: '16px', color: '#555', lineHeight: '1.6' }}>
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default ModalConfirm;