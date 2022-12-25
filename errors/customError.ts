class CustomError extends Error {
  statusCode: number;
  code: number;
  keyValue: string;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.code = statusCode;
    this.keyValue = "";
  }
}

export { CustomError };
