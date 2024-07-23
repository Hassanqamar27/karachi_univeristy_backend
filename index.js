import mongoose from "mongoose";
// import { DB_NAME } from "./src/utils/constants.js";
import express from "express";
import dotenv from "dotenv";
import studentRoutes from "./src/routes/studentRoutes.js";
import teacherRoutes from "./src/routes/teacherRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import assignmentRoutes from "./src/routes/assignmentRoutes.js";
import router from "./src/routes/studentRoutes.js";
dotenv.config();
const app = express();

app.use(express.json());
app.use("/api/auth", router);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/assignments", assignmentRoutes);

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI); //(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", (error) => {
      console.log("error", error);
      throw error;
    });
    app.listen(process.env.PORT, () => {
      console.log(`app is listening on ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("error:", error);
    throw err;
  }
})();
// server.js
