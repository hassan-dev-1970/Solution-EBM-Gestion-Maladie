// src/hooks/useConfirmToast.js
import { toast } from 'react-toastify';

const useConfirmToast = () => {
  const showConfirm = (message, onConfirm, options = {}) => {
    const {
      confirmText = "Confirmer",
      cancelText = "Annuler",
      confirmColor = "#082b67",
      cancelColor = "#6c757d"
    } = options;

    let toastId;

    const handleConfirm = () => {
      toast.dismiss(toastId);
      if (typeof onConfirm === 'function') {
        onConfirm();
      }
    };

    const handleCancel = () => {
      toast.dismiss(toastId);
    };

    toastId = toast.info(
      <div style={{ width: '100%', textAlign: 'center' }}>
     <p style={{fontSize: '15px'}}>{message}</p><br />
      <div style={{ marginTop: '12px', textAlign: 'center', display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '6px 14px',
              background: cancelColor,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              marginRight: '8px',
              width: '50%'
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '6px 14px',
              background: confirmColor,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              width: '50%'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        hideProgressBar: true,
        pauseOnHover: false,
        closeButton: false,
        style: {
          marginTop: '100%',
          backgroundColor: '#e1edf1',
          color: '#333333',
          border: '1px solid #082b67',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          minWidth: '400px',
          padding: '16px'
        }
      }
    );
  };

  return { showConfirm };
};

export default useConfirmToast;