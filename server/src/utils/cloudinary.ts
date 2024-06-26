import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file to Cloudinary.
 * @param {string} localFilePath - The local file path of the file to be uploaded.
 * @returns {Promise<object|null>} - A promise that resolves to the Cloudinary response object if the upload is successful, or null if the upload fails.
 */
const uploadOnCloudinary = async (localFilePath: string) => {
  try {
    // Return null if the local file path is not provided
    if (!localFilePath) {
      return null;
    }

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("File has uploaded successfully");

    // Remove the file from the locally saved file as the upload operation is successful
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // Remove the file from the locally saved file as the upload operation failed
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };
