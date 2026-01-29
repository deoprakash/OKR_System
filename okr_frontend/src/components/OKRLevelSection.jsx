import React from 'react';

const OKRLevelSection = ({ level, employeeCode, employeeName, okrDescription, okrValue, onChange }) => (
  <div className="border border-black rounded bg-white p-6 mb-8">
    <div className="w-fit mx-auto -mt-6 mb-4">
      <span className="bg-black text-white px-6 py-1 rounded text-lg font-bold shadow">Level - {level}</span>
    </div>
    <div className="flex items-center gap-6">
      <label className="text-xl font-bold text-gray-900 min-w-[140px]">Employee Code</label>
      <input type="text" value={employeeCode} onChange={e => onChange('employeeCode', e.target.value)} className="w-32 border border-gray-400 rounded px-3 py-2 text-lg text-gray-900 bg-white" />
      <label className="text-xl font-bold text-gray-900 min-w-[140px]">Employee Name</label>
      <input type="text" value={employeeName} onChange={e => onChange('employeeName', e.target.value)} className="w-64 border border-gray-400 rounded px-3 py-2 text-lg text-gray-900 bg-white" />
      <label className="text-xl font-bold text-gray-900 min-w-[140px]">OKR Description</label>
      <input type="text" value={okrDescription} onChange={e => onChange('okrDescription', e.target.value)} className="w-full border border-gray-400 rounded px-3 py-2 text-lg text-gray-900 bg-white" />
    </div>
  </div>
);

export default OKRLevelSection;
