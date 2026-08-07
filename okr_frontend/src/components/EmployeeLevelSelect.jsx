import React from "react";
import Select from "./ui/Select";

const EmployeeLevelSelect = ({
  value,
  onChange,
  options,
  disabled = false,
}) => (
  <Select
    className="text-lg"
    value={value}
    onChange={onChange}
    disabled={disabled}
  >
    <option value="">Select Level</option>
    {options.map((opt, idx) => (
      <option key={idx} value={opt}>
        {opt}
      </option>
    ))}
  </Select>
);

export default EmployeeLevelSelect;
