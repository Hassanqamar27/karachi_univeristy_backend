// controllers/adminController.js
import userModel from "../models/userSchema.js";
import courseModel from "../models/courseSchema.js"; // Assuming you have a course schema
import bcrypt from "bcryptjs";

export const assignTeacherToStudent = async (req, res) => {
  try {
    const { studentId, teacherId, courseId } = req.body;

    const student = await userModel.findById(studentId);
    const teacher = await userModel.findById(teacherId);
    const course = await courseModel.findById(courseId);

    if (!student || !teacher || !course) {
      return res
        .status(404)
        .json({ message: "Student, Teacher, or Course not found" });
    }

    if (student.role !== "student" || teacher.role !== "teacher") {
      return res
        .status(400)
        .json({ message: "Invalid roles for student or teacher" });
    }

    student.course = courseId;
    teacher.students.push(studentId);

    await student.save();
    await teacher.save();

    res.json({ message: "Teacher assigned to student successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

export const registerTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        data: null,
        status: false,
        message: "Required fields are missing",
      });
    }

    const userExist = await userModel.findOne({ email: email });

    if (userExist) {
      return res.status(400).json({
        data: null,
        message: "Email already exists",
        status: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const teacherCreated = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role: "teacher",
    });

    res.json({
      data: teacherCreated,
      message: "Teacher registered successfully",
      status: true,
    });
  } catch (err) {
    res.status(500).json("Something went wrong");
  }
};
