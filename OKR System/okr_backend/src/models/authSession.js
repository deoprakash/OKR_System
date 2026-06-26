import mongoose from "mongoose";

const AuthSessionSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    empCode: { type: Number, required: true, index: true },
    expiresAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

AuthSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AuthSession = mongoose.model("AuthSession", AuthSessionSchema);

export default AuthSession;
