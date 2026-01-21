import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    picture: { type: String },
    provider: { type: String, required: true }, // google, credentials
    providerId: { type: String, required: true }, // Google user ID
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
    