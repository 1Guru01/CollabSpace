import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    refreshTokenHash: { type: String, required: true },

    userAgent: { type: String },
    ip: { type: String },

    expiresAt: { type: Date, required: true },

    revokedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Important index for cleanup
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Session ||
  mongoose.model("Session", SessionSchema);
