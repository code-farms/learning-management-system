class ApiResponse<T> {
  public statusCode: number;
  public success: boolean;
  public message: string;
  public data: T;

  constructor(
    statusCode: number,
    success: boolean,
    message: string = "Success",
    data: T
  ) {
    this.statusCode = statusCode;
    this.success = success;
    this.message = message;
    this.data = data;
  }
}

export { ApiResponse };
