import React from 'react';

const KeyResultInput = ({ label, value, onChange, maxLength }) => (
  <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
    <label className="text-base sm:text-lg font-bold text-(--text) min-w-35">{label}</label>
    <input
      type="text"
      className="flex-1 border rounded px-3 py-2 text-lg"
      value={value}
      onChange={onChange}
      maxLength={maxLength}
    />
  </div>
);

export default KeyResultInput;
