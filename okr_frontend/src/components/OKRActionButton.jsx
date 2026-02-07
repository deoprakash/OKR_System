import React from 'react';

const OKRActionButton = ({ children, onClick, className = '', disabled = false }) => (
  <button
    type="button"
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={`px-10 py-3 rounded text-lg font-medium mx-4 mt-4 transition ${disabled ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'} ${className}`}
  >
    {children}
  </button>
);

export default OKRActionButton;
