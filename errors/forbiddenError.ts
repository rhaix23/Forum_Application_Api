import { CustomError } from "./customError.js";

class ForbiddenError extends CustomError {
  constructor(message?: string) {
    const customMessage = "User does not have permission to perform action";
    super(message ? message : customMessage);
    this.statusCode = 403;
  }
}

export { ForbiddenError };
