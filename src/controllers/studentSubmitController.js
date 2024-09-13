import Assignment from "../models/assignmentschema.js";
import User from "../models/usersSchema.js";
import cloudinary from "../config/cloudinary.js";
import upload from "../middleware/multer-config.js"; // Import Multer configuration

// Middleware for handling file upload
export const uploadFile = upload.single("file"); // 'file' is the field name in the form

// Get Assignments for a specific student with submission status
// export const getStudentAssignments = async (req, res) => {
//   try {
//     const studentId = req.user.id; // Assuming studentId is coming from token (authenticated user)

//     // Ensure user is a student
//     const student = await User.findById(studentId);
//     if (!student || student.role !== "student") {
//       return res
//         .status(403)
//         .json({ message: "Access denied. You are not a student." });
//     }

//     // Find assignments for the student's assigned teacher
//     const assignments = await Assignment.find({
//       teacher: student.assignedTeacher,
//     })
//       .populate("teacher", "name email")
//       .populate("submissions.student", "name") // Populate student details
//       .select("title description dueDate submissions"); // Only select necessary fields

//     // Check if student has submitted each assignment
//     const assignmentWithSubmissionStatus = assignments.map((assignment) => {
//       const submission = assignment.submissions.find((sub) =>
//         sub.student._id.equals(studentId)
//       );
//       return {
//         ...assignment.toObject(),
//         isSubmitted: !!submission, // Boolean to indicate submission status
//         submissionDetails: submission ? submission : null, // Return submission details if available
//       };
//     });

