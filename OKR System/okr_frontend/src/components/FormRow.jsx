import React from 'react';

const FormRow = ({ children, className = '' }) => (
  <div className={`flex flex-col lg:flex-row items-stretch lg:items-center mb-6 gap-4 lg:gap-6 ${className}`}>{children}</div>
);

export default FormRow;
