import jwt from "jsonwebtoken";
import User from "../models/usersSchema.js"; // Import your unified user schema

const teacherMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);

    // Find the user by ID (could be admin, teacher, or student)
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Attach the user to the request object
    req.user = user;

    // Role-based authorization check for "teacher"
    if (user.role !== "teacher") {
      return res.status(403).json({ error: "Access denied: Teachers only" });
    }

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

export default teacherMiddleware;
