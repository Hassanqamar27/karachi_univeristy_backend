// routes/assignmentRoutes.js
import express from "express";
import Assignment from "../models/assignmentschema.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = express.Router();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "assignments",
    format: async (req, file) => "pdf", // supports promises as well
    public_id: (req, file) => file.filename,
  },
});

const parser = multer({ storage: storage });

// Teacher posts an assignment
router.post("/", async (req, res) => {
  try {
    const assignment = new Assignment(req.body);
    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Student submits an assignment
router.post("/submit", parser.single("file"), async (req, res) => {
  try {
    const { assignmentId, studentId } = req.body;
    const fileUrl = req.file.path;

    const assignment = await Assignment.findById(assignmentId);
    assignment.submissions.push({ student: studentId, fileUrl });
    await assignment.save();

    res.status(200).json({ message: "Assignment submitted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Teacher grades an assignment
router.post("/grade", async (req, res) => {
  try {
    const { assignmentId, studentId, grade } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    const submission = assignment.submissions.find(
      (sub) => sub.student.toString() === studentId
    );
    if (submission) {
      submission.grade = grade;
      await assignment.save();
      res.status(200).json({ message: "Grade submitted successfully" });
    } else {
      res.status(400).json({ error: "Submission not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
