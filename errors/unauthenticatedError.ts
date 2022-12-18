import { CustomError } from "./customError.js";

class UnAuthenticatedError extends CustomError {
  constructor(message: string) {
    super(message);
    this.statusCode = 401;
  }
}

export { UnAuthenticatedError };
