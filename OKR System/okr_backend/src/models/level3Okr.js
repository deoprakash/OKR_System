import mongoose from "mongoose";
import Counter from "./counter.js";

const Level3OKRSchema = new mongoose.Schema(
  {
    level2OkrCode: { type: Number, required: true, index: true },
    level3OkrCode: { type: Number, unique: true, index: true },
    empLevel: { type: Number, default: 3 },
    empCode: { type: Number, required: true },
    empName: { type: String, maxlength: 40 },
    createdByName: { type: String, maxlength: 40 },
    createdByEmpCode: { type: Number },
    createdByUserId: { type: String, maxlength: 10 },
    okrDate: { type: Date, default: () => new Date() },
    okrDesc: { type: String, maxlength: 100 },
    kr1: { type: String, maxlength: 100 },
    kr2: { type: String, maxlength: 100 },
    kr3: { type: String, maxlength: 100 },
    kr4: { type: String, maxlength: 100 },
    kr5: { type: String, maxlength: 100 },
    q1_percentage: { type: Number, min: 0, max: 100 },
    q1_comment: { type: String, maxlength: 100 },
    q2_percentage: { type: Number, min: 0, max: 100 },
    q2_comment: { type: String, maxlength: 100 },
    q3_percentage: { type: Number, min: 0, max: 100 },
    q3_comment: { type: String, maxlength: 100 },
    q4_percentage: { type: Number, min: 0, max: 100 },
    q4_comment: { type: String, maxlength: 100 }
  },
  { timestamps: true }
);

// Auto-generate a running serial number for `level3OkrCode`
Level3OKRSchema.pre("save", async function (next) {
  if (!this.isNew) return next();
  if (this.level3OkrCode) return next();

  try {
    const counter = await Counter.findOneAndUpdate(
      { _id: "level3okr" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.level3OkrCode = counter.seq;
    next();
  } catch (err) {
    next(err);
  }
});

const Level3OKR = mongoose.model("Level3OKR", Level3OKRSchema);

export default Level3OKR;
