import { CustomError } from "./customError.js";

class NotFoundError extends CustomError {
  constructor(message: string) {
    super(message);
    this.statusCode = 404;
  }
}

export { NotFoundError };
