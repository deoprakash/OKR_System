import React from "react";

const LabeledInput = ({ label, ...props }) => (
  <div className="flex items-center gap-2">
    <label className="text-xl font-bold text-gray-900 min-w-[140px]">
      {label}
    </label>
    <input
      {...props}
      className={`w-full border border-white/60 rounded-xl px-3.5 py-2.5 text-base text-gray-900 bg-white/72 backdrop-blur-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary ${props.className || ""}`}
    />
  </div>
);

export default LabeledInput;
