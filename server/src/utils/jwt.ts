import { Request, Response } from "express";
import { User, UserInterface } from "../models/user.model";
import { redis } from "../db/redis";
import { ApiResponse } from "./apiResponse";
import ApiError from "./apiError";

// Define interface for token options
interface TokenInterface {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure: boolean;
}

export const accessTokenExpire =
  parseInt(process.env.ACCESS_TOKEN_EXPIRY!) * 24 * 60 * 60 * 1000;
export const refreshTokenExpire =
  parseInt(process.env.REFRESH_TOKEN_EXPIRY!) * 24 * 60 * 60 * 1000;

// Options for cookie
export const accessTokenOptions: TokenInterface = {
  expires: new Date(Date.now() + accessTokenExpire),
  maxAge: accessTokenExpire,
  httpOnly: true,
  sameSite: "lax",
  secure: false,
};
export const refreshTokenOptions: TokenInterface = {
  expires: new Date(Date.now() + refreshTokenExpire),
  maxAge: refreshTokenExpire,
  httpOnly: true,
  sameSite: "lax",
  secure: false,
};

// Define a function to send token to user
export const sendToken = async (user: UserInterface, res: Response) => {
  // Upload session into redis
  await redis.set(user._id, JSON.stringify(user) as any);

  // Generate access token and refresh token
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Save refresh token in database
  user.refreshToken = refreshToken;
  await user.save();

  const loggedinUser = await User.findById(user._id).select("-password");

  // Parse  environment variables  to integrate with fallback values

  // Only set secure to true in production
  if (process.env.NODE_ENV === "production") {
    accessTokenOptions.secure = true;
    refreshTokenOptions.secure = true;
  }

  // Set cookies
  res.cookie("accessToken", accessToken, accessTokenOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenOptions);

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        true,
        `User has loggedin successfully.`,
        loggedinUser
      )
    );
};