//     res.status(200).json({ assignments: assignmentWithSubmissionStatus });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// Get Assignments for a specific student with submission and grade status
export const getStudentAssignments = async (req, res) => {
  try {
    const studentId = req.user.id; // Assuming studentId is coming from token (authenticated user)
    // console.log(studentId);
    // Ensure user is a student
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res
        .status(403)
        .json({ message: "Access denied. You are not a student." });
    }
    // console.log("Assigned Teachers for the Student:", student.assignedStudents);
    // const a = student.assignedStudents[0];
    // console.log(a);
    // Find assignments for the student's assigned teacher
    const assignments = await Assignment.find({
      // teacher: student.assignedStudents,
      teacher: { $in: student.assignedStudents },
    })
      .populate("teacher", "name email")
      .populate("submissions.student", "name") // Populate student details
      .select("title description dueDate submissions"); // Only select necessary fields
    // console.log(assignments);
    // Check if student has submitted each assignment
    const assignmentWithSubmissionStatus = assignments.map((assignment) => {
      const submission = assignment.submissions.find((sub) =>
        sub.student._id.equals(studentId)
      );
      return {
        ...assignment.toObject(),
        isSubmitted: !!submission, // Boolean to indicate submission status
        submissionDetails: submission ? submission : null, // Return submission details if available
        grade: submission ? submission.grade : null, // Include grade if submission exists
      };
    });

    res.status(200).json({ assignments: assignmentWithSubmissionStatus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// assignmentController.js
// 'file' is the field name in the form

// export const editAssignmentSubmission = async (req, res) => {
//   console.log("req.body:", req.body);
//   console.log("req.params:", req.params);
//   console.log("req.file:", req.file);
//   try {
//     const studentId = req.user.id; // Assuming studentId is coming from token (authenticated user)
//     const assignmentId = req.params.id;

//     // Ensure user is a student
//     const student = await User.findById(studentId);
//     if (!student || student.role !== "student") {
//       return res
//         .status(403)
//         .json({ message: "Access denied. You are not a student." });
//     }

//     // Find and update the assignment
//     const assignment = await Assignment.findById(assignmentId);
//     if (!assignment) {
//       return res.status(404).json({ message: "Assignment not found." });
//     }

//     // Check if the due date has passed
//     if (assignment.dueDate < Date.now()) {
//       return res.status(400).json({
//         message: "You cannot edit this submission. The due date has passed.",
//       });
//     }

//     // Check if the student has already submitted the assignment
//     const submissionIndex = assignment.submissions.findIndex((sub) =>
//       sub.student.equals(studentId)
//     );
//     if (submissionIndex === -1) {
//       return res
//         .status(400)
//         .json({ message: "You have not submitted this assignment yet." });
//     }

//     // Prepare update object
//     const updateFields = {};

//     // Handle file upload and update
//     if (req.file) {
//       // Delete the existing file from Cloudinary
//       const existingFileUrl = assignment.submissions[submissionIndex].fileUrl;
//       if (existingFileUrl) {
//         const publicId = existingFileUrl.split("/").pop().split(".")[0]; // Extract the public ID from URL
//         await cloudinary.uploader.destroy(publicId);
//       }

//       // Upload the new file to Cloudinary
//       const result = await cloudinary.uploader.upload(req.file.path, {
//         folder: "assignments", // Optional: specify the folder if needed
//       });

//       // Add new file URL to the updateFields object
//       updateFields["submissions." + submissionIndex + ".fileUrl"] =
//         result.secure_url;
//     }

//     // Update the assignment with new submission details
//     const updatedAssignment = await Assignment.findByIdAndUpdate(
//       assignmentId,
//       { $set: updateFields },
//       { new: true } // Return the updated document
//     );

//     if (!updatedAssignment) {
//       return res
//         .status(404)
//         .json({ message: "Assignment not found or failed to update." });
//     }

//     res.status(200).json({
//       message: "Assignment submission updated successfully",
//       assignment: updatedAssignment,
//     });
//   } catch (error) {
//     console.error("Error editing assignment submission:", error); // Debugging log
//     res.status(500).json({ message: error.message });
//   }
// };

export const editAssignmentSubmission = async (req, res) => {
  console.log("req.body:", req.body);
  console.log("req.params:", req.params);
  console.log("req.file:", req.file); // Make sure req.file has the expected data

  try {
    const studentId = req.user.id; // Assuming studentId is coming from token (authenticated user)
    const assignmentId = req.params.id;

    console.log("Student ID:", studentId);
    console.log("Assignment ID:", assignmentId);

    // Ensure user is a student
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      console.log("Access Denied: Not a student");
      return res
        .status(403)
        .json({ message: "Access denied. You are not a student." });
    }

    // Find and update the assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      console.log("Assignment Not Found");
      return res.status(404).json({ message: "Assignment not found." });
    }

    // Check if the due date has passed
    if (assignment.dueDate < Date.now()) {
      console.log("Assignment Due Date Passed");
      return res.status(400).json({
        message: "You cannot edit this submission. The due date has passed.",
      });
    }

    // Check if the student has already submitted the assignment
    const submissionIndex = assignment.submissions.findIndex((sub) =>
      sub.student.equals(studentId)
    );
    if (submissionIndex === -1) {
      console.log("Submission Not Found");
      return res
        .status(400)
        .json({ message: "You have not submitted this assignment yet." });
    }

    // Prepare update object
    const updateFields = {};

    // Handle file upload and update
    if (req.file) {
      // Delete the existing file from Cloudinary
      // const existingFileUrl = assignment.submissions[submissionIndex].fileUrl;
      // if (existingFileUrl) {
      //   const publicId = existingFileUrl.split("/").pop().split(".")[0]; // Extract the public ID from URL
      //   await cloudinary.uploader.destroy(publicId);
      //   console.log("Deleted existing file from Cloudinary");
      // }
      // Delete the existing file from Cloudinary
      const existingFileUrl = assignment.submissions[submissionIndex].fileUrl;
      if (existingFileUrl) {
        const publicId = existingFileUrl.split("/").slice(-1)[0].split(".")[0]; // Extract the public ID from URL
        console.log("Public ID to delete:", publicId);
        const deleteResult = await cloudinary.uploader.destroy(publicId);
        console.log("Delete Result:", deleteResult); // Log delete result
        if (deleteResult.result !== "ok") {
          console.log("Failed to delete existing file");
        } else {
          console.log("Deleted existing file from Cloudinary");
        }
      }

      // Upload the new file to Cloudinary
      const result = req.file.path;
      // const result = await cloudinary.uploader.upload(req.file.path, {
      //   folder: "assignments", // Optional: specify the folder if needed
      // });

      // Add new file URL to the updateFields object
      updateFields["submissions." + submissionIndex + ".fileUrl"] =
        result.secure_url;
      console.log("Uploaded new file to Cloudinary:", result.secure_url);
    }

    // Update the assignment with new submission details
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      { $set: updateFields },
      { new: true } // Return the updated document
    );

    if (!updatedAssignment) {
      console.log("Update Failed");
      return res
        .status(404)
        .json({ message: "Assignment not found or failed to update." });
    }

    res.status(200).json({
      message: "Assignment submission updated successfully",
      assignment: updatedAssignment,
    });
  } catch (error) {
    console.error("Error editing assignment submission:", error);
    res.status(500).json({ message: error.message });
  }
};

