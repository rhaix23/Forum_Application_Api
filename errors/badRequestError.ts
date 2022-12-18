import { CustomError } from "./customError.js";

class BadRequestError extends CustomError {
  constructor(message: string) {
    super(message);
    this.statusCode = 400;
  }
}

export { BadRequestError };
