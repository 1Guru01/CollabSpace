import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },          // NEW
    emailVerified: { type: Boolean, default: false }, // NEW

    provider: { type: String, required: true },
    providerId: { type: String },

    picture: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
