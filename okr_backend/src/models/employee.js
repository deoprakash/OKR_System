import mongoose from "mongoose";
import crypto from "crypto";
import Counter from "./counter.js";

function generateUserIdCandidate() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = 10;
  const bytes = crypto.randomBytes(length);
  let value = "";
  for (let i = 0; i < length; i += 1) {
    value += alphabet[bytes[i] % alphabet.length];
  }
  return value;
}

const EmployeeSchema = new mongoose.Schema(
  {
    empCode: { type: Number, required: true, unique: true },
    userId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9]{8,10}$/, "userId must be 8-10 alphanumeric characters"]
    },
    empName: { type: String, required: true, maxlength: 40 },
    empDesignation: { type: String, maxlength: 40 },
    empLevel: { type: Number },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
    },
    cellNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^[0-9]{10,15}$/, "Invalid mobile format"]
    },
    isAdmin: { type: Boolean, default: false }
    ,
    createdByName: { type: String, maxlength: 40 },
    createdByEmpCode: { type: Number },
    createdByUserId: { type: String, maxlength: 10 }
  },
  { timestamps: true }
);

// create an index on empCode for fast lookup and enforcement
EmployeeSchema.index({ empCode: 1 }, { unique: true });
EmployeeSchema.index({ userId: 1 }, { unique: true });
EmployeeSchema.index({ emailId: 1 }, { unique: true });
EmployeeSchema.index({ cellNumber: 1 }, { unique: true });

// Auto-generate a running serial number for empCode when missing
EmployeeSchema.pre("validate", async function (next) {
  try {
    if (!this.empCode) {
      const counter = await Counter.findOneAndUpdate(
        { _id: "employee" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.empCode = counter.seq;
    }

    if (!this.userId) {
      const EmployeeModel = this.constructor;
      for (let i = 0; i < 10; i += 1) {
        const candidate = generateUserIdCandidate();
        const exists = await EmployeeModel.exists({ userId: candidate });
        if (!exists) {
          this.userId = candidate;
          break;
        }
      }
      if (!this.userId) {
        return next(new Error("Failed to generate unique userId"));
      }
    }

    next();
  } catch (err) {
    next(err);
  }
});

const Employee = mongoose.model("Employee", EmployeeSchema);

export default Employee;
