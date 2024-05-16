import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/apiError";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../db/redis";

// Middleware to check if user is authenticated.
export const isAuthenticated = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get access token from cookies.
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // Check if access token exists.
    if (!accessToken) {
      throw new ApiError(400, "Please login to access this resourse.");
    }

    // Verify access token with jwt.
    const decodedData = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET!
    ) as JwtPayload;

    // Check if access token is valid.
    if (!decodedData) {
      throw new ApiError(400, "Access token is not valid.");
    }

    // Get user from redis
    const user = await redis.get(decodedData._id);

    // Throw error if user does not exist.
    if (!user) {
      throw new ApiError(400, "User not found.");
    }

    // Set user in request
    req.user = JSON.parse(user);

    // Call next middleware
    next();
  }
);

// Middleware to check if user is authorized to access this resource.
export const isAuthorizedRole =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      throw new ApiError(
        403,
        "You are not authorized to access this resource."
      );
    }
    next();
  };
