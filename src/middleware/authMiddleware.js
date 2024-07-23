// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import Admin from "../models/adminSchema.js";

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

export default authMiddleware;
