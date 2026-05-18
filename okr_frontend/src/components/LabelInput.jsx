import React from 'react';

const LabelInput = ({ label, children }) => (
  <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-6 lg:mb-8">
    <label className="w-full lg:w-56 text-base sm:text-lg font-medium text-(--text)" htmlFor={label.replace(/ /g, '').toLowerCase()}>
      {label}
    </label>
    <div className="flex-1">{children}</div>
  </div>
);

export default LabelInput;
