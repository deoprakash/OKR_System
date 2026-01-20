import React from 'react';

const ActionButton = ({ children, onClick, type = 'button', className = '' }) => (
  <button
    type={type}
    onClick={onClick}
    className={`bg-black text-white px-10 py-3 rounded text-lg font-medium mx-4 mt-4 hover:bg-blue-900 transition ${className}`}
  >
    {children}
  </button>
);

export default ActionButton;
