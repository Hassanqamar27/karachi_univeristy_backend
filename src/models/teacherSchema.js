// models/Teacher.js
import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
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
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    assignedStudents: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    ],
  },
  { timestamps: true }
);

const Teacher = mongoose.model("Teacher", teacherSchema);
export default Teacher;
