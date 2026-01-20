import React from 'react';

const BackButton = ({ onClick, className = '' }) => (
  <button
    type="button"
    className={`bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded shadow mr-4 flex items-center ${className}`}
    onClick={onClick}
  >
    <span className="mr-2">&#8592;</span> Back
  </button>
);

export default BackButton;
