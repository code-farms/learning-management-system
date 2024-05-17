import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { v2 as cloudinary } from "cloudinary";
import { ApiResponse } from "../utils/apiResponse";
import ApiError from "../utils/apiError";
import { createCourse } from "../services/course.services";

const uploadCourse = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Destructure the course data from the request body
      const {
        data,
        data: { thumbnail },
      } = req.body;

      // Check if thumbnail is provided
      if (!thumbnail) {
        throw new ApiError(400, "Thumbnail is required");
      }

      // Upload thumbnail to cloudinary
      const uploadedThumbnail = await cloudinary.uploader.upload(thumbnail, {
        folder: "courses",
      });

      // Update the public_id and url in the thumbnail object
      data.thumbnail = {
        public_id: uploadedThumbnail.public_id,
        url: uploadedThumbnail.secure_url,
      };

      // Create the course with createCourse service
      createCourse(data, res, next);
    } catch (error: any) {
      res
        .status(error.statusCode)
        .json(new ApiResponse(500, false, error.message, null));
    }
  }
);

export { uploadCourse };
