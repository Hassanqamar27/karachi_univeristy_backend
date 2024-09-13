import Assignment from "../models/assignmentschema.js";
import User from "../models/usersSchema.js";

// Create Assignment
export const createNewAssignment = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    const teacherId = req.user.id; // Assuming teacherId is coming from token (authenticated user)

    // Ensure teacher is creating the assignment
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Access denied. You are not a teacher." });
    }

    // Create new assignment
    const newAssignment = new Assignment({
      title,
      description,
      dueDate,
      teacher: teacherId,
      submissions: [],
    });

    // Save assignment to DB
    await newAssignment.save();

    res.status(201).json({
      message: "Assignment created successfully",
      assignment: newAssignment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get Assignments for a specific teacher
export const getTeacherAssignments = async (req, res) => {
  try {
    const teacherId = req.user.id; // Assuming teacherId is coming from token (authenticated user)

    // Ensure user is a teacher
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Access denied. You are not a teacher." });
    }

    // Find assignments by teacher ID
    const assignments = await Assignment.find({ teacher: teacherId }).populate(
      "submissions.student",
      "name email"
    );

    res.status(200).json({ assignments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Update a specific assignment
export const updatingAssignment = async (req, res) => {
  try {
    const teacherId = req.user.id; // Assuming teacherId is coming from token (authenticated user)
    const { title, description, dueDate } = req.body;
    const assignmentId = req.params.id;

    // Ensure user is a teacher
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Access denied. You are not a teacher." });
    }

    // Find the assignment and check if it belongs to the teacher
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      teacher: teacherId,
    });
    if (!assignment) {
      return res
        .status(404)
        .json({ message: "Assignment not found or not authorized." });
    }

    // Update assignment fields
    if (title) assignment.title = title;
    if (description) assignment.description = description;
    if (dueDate) {
      if (new Date(dueDate) <= new Date()) {
        return res
          .status(400)
          .json({ message: "Due date must be in the future." });
      }
      assignment.dueDate = dueDate;
    }

    // Save updated assignment to the database
    await assignment.save();

    res
      .status(200)
      .json({ message: "Assignment updated successfully", assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Delete an assignment
export const deleteAssignment = async (req, res) => {
  try {
    const teacherId = req.user.id; // Assuming teacherId is coming from token (authenticated user)
    const assignmentId = req.params.id;
    // sala bc na apni g marwadi is kam na bhadwa na din kha lia pora
    // console.log("Teacher ID from token:", teacherId);
    // console.log("Assignment ID from request:", assignmentId);

    // Ensure user is a teacher
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Access denied. You are not a teacher." });
    }

    // Find the assignment and check if it belongs to the teacher
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      teacher: teacherId,
    });
    if (!assignment) {
      return res
        .status(404)
        .json({ message: "Assignment not found or not authorized." });
    }

    // Delete the assignment
    await Assignment.deleteOne({ _id: assignmentId });

    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get all submissions for a specific assignment (teacher only)
export const getAssignmentSubmissions = async (req, res) => {
  try {
    const teacherId = req.user.id; // Assuming teacherId is coming from token
    const assignmentId = req.params.id;

    // Find the assignment and ensure it's assigned to the authenticated teacher
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      teacher: teacherId,
    }).populate("submissions.student", "name email");
    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found or you are not authorized to view this.",
      });
    }

    // Return the submissions for the assignment
    res.status(200).json({ submissions: assignment.submissions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Grade a student's submission for a specific assignment
// export const gradeSubmission = async (req, res) => {
//   try {
//     const teacherId = req.user.id; // Assuming teacherId is coming from token
//     const { assignmentId, studentId, grade } = req.body; // assignmentId, studentId, and grade are passed in the request body

//     // Find the assignment and ensure it's assigned to the authenticated teacher
//     const assignment = await Assignment.findOne({
//       _id: assignmentId,
//       teacher: teacherId,
//     });
//     if (!assignment) {
//       return res.status(404).json({
//         message:
//           "Assignment not found or you are not authorized to grade this.",
//       });
//     }

//     // Check if the submission exists for the student
//     const submission = assignment.submissions.find((sub) =>
//       sub.student.equals(studentId)
//     );
//     if (!submission) {
//       return res
//         .status(404)
//         .json({ message: "Submission not found for the specified student." });
//     }

//     // Assign the grade (and optionally update submission time if needed)
//     submission.grade = grade;

//     // Save the assignment with the updated grade
//     await assignment.save();

//     res
//       .status(200)
//       .json({ message: "Grade assigned successfully.", submission });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };// In your backend
export const gradeSubmission = async (req, res) => {
  const teacherId = req.user.id;
  const submissionId = req.params.id;
  const { grade } = req.body;
  console.log(grade, submissionId);

  try {
    const submission = await Assignment.findOneAndUpdate(
      {
        // _id: assignmentId,
        "submissions._id": submissionId,
      },
      {
        $set: { "submissions.$.grade": grade },
      },
      { new: true } // Option to return the modified document
    );
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }
    res.json({ message: "Grade assigned successfully", submission });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// export const gradeSubmission = async (req, res) => {
//   try {
//     const teacherId = req.user.id;
//     const assignmentId = req.params.id; // Assuming teacherId is coming from token

//     const { studentId, grade } = req.body; // assignmentId, studentId, and grade are passed in the request body
//     console.log(assignmentId, studentId, grade);
//     // Find the assignment and ensure it's assigned to the authenticated teacher
//     const assignment = await Assignment.findOne({
//       _id: assignmentId,
//       teacher: teacherId,
//     });

//     if (!assignment) {
//       return res.status(404).json({
//         message:
//           "Assignment not found or you are not authorized to grade this.",
//       });
//     }

//     // Find the submission for the specified student
//     const submission = await Assignment.findOneAndUpdate(
//       {
//         _id: assignmentId,
//         "submissions.student": studentId,
//       },
//       {
//         $set: { "submissions.$.grade": grade },
//       },
//       { new: true } // Option to return the modified document
//     );

//     if (!submission) {
//       return res
//         .status(404)
//         .json({ message: "Submission not found for the specified student." });
//     }

//     res
//       .status(200)
//       .json({ message: "Grade assigned successfully.", submission });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// export const createOrUpdateAssignment = async (req, res) => {
//   try {
//     const { assignmentId, title, description, dueDate, teacherId } = req.body;

//     // Validate the teacher
//     const teacher = await User.findById(teacherId);
//     if (!teacher || teacher.role !== "teacher") {
//       return res.status(404).json({ error: "Teacher not found" });
//     }

//     if (assignmentId) {
//       // Update an existing assignment
//       const assignment = await Assignment.findById(assignmentId);
//       if (!assignment) {
//         return res.status(404).json({ error: "Assignment not found" });
//       }

//       // Ensure that the teacher updating the assignment is the same as the one who created it
//       if (assignment.teacher.toString() !== teacher._id.toString()) {
//         return res
//           .status(403)
//           .json({ error: "Unauthorized to update this assignment" });
//       }

//       assignment.title = title || assignment.title;
//       assignment.description = description || assignment.description;
//       assignment.dueDate = dueDate || assignment.dueDate;

//       await assignment.save();
//       res
//         .status(200)
//         .json({ message: "Assignment updated successfully", assignment });
//     } else {
//       // Create a new assignment
//       const assignment = new Assignment({
//         title,
//         description,
//         dueDate,
//         teacher: teacher._id,
//       });

//       await assignment.save();
//       res
//         .status(201)
//         .json({ message: "Assignment created successfully", assignment });
//     }
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// export const deleteAssignment = async (req, res) => {
//   try {
//     const { assignmentId } = req.body;

//     const assignment = await Assignment.findById(assignmentId);
//     if (!assignment) {
//       return res.status(404).json({ error: "Assignment not found" });
//     }

//     // Ensure that the teacher deleting the assignment is the one who created it
//     if (assignment.teacher.toString() !== req.user._id.toString()) {
//       return res
//         .status(403)
//         .json({ error: "Unauthorized to delete this assignment" });
//     }

//     await Assignment.findByIdAndDelete(assignmentId);
//     res.status(200).json({ message: "Assignment deleted successfully" });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// export const submitOrUpdateAssignment = async (req, res) => {
//   try {
//     const { assignmentId } = req.body;
//     const fileUrl = req.file.path;
//     const studentId = req.user._id; // Assuming student's ID is in the token

//     const assignment = await Assignment.findById(assignmentId).populate(
//       "teacher"
//     );

//     if (!assignment) {
//       return res.status(404).json({ error: "Assignment not found" });
//     }

//     // Check if the student is assigned to this teacher
//     if (!assignment.teacher.assignedStudents.includes(studentId)) {
//       return res
//         .status(403)
//         .json({ error: "You are not assigned to this teacher's class" });
//     }

//     const existingSubmission = assignment.submissions.find(
//       (sub) => sub.student.toString() === studentId
//     );

//     if (existingSubmission) {
//       // Update existing submission
//       existingSubmission.fileUrl = fileUrl;
//       existingSubmission.submittedAt = new Date();
//       existingSubmission.isLate = new Date() > new Date(assignment.dueDate);
//     } else {
//       // Create a new submission
//       assignment.submissions.push({
//         student: studentId,
//         fileUrl,
//         submittedAt: new Date(),
//         isLate: new Date() > new Date(assignment.dueDate),
//       });
//     }

//     await assignment.save();
//     res
//       .status(200)
//       .json({ message: "Assignment submitted/updated successfully" });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };
