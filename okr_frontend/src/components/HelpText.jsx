import React from 'react';

const HelpText = ({ title, children }) => (
  <div className="mb-8">
    <div className="font-semibold underline text-red-600 cursor-pointer">{title}</div>
    <div className="text-red-600 text-base underline">{children}</div>
  </div>
);

export default HelpText;
