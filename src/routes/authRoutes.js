// routes/authRoutes.js
import express from "express";
import {
  signupController,
  loginController,
  otpProcessApi,
  otpVerify,
  verifyController,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.post("/otp-process", otpProcessApi);
router.post("/otp-verify", otpVerify);
router.get("/verify", verifyController);

export default router;
