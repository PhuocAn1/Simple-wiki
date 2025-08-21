import React from 'react';
import './ConfirmationPanel.css';

const ConfirmationPanel = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="overlay">
      <div className="panel">
        <p className="message">{message}</p>
        <div className="button-group">
          <button onClick={onCancel}>Continue editing</button>
          <button onClick={onConfirm}>Discard edits</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPanel;
