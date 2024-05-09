import { NextFunction, Request, Response } from "express";

/**
 * Wraps an asynchronous request handler function with error handling middleware.
 * @param requestHandler - The asynchronous request handler function to be wrapped.
 * @returns A middleware function that handles asynchronous requests.
 */
const asyncHandler = (requestHandler: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    /**
     * Resolves a Promise returned by the request handler and catches any errors that occur.
     * @returns {Promise} - A Promise that resolves the result of the request handler.
     */
    Promise.resolve(requestHandler(req, res, next)).catch((error) =>
      next(error)
    );
  };
};

export default asyncHandler;
