import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import Course from "../models/course.model";

const createCourse = asyncHandler(
  async (data: any, res: Response, next: NextFunction) => {
    try {
      // Create course and save it to the database
      const course = await Course.create(data);

      // Return a success response with the created course
      res
        .status(201)
        .json(
          new ApiResponse(201, true, "New course created successfully.", course)
        );
    } catch (error: any) {
      res.status(500).json(new ApiResponse(500, false, error.message, null));
    }
  }
);

export { createCourse };
