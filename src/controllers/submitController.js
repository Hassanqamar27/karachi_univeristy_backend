// Import the Assignment model
import Assignment from "../models/assignmentschema.js";

// Fetch student assignments (submitted and non-submitted)
export const fetchStudentAssignments = async (req, res) => {
  try {
    const studentId = req.user._id; // Assuming req.user contains the logged-in student

    // Find all assignments for the student (submitted or not)
    const assignments = await Assignment.find({
      $or: [
        { "submissions.student": studentId }, // Find assignments the student has submitted
        { "submissions.student": { $ne: studentId } }, // Find assignments the student hasn't submitted
      ],
    }).populate("teacher", "name"); // Populate teacher details

    res.status(200).json({ assignments });
  } catch (error) {
    res.status(500).json({ error: "Error fetching assignments" });
  }
};

// Submit a new assignment
export const submitsAssignment = async (req, res) => {
  try {
    const { assignmentId, fileUrl } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Check if the student has already submitted
    const existingSubmission = assignment.submissions.find(
      (submission) => submission.student.toString() === req.user._id.toString()
    );

    if (existingSubmission) {
      return res
        .status(400)
        .json({ error: "You have already submitted this assignment" });
    }

    // Add the submission
    assignment.submissions.push({
      student: req.user._id,
      fileUrl,
      submittedAt: new Date(),
      isLate: assignment.dueDate < new Date(),
    });

    await assignment.save();
    res
      .status(200)
      .json({ message: "Assignment submitted successfully", assignment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update an existing submission
export const update1Assignment = async (req, res) => {
  try {
    const { assignmentId, fileUrl } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Check if the student has already submitted this assignment
    const submission = assignment.submissions.find(
      (submission) => submission.student.toString() === req.user._id.toString()
    );

    if (!submission) {
      return res
        .status(400)
        .json({ error: "No previous submission found for this assignment" });
    }

    // Update the submission details
    submission.fileUrl = fileUrl;
    submission.submittedAt = new Date();
    submission.isLate = assignment.dueDate < new Date();

    await assignment.save();
    res.status(200).json({
      message: "Assignment updated successfully",
      assignment,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
