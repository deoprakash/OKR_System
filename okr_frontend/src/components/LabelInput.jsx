import React from 'react';

const LabelInput = ({ label, children }) => (
  <div className="flex items-center mb-8">
    <label className="w-56 text-xl font-medium text-gray-900" htmlFor={label.replace(/ /g, '').toLowerCase()}>
      {label}
    </label>
    <div className="flex-1">{children}</div>
  </div>
);

export default LabelInput;
