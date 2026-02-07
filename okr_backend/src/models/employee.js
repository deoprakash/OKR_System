import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema(
  {
    empCode: { type: Number, required: true, unique: true },
    empName: { type: String, required: true, maxlength: 40 },
    empDesignation: { type: String, maxlength: 40 },
    empLevel: { type: Number }
  },
  { timestamps: true }
);

// create an index on empCode for fast lookup and enforcement
EmployeeSchema.index({ empCode: 1 }, { unique: true });

const Employee = mongoose.model("Employee", EmployeeSchema);

export default Employee;
