import React from 'react';

const OKRActionButton = ({ children, onClick, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`bg-black text-white px-10 py-3 rounded text-lg font-medium mx-4 mt-4 hover:bg-gray-800 transition ${className}`}
  >
    {children}
  </button>
);

export default OKRActionButton;
