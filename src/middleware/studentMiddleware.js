import jwt from "jsonwebtoken";
import User from "../models/usersSchema.js"; // Assuming this is your user model

const studentMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);

    // Find the user by ID
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Check if the user role is 'student'
    if (user.role !== "student") {
      return res.status(403).json({ error: "Access denied: Students only" });
    }

    // Attach the user to the request object for future use
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

export default studentMiddleware;
