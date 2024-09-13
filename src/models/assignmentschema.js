// import mongoose from "mongoose";

// const assignmentSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//     },
//     description: {
//       type: String,
//     },
//     dueDate: {
//       type: Date,
//       required: true,
//     },
//     teacher: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User", // Referring to User schema
//       required: true,
//     },
//     submissions: [
//       {
//         student: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "User", // Referring to User schema
//           required: true,
//         },
//         fileUrl: { type: String, required: true },
//         grade: { type: Number, min: 0, max: 10 },
//         submittedAt: { type: Date, default: Date.now },
//         isLate: { type: Boolean, default: false },
//       },
//     ],
//   },
//   { timestamps: true }
// );

// const Assignment = mongoose.model("Assignment", assignmentSchema);
// export default Assignment;
import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    dueDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > Date.now();
        },
        message: "Due date must be in the future",
      },
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Referring to User schema
      required: true,
    },
    submissions: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Referring to User schema
          required: true,
        },
        fileUrl: {
          type: String,
          required: true,
        },
        grade: {
          type: String,
        },
        submittedAt: {
          type: Date,
          default: Date.now,
        },
        isLate: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);

// Indexing teacher field for faster queries
assignmentSchema.index({ teacher: 1 });

// Method to check if a submission is late
assignmentSchema.methods.checkIfLate = function (submittedAt) {
  return submittedAt > this.dueDate;
};

const Assignment = mongoose.model("Assignment", assignmentSchema);
export default Assignment;
