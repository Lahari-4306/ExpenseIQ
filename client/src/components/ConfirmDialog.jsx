import './ConfirmDialog.css';

const ConfirmDialog = ({ message, onConfirm, onCancel, confirmLabel = 'Delete', danger = true }) => (
  <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onCancel()}>
    <div className="confirm-dialog">
      <div className="confirm-icon">{danger ? '⚠' : 'ℹ'}</div>
      <h3 className="confirm-title">{danger ? 'Confirm Delete' : 'Confirm Action'}</h3>
      <p className="confirm-message">{message}</p>
      <div className="confirm-actions">
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmDialog;
