import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/apiError";
import { User, UserInterface } from "../models/user.model";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { ApiResponse } from "../utils/apiResponse";
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "../utils/jwt";
import { redis } from "../db/redis";
import { getUserById } from "./../services/user.services";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { v2 as cloudinary } from "cloudinary";

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

interface SocialAuthBodyInterface {
  name: string;
  email: string;
  avatar: string;
}

interface UpdatePasswordInterface {
  oldPassword: string;
  newPassword: string;
}

interface UpdateProfilePictureInterface {
  avatar: string;
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

// User Login Controller
const loginUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // Check whether all fields are filled or not.
    if ([email, password].some((fields) => fields?.trim() === "")) {
      throw new ApiError(400, "Please fill all fields");
    }

    // Check whether user is already registered or not.
    const user = await User.findOne({ email }).select("+password");

    // If user is not registered then throw error.
    if (!user) {
      throw new ApiError(409, `User with email ${email} does not exists`);
    }

    // Check whether password is correct or not.
    const isPasswordCorrect = await user.comparePassword(password);
    console.log(isPasswordCorrect);

    // If password is incorrect then throw error.
    if (!isPasswordCorrect) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Create a token for the user
    sendToken(user, res);
  }
);

// User Logout Controller
const logoutUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.cookie("accessToken", "", {
      maxAge: 1,
      httpOnly: true,
    });
    res.cookie("refreshToken", "", {
      maxAge: 1,
      httpOnly: true,
    });

    // Delete user from redis
    await redis.del(req.user?._id.toString());

    // Send the res
    res
      .status(200)
      .json(new ApiResponse(201, true, "Logged out successfully", null));
  }
);

// Update access token
const updateAccessAndRefreshToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get refresh token from cookies.
    const refresh_token = req.cookies.refreshToken;

    // Check if refresh token exists.
    if (!refresh_token) {
      throw new ApiError(401, "Please login.");
    }

    // Decode the data from jwt token.
    const decodedData = jwt.verify(
      refresh_token,
      process.env.REFRESH_TOKEN_SECRET!
    ) as JwtPayload;

    // Check if refresh token is valid.
    if (!decodedData) {
      throw new ApiError(401, "Unauthorized");
    }

    // Get user from redis
    const session = await redis.get(decodedData._id);

    // Check if session exists.
    if (!session) {
      throw new ApiError(401, "Could not refresh token.");
    }

    const user = JSON.parse(session);

    // Generate access token
    const accessToken = jwt.sign(
      { _id: user._id },
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
    );
    // Generate refresh token
    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.REFRESH_TOKEN_SECRET!,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      }
    );

    // Find the user in database.
    const foundUser = await User.findByIdAndUpdate(
      decodedData._id,
      { $set: { refreshToken } },
      { new: true }
    ).select("-password");

    // Check if user exists in the database with decoded user _id.
    if (!foundUser) {
      throw new ApiError(404, "User not found");
    }

    // Set user data object in the req object.
    req.user = foundUser;

    // Update user in the redis session
    await redis.set(foundUser._id, JSON.stringify(foundUser));

    // Set refresh token and access token in cookies.
    res.cookie("accessToken", accessToken, accessTokenOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenOptions);

    // Send the response
    return res.json(
      new ApiResponse(200, true, "Access token updated successfully.", {
        accessToken,
        refreshToken,
      })
    );
  }
);

// Get user info
const getUserInfo = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get user id from request.
      const userId = req.user?._id;

      // Call getUserById function and get user info from database.
      const user = await getUserById(userId);

      // Send the response
      return res.json(new ApiResponse(201, true, "User info got.", user));
    } catch (error: any) {
      return res.json(new ApiResponse(500, false, error.message, null));
    }
  }
);

// Social Authentication
const socialAuth = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get user info from request body.
      const { email, name, avatar } = req.body as SocialAuthBodyInterface;

      // Check whether user is already registered or not.
      const user = await User.findOne({ email });

      // If user is not registered then create a new user and token.
      if (!user) {
        const newUser = await User.create({
          name,
          email,
          avatar,
        });
        sendToken(newUser, res);
      } else {
        // If user is already registered then login the user and create token.
        sendToken(user, res);
      }
    } catch (error: any) {
      return res.json(new ApiResponse(500, false, error.message, null));
    }
  }
);

