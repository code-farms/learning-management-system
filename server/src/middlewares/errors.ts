import { Request, Response } from "express";
import ApiError from "../utils/apiError";

/**
 * Error handling middleware for Express.js.
 * @param err - The error object.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 */
export const ErrorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: Function
) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Wrong MongoDB id Error
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ApiError(400, message);
  }

  // Duplicate Key Error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)}`;
    err = new ApiError(400, message);
  }

  // Wrong JWT Error
  if (err.name === "JsonWebTokenError") {
    const message = `Json Web Token is invalid, please try again.`;
    err = new ApiError(400, message);
  }

  // JWT Expired Error
  if (err.name === "JsonWebTokenError") {
    const message = `Json Web Token is expired, please try again.`;
    err = new ApiError(400, message);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
