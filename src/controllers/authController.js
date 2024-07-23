// controllers/authController.js
import otpModel from "../models/otpSchema.js";
import userModel from "../models/userSchema.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import "dotenv/config";
import { EmailVerificationHtml } from "../template/index.js";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.TOKEN_KEY, {
    expiresIn: "5h",
  });
};

export const otpProcess = async (userId, email) => {
  await otpModel.findOneAndDelete({ userId: email });
  const generatedOtp = crypto.randomInt(100000, 999999).toString();
  await otpModel.create({ otp: generatedOtp, userId: email });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  return transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "Email Verification",
    html: EmailVerificationHtml(generatedOtp),
  });
};

export const otpProcessApi = async (req, res) => {
  const email = req.body?.id;
  await otpModel.findOneAndDelete({ userId: email });
  const generatedOtp = crypto.randomInt(100000, 999999).toString();
  await otpModel.create({ otp: generatedOtp, userId: email });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  transporter.sendMail({
    from: process.env.EMAIL,
    to: req.body.email,
    subject: "Email Verification",
    html: EmailVerificationHtml(generatedOtp),
  });

  res.json("resend successful");
};

export const signupController = async (req, res) => {
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

    const userCreated = await userModel.create({
      name,
      email,
      password,
      role: "student",
    });

    await otpProcess(userCreated._id, email);

    res.json({
      data: null,
      message: "User created. OTP sent to email.",
      status: true,
    });
  } catch (err) {
    res.status(500).json("Something went wrong");
  }
};

export const otpVerify = async (req, res) => {
  const { id, otp } = req.body;
  if (!id || !otp) {
    return res.status(400).json("Required fields are missing");
  }

  const getOtp = await otpModel.findOne({ userId: id });
  if (!getOtp) {
    return res.status(400).json({
      data: null,
      message: "OTP not found",
      status: false,
    });
  }

  if (getOtp.otp !== otp) {
    return res.json({
      data: null,
      message: "Wrong OTP code entered",
      status: false,
    });
  }

  getOtp.verified = true;
  await getOtp.save();

  res.json({
    data: getOtp,
    message: "OTP verified successfully",
    status: true,
  });
};

export const loginController = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      data: null,
      status: false,
      message: "Required fields are missing",
    });
  }

  const userExist = await userModel.findOne({ email: email });

  if (!userExist) {
    return res.status(400).json({
      data: null,
      status: false,
      message: "Email does not exist",
    });
  }

  if (userExist.password !== password) {
    return res.status(400).json({
      data: null,
      status: false,
      message: "Password incorrect",
    });
  }

  const token = generateToken(userExist._id, userExist.role);

  res.json({
    data: userExist,
    token,
    status: true,
  });
};

export const verifyController = async (req, res) => {
  res.json("User verified");
};
