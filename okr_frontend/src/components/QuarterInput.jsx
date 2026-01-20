import React from 'react';

const QuarterInput = ({ label, value, onChange, comment, onCommentChange }) => (
  <div className="flex items-center gap-2 mb-4">
    <label className="min-w-[120px] text-lg font-bold text-gray-900">{label}</label>
    <input
      type="number"
      min="0"
      max="100"
      className="w-16 border border-gray-400 rounded px-2 py-1 text-lg text-gray-900 bg-white"
      value={value}
      onChange={onChange}
    />
    <span className="mx-1">%</span>
    <input
      type="text"
      placeholder="Comments"
      className="flex-1 border border-gray-400 rounded px-3 py-2 text-lg text-gray-900 bg-white"
      value={comment}
      onChange={onCommentChange}
    />
  </div>
);

export default QuarterInput;
