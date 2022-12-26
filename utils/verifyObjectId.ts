import { isValidObjectId } from "mongoose";
import { BadRequestError } from "../errors/badRequestError.js";

export const verifyObjectId = (id: string) => {
  if (!isValidObjectId(id)) {
    throw new BadRequestError("Invalid object id");
  }
};
