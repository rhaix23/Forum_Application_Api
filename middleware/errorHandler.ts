import { NextFunction, Request, Response } from "express";
import { CustomError } from "../errors/customError.js";

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const defaultError = {
    statusCode: err.statusCode || 500,
    msg: err.message || "Something went wrong, try again later",
  };

  if (err.name === "ValidationError") {
    defaultError.statusCode = 400;
  }

  res.status(defaultError.statusCode).json({ msg: defaultError.msg });
};
