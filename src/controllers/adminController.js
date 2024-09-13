import User from "../models/usersSchema.js";
import bcrypt from "bcryptjs";

// Admin creates a teacher and assigns students
export const createTeacherAndAssignStudents = async (req, res) => {
  try {
    const { name, email, password, course, timing } = req.body;

    // Validate input
    if (!name || !email || !password || !course || !timing) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the teacher already exists
    const teacherExist = await User.findOne({ email });
    if (teacherExist) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the teacher
    const newTeacher = new User({
      name,
      email,
      password: hashedPassword,
      role: "teacher",
      course,
      timing,
    });

    // Save the teacher
    await newTeacher.save();

    // Find students matching the course and timing
    const students = await User.find({
      role: "student",
      course,
      timing,
    });

    // Assign the students to the teacher
    // newTeacher.assignedStudents = students.map((student) => student._id);

    // // Save the updated teacher with assigned students
    // await newTeacher.save();
    if (students.length > 0) {
      // Assign the teacher ID to all matched students using updateMany
      await User.updateMany(
        { role: "student", course, timing }, // Filter for matching students
        { $set: { assignedStudents: newTeacher._id } } // Update with teacher ID
      );

      // Also, assign the students to the teacher's assignedStudents array
      newTeacher.assignedStudents = students.map((student) => student._id);
      await newTeacher.save(); // Save the updated teacher
    }
    res.status(201).json({
      message: "Teacher created and students assigned successfully",
      teacher: newTeacher,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// Teacher display
export const getAllTeachers = async (req, res) => {
  try {
    // Find all users with the role "teacher" and populate assignedStudents with only name and email
    const teachers = await User.find({ role: "teacher" }).populate({
      path: "assignedStudents",
      select: "name email", // Select only the name and email fields of the students
    });

    // Check if there are teachers
    if (teachers.length === 0) {
      return res.status(404).json({ message: "No teachers found" });
    }

    res.status(200).json({ teachers });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// Get all teachers
// export const getAllTeachers = async (req, res) => {
//   try {
//     // Find all users with the role "teacher"
//     const teachers = await User.find({ role: "teacher" });

//     // Check if there are teachers
//     if (teachers.length === 0) {
//       return res.status(404).json({ message: "No teachers found" });
//     }

//     res.status(200).json({ teachers });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Something went wrong", error: error.message });
//   }
// };
// Delete teacher by ID in auth token using local storage
export const deleteTeacherById = async (req, res) => {
  try {
    const teacherId = req.params.id;

    // Find and delete teacher by ID
    const teacher = await User.findByIdAndDelete(teacherId);

    // Check if teacher exists
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Optionally, you might want to remove the teacher from any assigned students
    await User.updateMany(
      { _id: { $in: teacher.assignedStudents } },
      { $pull: { assignedTeachers: teacherId } }
    );

    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};