// Update user's info
const updateUserInfo = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get user id from request.
      const userId = req.user?._id;

      // Check if user id exists.
      if (!userId) {
        throw new ApiError(401, "Unauthorized");
      }

      // Get user info from request body.
      const { name, avatar } = req.body;

      // Find the user in database.
      const foundUser = await User.findByIdAndUpdate(
        userId,
        { $set: { name, avatar } },
        { new: true }
      );

      await redis.set(userId, JSON.stringify(foundUser));

      // Send the response
      return res.json(
        new ApiResponse(201, true, "User info updated successfully.", foundUser)
      );
    } catch (error: any) {
      return res.json(new ApiResponse(500, false, error.message, null));
    }
  }
);

// Update user's password 🔥🔥 Need to check.
// Password is updating but unable to login with new password.
const updatePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get user id from request.
      const userId = req.user?._id;
      const email = req.user?.email;

      // Get user info from request body.
      const { oldPassword, newPassword } = req.body as UpdatePasswordInterface;
      console.log(oldPassword, newPassword);

      // Check if user id exists.
      if (!userId) {
        throw new ApiError(401, "Unauthorized request.");
      }

      // Check whether all fields are filled or not.
      if ([oldPassword, newPassword].some((fields) => fields?.trim() === "")) {
        throw new ApiError(400, "Please fill all fields");
      }

      // Find the user in database.
      const foundUser = await User.findOne({ email }).select("+password");

      // Check if user exists in the database with decoded user _id.
      if (!foundUser) {
        throw new ApiError(404, "User not found");
      }

      // Compare old password with saves password in database
      const isPasswordCorrect = await foundUser?.comparePassword(oldPassword);
      console.log("isPasswordCorrect", isPasswordCorrect);

      // If password is incorrect then throw error.
      if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid old password.");
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { password: newPassword } },
        { new: true }
      );
      console.log("inside update password function", user);

      // If user is not registered then throw error.
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      // Update user in the redis session
      await redis.set(userId, JSON.stringify(user));

      // Set user data object in the req object.
      req.user = user;

      // Send the response
      return res
        .status(200)
        .json(
          new ApiResponse(200, true, "Password updated successfully.", user)
        );
    } catch (error: any) {
      return res
        .status(500)
        .json(new ApiResponse(500, false, error.message, null));
    }
  }
);

// Update user's profile picture 🔥🔥 Need to check.
// Image is uploading on local server but not getting local path from req.file.path
const updateProfilePicture = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract the files from the request
      const avatarLocalPath = req.file?.path;
      const user = req.user;
      console.log(req.file);

      // If avatarLocalPath is empty then throw error.
      if (!avatarLocalPath) {
        throw new ApiError(400, "Please upload a profile picture.");
      }

      // If user has a previous avatar then delete it from cloudinary.
      if (user?.avatar.public_id) {
        await cloudinary.uploader.destroy(user?.avatar.public_id);
      }

      // Upload the avatar file to the cloudinary
      const avatar = await uploadOnCloudinary(avatarLocalPath);

      // If avatar is empty then throw error.
      if (!avatar?.url) {
        throw new ApiError(400, "Error while uploading on avatar.");
      }

      // Find the user and update the avarar in database.
      const foundUser = await User.findByIdAndUpdate(
        user?._id,
        { $set: { avatar: avatar?.url } },
        { new: true }
      ).select("-password");

      await redis.set(user?._id, JSON.stringify(foundUser));

      // Send the response
      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            true,
            "Profile picture updated successfully.",
            foundUser
          )
        );
    } catch (error: any) {
      return res
        .status(500)
        .json(new ApiResponse(500, false, error.message, null));
    }
  }
);

export {
  registerUser,
  loginUser,
  logoutUser,
  updateAccessAndRefreshToken,
  getUserInfo,
  socialAuth,
  updateUserInfo,
  updatePassword,
  updateProfilePicture,
};
