import React from 'react';

const KeyResultInput = ({ label, value, onChange, maxLength }) => (
  <div className="flex items-center mb-4">
    <label className="text-xl font-bold text-gray-900 min-w-[140px]">{label}</label>
    <input
      type="text"
      className="flex-1 border border-gray-400 rounded px-3 py-2 text-lg text-gray-900 bg-white"
      value={value}
      onChange={onChange}
      maxLength={maxLength}
    />
  </div>
);

export default KeyResultInput;
