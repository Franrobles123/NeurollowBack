import mongoose from "mongoose";

const DemoRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    institution: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "confirmed", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

export default mongoose.model("DemoRequest", DemoRequestSchema);