// Assuming you have an express route to handle uploads
// export const editAssignmentSubmission = async (req, res) => {
//   try {
//     const studentId = req.user.id;
//     const assignmentId = req.params.id;

//     const student = await User.findById(studentId);
//     if (!student || student.role !== "student") {
//       return res
//         .status(403)
//         .json({ message: "Access denied. You are not a student." });
//     }

//     const assignment = await Assignment.findById(assignmentId);
//     if (!assignment) {
//       return res.status(404).json({ message: "Assignment not found." });
//     }

//     if (assignment.dueDate < Date.now()) {
//       return res.status(400).json({ message: "Due date has passed." });
//     }

//     const submissionIndex = assignment.submissions.findIndex((sub) =>
//       sub.student.equals(studentId)
//     );
//     if (submissionIndex === -1) {
//       return res.status(400).json({ message: "No existing submission found." });
//     }

//     const updateFields = {};

//     // Handle file upload
//     if (req.file) {
//       const existingFileUrl = assignment.submissions[submissionIndex].fileUrl;
//       if (existingFileUrl) {
//         const publicId = existingFileUrl.split("/").pop().split(".")[0];
//         await deleteFileFromCloudinary(publicId);
//       }

//       const uploadResult = await uploadFileToCloudinary(req.file.path);
//       updateFields["submissions." + submissionIndex + ".fileUrl"] =
//         uploadResult.secure_url;
//     }

//     const updatedAssignment = await Assignment.findByIdAndUpdate(
//       assignmentId,
//       { $set: updateFields },
//       { new: true }
//     );

//     res.status(200).json({
//       message: "Assignment submission updated successfully",
//       assignment: updatedAssignment,
//     });
//   } catch (error) {
//     console.error("Error updating submission:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// export const editAssignmentSubmission = async (req, res) => {
//   try {
//     const studentId = req.user.id; // Assuming studentId is coming from token (authenticated user)
//     const assignmentId = req.params.id;

//     // Ensure user is a student
//     const student = await User.findById(studentId);
//     if (!student || student.role !== "student") {
//       return res
//         .status(403)
//         .json({ message: "Access denied. You are not a student." });
//     }

//     // Find the assignment
//     const assignment = await Assignment.findById(assignmentId);
//     if (!assignment) {
//       return res.status(404).json({ message: "Assignment not found." });
//     }

//     // Check if the due date has passed
//     if (assignment.dueDate < Date.now()) {
//       return res.status(400).json({
//         message: "You cannot edit this submission. The due date has passed.",
//       });
//     }

//     // Check if the student has already submitted the assignment
//     const submissionIndex = assignment.submissions.findIndex((sub) =>
//       sub.student.equals(studentId)
//     );
//     if (submissionIndex === -1) {
//       return res
//         .status(400)
//         .json({ message: "You have not submitted this assignment yet." });
//     }

//     // Delete the existing file from Cloudinary
//     const existingFileUrl = assignment.submissions[submissionIndex].fileUrl;
//     if (existingFileUrl) {
//       const publicId = existingFileUrl.split("/").pop().split(".")[0]; // Extract the public ID from URL
//       await cloudinary.uploader.destroy(publicId);
//     }

//     // Check if new file is uploaded
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded." });
//     }

//     // Update the student's submission with the new file URL
//     assignment.submissions[submissionIndex].fileUrl = req.file.path;

//     // Save the assignment with the updated submission
//     await assignment.save();

//     res.status(200).json({
//       message: "Assignment submission updated successfully",
//       assignment,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// Edit a student's assignment submission
// export const editAssignmentSubmission = async (req, res) => {
//   try {
//     const studentId = req.user.id; // Assuming studentId is coming from token (authenticated user)
//     const assignmentId = req.params.id;
//     const { fileUrl } = req.body; // New file URL after editing

