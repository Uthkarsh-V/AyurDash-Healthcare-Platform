// client/src/components/layout/Modal.jsx
import { createPortal } from 'react-dom';

export default function Modal({ content, onClose }) {
  return createPortal(
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div id="modalContent" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>,
    document.body
  );
}
