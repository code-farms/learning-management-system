class ApiError extends Error {
  statusCode: number;
  data: null;
  message: string;
  success: boolean;
  stack: string = "";

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;

    // if (stack) {
    //   this.stack = stack;
    // } else {
    //   Error.captureStackTrace(this, this.constructor);
    // }
  }
}

export default ApiError;
