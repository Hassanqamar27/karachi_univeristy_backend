import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import path from "path";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "assignments",
    resource_type: "auto", // This ensures non-image files like zip, doc, etc., are handled correctly
    format: async (req, file) => {
      // Get the original file extension without the dot
      const ext = path
        .extname(file.originalname)
        .replace(".", "")
        .toLowerCase();
      console.log("Extracted Extension:", ext);
      return ext; // Return the correct file extension
    },
    public_id: (req, file) => {
      // Extract the base name (without extension) from the original file name
      const filename = path.parse(file.originalname).name;
      console.log("Generating Public ID:", Date.now() + "-" + filename);
      return Date.now() + "-" + filename; // Add timestamp to avoid name collisions
    },
  },
});
const fileFilter = (req, file, cb) => {
  console.log("Detected MIME type:", file.mimetype);
  const allowedTypes = [
    "application/pdf",
    "application/zip",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  // Extract the file extension for additional checking
  const ext = path.extname(file.originalname).toLowerCase();

  // Check if the file MIME type or extension is allowed
  if (allowedTypes.includes(file.mimetype) || ext === ".zip") {
    cb(null, true);
  } else {
    cb(new Error("Only .pdf, .zip, .doc, and .docx files are allowed"), false);
  }
};

const upload = multer({ storage: storage, fileFilter });

export default upload;
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import path from "path";
// import cloudinary from "../config/cloudinary.js"; // Your cloudinary config

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "assignments", // Folder where files will be stored
//     resource_type: "raw", // Use 'raw' for PDFs, ZIPs, DOCs, etc.
//     format: async (req, file) => {
//       // Extract the file extension
//       const ext = path
//         .extname(file.originalname)
//         .replace(".", "")
//         .toLowerCase();
//       return ext; // Returns the file extension
//     },
//     public_id: (req, file) => {
//       // Generate a unique public ID using the current timestamp and original file name (without extension)
//       const filename = path.parse(file.originalname).name;
//       return `${Date.now()}-${filename}`; // Return a unique public ID for the file
//     },
//   },
// });

// const upload = multer({ storage });
// export default upload
