// routes/teacherRoutes.js
import express from "express";
import Teacher from "../models/teacherSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// Register a new teacher (Admin only)
router.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const teacher = new Teacher({ ...req.body, password: hashedPassword });
    await teacher.save();
    res.status(201).json(teacher);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Teacher login
router.post("/login", async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ email: req.body.email });
    if (
      teacher &&
      (await bcrypt.compare(req.body.password, teacher.password))
    ) {
      const token = jwt.sign({ id: teacher._id }, process.env.JWT_SECRET);
      res.json({ token });
    } else {
      res.status(400).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
