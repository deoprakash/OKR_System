import React from 'react';

const ActionButton = ({ children, onClick, type = 'button', className = '', disabled = false }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`bg-black text-white px-10 py-3 rounded text-lg font-medium mx-4 mt-4 transition ${className} ${disabled ? 'opacity-50 cursor-not-allowed hover:none' : 'hover:bg-blue-900'}`}
  >
    {children}
  </button>
);

export default ActionButton;
