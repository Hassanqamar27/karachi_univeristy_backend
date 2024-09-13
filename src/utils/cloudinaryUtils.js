// cloudinaryUtils.js
import cloudinary from "../config/cloudinary.js"; // Adjust the path to your Cloudinary configuration

export const uploadFileToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath);
    console.log("Cloudinary upload result:", result);
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};
// export const deleteFileFromCloudinary = async (publicId) => {
//   try {
//     console.log(publicId);
//     const result = await cloudinary.uploader.destroy("1726001624755-aws", {
//       resource_type: "raw",
//     });
//     console.log("File deleted from Cloudinary:", result);
//   } catch (error) {
//     console.error("Error deleting file from Cloudinary:", error);
//     throw error;
//   }
// };
// export const deleteFileFromCloudinary = async (publicId) => {
//   try {
//     const result = await cloudinary.uploader.destroy(publicId, {
//       resource_type: "raw", // Specify 'raw' for non-image files
//     });
//     return result;
//   } catch (error) {
//     console.error("Error deleting file from Cloudinary:", error);
//     throw error;
//   }
// };

// import cloudinary from "../config/cloudinary.js";

// /**
//  * Uploads a file to Cloudinary.
//  * @param {string} filePath - The local file path to upload.
//  * @returns {Promise<object>} - The upload result containing file details.
//  */
// // export const uploadFileToCloudinary = async (filePath) => {
// //   try {
// //     const result = await cloudinary.uploader.upload(filePath, {
// //       folder: "assignments",
// //       resource_type: "auto", // Handles various file types
// //     });
// //     return result;
// //   } catch (error) {
// //     console.error("Error uploading file to Cloudinary:", error);
// //     throw error;
// //   }
// // };

// export const uploadFileToCloudinary = async (filePath) => {
//   try {
//     const result = await cloudinary.uploader.upload(filePath, {
//       folder: "assignments",
//       resource_type: "raw", // Use "raw" for non-image files
//       public_id: (req, file) => {
//         const filename = path.parse(file.originalname).name;
//         return `${Date.now()}-${filename}`;
//       },
//     });
//     return result;
//   } catch (error) {
//     console.error("Error uploading file to Cloudinary:", error);
//     throw error;
//   }
// };
// /**
//  * Deletes a file from Cloudinary.
//  * @param {string} publicId - The public ID of the file to delete.
//  * @returns {Promise<object>} - The deletion result.
//  */
// export const deleteFileFromCloudinary = async (publicId) => {
//   try {
//     const result = await cloudinary.uploader.destroy(publicId, {
//       resource_type: "raw", // Handles various file types
//     });
//     return result;
//   } catch (error) {
//     console.error("Error deleting file from Cloudinary:", error);
//     throw error;
//   }
// };
