import express from "express";
import {
  createOrUpdateAssignment,
  deleteAssignment,
  submitOrUpdateAssignment,
} from "../controllers/assignmentController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

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
    format: async (req, file) => "zip",
    public_id: (req, file) => file.filename,
  },
});

const parser = multer({ storage: storage });

const router = express.Router();

// Routes
router.post("/create-or-update", authMiddleware, createOrUpdateAssignment); // Teacher creates or updates assignment
router.post("/delete", authMiddleware, deleteAssignment); // Teacher deletes assignment
router.post(
  "/submit-or-update",
  authMiddleware,
  parser.single("file"),
  submitOrUpdateAssignment
); // Student submits or updates assignment

export default router;
