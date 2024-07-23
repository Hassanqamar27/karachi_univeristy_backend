// models/otpSchema.js
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300,
  }, // 5 minutes
});

const otpModel = mongoose.model("otp", otpSchema);

export default otpModel;