//     // Ensure user is a student
//     const student = await User.findById(studentId);
//     if (!student || student.role !== "student") {
//       return res
//         .status(403)
//         .json({ message: "Access denied. You are not a student." });
//     }

//     // Find the assignment
//     const assignment = await Assignment.findById(assignmentId);
//     if (!assignment) {
//       return res.status(404).json({ message: "Assignment not found." });
//     }

//     // Check if the due date has passed
//     if (assignment.dueDate < Date.now()) {
//       return res.status(400).json({
//         message: "You cannot edit this submission. The due date has passed.",
//       });
//     }

//     // Check if the student has already submitted the assignment
//     const submissionIndex = assignment.submissions.findIndex((sub) =>
//       sub.student.equals(studentId)
//     );
//     if (submissionIndex === -1) {
//       return res
//         .status(400)
//         .json({ message: "You have not submitted this assignment yet." });
//     }

//     // Update the student's submission with the new file
//     assignment.submissions[submissionIndex].fileUrl = fileUrl;

//     // Save the assignment with the updated submission
//     await assignment.save();

//     res.status(200).json({
//       message: "Assignment submission updated successfully",
//       assignment,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// Submit assignment by a student
// export const submitAssignment = async (req, res) => {
//   console.log("req.body:", req.body);
//   console.log("req.params:", req.params);
//   console.log("req.file:", req.file); // Make sure req.file has the expected data

//   try {
//     const studentId = req.user.id;
//     const assignmentId = req.params.id;

//     console.log("Student ID:", studentId);
//     console.log("Assignment ID:", assignmentId);

//     const student = await User.findById(studentId);
//     if (!student || student.role !== "student") {
//       console.log("Access Denied: Not a student");
//       return res
//         .status(403)
//         .json({ message: "Access denied. You are not a student." });
//     }

//     const assignment = await Assignment.findById(assignmentId);
//     if (!assignment) {
//       console.log("Assignment Not Found");
//       return res.status(404).json({ message: "Assignment not found." });
//     }

//     if (!student.assignedStudents.includes(assignment.teacher.toString())) {
//       console.log("Access Denied: Not assigned to this teacher");
//       return res
//         .status(403)
//         .json({ message: "You are not allowed to submit this assignment." });
//     }

//     if (!req.file) {
//       console.log("No file uploaded");
//       return res.status(400).json({ message: "No file uploaded." });
//     }

//     const fileUrl = req.file.path; // Cloudinary URL should be available here
//     console.log("File URL:", fileUrl); // Log the file URL to ensure it's correct

//     const isLate = Date.now() > assignment.dueDate;

//     const updatedAssignment = await Assignment.findByIdAndUpdate(
//       assignmentId,
//       {
//         $push: {
//           submissions: {
//             student: studentId,
//             fileUrl,
//             isLate,
//           },
//         },
//       },
//       { new: true }
//     );

//     res.status(200).json({
//       message: "Assignment submitted successfully",
//       submission: updatedAssignment.submissions,
//     });
//   } catch (error) {
//     console.error("Error submitting assignment:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// export const submitAssignment = async (req, res) => {
//   console.log("req.body:", req.body);
//   console.log("req.params:", req.params);
//   console.log("req.file:", req.file); // Log the file data to verify

//   try {
//     const studentId = req.user.id;
//     const assignmentId = req.params.id;

//     console.log("Student ID:", studentId);
//     console.log("Assignment ID:", assignmentId);

//     // Verify the student exists and has the correct role
//     const student = await User.findById(studentId);
//     if (!student || student.role !== "student") {
//       console.log("Access Denied: Not a student");
//       return res
//         .status(403)
//         .json({ message: "Access denied. You are not a student." });
//     }

//     // Verify the assignment exists
//     const assignment = await Assignment.findById(assignmentId);
//     if (!assignment) {
//       console.log("Assignment Not Found");
//       return res.status(404).json({ message: "Assignment not found." });
//     }

//     // Ensure the student is assigned to the correct teacher for the assignment
//     if (!student.assignedStudents.includes(assignment.teacher.toString())) {
//       console.log("Access Denied: Not assigned to this teacher");
//       return res
//         .status(403)
//         .json({ message: "You are not allowed to submit this assignment." });
//     }

