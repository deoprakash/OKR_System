import mongoose from "mongoose";

const OtpChallengeSchema = new mongoose.Schema(
  {
    empCode: { type: Number, required: true, index: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 },
    consumed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

OtpChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OtpChallenge = mongoose.model("OtpChallenge", OtpChallengeSchema);

export default OtpChallenge;
