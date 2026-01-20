import React from 'react';

const Box = ({ children, className = '' }) => (
  <div className={`border border-black rounded bg-white p-6 mb-8 ${className}`}>{children}</div>
);

export default Box;