//     // Ensure a file has been uploaded
//     if (!req.file) {
//       console.log("No file uploaded");
//       return res.status(400).json({ message: "No file uploaded." });
//     }

//     // Upload the file to Cloudinary
//     const uploadResult = await uploadFileToCloudinary(req.file.path);
//     if (!uploadResult || !uploadResult.secure_url) {
//       console.log("File upload to Cloudinary failed");
//       return res.status(500).json({ message: "File upload failed." });
//     }

//     const fileUrl = uploadResult.secure_url; // Use Cloudinary URL
//     console.log("File URL:", fileUrl); // Log the Cloudinary file URL to verify

//     const isLate = Date.now() > assignment.dueDate;

//     // Update the assignment with the new submission
//     const updatedAssignment = await Assignment.findByIdAndUpdate(
//       assignmentId,
//       {
//         $push: {
//           submissions: {
//             student: studentId,
//             fileUrl, // Save the Cloudinary file URL
//             isLate,
//           },
//         },
//       },
//       { new: true }
//     );

//     console.log("Assignment submitted successfully");

//     // Respond with success message and the updated submissions
//     res.status(200).json({
//       message: "Assignment submitted successfully",
//       submission: updatedAssignment.submissions,
//     });
//   } catch (error) {
//     console.error("Error submitting assignment:", error);
//     res.status(500).json({ message: error.message });
//   }
// };
import { uploadFileToCloudinary } from "../utils/cloudinaryUtils.js";
import { updateAssignment } from "./assignment1Controller.js";
// // import Assignment from "../models/assignmentModel.js"; // Make sure your model is correctly imported
// // import User from "../models/userModel.js"; // Assuming you have a User model

// export const submitAssignment = async (req, res) => {
//   console.log("req.body:", req.body);
//   console.log("req.params:", req.params);
//   console.log("req.file:", req.file);

//   try {
//     const studentId = req.user.id;
//     const assignmentId = req.params.id;

//     // Find the student and validate their role
//     const student = await User.findById(studentId);
//     if (!student || student.role !== "student") {
//       return res
//         .status(403)
//         .json({ message: "Access denied. You are not a student." });
//     }

//     // Find the assignment
//     const assignment = await Assignment.findById(assignmentId);
//     if (!assignment) {
//       return res.status(404).json({ message: "Assignment not found." });
//     }

//     // Check if the student is assigned to this teacher
//     if (!student.assignedStudents.includes(assignment.teacher.toString())) {
//       return res
//         .status(403)
//         .json({ message: "You are not allowed to submit this assignment." });
//     }

//     // Check if a file was uploaded
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded." });
//     }

//     // Check if the student already submitted the assignment (to delete previous submission)
//     const previousSubmission = assignment.submissions.find(
//       (sub) => sub.student.toString() === studentId
//     );

//     if (previousSubmission) {
//       // Delete the existing file from Cloudinary
//       await deleteFileFromCloudinary(previousSubmission.fileUrl);
//     }

//     // Upload the new file to Cloudinary
//     const fileUrl = req.file.path; // This should be the Cloudinary URL
//     const isLate = Date.now() > assignment.dueDate;

//     // Remove old submission
//     await Assignment.findByIdAndUpdate(assignmentId, {
//       $pull: { submissions: { student: studentId } }, // Remove old submission
//     });

//     // Add new submission
//     const updatedAssignment = await Assignment.findByIdAndUpdate(
//       assignmentId,
//       {
//         $push: {
//           submissions: {
//             student: studentId,
//             fileUrl,
//             isLate,
//           },
//         },
//       },
//       { new: true }
//     );

//     res.status(200).json({
//       message: "Assignment submitted successfully",
//       submission: updatedAssignment.submissions,
//     });
//   } catch (error) {
//     console.error("Error submitting assignment:", error);
//     res.status(500).json({ message: error.message });
//   }
// };
// import {
//   deleteFileFromCloudinary,
//   uploadFileToCloudinary,
// } from "../utils/cloudinaryUtils.js";
// import Assignment from "../models/assignmentModel.js";
// import User from "../models/userModel.js";
// import path from "path";

