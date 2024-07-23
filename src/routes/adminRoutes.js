// routes/adminRoutes.js
import express from "express";
import Admin from "../models/adminSchema.js";
import Teacher from "../models/teacherSchema.js";
import Student from "../models/studentSchema.js";
import Course from "../models/courseSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/authMiddleware.js"; // Middleware to verify token and role

const router = express.Router();

// Admin login
router.post("/login", async (req, res) => {
  try {
    const admin = await Admin.findOne({ email: req.body.email });
    if (admin && (await bcrypt.compare(req.body.password, admin.password))) {
      const token = jwt.sign(
        { id: admin._id, role: "admin" },
        process.env.JWT_SECRET
      );
      res.json({ token });
    } else {
      res.status(400).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register a new teacher (Admin only)
router.post("/register-teacher", authMiddleware, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        data: null,
        status: false,
        message: "Required fields are missing",
      });
    }

    const userExist = await Teacher.findOne({ email: email });

    if (userExist) {
      return res.status(400).json({
        data: null,
        message: "Email already exists",
        status: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = new Teacher({
      ...req.body,
      password: hashedPassword,
      role: "teacher",
    });
    await teacher.save();
    res.status(201).json(teacher);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Assign students to teacher based on course and timing
router.post("/assign-students", authMiddleware, async (req, res) => {
  try {
    const { teacherId, courseId, timing } = req.body;
    const students = await Student.find({
      course: courseId,
      timing,
      status: "approved",
    });

    await Teacher.findByIdAndUpdate(teacherId, {
      $push: { assignedStudents: { $each: students.map((s) => s._id) } },
    });

    res.status(200).json({ message: "Students assigned successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
