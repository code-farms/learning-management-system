import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/apiError";
import { User, UserInterface } from "../models/user.model";
import jwt, { Secret } from "jsonwebtoken";
import { ApiResponse } from "../utils/apiResponse";
import { sendToken } from "../utils/jwt";

interface RegisterUserInterface {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

interface ActivationTokenInterface {
  token: string;
  activationCode: string;
}

interface ActivationRequestInterface {
  activation_token: string;
  activation_code: string;
}

interface LoginInterface {
  email: string;
  password: string;
}

/**
 * Creates an activation token for a registered user.
 * @param user - The user object to be included in the token.
 * @returns An object containing the token and activation-code/OTP.
 */
const createActivationToken = (
  user: RegisterUserInterface
): ActivationTokenInterface => {
  // Generate a random activation code/OTP.
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

  // Create an activation token with the user and activation-code/OTP.
  const token = jwt.sign(
    { user, activationCode },
    process.env.ACTIVATION_SECRET as Secret,
    {
      expiresIn: "5m",
    }
  );

  // Return the token and activation-code/OTP.
  return { token, activationCode };
};

// Ueser Registration Controller

const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;

    // Check whether all fields are filled or not.
    if ([name, email, password].some((fields) => fields?.trim() === "")) {
      throw new ApiError(400, "Please fill all fields");
    }

    // Check whether user is already registered or not.
    const isUserExists = await User.findOne({ email });

    // If user is already registered then throw error.
    if (isUserExists) {
      throw new ApiError(409, `User with email ${email} already exists`);
    }

    // Create a new user in database.
    const createdUser = await User.create({ name, email, password });

    // Check whether user is created or not.
    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering a user");
    }

    // Send the response.
    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          true,
          `User has register successfully.`,
          createdUser
        )
      );
  }
);

const loginUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // Check whether all fields are filled or not.
    if ([email, password].some((fields) => fields?.trim() === "")) {
      throw new ApiError(400, "Please fill all fields");
    }

    // Check whether user is already registered or not.
    const user = await User.findOne({ email }).select("+password");
    console.log(user);

    // If user is not registered then throw error.
    if (!user) {
      throw new ApiError(409, `User with email ${email} does not exists`);
    }

    // Check whether password is correct or not.
    const isPasswordCorrect = await user.comparePassword(password);

    // If password is incorrect then throw error.
    if (!isPasswordCorrect) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Create a token for the user
    sendToken(user, res);
  }
);

export { registerUser, loginUser };