// Helper to extract public ID from Cloudinary URL
// const extractPublicIdFromUrl = (url) => {
//   const parts = url.split("/");
//   const fileWithExtension = parts[parts.length - 1]; // e.g., "fileName.pdf"
//   const fileName = fileWithExtension.split(".")[0]; // e.g., "fileName"
//   const publicId = parts.slice(-3, -1).concat(fileName).join("/"); // Extract public ID part
//   return publicId;
// };

// Function to extract the Cloudinary public ID from the file URL
// Function to extract the Cloudinary public ID from the file URL
// Function to extract the Cloudinary public ID from the file URL
// Function to extract the Cloudinary public ID from the file URL
// Function to extract the Cloudinary public ID from the file URL
// const extractPublicIdFromUrl = (fileUrl) => {
//   if (!fileUrl) {
//     console.error("Error: fileUrl is undefined or null.");
//     return null;
//   }

//   console.log("File URL received:", fileUrl);

//   try {
//     const urlParts = fileUrl.split("/");

//     if (urlParts.length  -1) {
//       console.error("Error: URL is not in the expected format.");
//       return null;
//     }

//     // Extract everything after 'upload/'
//     const uploadIndex = urlParts.indexOf("upload");
//     if (uploadIndex === -1) {
//       console.error("Error: 'upload' not found in URL.");
//       return null;
//     }

//     const publicId = urlParts
//       .slice(uploadIndex + 1)
//       .join("/")
//       .split(".")[0]; // Remove file extension
//     console.log("Extracted Public ID:", publicId);

//     return publicId;
//   } catch (error) {
//     console.error("Error extracting public ID:", error);
//     return null;
//   }
//  };
// const extractPublicIdFromUrl = (url) => {
//   // Remove the base URL part
//   const baseUrl = "https://res.cloudinary.com/dvfqp0z6x/image/upload/";
//   if (!url.startsWith(baseUrl)) {
//     throw new Error("URL does not match the expected base URL");
//   }

//   // Remove the base URL from the URL
//   const path = url.substring(baseUrl.length);

//   // Remove the file extension if any
//   const publicIdWithVersion = path.split("/").slice(1).join("/"); // Remove versioning part if any
//   const publicId = publicIdWithVersion.replace(
//     /\.(jpg|jpeg|png|gif|pdf|doc|docx|zip|mp4|mov|avi)$/i,
//     ""
//   );

//   return publicId;
// };
// const extractPublicIdFromUrl = (url) => {
//   const urlArray = url.split("/");
//   console.log(urlArray);
//   const file = urlArray[urlArray.length - 1];
//   console.log(file);
//   const fileName = file.split(".")[0];
//   console.log(fileName);
//   const publicId = "1726000158828-aws";
//   return publicId;
// };
// Test
// const url =
//   "https://res.cloudinary.com/dvfqp0z6x/image/upload/v1725994286/assignments/1725994283088-ID-260429.pdf";
// const publicId = extractPublicIdFromUrl(url);
// console.log("Extracted Public ID:", publicId);

export const submitAssignment = async (req, res) => {
  console.log("req.body:", req.body);
  console.log("req.params:", req.params);
  console.log("req.file:", req.file);

  try {
    const studentId = req.user?.id; // Use optional chaining to prevent undefined error
    const assignmentId = req.params?.id;

    console.log("Student ID:", studentId);
    console.log("Assignment ID:", assignmentId);

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      console.log("Student not found or role is not student");
      return res
        .status(403)
        .json({ message: "Access denied. You are not a student." });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      console.log("Assignment not found");
      return res.status(404).json({ message: "Assignment not found." });
    }

    if (!student.assignedStudents.includes(assignment.teacher.toString())) {
      console.log("Not allowed to submit this assignment");
      return res
        .status(403)
        .json({ message: "You are not allowed to submit this assignment." });
    }

    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({ message: "No file uploaded." });
    }
    // Upload the new file to Cloudinary
    const fileUrl = req.file.path;
    const isLate = Date.now() > assignment.dueDate;
    console.log(fileUrl, isLate);

    let updatedAssignment = await Assignment.findOneAndUpdate(
      {
        _id: assignmentId, // Find the assignment by ID
        "submissions.student": studentId, // Check if this student has already submitted
      },
      {
        // If student exists, update their submission
        $set: {
          "submissions.$.fileUrl": fileUrl, // Update the file URL
          "submissions.$.isLate": isLate, // Update the late status
          "submissions.$.submittedAt": Date.now(), // Update the submission time
        },
      },
      {
        new: true, // Return the updated document
        upsert: false, // Don't insert a new record if student hasn't submitted
      }
    );

    console.log(updatedAssignment);
    // If the student hasn't submitted before, push a new submission
    if (!updatedAssignment) {
      const newSubmission = {
        student: studentId,
        fileUrl: fileUrl,
        isLate: isLate,
        submittedAt: Date.now(),
      };

      updatedAssignment = await Assignment.findByIdAndUpdate(
        assignmentId,
        { $push: { submissions: newSubmission } }, // Push new submission to the array
        { new: true }
      );
      return res.status(200).json({
        message: "Assignment submitted successfully",
        submission: updatedAssignment.submissions,
      });
    }

    return res.status(200).json({
      message: "Assignment submission updated successfully",
      assignment: updatedAssignment,
    });
  } catch (error) {
    console.error("Error submitting assignment:", error);
    res.status(500).json({ message: error.message });
  }
};
/**
 * Handles assignment submission.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */

