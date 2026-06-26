import mongoose from "mongoose";
import Counter from "./counter.js";

const Level1OKRSchema = new mongoose.Schema(
  {
    empLevel: { type: Number, default: 1 },
    level1OkrCode: { type: Number, unique: true, index: true },
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

// Auto-generate a running serial number for `level1OkrCode`
Level1OKRSchema.pre("save", async function (next) {
  if (!this.isNew) return next();
  if (this.level1OkrCode) return next();

  try {
    const counter = await Counter.findOneAndUpdate(
      { _id: "level1okr" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.level1OkrCode = counter.seq;
    next();
  } catch (err) {
    next(err);
  }
});

const Level1OKR = mongoose.model("Level1OKR", Level1OKRSchema);

export default Level1OKR;
