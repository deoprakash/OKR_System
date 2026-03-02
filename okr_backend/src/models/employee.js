import mongoose from "mongoose";
import Counter from "./counter.js";

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

// Auto-generate a running serial number for empCode when missing
EmployeeSchema.pre("validate", async function (next) {
  if (this.empCode) return next();
  try {
    const counter = await Counter.findOneAndUpdate(
      { _id: "employee" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.empCode = counter.seq;
    next();
  } catch (err) {
    next(err);
  }
});

const Employee = mongoose.model("Employee", EmployeeSchema);

export default Employee;