// export const submitAssignment = async (req, res) => {
//   console.log("req.body:", req.body);
//   console.log("req.params:", req.params);
//   console.log("req.file:", req.file);

//   try {
//     const studentId = req.user.id;
//     const assignmentId = req.params.id;

//     console.log("Student ID:", studentId);
//     console.log("Assignment ID:", assignmentId);

//     const student = await User.findById(studentId);
//     if (!student || student.role !== "student") {
//       return res
//         .status(403)
//         .json({ message: "Access denied. You are not a student." });
//     }

//     const assignment = await Assignment.findById(assignmentId);
//     if (!assignment) {
//       return res.status(404).json({ message: "Assignment not found." });
//     }

//     if (!student.assignedStudents.includes(assignment.teacher.toString())) {
//       return res
//         .status(403)
//         .json({ message: "You are not allowed to submit this assignment." });
//     }

//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded." });
//     }

//     const fileUrl = req.file.path;

//     // Find existing submission
//     let existingSubmission = assignment.submissions.find(
//       (sub) => sub.student.toString() === studentId
//     );

//     if (existingSubmission) {
//       // Update existing submission
//       existingSubmission.fileUrl = fileUrl;
//       existingSubmission.submittedAt = new Date();
//     } else {
//       // Add new submission
//       const isLate = Date.now() > assignment.dueDate;
//       assignment.submissions.push({
//         student: studentId,
//         fileUrl,
//         isLate,
//         submittedAt: new Date(),
//       });
//     }

//     // Save the updated assignment
//     await assignment.save();

//     // Respond with the updated submission
//     res.status(200).json({
//       message: "Assignment submitted successfully",
//       submission: existingSubmission || assignment.submissions.slice(-1)[0],
//     });
//   } catch (error) {
//     console.error("Error submitting assignment:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// export const submitAssignment = async (req, res) => {
//   console.log("req.body:", req.body);
//   console.log("req.params:", req.params);
//   console.log("req.file:", req.file);

//   try {
//     const studentId = req.user.id;
//     const assignmentId = req.params.id;

//     console.log("Student ID:", studentId);
//     console.log("Assignment ID:", assignmentId);

//     const student = await User.findById(studentId);
//     if (!student || student.role !== "student") {
//       return res
//         .status(403)
//         .json({ message: "Access denied. You are not a student." });
//     }

//     const assignment = await Assignment.findById(assignmentId);
//     if (!assignment) {
//       return res.status(404).json({ message: "Assignment not found." });
//     }

//     if (!student.assignedStudents.includes(assignment.teacher.toString())) {
//       return res
//         .status(403)
//         .json({ message: "You are not allowed to submit this assignment." });
//     }

//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded." });
//     }

//     const fileUrl = req.file.path;
//     const fileId = req.file.filename; // assuming filename is unique in Cloudinary

//     const existingSubmission = assignment.submissions.find(
//       (sub) => sub.student.toString() === studentId
//     );

//     if (existingSubmission) {
//       // Replace existing submission
//       existingSubmission.fileUrl = fileUrl;
//       existingSubmission.submittedAt = new Date();
//     } else {
//       // New submission
//       const isLate = Date.now() > assignment.dueDate;
//       assignment.submissions.push({
//         student: studentId,
//         fileUrl,
//         isLate,
//         submittedAt: new Date(),
//       });
//     }

