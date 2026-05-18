import React from 'react';

const BackButton = ({ onClick, className = '' }) => (
  <button
    type="button"
    className={`back-button hero-secondary inline-flex items-center gap-2 py-2.5 px-5 rounded-full font-semibold ${className}`}
    onClick={onClick}
    aria-label="Go back"
  >
    <span>&#8592;</span> Back
  </button>
);

export default BackButton;
