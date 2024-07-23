// models/userSchema.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["student", "teacher", "admin"],
  },
  verified: {
    type: Boolean,
    default: false,
  },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" }, // For students
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // For teachers
});

export default mongoose.model("User", userSchema);
