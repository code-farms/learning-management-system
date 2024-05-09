import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/apiError";
import { User } from "../models/user.model";

interface RegisterUserInterface {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;

    /**
     * Checks if any of the given fields are empty or contain only whitespace characters.
     * If any field is empty or contains only whitespace characters, throws an ApiError with status code 400 and a corresponding error message.
     */
    if ([name, email, password].some((fields) => fields?.trim() === "")) {
      throw new ApiError(400, "Please fill all fields");
    }

    const isUserExists = await User.findOne({ email });

    if (isUserExists) {
      throw new ApiError(409, "User already exists");
    }

    const avatarLocalPath = (
      req.files as { [fieldname: string]: Express.Multer.File[] }
    )?.avatar?.[0]?.path;

    const user = await User.create({ name, email, password });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while creating a new user");
    }
  }
);
