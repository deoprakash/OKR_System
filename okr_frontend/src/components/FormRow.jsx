import React from 'react';

const FormRow = ({ children, className = '' }) => (
  <div className={`flex items-center mb-6 gap-6 ${className}`}>{children}</div>
);

export default FormRow;
