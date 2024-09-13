import Assignment from "../models/assignmentschema.js";
import User from "../models/usersSchema.js";

// Fetch all assignments
export const fetchAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find();
    res.status(200).json(assignments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Create a new assignment
export const createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, teacherId } = req.body;

    // Validate the teacher
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ error: "Teacher not found" });
    }

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
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update an existing assignment
export const updateAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, teacherId } = req.body;
    const { assignmentId } = req.params; // Get assignmentId from params

    // Validate the teacher
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ error: "Teacher not found" });
    }

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

    // Update assignment fields if provided
    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;
    assignment.dueDate = dueDate || assignment.dueDate;

    await assignment.save();
    res
      .status(200)
      .json({ message: "Assignment updated successfully", assignment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an assignment
export const deletedAssignment = async (req, res) => {
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
// ya file bakwas ha is ko bat ma delete kerna ha q k sari logic local storage ka hisab sa nhi thi
