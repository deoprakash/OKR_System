import React from 'react';

const LabeledInput = ({ label, ...props }) => (
  <div className="flex items-center gap-2">
    <label className="text-xl font-bold text-gray-900 min-w-[140px]">{label}</label>
    <input {...props} className={`border border-gray-400 rounded px-3 py-2 text-lg text-gray-900 bg-white ${props.className || ''}`} />
  </div>
);

export default LabeledInput;