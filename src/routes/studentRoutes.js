// routes/studentRoutes.js
import express from "express";
import Student from "../models/studentSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// Register a new student
router.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const student = new Student({ ...req.body, password: hashedPassword });
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Student login
router.post("/login", async (req, res) => {
  try {
    const student = await Student.findOne({ cnic: req.body.cnic });
    if (
      student &&
      (await bcrypt.compare(req.body.password, student.password))
    ) {
      const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET);
      res.json({ token });
    } else {
      res.status(400).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
