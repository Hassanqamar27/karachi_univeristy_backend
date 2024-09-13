import mongoose from "mongoose";
import cors from "cors";
// import { DB_NAME } from "./src/utils/constants.js";
import express from "express";
import dotenv from "dotenv";
// import studentRoutes from "./src/routes/studentRoutes.js";
// import teacherRoutes from "./src/routes/teacherRoutes.js";
// import adminRoutes from "./src/routes/adminRoutes.js";
// import assignmentRoutes from "./src/routes/router.js";
import router from "./src/routes/router.js";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", router);
app.use(express.urlencoded({ extended: true }));

(async () => {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose
      .connect(uri)
      .then(() => console.log("MongoDB connected!"))
      .catch((error) => console.log("err mongodb", error.message));

    app.on("error", (error) => {
      console.log("error", error);
      throw error;
    });
    app.listen(process.env.PORT, () => {
      console.log(
        `Server side is running on http://www.localhost:${process.env.PORT}/`
      );
    });
  } catch (error) {
    console.error("error:", error);
    throw err;
  }
})();
// server.js
