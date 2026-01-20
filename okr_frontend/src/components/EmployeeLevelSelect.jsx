import React from 'react';

const EmployeeLevelSelect = ({ value, onChange, options }) => (
  <select
    className="w-full p-2 border border-gray-300 rounded text-lg"
    value={value}
    onChange={onChange}
  >
    <option value="">Select Level</option>
    {options.map((opt, idx) => (
      <option key={idx} value={opt}>{opt}</option>
    ))}
  </select>
);

export default EmployeeLevelSelect;
