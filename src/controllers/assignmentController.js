import Assignment from "../models/Assignment.js";
import User from "../models/usersSchema.js";

export const createOrUpdateAssignment = async (req, res) => {
  try {
    const { assignmentId, title, description, dueDate, teacherId } = req.body;

    // Validate the teacher
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ error: "Teacher not found" });
    }

    if (assignmentId) {
      // Update an existing assignment
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      // Ensure that the teacher updating the assignment is the same as the one who created it
      if (assignment.teacher.toString() !== teacher._id.toString()) {
        return res
          .status(403)
          .json({ error: "Unauthorized to update this assignment" });
      }

      assignment.title = title || assignment.title;
      assignment.description = description || assignment.description;
      assignment.dueDate = dueDate || assignment.dueDate;

      await assignment.save();
      res
        .status(200)
        .json({ message: "Assignment updated successfully", assignment });
    } else {
      // Create a new assignment
      const assignment = new Assignment({
        title,
        description,
        dueDate,
        teacher: teacher._id,
      });

      await assignment.save();
      res
        .status(201)
        .json({ message: "Assignment created successfully", assignment });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
import Assignment from "../models/Assignment.js";

export const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Ensure that the teacher deleting the assignment is the one who created it
    if (assignment.teacher.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this assignment" });
    }

    await Assignment.findByIdAndDelete(assignmentId);
    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
import Assignment from "../models/Assignment.js";

export const submitOrUpdateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.body;
    const fileUrl = req.file.path;
    const studentId = req.user._id; // Assuming student's ID is in the token

    const assignment = await Assignment.findById(assignmentId).populate(
      "teacher"
    );

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Check if the student is assigned to this teacher
    if (!assignment.teacher.assignedStudents.includes(studentId)) {
      return res
        .status(403)
        .json({ error: "You are not assigned to this teacher's class" });
    }

    const existingSubmission = assignment.submissions.find(
      (sub) => sub.student.toString() === studentId
    );

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.fileUrl = fileUrl;
      existingSubmission.submittedAt = new Date();
      existingSubmission.isLate = new Date() > new Date(assignment.dueDate);
    } else {
      // Create a new submission
      assignment.submissions.push({
        student: studentId,
        fileUrl,
        submittedAt: new Date(),
        isLate: new Date() > new Date(assignment.dueDate),
      });
    }

    await assignment.save();
    res
      .status(200)
      .json({ message: "Assignment submitted/updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
