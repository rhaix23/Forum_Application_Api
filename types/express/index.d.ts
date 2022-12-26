import { IUserInformation } from "../user.types.js";

declare global {
  namespace Express {
    export interface Request {
      user?: Record<string, any>;
    }
  }
}
