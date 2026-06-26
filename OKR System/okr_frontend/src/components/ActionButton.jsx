import React from 'react';

const ActionButton = ({ children, onClick, type = 'button', className = '', disabled = false, preventMouseFocus = true }) => (
  <button
    type={type}
    onMouseDown={preventMouseFocus && !disabled ? (e) => e.preventDefault() : undefined}
    onClick={onClick}
    disabled={disabled}
    className={`btn ${disabled ? 'btn-ghost opacity-50 cursor-not-allowed' : 'btn-primary'} ${className}`}
  >
    {children}
  </button>
);

export default ActionButton;
