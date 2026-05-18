import React from 'react';

const ActionButton = ({ children, onClick, type = 'button', className = '', disabled = false }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`btn ${disabled ? 'btn-ghost opacity-50 cursor-not-allowed' : 'btn-primary'} ${className}`}
  >
    {children}
  </button>
);

export default ActionButton;
