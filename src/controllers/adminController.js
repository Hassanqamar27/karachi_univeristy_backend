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
    newTeacher.assignedStudents = students.map((student) => student._id);

    // Save the updated teacher with assigned students
    await newTeacher.save();

    res
      .status(201)
      .json({
        message: "Teacher created and students assigned successfully",
        teacher: newTeacher,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};
