import React from 'react';

const QuarterInput = ({ label, value, onChange, comment, onCommentChange }) => (
  <div className="grid gap-3 lg:grid-cols-[120px_80px_24px_1fr] items-center mb-4">
    <label className="text-base sm:text-lg font-bold text-(--text)">{label}</label>
    <input
      type="number"
      min="0"
      max="100"
      className="w-full border rounded px-2 py-1 text-lg"
      value={value}
      onChange={onChange}
    />
    <span className="mx-1 text-(--muted)">%</span>
    <input
      type="text"
      placeholder="Comments"
      className="w-full border rounded px-3 py-2 text-lg"
      value={comment}
      onChange={onCommentChange}
    />
  </div>
);

export default QuarterInput;
