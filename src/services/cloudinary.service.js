import { v2 as cloudinary } from "cloudinary";
import cleanupTempFile from "../utils/cleanupTempFile.js";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// File upload
export const cloudinaryUpload = async (filePath) => {
  try {
    if (!filePath) return null;

    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    cleanupTempFile(filePath);
    return response;
  } catch (error) {
    cleanupTempFile(filePath);
    return null;
  }
};

export const cloudinaryFileDelete = async (id) => {
  try {
    if (!id) {
      return null;
    }

    const response = await cloudinary.uploader.destroy(id);
    console.log("Cloudinary file deleted:", response);
    return response;
  } catch (error) {
    console.error("Error deleting cloudinary file:", error);
    return null;
  }
};
