import React from 'react';

const Box = ({ children, className = '' }) => (
  <div className={`glass-card p-5 sm:p-6 mb-8 ${className}`}>{children}</div>
);

export default Box;
