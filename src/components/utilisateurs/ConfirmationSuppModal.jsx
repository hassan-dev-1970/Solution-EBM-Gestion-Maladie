
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import '../Styles/modal-delete.css';

const backdrop = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const modalVariant = {
  hidden: { y: '-100vh', opacity: 0 },
  visible: { y: '0', opacity: 1, transition: { delay: 0.2 } },
  exit: { y: '100vh', opacity: 0 },
};

export default function ConfirmationModal({ isOpen, message, onConfirm, onCancel }) {
  // Extraire le nom à afficher en gras
  const extractName = () => {
    if (message?.includes('client ')) return message.split('client ')[1];
    if (message?.includes('utilisateur ')) return message.split('utilisateur ')[1];
    if (message?.includes('prestation ')) return message.split('prestation ')[1];
    if (message?.includes('medicament ')) return message.split('medicament ')[1];


    return '';
  };

  const baseMessage =
    message?.includes('client ') || message?.includes('utilisateur ') || message?.includes('prestation ') || message?.includes('medicament ')
      ? 'Êtes-vous sûr de vouloir supprimer cet élément ?'
      : message;

  const highlightedName = extractName();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div className="modal" variants={modalVariant} exit="exit">
            <div className="modal-header">
              <AlertTriangle size={48} className="alert-icon" />
              <h3>Confirmation</h3>
            </div>

            <p className="modal-message">{baseMessage}</p>

            {highlightedName && (
              <p className="highlighted-name">{highlightedName}</p>
            )}

            <div className="modal-actions">
              <button onClick={onConfirm} className="btn-confirm">
                Confirmer
              </button>
              <button onClick={onCancel} className="btn-cancel">
                Annuler
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
