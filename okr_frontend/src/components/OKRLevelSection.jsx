import React from "react";

const OKRLevelSection = ({
  level,
  employeeCode,
  employeeName,
  okrDescription,
  okrValue,
  onChange,
}) => (
  <div className="card p-6 mb-8 rounded-lg">
    <div className="w-fit mx-auto -mt-6 mb-4">
      <span className="badge">Level - {level}</span>
    </div>
    <div className="flex items-center gap-6">
      <label className="text-xl font-bold text-gray-900 min-w-[140px]">
        Employee Code
      </label>
      <input
        type="text"
        value={employeeCode}
        onChange={(e) => onChange("employeeCode", e.target.value)}
        className="w-32 border border-white/60 rounded-xl px-3.5 py-2.5 text-lg text-gray-900 bg-white/72 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary"
      />
      <label className="text-xl font-bold text-gray-900 min-w-[140px]">
        Employee Name
      </label>
      <input
        type="text"
        value={employeeName}
        onChange={(e) => onChange("employeeName", e.target.value)}
        className="w-64 border border-white/60 rounded-xl px-3.5 py-2.5 text-lg text-gray-900 bg-white/72 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary"
      />
      <label className="text-xl font-bold text-gray-900 min-w-[140px]">
        OKR Description
      </label>
      <input
        type="text"
        value={okrDescription}
        onChange={(e) => onChange("okrDescription", e.target.value)}
        className="w-full border border-white/60 rounded-xl px-3.5 py-2.5 text-lg text-gray-900 bg-white/72 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary"
      />
    </div>
  </div>
);

export default OKRLevelSection;
