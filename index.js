import mongoose from "mongoose";
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

app.use(express.json());
app.use("/api", router);

(async () => {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose
      .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => console.log("MongoDB connected!"))
      .catch((error) => console.log("err mongodb", error.message));

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
