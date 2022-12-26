import { CustomError } from "./customError.js";

class NotFoundError extends CustomError {
  constructor(message?: string) {
    const customMessage = message || "Not found";
    super(customMessage);
    this.statusCode = 404;
  }
}

export { NotFoundError };