//     await assignment.save();

//     res.status(200).json({
//       message: "Assignment submitted successfully",
//       submission: existingSubmission || assignment.submissions.slice(-1)[0],
//     });
//   } catch (error) {
//     console.error("Error submitting assignment:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// export const submitAssignment = async (req, res) => {
//   console.log("req.body:", req.body);
//   console.log("req.params:", req.params);
//   console.log("req.file:", req.file);

//   try {
//     const studentId = req.user.id;
//     const assignmentId = req.params.id;

//     const student = await User.findById(studentId);
//     if (!student || student.role !== "student") {
//       return res
//         .status(403)
//         .json({ message: "Access denied. You are not a student." });
//     }

//     const assignment = await Assignment.findById(assignmentId);
//     if (!assignment) {
//       return res.status(404).json({ message: "Assignment not found." });
//     }

//     if (!student.assignedStudents.includes(assignment.teacher.toString())) {
//       return res
//         .status(403)
//         .json({ message: "You are not allowed to submit this assignment." });
//     }

//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded." });
//     }

//     // Check if the student already submitted the assignment (to delete previous submission)
//     const previousSubmission = assignment.submissions.find(
//       (sub) => sub.student.toString() === studentId
//     );

//     if (previousSubmission) {
//       // Extract public ID from previous submission file URL
//       const publicId = extractPublicIdFromUrl(previousSubmission.fileUrl);
//       console.log("Public ID to delete:", publicId);

//       // Delete the existing file from Cloudinary
//       await deleteFileFromCloudinary(publicId);
//     }

//     // Upload the new file to Cloudinary
//     const fileUrl = req.file.path; // Cloudinary URL should be here
//     const isLate = Date.now() > assignment.dueDate;

//     // Remove old submission
//     await Assignment.findByIdAndUpdate(assignmentId, {
//       $pull: { submissions: { student: studentId } },
//     });

//     // Add new submission
//     const updatedAssignment = await Assignment.findByIdAndUpdate(
//       assignmentId,
//       {
//         $push: {
//           submissions: {
//             student: studentId,
//             fileUrl,
//             isLate,
//           },
//         },
//       },
//       { new: true }
//     );

//     res.status(200).json({
//       message: "Assignment submitted successfully",
//       submission: updatedAssignment.submissions,
//     });
//   } catch (error) {
//     console.error("Error submitting assignment:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// export const submitAssignment = async (req, res) => {
//   try {
//     const studentId = req.user.id; // Assuming studentId is coming from token (authenticated user)
//     const assignmentId = req.params.id;

//     // Ensure the user is a student
//     const student = await User.findById(studentId);
//     if (!student || student.role !== "student") {
//       return res
//         .status(403)
//         .json({ message: "Access denied. You are not a student." });
//     }

//     // Find the assignment
//     const assignment = await Assignment.findById(assignmentId);
//     if (!assignment) {
//       return res.status(404).json({ message: "Assignment not found." });
//     }

//     // Check if the assignment's teacher is in the student's assignedTeachers array
//     if (!student.assignedTeachers.includes(assignment.teacher.toString())) {
//       return res
//         .status(403)
//         .json({ message: "You are not allowed to submit this assignment." });
//     }

//     // Check if a file is uploaded
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded." });
//     }

//     // Upload the file to Cloudinary
//     const result = await uploadFileToCloudinary(req.file.path, {
//       folder: "assignments",
//       resource_type: "auto",
//     });
//     const fileUrl = result.secure_url;

//     // Determine if the submission is late
//     const isLate = Date.now() > assignment.dueDate;

//     // Update the assignment with the new submission
//     const updatedAssignment = await Assignment.findByIdAndUpdate(
//       assignmentId,
//       {
//         $push: {
//           submissions: {
//             student: studentId,
//             fileUrl,
//             isLate,
//           },
//         },
//       },
//       { new: true }
//     );

//     res.status(200).json({
//       message: "Assignment submitted successfully",
//       submission: updatedAssignment.submissions,
//     });
//   } catch (error) {
//     console.error("Error during assignment submission:", error); // Log error for debugging
//     res.status(500).json({ message: error.message });
//   }
// };
