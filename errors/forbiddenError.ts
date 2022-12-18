import { CustomError } from "./customError.js";

class ForbiddenError extends CustomError {
  constructor(message: string) {
    super(message);
    this.statusCode = 403;
  }
}

export { ForbiddenError };
