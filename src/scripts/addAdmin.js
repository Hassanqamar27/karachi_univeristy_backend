// scripts/addAdmin.js
// to run this file node src/scripts/addAdmin.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import usersSchema from "../models/usersSchema.js";
import "dotenv/config";

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const existingAdmin = await usersSchema.findOne({
      email: process.env.ADMIN_EMAIL,
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    const newAdmin = new usersSchema({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
    });

    await newAdmin.save();
    console.log("Admin created successfully");
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    mongoose.connection.close();
  }
};

run();
