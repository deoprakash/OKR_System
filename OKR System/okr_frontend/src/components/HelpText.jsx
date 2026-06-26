import React from 'react';

const HelpText = ({ title, children, titleClass = 'text-red-600 cursor-pointer', bodyClass = 'text-red-600' }) => (
  <div className="mb-8">
    <div className={`font-semibold underline ${titleClass}`}>{title}</div>
    <div className={`${bodyClass} text-base underline`}>{children}</div>
  </div>
);

export default HelpText;
