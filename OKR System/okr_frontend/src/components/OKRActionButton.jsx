import React from 'react';

const OKRActionButton = ({ children, onClick, className = '', disabled = false, type = 'button', preventMouseFocus = true }) => (
  <button
    type={type}
    onMouseDown={preventMouseFocus && !disabled ? (e) => e.preventDefault() : undefined}
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={`btn ${disabled ? 'btn-ghost opacity-50 cursor-not-allowed' : 'btn-primary'} px-6 sm:px-8 py-2.5 sm:py-3 font-semibold rounded-lg transition-all duration-200 hover:shadow-lg disabled:hover:shadow-none ${className}`}
  >
    {children}
  </button>
);

export default OKRActionButton;
